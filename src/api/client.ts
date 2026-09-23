/**
 * Frontend API Client for Good Luck Hair Salon
 * Communicates with backend endpoints (/api/...) with clean error handling
 * and fallback capabilities for offline/standalone execution.
 */

import { SERVICES } from '../data/services';
import { calculateAvailableSlots } from '../data/availability';

export interface ApiTimeSlot {
  time: string;
  endTime: string;
  isAvailable: boolean;
  remainingCapacity: number;
  totalCapacity: number;
  reason?: string;
}

export interface ApiAppointmentPayload {
  customerName: string;
  mobile: string;
  serviceId: string;
  locationType: 'SALON' | 'HOME';
  address?: string;
  locality?: string;
  appointmentDate: string;
  startTime: string;
  notes?: string;
}

export interface ApiAppointmentResponse {
  id: string;
  bookingReference: string;
  customerName: string;
  mobile: string;
  serviceId: string;
  locationType: 'SALON' | 'HOME';
  address?: string;
  locality?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export type ImageSlotType = 'HERO' | 'ABOUT' | 'GALLERY' | 'SERVICE' | 'LOGO';

export interface ApiImageModel {
  id: string;
  slot: ImageSlotType;
  serviceId?: string | null;
  storageKey: string;
  publicUrl: string;
  altText: string;
  mimeType: string;
  fileSize: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = ''; // Relative to current origin in full-stack setup

class SalonApiClient {
  private adminToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.adminToken = sessionStorage.getItem('gls_admin_token') || localStorage.getItem('gls_admin_token');
    }
  }

  setAdminToken(token: string | null) {
    this.adminToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('gls_admin_token', token);
      } else {
        sessionStorage.removeItem('gls_admin_token');
      }
    }
  }

  getAdminToken(): string | null {
    return this.adminToken;
  }

  /**
   * Fetch services from backend or fallback to local definition
   */
  async getServices(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/services`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[API Client] Falling back to local services catalog:', e);
    }
    return SERVICES;
  }

  /**
   * Fetch availability for a specific service, date, and location
   */
  async getAvailability(
    serviceId: string,
    date: string,
    locationType: 'SALON' | 'HOME' = 'SALON'
  ): Promise<ApiTimeSlot[]> {
    try {
      const params = new URLSearchParams({
        serviceId,
        date,
        locationType,
      });
      const res = await fetch(`${API_BASE_URL}/api/availability?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.slots) {
          return json.data.slots;
        }
      }
    } catch (e) {
      console.warn('[API Client] Backend availability fetch failed, using frontend engine fallback:', e);
    }

    // Seamless fallback to client availability calculation if server is temporarily unreachable
    const fallbackSlots = calculateAvailableSlots({ date, serviceDuration: 30 });
    return fallbackSlots.map((s) => ({
      time: s.time,
      endTime: s.time,
      isAvailable: s.isAvailable,
      remainingCapacity: s.isAvailable ? 2 : 0,
      totalCapacity: 2,
      reason: s.reason,
    }));
  }

  /**
   * Create an appointment with backend validation & atomic capacity reservation
   */
  async createAppointment(payload: ApiAppointmentPayload): Promise<ApiAppointmentResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to confirm appointment. Please choose another time slot.');
      }

      return json.data;
    } catch (err: any) {
      // If network offline or dev fallback needed
      if (err.message && !err.message.includes('Failed to fetch')) {
        throw err;
      }

      // Standalone simulation fallback
      console.warn('[API Client] Creating local confirmation fallback:', err);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return {
        id: 'apt-sim-' + Date.now(),
        bookingReference: `GLS-${randomSuffix}`,
        customerName: payload.customerName,
        mobile: payload.mobile,
        serviceId: payload.serviceId,
        locationType: payload.locationType,
        address: payload.address,
        locality: payload.locality,
        appointmentDate: payload.appointmentDate,
        startTime: payload.startTime,
        endTime: payload.startTime,
        status: 'CONFIRMED',
        notes: payload.notes,
        createdAt: new Date().toISOString(),
      };
    }
  }

  // --- Admin Endpoints ---

  private getAuthHeaders(isFormData = false): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.adminToken) {
      headers['x-admin-token'] = this.adminToken;
      headers['Authorization'] = `Bearer ${this.adminToken}`;
    }
    return headers;
  }

  async getAdminDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Admin authentication required.');
    }
    return json.data;
  }

  async getAdminAppointments(filters?: { date?: string; status?: string; locationType?: string }): Promise<any[]> {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/appointments?${query}`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch appointments.');
    }
    return json.data;
  }

  async getAdminCustomers(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/customers`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch customer list.');
    }
    return json.data;
  }

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update status.');
    }
    return json.data;
  }

  async getAdminServices(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/services`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch services.');
    }
    return json.data;
  }

  async updateService(id: string, updates: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/services/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update service.');
    }
    return json.data;
  }

  async getAdminSettings(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch business settings.');
    }
    return json.data;
  }

  async updateAdminSettings(updates: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update business settings.');
    }
    return json.data;
  }

  // --- Public Image Endpoints ---

  async getActiveImage(slot: ImageSlotType, serviceId?: string): Promise<ApiImageModel | null> {
    try {
      const query = new URLSearchParams({ slot, ...(serviceId ? { serviceId } : {}) }).toString();
      const res = await fetch(`${API_BASE_URL}/api/images/active?${query}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn(`[API Client] Failed to fetch active image for slot "${slot}":`, e);
    }
    return null;
  }

  // --- Admin Image Management Endpoints ---

  async getAdminImages(filters?: { slot?: string; isActive?: boolean; serviceId?: string }): Promise<ApiImageModel[]> {
    const params = new URLSearchParams();
    if (filters?.slot) params.set('slot', filters.slot);
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters?.serviceId) params.set('serviceId', filters.serviceId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/admin/images${queryString}`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch images list.');
    }
    return json.data;
  }

  async uploadAdminImage(formData: FormData): Promise<ApiImageModel> {
    const res = await fetch(`${API_BASE_URL}/api/admin/images`, {
      method: 'POST',
      headers: this.getAuthHeaders(true), // Let browser set multipart boundary
      body: formData,
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to upload image.');
    }
    return json.data;
  }

  async updateAdminImage(
    id: string,
    updates: { altText?: string; isActive?: boolean; slot?: string; serviceId?: string | null }
  ): Promise<ApiImageModel> {
    const res = await fetch(`${API_BASE_URL}/api/admin/images/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update image.');
    }
    return json.data;
  }

  async replaceAdminImage(id: string, formData: FormData): Promise<ApiImageModel> {
    const res = await fetch(`${API_BASE_URL}/api/admin/images/${id}/file`, {
      method: 'PUT',
      headers: this.getAuthHeaders(true),
      body: formData,
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to replace image file.');
    }
    return json.data;
  }

  async deleteAdminImage(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/api/admin/images/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete image.');
    }
    return true;
  }
}

export const apiClient = new SalonApiClient();
