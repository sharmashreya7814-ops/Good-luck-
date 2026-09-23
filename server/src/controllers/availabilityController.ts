import { Request, Response, NextFunction } from 'express';
import { availabilityService } from '../services/availabilityService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { LocationType } from '../types';

export class AvailabilityController {
  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId, date, locationType } = req.query;

      if (!serviceId || typeof serviceId !== 'string') {
        return sendError(res, 'Query parameter "serviceId" is required.', 400);
      }
      if (!date || typeof date !== 'string') {
        return sendError(res, 'Query parameter "date" (YYYY-MM-DD) is required.', 400);
      }

      const location: LocationType = locationType === 'HOME' ? 'HOME' : 'SALON';
      const result = await availabilityService.getAvailability(serviceId, date, location);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const availabilityController = new AvailabilityController();
