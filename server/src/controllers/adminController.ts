import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { appointmentService } from '../services/appointmentService';
import { serviceManagementService } from '../services/serviceManagementService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AppointmentStatus, LocationType } from '../types';

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await adminService.getDashboardMetrics();
      return sendSuccess(res, summary);
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

  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await adminService.getCustomerDirectory();
      return sendSuccess(res, customers);
    } catch (err) {
      next(err);
    }
  }

  async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await serviceManagementService.getAllServices(false);
      return sendSuccess(res, services);
    } catch (err) {
      next(err);
    }
  }

  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, category, description, price, duration, homeServiceAvailable, tagline, isPopular, active } = req.body;
      if (!name || !price || !duration) {
        return sendError(res, 'Name, price, and duration are required fields.', 400);
      }
      const newService = await serviceManagementService.createService({
        name,
        category: category || 'hair',
        description: description || '',
        price,
        duration: Number(duration),
        homeServiceAvailable: Boolean(homeServiceAvailable),
        tagline,
        isPopular: Boolean(isPopular),
        active: active !== undefined ? Boolean(active) : true,
      });
      return sendSuccess(res, newService, 'Service created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return sendError(res, 'Invalid service id.', 400);
      }
      const updated = await serviceManagementService.updateService(id, req.body);
      if (!updated) {
        return sendError(res, 'Service not found', 404);
      }
      return sendSuccess(res, updated, 'Service updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateAppointmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) {
        return sendError(res, 'Status is required.', 400);
      }
      const { id } = req.params;
      if (typeof id !== 'string') {
        return sendError(res, 'Invalid appointment id.', 400);
      }
      const updated = await appointmentService.updateStatus(id, status as AppointmentStatus);
      return sendSuccess(res, updated, 'Appointment status updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await adminService.getDashboardMetrics();
      return sendSuccess(res, dashboard.settings);
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await adminService.updateSettings(req.body);
      return sendSuccess(res, updated, 'Settings updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
