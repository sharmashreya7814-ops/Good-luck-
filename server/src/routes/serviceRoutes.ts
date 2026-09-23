import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

// Public Service Endpoints
router.get('/', (req, res, next) => serviceController.getServices(req, res, next));
router.get('/:id', (req, res, next) => serviceController.getServiceById(req, res, next));

// Protected Admin Mutation Endpoints (Also accessible via /api/admin/services)
router.post('/', requireAdminAuth, (req, res, next) => serviceController.createService(req, res, next));
router.put('/:id', requireAdminAuth, (req, res, next) => serviceController.updateService(req, res, next));
router.delete('/:id', requireAdminAuth, (req, res, next) => serviceController.deleteService(req, res, next));

export default router;
