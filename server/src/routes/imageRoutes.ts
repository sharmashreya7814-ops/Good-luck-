import { Router } from 'express';
import { imageController } from '../controllers/imageController';

const router = Router();

// Public endpoint for frontend components to fetch current active images
router.get('/active', (req, res, next) => imageController.getActiveImage(req, res, next));

export default router;
