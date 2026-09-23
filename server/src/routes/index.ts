import { Router } from 'express';
import serviceRoutes from './serviceRoutes';
import appointmentRoutes from './appointmentRoutes';
import availabilityRoutes from './availabilityRoutes';
import adminRoutes from './adminRoutes';
import imageRoutes from './imageRoutes';

const router = Router();

router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/availability', availabilityRoutes);
router.use('/admin', adminRoutes);
router.use('/images', imageRoutes);


// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Good Luck Hair Salon API is running',
  });
});

// 404 fallback for unmatched /api routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

export default router;
