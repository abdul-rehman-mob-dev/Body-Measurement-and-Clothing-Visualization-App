import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifyToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { uid, email } = req.user!;

    // Find or create user in PostgreSQL
    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: email,
          name: req.body.name || email.split('@')[0],
        },
      });
    }

    res.json({
      message: 'Token verified successfully',
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
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
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
}
