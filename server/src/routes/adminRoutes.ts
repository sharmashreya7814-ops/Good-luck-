import { Router } from 'express';
import multer from 'multer';
import { adminController } from '../controllers/adminController';
import { imageController } from '../controllers/imageController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

// Configure multer memory storage for secure in-memory buffer inspection and size enforcement
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum file limit
  },
});

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
router.delete('/services/:id', (req, res, next) => adminController.deleteService(req, res, next));

// Business settings
router.get('/settings', (req, res, next) => adminController.getSettings(req, res, next));
router.put('/settings', (req, res, next) => adminController.updateSettings(req, res, next));

// Image Management (Admin media storage)
router.get('/images', (req, res, next) => imageController.listImages(req, res, next));
router.post('/images', upload.single('image'), (req, res, next) => imageController.uploadImage(req, res, next));
router.patch('/images/:id', (req, res, next) => imageController.updateMetadata(req, res, next));
router.put('/images/:id/file', upload.single('image'), (req, res, next) => imageController.replaceFile(req, res, next));
router.post('/images/:id/replace', upload.single('image'), (req, res, next) => imageController.replaceFile(req, res, next));
router.delete('/images/:id', (req, res, next) => imageController.deleteImage(req, res, next));

export default router;

