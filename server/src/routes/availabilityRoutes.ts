import { Router } from 'express';
import { availabilityController } from '../controllers/availabilityController';

const router = Router();

// GET /api/availability?serviceId=...&date=...&locationType=...
router.get('/', (req, res, next) => availabilityController.getAvailability(req, res, next));

export default router;
