import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { env } from '../config/env';

const prisma = new PrismaClient();

async function getUserId(firebaseUid: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
    select: { id: true },
  });
  return user?.id || null;
}

export async function processScan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = await getUserId(req.user!.uid);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { frontPhotoUrl, sidePhotoUrl, userHeight, userWeight } = req.body;

    if (!frontPhotoUrl) {
      res.status(400).json({ error: 'Front photo URL is required' });
      return;
    }

    // Try Python AI service first, fallback to anthropometric calculation
    let measurements: any;
    let size: string;
    let confidence: number;
    let quality_score: string;
    let usedFallback = false;

    try {
      const aiResponse = await axios.post(`${env.AI_SERVICE_URL}/api/ai/process-photos`, {
        front_photo_url: frontPhotoUrl,
        side_photo_url: sidePhotoUrl,
        user_height: userHeight || 175,
        user_weight: userWeight || 70,
      }, { timeout: 5000 });

      measurements = aiResponse.data.measurements;
      size = aiResponse.data.size;
      confidence = aiResponse.data.confidence;
      quality_score = aiResponse.data.quality_score;
    } catch {
      // Python service not available, use fallback
      usedFallback = true;
      const h = userHeight || 175;
      measurements = {
        shoulder: Math.round(h * 0.259 * 10) / 10,
        chest: Math.round(h * 0.536),
        waist: Math.round(h * 0.447),
        hips: Math.round(h * 0.543),
        inseam: Math.round(h * 0.447),
        neck: Math.round(h * 0.198 * 10) / 10,
        arms: 35,
      };

      if (measurements.chest < 88) size = 'XS';
      else if (measurements.chest < 96) size = 'S';
      else if (measurements.chest < 104) size = 'M';
      else if (measurements.chest < 112) size = 'L';
      else if (measurements.chest < 120) size = 'XL';
      else size = 'XXL';

      confidence = 70;
      quality_score = 'fair';
    }

    // Save scan to database
    const scan = await prisma.scan.create({
      data: {
        userId,
        frontPhotoUrl,
        sidePhotoUrl: sidePhotoUrl || null,
        chest: measurements.chest,
        waist: measurements.waist,
        hips: measurements.hips,
        shoulder: measurements.shoulder,
        inseam: measurements.inseam,
        neck: measurements.neck,
        arms: measurements.arms,
        size,
        confidence,
        qualityScore: quality_score,
      },
    });

    // Also save as measurement
    const measurement = await prisma.measurement.create({
      data: {
        userId,
        chest: measurements.chest,
        waist: measurements.waist,
        hips: measurements.hips,
        shoulder: measurements.shoulder,
        inseam: measurements.inseam,
        neck: measurements.neck,
        arms: measurements.arms,
        height: userHeight,
        weight: userWeight,
        size,
        confidence,
        qualityScore: quality_score,
        isDefault: true,
      },
    });

    res.json({
      scan,
      measurement,
      message: usedFallback ? 'Scan processed (fallback mode)' : 'Scan processed successfully',
      fallback: usedFallback,
    });
  } catch (error) {
    console.error('Process scan error:', error);
    res.status(500).json({ error: 'Failed to process scan' });
  }
}

export async function getScanHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = await getUserId(req.user!.uid);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const scans = await prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ scans });
  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({ error: 'Failed to get scan history' });
  }
}

export async function deleteScan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = await getUserId(req.user!.uid);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.scan.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    await prisma.scan.delete({ where: { id } });

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({ error: 'Failed to delete scan' });
  }
}
