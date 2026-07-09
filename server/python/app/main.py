from fastapi import APIRouter, HTTPException
from typing import Optional
import traceback

from app.models.schemas import (
    ProcessPhotosRequest,
    ProcessPhotosResponse,
    BodyMeasurements,
    ValidateImageRequest,
    ValidateImageResponse,
)
from app.services.pose_detector import PoseDetector
from app.services.image_processor import ImageProcessor
from app.services.measurement_calc import (
    calculate_measurements_from_landmarks,
    get_size_recommendation,
    get_quality_score,
)

router = APIRouter(prefix="/api/ai", tags=["AI Services"])

pose_detector = PoseDetector()
image_processor = ImageProcessor()


@router.post("/process-photos", response_model=ProcessPhotosResponse)
async def process_photos(request: ProcessPhotosRequest):
    """Process body photos to extract measurements."""
    try:
        # Download front image
        front_image = await pose_detector.download_image(request.front_photo_url)

        # Preprocess
        front_processed = image_processor.preprocess(front_image)

        # Detect landmarks
        front_result = pose_detector.detect_landmarks(front_processed)

        if not front_result["is_valid"] and request.side_photo_url:
            # Try side photo if front is not valid
            side_image = await pose_detector.download_image(request.side_photo_url)
            side_processed = image_processor.preprocess(side_image)
            side_result = pose_detector.detect_landmarks(side_processed)

            if not side_result["is_valid"]:
                raise HTTPException(
                    status_code=422,
                    detail="Could not detect valid body pose in either photo. Please ensure full body is visible.",
                )

            landmarks = side_result["landmarks"]
            confidence = side_result["confidence"]
        elif not front_result["is_valid"]:
            raise HTTPException(
                status_code=422,
                detail="Could not detect valid body pose. Please ensure full body is visible in the photo.",
            )
        else:
            landmarks = front_result["landmarks"]
            confidence = front_result["confidence"]

            # If side photo available, average the landmarks for better accuracy
            if request.side_photo_url:
                try:
                    side_image = await pose_detector.download_image(request.side_photo_url)
                    side_processed = image_processor.preprocess(side_image)
                    side_result = pose_detector.detect_landmarks(side_processed)

                    if side_result["is_valid"] and len(side_result["landmarks"]) == len(landmarks):
                        landmarks = [
                            {
                                "x": (fl["x"] + sl["x"]) / 2,
                                "y": (fl["y"] + sl["y"]) / 2,
                                "z": (fl["z"] + sl["z"]) / 2,
                                "visibility": max(fl["visibility"], sl["visibility"]),
                            }
                            for fl, sl in zip(landmarks, side_result["landmarks"])
                        ]
                        confidence = round((confidence + side_result["confidence"]) / 2)
                except Exception:
                    pass  # Continue with front-only landmarks

        # Calculate measurements
        measurements = calculate_measurements_from_landmarks(
            landmarks, request.user_height
        )

        # Get size and quality
        size = get_size_recommendation(measurements["chest"])
        quality_score = get_quality_score(confidence)

        return ProcessPhotosResponse(
            measurements=BodyMeasurements(**measurements),
            size=size,
            confidence=confidence,
            quality_score=quality_score,
            pose_result=front_result,
        )

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/validate-image", response_model=ValidateImageResponse)
async def validate_image(request: ValidateImageRequest):
    """Validate image quality for body measurement."""
    try:
        image = await pose_detector.download_image(request.image_url)
        result = image_processor.validate_image_quality(image)

        # Also check pose detection
        pose_result = pose_detector.detect_landmarks(image)

        issues = result["issues"]
        if not pose_result["is_valid"]:
            issues.append("Could not detect body pose")

        score = result["quality_score"]
        if not pose_result["is_valid"] and score == "excellent":
            score = "fair"

        return ValidateImageResponse(
            quality_score=score,
            confidence=pose_result["confidence"],
            issues=issues,
            is_valid=result["is_valid"] and pose_result["is_valid"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "python-ai"}
