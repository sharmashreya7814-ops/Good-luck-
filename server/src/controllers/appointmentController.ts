import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointmentService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AppointmentStatus, LocationType } from '../types';

export class AppointmentController {
  async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.createAppointment(req.body);
      return sendSuccess(
        res,
        appointment,
        `Appointment successfully confirmed with reference ${appointment.bookingReference}`,
        201
      );
    } catch (err) {
      next(err);
    }
  }

  async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, status, locationType } = req.query;
      const appointments = await appointmentService.getAppointments({
        date: date as string,
        status: status as AppointmentStatus,
        locationType: locationType as LocationType,
      });
      return sendSuccess(res, appointments);
    } catch (err) {
      next(err);
    }
  }

  async getAppointmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.getAppointmentById(req.params.id);
      return sendSuccess(res, appointment);
    } catch (err) {
      next(err);
    }
  }

  async getAppointmentByReference(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.getAppointmentByReference(req.params.reference);
      return sendSuccess(res, appointment);
    } catch (err) {
      next(err);
    }
  }

  async updateAppointmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) {
        return sendError(res, 'Field "status" is required.', 400);
      }
      const updated = await appointmentService.updateStatus(req.params.id, status as AppointmentStatus);
      return sendSuccess(res, updated, 'Appointment status updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const appointmentController = new AppointmentController();
