import { db } from '../db/dbClient';
import { ServiceModel, ServiceCategory } from '../types';

export class ServiceManagementService {
  async getAllServices(activeOnly: boolean = false): Promise<ServiceModel[]> {
    return await db.getServices(activeOnly);
  }

  async getServiceById(id: string): Promise<ServiceModel | null> {
    return await db.getServiceById(id);
  }

  async createService(data: {
    id?: string;
    name: string;
    category: ServiceCategory;
    description: string;
    price: string;
    duration: number;
    homeServiceAvailable: boolean;
    active?: boolean;
    isPopular?: boolean;
    tagline?: string;
  }): Promise<ServiceModel> {
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const service = await db.createService({
      id,
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      duration: data.duration,
      homeServiceAvailable: data.homeServiceAvailable,
      active: data.active ?? true,
      isPopular: data.isPopular ?? false,
      tagline: data.tagline,
    });
    return service;
  }

  async updateService(id: string, updates: Partial<ServiceModel>): Promise<ServiceModel | null> {
    return await db.updateService(id, updates);
  }

  async deleteService(id: string): Promise<boolean> {
    return await db.deleteService(id);
  }
}

export const serviceManagementService = new ServiceManagementService();
