export interface ProcessingResult {
  success: boolean;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    shoulder: number;
    inseam: number;
    neck: number;
    arms: number;
  };
  size: string;
  confidence: number;
}

const mockMeasurements = {
  chest: { min: 88, max: 102 },
  waist: { min: 72, max: 88 },
  hips: { min: 92, max: 104 },
  shoulder: { min: 42, max: 50 },
  inseam: { min: 76, max: 86 },
  neck: { min: 36, max: 42 },
  arms: { min: 30, max: 40 },
};

const sizeChart = [
  { size: 'S', chestMax: 92 },
  { size: 'M', chestMax: 98 },
  { size: 'L', chestMax: 104 },
  { size: 'XL', chestMax: 112 },
];

function getRandomMeasurement(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function getSize(chest: number): string {
  for (const s of sizeChart) {
    if (chest <= s.chestMax) return s.size;
  }
  return 'XL';
}

export async function processPhotos(
  photos: string[],
  onProgress: (step: string, progress: number) => void
): Promise<ProcessingResult> {
  const steps = [
    { name: 'Uploading photos', duration: 800 },
    { name: 'Pose detection', duration: 1200 },
    { name: 'Body segmentation', duration: 1000 },
    { name: 'Measurement extraction', duration: 1500 },
    { name: 'Size calculation', duration: 800 },
    { name: 'Finalizing', duration: 500 },
  ];

  let totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  let elapsed = 0;

  for (const step of steps) {
    const stepStart = elapsed;
    const stepEnd = elapsed + step.duration;

    const stepInterval = setInterval(() => {
      elapsed += 50;
      const overallProgress = Math.min(Math.round((elapsed / totalDuration) * 100), 99);
      onProgress(step.name, overallProgress);
    }, 50);

    await new Promise((resolve) => setTimeout(resolve, step.duration));
    clearInterval(stepInterval);
    elapsed = stepEnd;
  }

  onProgress('Done', 100);

  const chest = getRandomMeasurement(mockMeasurements.chest.min, mockMeasurements.chest.max);
  const waist = getRandomMeasurement(mockMeasurements.waist.min, mockMeasurements.waist.max);
  const hips = getRandomMeasurement(mockMeasurements.hips.min, mockMeasurements.hips.max);
  const shoulder = getRandomMeasurement(mockMeasurements.shoulder.min, mockMeasurements.shoulder.max);
  const inseam = getRandomMeasurement(mockMeasurements.inseam.min, mockMeasurements.inseam.max);
  const neck = getRandomMeasurement(mockMeasurements.neck.min, mockMeasurements.neck.max);
  const arms = getRandomMeasurement(mockMeasurements.arms.min, mockMeasurements.arms.max);

  return {
    success: true,
    measurements: { chest, waist, hips, shoulder, inseam, neck, arms },
    size: getSize(chest),
    confidence: Math.round(85 + Math.random() * 14),
  };
}
