import { Router } from 'express';
import {
  processScan,
  getScanHistory,
  deleteScan,
} from '../controllers/scan.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/process', authenticate, processScan);
router.get('/history', authenticate, getScanHistory);
router.delete('/:id', authenticate, deleteScan);

export default router;
