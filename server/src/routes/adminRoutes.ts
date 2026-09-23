import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

// Apply admin authentication middleware to all admin endpoints
router.use(requireAdminAuth);

// Dashboard metrics & today's agenda
router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));

// Appointments management
router.get('/appointments', (req, res, next) => adminController.getAppointments(req, res, next));
router.patch('/appointments/:id/status', (req, res, next) => adminController.updateAppointmentStatus(req, res, next));

// Customer directory
router.get('/customers', (req, res, next) => adminController.getCustomers(req, res, next));

// Services administration
router.get('/services', (req, res, next) => adminController.getServices(req, res, next));
router.post('/services', (req, res, next) => adminController.createService(req, res, next));
router.put('/services/:id', (req, res, next) => adminController.updateService(req, res, next));

// Business settings
router.get('/settings', (req, res, next) => adminController.getSettings(req, res, next));
router.put('/settings', (req, res, next) => adminController.updateSettings(req, res, next));

export default router;
