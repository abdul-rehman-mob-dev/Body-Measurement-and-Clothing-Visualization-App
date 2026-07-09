import { Router } from 'express';
import { getPresignedUrl, uploadPhoto } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Get pre-signed URL for direct S3 upload
router.post('/presigned-url', authenticate, getPresignedUrl);

// Upload photo via server (alternative to pre-signed URL)
router.post('/photo', authenticate, upload.single('photo'), uploadPhoto);

export default router;
