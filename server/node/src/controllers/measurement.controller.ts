import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUserId(firebaseUid: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
    select: { id: true },
  });
  return user?.id || null;
}

export async function getMeasurements(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = await getUserId(req.user!.uid);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const measurements = await prisma.measurement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ measurements });
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({ error: 'Failed to get measurements' });
  }
}

export async function getDefaultMeasurement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = await getUserId(req.user!.uid);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const measurement = await prisma.measurement.findFirst({
      where: { userId, isDefault: true },
    });

    if (!measurement) {
      // Return most recent if no default set
      const latest = await prisma.measurement.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ measurement: latest || null });
      return;
    }

    res.json({ measurement });
  } catch (error) {
    console.error('Get default measurement error:', error);
    res.status(500).json({ error: 'Failed to get default measurement' });
  }
}

export async function createMeasurement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = await getUserId(req.user!.uid);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { chest, waist, hips, shoulder, inseam, neck, arms, height, weight, size, confidence, qualityScore, isDefault } = req.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.measurement.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const measurement = await prisma.measurement.create({
      data: {
        userId,
        chest,
        waist,
        hips,
        shoulder,
        inseam,
        neck,
        arms,
        height,
        weight,
        size,
        confidence,
        qualityScore,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({ measurement });
  } catch (error) {
    console.error('Create measurement error:', error);
    res.status(500).json({ error: 'Failed to create measurement' });
  }
}

export async function updateMeasurement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = await getUserId(req.user!.uid);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { id } = req.params;
    const { chest, waist, hips, shoulder, inseam, neck, arms, height, weight, size, confidence, qualityScore, isDefault } = req.body;

    // Verify ownership
    const existing = await prisma.measurement.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Measurement not found' });
      return;
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.measurement.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const measurement = await prisma.measurement.update({
      where: { id },
      data: {
        ...(chest !== undefined && { chest }),
        ...(waist !== undefined && { waist }),
        ...(hips !== undefined && { hips }),
        ...(shoulder !== undefined && { shoulder }),
        ...(inseam !== undefined && { inseam }),
        ...(neck !== undefined && { neck }),
        ...(arms !== undefined && { arms }),
        ...(height !== undefined && { height }),
        ...(weight !== undefined && { weight }),
        ...(size !== undefined && { size }),
        ...(confidence !== undefined && { confidence }),
        ...(qualityScore !== undefined && { qualityScore }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    res.json({ measurement });
  } catch (error) {
    console.error('Update measurement error:', error);
    res.status(500).json({ error: 'Failed to update measurement' });
  }
}

export async function deleteMeasurement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = await getUserId(req.user!.uid);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { id } = req.params;

    const existing = await prisma.measurement.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Measurement not found' });
      return;
    }

    await prisma.measurement.delete({ where: { id } });

    res.json({ message: 'Measurement deleted successfully' });
  } catch (error) {
    console.error('Delete measurement error:', error);
    res.status(500).json({ error: 'Failed to delete measurement' });
  }
}
