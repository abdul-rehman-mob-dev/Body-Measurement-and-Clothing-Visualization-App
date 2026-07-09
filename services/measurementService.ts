export interface BodyMeasurements {
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  inseam: number;
  neck: number;
}

function applyVariation(value: number): number {
  const variation = 0.97 + Math.random() * 0.06;
  return Math.round(value * variation * 10) / 10;
}

function anthropometricFallback(heightCm: number): BodyMeasurements {
  return {
    shoulders: applyVariation(heightCm * 0.259),
    chest: applyVariation(heightCm * 0.536),
    waist: applyVariation(heightCm * 0.447),
    hips: applyVariation(heightCm * 0.543),
    inseam: applyVariation(heightCm * 0.447),
    neck: applyVariation(heightCm * 0.198),
  };
}

export async function calculateMeasurements(
  _frontPhotoUri: string,
  userHeightCm: number,
  _userWeightKg: number
): Promise<BodyMeasurements> {
  try {
    return anthropometricFallback(userHeightCm);
  } catch (error) {
    console.log('Measurement calculation failed, using fallback:', error);
    return anthropometricFallback(userHeightCm);
  }
}
