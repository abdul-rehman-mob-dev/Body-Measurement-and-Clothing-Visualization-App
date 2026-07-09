import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { env } from '../config/env';

// Initialize Firebase Admin SDK (only if credentials are provided)
let firebaseInitialized = false;

try {
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY && !env.FIREBASE_PRIVATE_KEY.includes('YOUR_KEY_HERE')) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized');
  } else {
    console.log('⚠️  Firebase Admin not configured - auth middleware will use mock mode');
  }
} catch (error) {
  console.log('⚠️  Firebase Admin init failed - auth middleware will use mock mode');
}

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Mock mode: if Firebase not configured, use dev user
  if (!firebaseInitialized) {
    const devUid = req.headers['x-dev-uid'] as string || 'dev-user-001';
    const devEmail = req.headers['x-dev-email'] as string || 'dev@bodyfitai.com';
    req.user = { uid: devUid, email: devEmail };
    next();
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
