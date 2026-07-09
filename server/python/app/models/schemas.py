from pydantic import BaseModel
from typing import Optional, List


class Landmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float


class PoseDetectionResult(BaseModel):
    landmarks: List[Landmark]
    confidence: float
    is_valid: bool
    posture_analysis: dict


class ProcessPhotosRequest(BaseModel):
    front_photo_url: str
    side_photo_url: Optional[str] = None
    user_height: float = 175.0
    user_weight: float = 70.0


class BodyMeasurements(BaseModel):
    chest: float
    waist: float
    hips: float
    shoulder: float
    inseam: float
    neck: float
    arms: float


class ProcessPhotosResponse(BaseModel):
    measurements: BodyMeasurements
    size: str
    confidence: float
    quality_score: str
    pose_result: Optional[PoseDetectionResult] = None


class ValidateImageRequest(BaseModel):
    image_url: str


class ValidateImageResponse(BaseModel):
    quality_score: str
    confidence: float
    issues: List[str]
    is_valid: bool
