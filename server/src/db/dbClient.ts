import { 
  ServiceModel, 
  StaffModel, 
  BusinessSettingsModel, 
  AppointmentModel, 
  AppointmentStatus,
  LocationType,
  CreateAppointmentDTO,
  ImageModel,
  ImageSlot
} from '../types';
import { DEFAULT_BUSINESS_SETTINGS } from '../config/businessConfig';

export interface DatabaseRepository {
  // Services
  getServices(activeOnly?: boolean): Promise<ServiceModel[]>;
  getServiceById(id: string): Promise<ServiceModel | null>;
  createService(service: Omit<ServiceModel, 'createdAt' | 'updatedAt'>): Promise<ServiceModel>;
  updateService(id: string, updates: Partial<ServiceModel>): Promise<ServiceModel | null>;
  deleteService(id: string): Promise<boolean>;

  // Staff
  getStaff(activeOnly?: boolean): Promise<StaffModel[]>;
  getStaffById(id: string): Promise<StaffModel | null>;

  // Business Settings
  getBusinessSettings(): Promise<BusinessSettingsModel>;
  updateBusinessSettings(updates: Partial<BusinessSettingsModel>): Promise<BusinessSettingsModel>;

  // Appointments
  getAppointments(filters?: { date?: string; status?: AppointmentStatus; locationType?: LocationType }): Promise<AppointmentModel[]>;
  getAppointmentById(id: string): Promise<AppointmentModel | null>;
  getAppointmentByReference(reference: string): Promise<AppointmentModel | null>;
  createAppointment(appointment: Omit<AppointmentModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentModel>;
  updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentModel | null>;

  // Images
  getImages(filters?: { slot?: ImageSlot; isActive?: boolean; serviceId?: string }): Promise<ImageModel[]>;
  getImageById(id: string): Promise<ImageModel | null>;
  createImage(image: Omit<ImageModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImageModel>;
  updateImage(id: string, updates: Partial<ImageModel>): Promise<ImageModel | null>;
  deleteImage(id: string): Promise<boolean>;
  getActiveImageForSlot(slot: ImageSlot, serviceId?: string): Promise<ImageModel | null>;
}

// Initial Seed Data
const INITIAL_SERVICES: ServiceModel[] = [
  {
    id: 'classic-haircut',
    name: 'Classic Haircut & Styling',
    category: 'hair',
    description: 'Traditional scissor cut and neat neck contouring tailored to hair growth patterns.',
    price: '₹150',
    duration: 30,
    homeServiceAvailable: true,
    active: true,
    isPopular: true,
    tagline: 'Scissor precision and disciplined finishing',
    highlights: ['Style consultation', 'Scissor & clipper trimming', 'Clean neckline finish', 'Light styling'],
    features: ['Style consultation', 'Scissor & clipper trimming', 'Clean neckline finish', 'Light styling'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'beard-grooming',
    name: 'Beard Trim & Clean Lines',
    category: 'beard',
    description: 'Precision beard sculpting, symmetry balance, clean trimmer edging, and herbal oil.',
    price: '₹100',
    duration: 20,
    homeServiceAvailable: true,
    active: true,
    isPopular: true,
    tagline: 'Sharp contouring tailored to your face structure',
    highlights: ['Length tapering', 'Cheekline contour', 'Neckline shaping', 'Beard comb out'],
    features: ['Length tapering', 'Cheekline contour', 'Neckline shaping', 'Beard comb out'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'head-massage-champi',
    name: 'Head Massage (Champi)',
    category: 'massage',
    description: 'Traditional scalp champi with pressure-point relaxation to soothe everyday tension.',
    price: '₹120',
    duration: 25,
    homeServiceAvailable: true,
    active: true,
    isPopular: true,
    tagline: 'Traditional acupressure for mental clarity',
    highlights: ['Scalp circulation massage', 'Choice of oil / dry option', 'Temple pressure points', 'Neck relaxation'],
    features: ['Scalp circulation massage', 'Choice of oil / dry option', 'Temple pressure points', 'Neck relaxation'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shave-hot-towel',
    name: 'Clean Shave & Hot Towel',
    category: 'beard',
    description: 'Softening lather, classic straight-edge blade shaving, warm towel, and soothing balm.',
    price: '₹80',
    duration: 25,
    homeServiceAvailable: true,
    active: true,
    isPopular: false,
    tagline: 'Clean, comfortable grooming',
    highlights: ['Lather preparation', 'Smooth single-blade shave', 'Neck clearance', 'Soothing aftershave'],
    features: ['Lather preparation', 'Smooth single-blade shave', 'Neck clearance', 'Soothing aftershave'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'body-shoulder-massage',
    name: 'Upper Body & Shoulder Massage',
    category: 'massage',
    description: 'Focused neck, shoulder, and back tension release using unhurried manual techniques.',
    price: '₹250',
    duration: 35,
    homeServiceAvailable: false,
    active: true,
    isPopular: true,
    tagline: 'Calibrated pressure for tired muscles',
    highlights: ['Shoulder muscle release', 'Neck mobility relief', 'Focused manual pressure'],
    features: ['Shoulder muscle release', 'Neck mobility relief', 'Focused manual pressure'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hair-color-application',
    name: 'Hair & Beard Color Touch-up',
    category: 'other',
    description: 'Even grey coverage using gentle formulations with minimal scalp tingling.',
    price: '₹200',
    duration: 40,
    homeServiceAvailable: true,
    active: true,
    isPopular: false,
    tagline: 'Natural-looking tone and thorough wash',
    highlights: ['Even scalp coverage', 'Skin margin clean-up', 'Thorough shampoo rinse'],
    features: ['Even scalp coverage', 'Skin margin clean-up', 'Thorough shampoo rinse'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_STAFF: StaffModel[] = [
  {
    id: 'staff-1',
    name: 'Founder & Senior Barber',
    title: 'Proprietor & Senior Barber',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff-2',
    name: 'Associate Barber & Groomer',
    title: 'Senior Styling Associate',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// In-Memory Database Implementation (Guaranteed concurrency-safe in Node single-thread event loop)
class InMemoryDatabaseRepository implements DatabaseRepository {
  private services: Map<string, ServiceModel> = new Map();
  private staff: Map<string, StaffModel> = new Map();
  private settings: BusinessSettingsModel = { ...DEFAULT_BUSINESS_SETTINGS };
  private appointments: Map<string, AppointmentModel> = new Map();
  private images: Map<string, ImageModel> = new Map();

  constructor() {
    INITIAL_SERVICES.forEach((s) => this.services.set(s.id, { ...s }));
    INITIAL_STAFF.forEach((st) => this.staff.set(st.id, { ...st }));

    // Add 2 initial upcoming appointment samples for demonstration in admin
    const today = new Date().toISOString().split('T')[0];
    const sampleAppointment: AppointmentModel = {
      id: 'apt-sample-1',
      bookingReference: 'GLS-8021',
      customerName: 'Aarav Sharma',
      mobile: '9876543210',
      serviceId: 'classic-haircut',
      staffId: 'staff-1',
      locationType: 'SALON',
      appointmentDate: today,
      startTime: '10:00',
      endTime: '10:30',
      status: 'CONFIRMED',
      notes: 'Prefers classic scissor cut with short sides',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.appointments.set(sampleAppointment.id, sampleAppointment);
  }

  // Services
  async getServices(activeOnly = false): Promise<ServiceModel[]> {
    const list = Array.from(this.services.values());
    if (activeOnly) {
      return list.filter((s) => s.active);
    }
    return list;
  }

  async getServiceById(id: string): Promise<ServiceModel | null> {
    return this.services.get(id) || null;
  }

  async createService(data: Omit<ServiceModel, 'createdAt' | 'updatedAt'>): Promise<ServiceModel> {
    const now = new Date().toISOString();
    const service: ServiceModel = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.services.set(service.id, service);
    return service;
  }

  async updateService(id: string, updates: Partial<ServiceModel>): Promise<ServiceModel | null> {
    const existing = this.services.get(id);
    if (!existing) return null;
    const updated: ServiceModel = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    const existing = this.services.get(id);
    if (!existing) return false;
    // Soft delete / deactivation to preserve appointment history
    existing.active = false;
    existing.updatedAt = new Date().toISOString();
    this.services.set(id, existing);
    return true;
  }

  // Staff
  async getStaff(activeOnly = false): Promise<StaffModel[]> {
    const list = Array.from(this.staff.values());
    if (activeOnly) {
      return list.filter((st) => st.active);
    }
    return list;
  }

  async getStaffById(id: string): Promise<StaffModel | null> {
    return this.staff.get(id) || null;
  }

  // Settings
  async getBusinessSettings(): Promise<BusinessSettingsModel> {
    return { ...this.settings };
  }

  async updateBusinessSettings(updates: Partial<BusinessSettingsModel>): Promise<BusinessSettingsModel> {
    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.settings };
  }

  // Appointments
  async getAppointments(filters?: { date?: string; status?: AppointmentStatus; locationType?: LocationType }): Promise<AppointmentModel[]> {
    let list = Array.from(this.appointments.values());
    if (filters?.date) {
      list = list.filter((a) => a.appointmentDate === filters.date);
    }
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.locationType) {
      list = list.filter((a) => a.locationType === filters.locationType);
    }
    // Sort chronologically
    return list.sort((a, b) => {
      const dateCmp = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateCmp !== 0) return dateCmp;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  async getAppointmentById(id: string): Promise<AppointmentModel | null> {
    return this.appointments.get(id) || null;
  }

  async getAppointmentByReference(reference: string): Promise<AppointmentModel | null> {
    const match = Array.from(this.appointments.values()).find(
      (a) => a.bookingReference.toLowerCase() === reference.toLowerCase()
    );
    return match || null;
  }

  async createAppointment(data: Omit<AppointmentModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppointmentModel> {
    const id = 'apt-' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const appointment: AppointmentModel = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentModel | null> {
    const existing = this.appointments.get(id);
    if (!existing) return null;
    const updated: AppointmentModel = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.appointments.set(id, updated);
    return updated;
  }

  // Images Repository Methods
  async getImages(filters?: { slot?: ImageSlot; isActive?: boolean; serviceId?: string }): Promise<ImageModel[]> {
    let list = Array.from(this.images.values());
    if (filters?.slot) {
      list = list.filter((img) => img.slot === filters.slot);
    }
    if (filters?.isActive !== undefined) {
      list = list.filter((img) => img.isActive === filters.isActive);
    }
    if (filters?.serviceId !== undefined) {
      list = list.filter((img) => img.serviceId === filters.serviceId);
    }
    // Sort newest first
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getImageById(id: string): Promise<ImageModel | null> {
    return this.images.get(id) || null;
  }

  async createImage(data: Omit<ImageModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImageModel> {
    const id = 'img-' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    // Enforce business rule: Only ONE active HERO image at a time
    if (data.slot === 'HERO' && data.isActive) {
      for (const [key, existing] of this.images.entries()) {
        if (existing.slot === 'HERO' && existing.isActive) {
          this.images.set(key, {
            ...existing,
            isActive: false,
            updatedAt: now,
          });
        }
      }
    }

    const image: ImageModel = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.images.set(id, image);
    return image;
  }

  async updateImage(id: string, updates: Partial<ImageModel>): Promise<ImageModel | null> {
    const existing = this.images.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const targetSlot = updates.slot || existing.slot;
    const targetIsActive = updates.isActive !== undefined ? updates.isActive : existing.isActive;

    // Enforce business rule: Only ONE active HERO image at a time
    if (targetSlot === 'HERO' && targetIsActive) {
      for (const [key, current] of this.images.entries()) {
        if (key !== id && current.slot === 'HERO' && current.isActive) {
          this.images.set(key, {
            ...current,
            isActive: false,
            updatedAt: now,
          });
        }
      }
    }

    const updated: ImageModel = {
      ...existing,
      ...updates,
      updatedAt: now,
    };
    this.images.set(id, updated);
    return updated;
  }

  async deleteImage(id: string): Promise<boolean> {
    return this.images.delete(id);
  }

  async getActiveImageForSlot(slot: ImageSlot, serviceId?: string): Promise<ImageModel | null> {
    const list = Array.from(this.images.values());
    if (slot === 'SERVICE' && serviceId) {
      const match = list.find((img) => img.slot === 'SERVICE' && img.serviceId === serviceId && img.isActive);
      if (match) return match;
    }

    const match = list.find((img) => img.slot === slot && img.isActive);
    return match || null;
  }
}

// Singleton DB Client instance
export const db: DatabaseRepository = new InMemoryDatabaseRepository();
