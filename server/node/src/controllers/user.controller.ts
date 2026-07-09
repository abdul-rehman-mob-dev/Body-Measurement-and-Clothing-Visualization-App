import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user!.uid },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        age: user.age,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, phone, gender, height, weight, age, profileImage } = req.body;

    const user = await prisma.user.update({
      where: { firebaseUid: req.user!.uid },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
        ...(height !== undefined && { height }),
        ...(weight !== undefined && { weight }),
        ...(age !== undefined && { age }),
        ...(profileImage !== undefined && { profileImage }),
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        age: user.age,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}
