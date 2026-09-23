import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController';
import { validateAppointmentCreation } from '../middleware/validationMiddleware';

const router = Router();

// POST /api/appointments - Customer creates an appointment
router.post('/', validateAppointmentCreation, (req, res, next) => 
  appointmentController.createAppointment(req, res, next)
);

// GET /api/appointments - List appointments (with query filters)
router.get('/', (req, res, next) => 
  appointmentController.getAppointments(req, res, next)
);

// GET /api/appointments/ref/:reference - Look up appointment by booking reference (e.g. GLS-8492)
router.get('/ref/:reference', (req, res, next) => 
  appointmentController.getAppointmentByReference(req, res, next)
);

// GET /api/appointments/:id - Look up appointment by ID
router.get('/:id', (req, res, next) => 
  appointmentController.getAppointmentById(req, res, next)
);

// PATCH /api/appointments/:id/status - Update appointment status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
router.patch('/:id/status', (req, res, next) => 
  appointmentController.updateAppointmentStatus(req, res, next)
);

export default router;
