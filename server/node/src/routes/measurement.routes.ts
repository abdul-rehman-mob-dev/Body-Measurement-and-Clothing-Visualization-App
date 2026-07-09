import { Router } from 'express';
import {
  getMeasurements,
  getDefaultMeasurement,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../controllers/measurement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMeasurements);
router.get('/default', authenticate, getDefaultMeasurement);
router.post('/', authenticate, createMeasurement);
router.put('/:id', authenticate, updateMeasurement);
router.delete('/:id', authenticate, deleteMeasurement);

export default router;
