import { Router } from 'express';
import { verifyToken } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Verify Firebase token and create/update user in DB
router.post('/verify', authenticate, verifyToken);

export default router;
