import math
from typing import List, Dict


BODY_LANDMARKS = {
    "NOSE": 0,
    "LEFT_SHOULDER": 11,
    "RIGHT_SHOULDER": 12,
    "LEFT_ELBOW": 13,
    "RIGHT_ELBOW": 14,
    "LEFT_WRIST": 15,
    "RIGHT_WRIST": 16,
    "LEFT_HIP": 23,
    "RIGHT_HIP": 24,
    "LEFT_KNEE": 25,
    "RIGHT_KNEE": 26,
    "LEFT_ANKLE": 27,
    "RIGHT_ANKLE": 28,
    "LEFT_FOOT_INDEX": 31,
    "RIGHT_FOOT_INDEX": 32,
}


def pixel_distance(p1: Dict[str, float], p2: Dict[str, float]) -> float:
    return math.sqrt((p2["x"] - p1["x"]) ** 2 + (p2["y"] - p1["y"]) ** 2)


def calculate_scale_factor(landmarks: List[Dict], user_height_cm: float) -> float:
    left_foot = landmarks[BODY_LANDMARKS["LEFT_FOOT_INDEX"]]
    right_foot = landmarks[BODY_LANDMARKS["RIGHT_FOOT_INDEX"]]
    nose = landmarks[BODY_LANDMARKS["NOSE"]]

    foot_mid = {
        "x": (left_foot["x"] + right_foot["x"]) / 2,
        "y": (left_foot["y"] + right_foot["y"]) / 2,
    }
    feet_to_nose = pixel_distance(foot_mid, nose)

    if feet_to_nose <= 0:
        return 0.005

    return user_height_cm / feet_to_nose


def calculate_measurements_from_landmarks(
    landmarks: List[Dict], user_height_cm: float
) -> Dict[str, float]:
    """Calculate body measurements from pose landmarks."""
    scale = calculate_scale_factor(landmarks, user_height_cm)

    # Shoulder width
    left_shoulder = landmarks[BODY_LANDMARKS["LEFT_SHOULDER"]]
    right_shoulder = landmarks[BODY_LANDMARKS["RIGHT_SHOULDER"]]
    shoulder_width_px = pixel_distance(left_shoulder, right_shoulder)
    shoulder_width = shoulder_width_px * scale

    # Chest
    shoulder_mid_y = (left_shoulder["y"] + right_shoulder["y"]) / 2
    chest_width = shoulder_width * 1.45
    front_depth = shoulder_width * 0.35
    chest = math.pi * math.sqrt(
        (chest_width / 2) ** 2 + (front_depth / 2) ** 2
    ) / 2

    # Waist
    left_hip = landmarks[BODY_LANDMARKS["LEFT_HIP"]]
    right_hip = landmarks[BODY_LANDMARKS["RIGHT_HIP"]]
    hip_width_px = pixel_distance(left_hip, right_hip)
    hip_width = hip_width_px * scale
    waist_width = hip_width * 0.85
    front_depth = waist_width * 0.38
    waist = math.pi * math.sqrt(
        (waist_width / 2) ** 2 + (front_depth / 2) ** 2
    ) / 2

    # Hips
    front_depth = hip_width * 0.42
    hips = math.pi * math.sqrt(
        (hip_width / 2) ** 2 + (front_depth / 2) ** 2
    ) / 2

    # Inseam
    hip_mid = {
        "x": (left_hip["x"] + right_hip["x"]) / 2,
        "y": (left_hip["y"] + right_hip["y"]) / 2,
    }
    left_ankle = landmarks[BODY_LANDMARKS["LEFT_ANKLE"]]
    right_ankle = landmarks[BODY_LANDMARKS["RIGHT_ANKLE"]]
    ankle_mid = {
        "x": (left_ankle["x"] + right_ankle["x"]) / 2,
        "y": (left_ankle["y"] + right_ankle["y"]) / 2,
    }
    inseam_px = pixel_distance(hip_mid, ankle_mid)
    inseam = inseam_px * scale * 0.95

    # Neck
    nose = landmarks[BODY_LANDMARKS["NOSE"]]
    shoulder_mid = {
        "x": (left_shoulder["x"] + right_shoulder["x"]) / 2,
        "y": (left_shoulder["y"] + right_shoulder["y"]) / 2,
    }
    neck_length = pixel_distance(nose, shoulder_mid) * scale
    neck = neck_length * 1.1

    # Arms
    left_elbow = landmarks[BODY_LANDMARKS["LEFT_ELBOW"]]
    left_wrist = landmarks[BODY_LANDMARKS["LEFT_WRIST"]]
    upper_arm = pixel_distance(left_shoulder, left_elbow) * scale
    forearm = pixel_distance(left_elbow, left_wrist) * scale
    arms = upper_arm + forearm

    # Clamp values to reasonable ranges
    return {
        "chest": max(70, min(130, round(chest))),
        "waist": max(55, min(120, round(waist))),
        "hips": max(70, min(130, round(hips))),
        "shoulder": max(35, min(60, round(shoulder_width * 10) / 10)),
        "inseam": max(60, min(100, round(inseam))),
        "neck": max(30, min(50, round(neck * 10) / 10)),
        "arms": max(50, min(90, round(arms))),
    }


def get_size_recommendation(chest: float) -> str:
    if chest < 88:
        return "XS"
    if chest < 96:
        return "S"
    if chest < 104:
        return "M"
    if chest < 112:
        return "L"
    if chest < 120:
        return "XL"
    return "XXL"


def get_quality_score(confidence: float) -> str:
    if confidence >= 90:
        return "excellent"
    if confidence >= 75:
        return "good"
    if confidence >= 60:
        return "fair"
    return "poor"
