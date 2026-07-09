import cv2
import numpy as np
from typing import Optional


class ImageProcessor:
    """Handles image preprocessing for better pose detection."""

    @staticmethod
    def preprocess(image: np.ndarray) -> np.ndarray:
        """Apply preprocessing to improve pose detection accuracy."""
        # Resize if too large
        max_dim = 1920
        h, w = image.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            image = cv2.resize(image, None, fx=scale, fy=scale)

        # Enhance contrast
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_channel, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_channel = clahe.apply(l_channel)
        enhanced = cv2.merge([l_channel, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

        # Denoise slightly
        denoised = cv2.fastNlMeansDenoisingColored(enhanced, None, 6, 6, 7, 21)

        return denoised

    @staticmethod
    def validate_image_quality(image: np.ndarray) -> dict:
        """Check image quality for body measurement purposes."""
        issues = []

        h, w = image.shape[:2]

        # Check resolution
        if w < 640 or h < 480:
            issues.append("Image resolution too low (minimum 640x480)")

        # Check brightness
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        if brightness < 40:
            issues.append("Image is too dark")
        elif brightness > 220:
            issues.append("Image is too bright")

        # Check contrast
        contrast = np.std(gray)
        if contrast < 30:
            issues.append("Image has low contrast")

        # Check blur
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 100:
            issues.append("Image appears blurry")

        # Determine quality score
        score = "excellent"
        if len(issues) > 2:
            score = "poor"
        elif len(issues) > 1:
            score = "fair"
        elif len(issues) > 0:
            score = "good"

        return {
            "quality_score": score,
            "issues": issues,
            "is_valid": len(issues) == 0,
        }
