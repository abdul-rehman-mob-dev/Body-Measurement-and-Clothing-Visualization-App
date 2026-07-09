import cv2
import numpy as np
import mediapipe as mp
from typing import List, Tuple, Optional
import httpx
from io import BytesIO
from PIL import Image

from app.config import get_settings

settings = get_settings()


class PoseDetector:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=settings.MEDIAPIPE_MODEL_COMPLEXITY,
            enable_segmentation=False,
            min_detection_confidence=settings.MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=settings.MIN_TRACKING_CONFIDENCE,
        )

    async def download_image(self, url: str) -> np.ndarray:
        """Download image from URL and convert to OpenCV format."""
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()

        image_bytes = response.content
        pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")
        open_cv_image = np.array(pil_image)
        open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)
        return open_cv_image

    def detect_landmarks(self, image: np.ndarray) -> dict:
        """Detect body landmarks in an image."""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_image)

        if not results.pose_landmarks:
            return {
                "landmarks": [],
                "confidence": 0.0,
                "is_valid": False,
                "posture_analysis": {
                    "is_upright": False,
                    "symmetry_score": 0,
                    "body_alignment": "No pose detected",
                    "recommendations": ["Make sure your full body is visible"],
                },
            }

        landmarks = []
        for landmark in results.pose_landmarks.landmark:
            landmarks.append(
                {
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z,
                    "visibility": landmark.visibility,
                }
            )

        # Analyze posture
        posture = self._analyze_posture(landmarks, image.shape)

        # Calculate overall confidence
        key_indices = [
            self.mp_pose.PoseLandmark.LEFT_SHOULDER.value,
            self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value,
            self.mp_pose.PoseLandmark.LEFT_HIP.value,
            self.mp_pose.PoseLandmark.RIGHT_HIP.value,
            self.mp_pose.PoseLandmark.LEFT_KNEE.value,
            self.mp_pose.PoseLandmark.RIGHT_KNEE.value,
            self.mp_pose.PoseLandmark.LEFT_ANKLE.value,
            self.mp_pose.PoseLandmark.RIGHT_ANKLE.value,
        ]

        visibilities = [landmarks[i]["visibility"] for i in key_indices if i < len(landmarks)]
        avg_visibility = sum(visibilities) / len(visibilities) if visibilities else 0

        has_all_keypoints = all(
            landmarks[i]["visibility"] > 0.5
            for i in key_indices
            if i < len(landmarks)
        )

        is_valid = has_all_keypoints and avg_visibility > 0.5 and posture["is_upright"]

        return {
            "landmarks": landmarks,
            "confidence": round(avg_visibility * 100),
            "is_valid": is_valid,
            "posture_analysis": posture,
        }

    def _analyze_posture(self, landmarks: list, image_shape: tuple) -> dict:
        """Analyze body posture from landmarks."""
        h, w = image_shape[:2]

        LEFT_SHOULDER = self.mp_pose.PoseLandmark.LEFT_SHOULDER.value
        RIGHT_SHOULDER = self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value
        LEFT_HIP = self.mp_pose.PoseLandmark.LEFT_HIP.value
        RIGHT_HIP = self.mp_pose.PoseLandmark.RIGHT_HIP.value

        if LEFT_SHOULDER >= len(landmarks) or RIGHT_SHOULDER >= len(landmarks):
            return {
                "is_upright": False,
                "symmetry_score": 0,
                "body_alignment": "Insufficient landmarks",
                "recommendations": ["Ensure full body is visible"],
            }

        left_shoulder = landmarks[LEFT_SHOULDER]
        right_shoulder = landmarks[RIGHT_SHOULDER]
        left_hip = landmarks[LEFT_HIP]
        right_hip = landmarks[RIGHT_HIP]

        shoulder_mid_y = (left_shoulder["y"] + right_shoulder["y"]) / 2
        hip_mid_y = (left_hip["y"] + right_hip["y"]) / 2
        torso_length = hip_mid_y - shoulder_mid_y

        shoulder_tilt = abs(left_shoulder["y"] - right_shoulder["y"])
        hip_tilt = abs(left_hip["y"] - right_hip["y"])

        is_upright = torso_length > 0.25 and torso_length < 0.45
        symmetry_score = max(0, 1 - (shoulder_tilt + hip_tilt) / 0.1)

        body_alignment = "Good"
        if not is_upright:
            body_alignment = "Adjust posture"
        if symmetry_score < 0.7:
            body_alignment = "Center yourself"

        recommendations = []
        if shoulder_tilt > 0.05:
            recommendations.append("Level your shoulders")
        if hip_tilt > 0.05:
            recommendations.append("Straighten your hips")
        if not is_upright:
            recommendations.append("Stand up straight")

        return {
            "is_upright": is_upright,
            "symmetry_score": round(symmetry_score * 100),
            "body_alignment": body_alignment,
            "recommendations": recommendations,
        }

    def __del__(self):
        if hasattr(self, "pose"):
            self.pose.close()
