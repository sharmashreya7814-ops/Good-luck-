import { Request, Response, NextFunction } from 'express';
import { serviceManagementService } from '../services/serviceManagementService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class ServiceController {
  async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const services = await serviceManagementService.getAllServices(activeOnly);
      return sendSuccess(res, services);
    } catch (err) {
      next(err);
    }
  }

  async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await serviceManagementService.getServiceById(req.params.id);
      if (!service) {
        return sendError(res, 'Service not found', 404);
      }
      return sendSuccess(res, service);
    } catch (err) {
      next(err);
    }
  }

  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, category, description, price, duration, homeServiceAvailable, tagline, isPopular } = req.body;
      if (!name || !price || !duration) {
        return sendError(res, 'Name, price, and duration are required.', 400);
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
      });
      return sendSuccess(res, newService, 'Service created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await serviceManagementService.updateService(req.params.id, req.body);
      if (!updated) {
        return sendError(res, 'Service not found', 404);
      }
      return sendSuccess(res, updated, 'Service updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await serviceManagementService.deleteService(req.params.id);
      if (!deleted) {
        return sendError(res, 'Service not found', 404);
      }
      return sendSuccess(res, { deleted: true }, 'Service deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const serviceController = new ServiceController();
