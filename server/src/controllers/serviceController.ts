import { Request, Response, NextFunction } from 'express';
import { serviceManagementService } from '../services/serviceManagementService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { ServiceCategory, ServiceModel } from '../types';

const VALID_CATEGORIES: ServiceCategory[] = ['hair', 'beard', 'massage', 'other'];

function validateServicePayload(
  body: Record<string, unknown>,
  isUpdate: boolean
): { error?: string; cleanData?: Partial<ServiceModel> } {
  const {
    name,
    category,
    price,
    duration,
    description,
    tagline,
    homeServiceAvailable,
    active,
    isPopular,
    features,
    highlights,
    imageUrl,
  } = body;

  // Name validation
  if (!isUpdate || name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return { error: 'Service name cannot be empty.' };
    }
  }

  // Category validation
  if (!isUpdate || category !== undefined) {
    if (typeof category !== 'string' || !VALID_CATEGORIES.includes(category as ServiceCategory)) {
      return { error: `Invalid category. Allowed categories: ${VALID_CATEGORIES.join(', ')}.` };
    }
  }

  // Price validation: must be >= 0
  let formattedPrice: string | undefined;
  if (!isUpdate || price !== undefined) {
    if (price === undefined || price === null || String(price).trim() === '') {
      return { error: 'Price is required and must be non-negative.' };
    }
    const priceStr = String(price).trim();
    if (priceStr.includes('-')) {
      return { error: 'Price must be a valid number greater than or equal to 0.' };
    }
    const cleanPriceStr = priceStr.replace(/[^0-9.]/g, '');
    const numPrice = parseFloat(cleanPriceStr);
    if (isNaN(numPrice) || numPrice < 0) {
      return { error: 'Price must be a valid number greater than or equal to 0.' };
    }
    formattedPrice = priceStr.includes('₹') ? priceStr : `₹${Math.round(numPrice)}`;
  }

  // Duration validation: must be positive number > 0
  let numDuration: number | undefined;
  if (!isUpdate || duration !== undefined) {
    if (duration === undefined || duration === null || String(duration).trim() === '') {
      return { error: 'Duration is required and must be a positive number.' };
    }
    const durStr = String(duration).trim();
    if (durStr.includes('-')) {
      return { error: 'Duration must be a positive number of minutes (greater than 0).' };
    }
    numDuration = parseInt(durStr, 10);
    if (isNaN(numDuration) || numDuration <= 0) {
      return { error: 'Duration must be a positive number of minutes (greater than 0).' };
    }
  }

  // Feature / highlight list parsing
  let featureList: string[] | undefined;
  const rawFeatures = features !== undefined ? features : highlights;
  if (rawFeatures !== undefined) {
    if (Array.isArray(rawFeatures)) {
      featureList = rawFeatures.map((f) => String(f).trim()).filter(Boolean);
    } else if (typeof rawFeatures === 'string') {
      featureList = rawFeatures
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      featureList = [];
    }
  }

  const cleanData: Partial<ServiceModel> = {};
  if (name !== undefined) cleanData.name = String(name).trim();
  if (category !== undefined) cleanData.category = category as ServiceCategory;
  if (formattedPrice !== undefined) cleanData.price = formattedPrice;
  if (numDuration !== undefined) cleanData.duration = numDuration;
  if (description !== undefined) cleanData.description = typeof description === 'string' ? description.trim() : '';
  if (tagline !== undefined) cleanData.tagline = typeof tagline === 'string' ? tagline.trim() : undefined;
  if (homeServiceAvailable !== undefined) cleanData.homeServiceAvailable = Boolean(homeServiceAvailable);
  if (active !== undefined) cleanData.active = Boolean(active);
  if (isPopular !== undefined) cleanData.isPopular = Boolean(isPopular);
  if (featureList !== undefined) {
    cleanData.features = featureList;
    cleanData.highlights = featureList;
  }
  if (imageUrl !== undefined) {
    cleanData.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : undefined;
  }

  return { cleanData };
}

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
      const { id } = req.params;
      if (typeof id !== 'string') {
        return sendError(res, 'Invalid service id.', 400);
      }
      const service = await serviceManagementService.getServiceById(id);
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
      const { error, cleanData } = validateServicePayload(req.body, false);
      if (error || !cleanData) {
        return sendError(res, error || 'Malformed service data.', 400);
      }

      const newService = await serviceManagementService.createService({
        name: cleanData.name!,
        category: cleanData.category!,
        description: cleanData.description || '',
        price: cleanData.price!,
        duration: cleanData.duration!,
        homeServiceAvailable: cleanData.homeServiceAvailable ?? false,
        tagline: cleanData.tagline,
        isPopular: cleanData.isPopular ?? false,
        active: cleanData.active ?? true,
        features: cleanData.features,
        highlights: cleanData.highlights,
        imageUrl: cleanData.imageUrl,
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

      const { error, cleanData } = validateServicePayload(req.body, true);
      if (error || !cleanData) {
        return sendError(res, error || 'Malformed service update data.', 400);
      }

      const updated = await serviceManagementService.updateService(id, cleanData);
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
      const { id } = req.params;
      if (typeof id !== 'string') {
        return sendError(res, 'Invalid service id.', 400);
      }
      const deleted = await serviceManagementService.deleteService(id);
      if (!deleted) {
        return sendError(res, 'Service not found', 404);
      }
      return sendSuccess(
        res, 
        { id, deactivated: true }, 
        'Service deactivated and preserved in historical appointment ledger.'
      );
    } catch (err) {
      next(err);
    }
  }
}

export const serviceController = new ServiceController();

