import { PoseLandmark, BODY_LANDMARKS, getLandmarkPoint } from './poseDetection';

export interface BodyMeasurements {
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
  neck: number;
  arms: number;
}

export interface MeasurementResult {
  measurements: BodyMeasurements;
  confidence: number;
  qualityScore: 'excellent' | 'good' | 'fair' | 'poor';
}

function pixelDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function calculateScaleFactor(
  landmarks: PoseLandmark[],
  userHeightCm: number
): number {
  const leftFoot = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_FOOT_INDEX);
  const rightFoot = getLandmarkPoint(landmarks, BODY_LANDMARKS.RIGHT_FOOT_INDEX);
  const nose = getLandmarkPoint(landmarks, BODY_LANDMARKS.NOSE);

  const footMidX = (leftFoot.x + rightFoot.x) / 2;
  const footMidY = (leftFoot.y + rightFoot.y) / 2;
  const feetToNose = pixelDistance({ x: footMidX, y: footMidY }, nose);

  if (feetToNose <= 0) return 0.5;

  const scale = userHeightCm / feetToNose;
  return scale;
}

function calculateShoulderWidth(
  landmarks: PoseLandmark[],
  scale: number
): number {
  const leftShoulder = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmarkPoint(landmarks, BODY_LANDMARKS.RIGHT_SHOULDER);

  const pixelWidth = pixelDistance(leftShoulder, rightShoulder);
  const cmWidth = pixelWidth * scale;

  return Math.round(cmWidth * 10) / 10;
}

function calculateChest(
  landmarks: PoseLandmark[],
  scale: number,
  shoulderWidth: number
): number {
  const leftShoulder = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmarkPoint(landmarks, BODY_LANDMARKS.RIGHT_SHOULDER);

  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;

  const chestY = shoulderMidY + (scale > 0 ? 30 / scale : 60);

  const chestWidth = shoulderWidth * 1.45;

  const frontDepth = shoulderWidth * 0.35;
  const circumference = Math.PI * Math.sqrt(
    (Math.pow(chestWidth / 2, 2) + Math.pow(frontDepth / 2, 2)) / 2
  );

  return Math.round(circumference);
}

function calculateWaist(
  landmarks: PoseLandmark[],
  scale: number,
  shoulderWidth: number
): number {
  const leftHip = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmarkPoint(landmarks, BODY_LANDMARKS.RIGHT_HIP);

  const hipWidth = pixelDistance(leftHip, rightHip) * scale;

  const waistWidth = hipWidth * 0.85;

  const frontDepth = waistWidth * 0.38;
  const circumference = Math.PI * Math.sqrt(
    (Math.pow(waistWidth / 2, 2) + Math.pow(frontDepth / 2, 2)) / 2
  );

  return Math.round(circumference);
}

function calculateHips(
  landmarks: PoseLandmark[],
  scale: number
): number {
  const leftHip = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmarkPoint(landmarks, BODY_LANDMARKS.RIGHT_HIP);

  const hipWidth = pixelDistance(leftHip, rightHip) * scale;

  const frontDepth = hipWidth * 0.42;
  const circumference = Math.PI * Math.sqrt(
    (Math.pow(hipWidth / 2, 2) + Math.pow(frontDepth / 2, 2)) / 2
  );

  return Math.round(circumference);
}

function calculateInseam(
  landmarks: PoseLandmark[],
  scale: number
): number {
  const leftHip = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmarkPoint(landmarks, BODY_LANDMARKS.RIGHT_HIP);
  const leftAnkle = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getLandmarkPoint(landmarks, BODY_LANDMARKS.RIGHT_ANKLE);

  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;
  const ankleMidX = (leftAnkle.x + rightAnkle.x) / 2;
  const ankleMidY = (leftAnkle.y + rightAnkle.y) / 2;

  const pixelLength = pixelDistance(
    { x: hipMidX, y: hipMidY },
    { x: ankleMidX, y: ankleMidY }
  );

  const cmLength = pixelLength * scale * 0.95;

  return Math.round(cmLength);
}

function calculateNeck(
  landmarks: PoseLandmark[],
  scale: number
): number {
  const nose = getLandmarkPoint(landmarks, BODY_LANDMARKS.NOSE);
  const leftShoulder = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getLandmarkPoint(landmarks, BODY_LANDMARKS.RIGHT_SHOULDER);

  const neckLength = pixelDistance(nose, {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  }) * scale;

  const neckCircumference = neckLength * 1.1;

  return Math.round(neckCircumference);
}

function calculateArms(
  landmarks: PoseLandmark[],
  scale: number
): number {
  const leftShoulder = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_SHOULDER);
  const leftElbow = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_ELBOW);
  const leftWrist = getLandmarkPoint(landmarks, BODY_LANDMARKS.LEFT_WRIST);

  const upperArm = pixelDistance(leftShoulder, leftElbow) * scale;
  const forearm = pixelDistance(leftElbow, leftWrist) * scale;

  const totalArm = upperArm + forearm;

  return Math.round(totalArm);
}

function calculateConfidence(landmarks: PoseLandmark[]): number {
  const keyLandmarks = [
    BODY_LANDMARKS.LEFT_SHOULDER,
    BODY_LANDMARKS.RIGHT_SHOULDER,
    BODY_LANDMARKS.LEFT_HIP,
    BODY_LANDMARKS.RIGHT_HIP,
    BODY_LANDMARKS.LEFT_KNEE,
    BODY_LANDMARKS.RIGHT_KNEE,
    BODY_LANDMARKS.LEFT_ANKLE,
    BODY_LANDMARKS.RIGHT_ANKLE,
  ];

  const visibilities = keyLandmarks.map((idx) => landmarks[idx]?.visibility ?? 0);
  const avgVisibility = visibilities.reduce((a, b) => a + b, 0) / visibilities.length;

  return Math.round(avgVisibility * 100);
}

function getQualityScore(confidence: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (confidence >= 90) return 'excellent';
  if (confidence >= 75) return 'good';
  if (confidence >= 60) return 'fair';
  return 'poor';
}

export function calculateMeasurements(
  landmarks: PoseLandmark[],
  userHeightCm: number,
  view: 'front' | 'side' = 'front'
): MeasurementResult {
  const scale = calculateScaleFactor(landmarks, userHeightCm);

  const shoulderWidth = calculateShoulderWidth(landmarks, scale);

  const measurements: BodyMeasurements = {
    chest: calculateChest(landmarks, scale, shoulderWidth),
    waist: calculateWaist(landmarks, scale, shoulderWidth),
    hips: calculateHips(landmarks, scale),
    shoulder: shoulderWidth,
    inseam: calculateInseam(landmarks, scale),
    neck: calculateNeck(landmarks, scale),
    arms: calculateArms(landmarks, scale),
  };

  const confidence = calculateConfidence(landmarks);

  const clampedMeasurements: BodyMeasurements = {
    chest: Math.max(70, Math.min(130, measurements.chest)),
    waist: Math.max(55, Math.min(120, measurements.waist)),
    hips: Math.max(70, Math.min(130, measurements.hips)),
    shoulder: Math.max(35, Math.min(60, measurements.shoulder)),
    inseam: Math.max(60, Math.min(100, measurements.inseam)),
    neck: Math.max(30, Math.min(50, measurements.neck)),
    arms: Math.max(50, Math.min(90, measurements.arms)),
  };

  return {
    measurements: clampedMeasurements,
    confidence,
    qualityScore: getQualityScore(confidence),
  };
}
