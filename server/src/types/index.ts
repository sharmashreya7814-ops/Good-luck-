export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type LocationType = 'SALON' | 'HOME';
export type ServiceCategory = 'hair' | 'beard' | 'massage' | 'other';

export interface ServiceModel {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: string;
  duration: number; // in minutes
  homeServiceAvailable: boolean;
  active: boolean;
  isPopular?: boolean;
  tagline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffModel {
  id: string;
  name: string;
  title?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettingsModel {
  id: string;
  openingTime: string; // '09:00'
  closingTime: string; // '21:00'
  breakStart: string;  // '14:00'
  breakEnd: string;    // '15:00'
  saturdayClosingTime: string; // '14:00'
  staffCount: number;  // 2
  homeServiceEnabled: boolean;
  slotIntervalMinutes: number; // 30
  updatedAt: string;
}

export interface AppointmentModel {
  id: string;
  bookingReference: string;
  customerName: string;
  mobile: string;
  serviceId: string;
  serviceName?: string;
  staffId?: string;
  locationType: LocationType;
  address?: string;
  locality?: string;
  appointmentDate: string; // 'YYYY-MM-DD'
  startTime: string;       // 'HH:mm'
  endTime: string;         // 'HH:mm'
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlotAvailability {
  time: string; // '09:00'
  endTime: string; // '09:30'
  isAvailable: boolean;
  remainingCapacity: number; // out of total active staff (e.g., 2)
  totalCapacity: number;
  availableStaffIds: string[];
  reason?: string;
}

export interface CreateAppointmentDTO {
  customerName: string;
  mobile: string;
  serviceId: string;
  locationType: LocationType;
  address?: string;
  locality?: string;
  appointmentDate: string; // 'YYYY-MM-DD'
  startTime: string;       // 'HH:mm'
  notes?: string;
}

export interface UpdateAppointmentStatusDTO {
  status: AppointmentStatus;
}

export interface AdminDashboardMetrics {
  todayAppointmentsCount: number;
  upcomingAppointmentsCount: number;
  completedCount: number;
  cancelledCount: number;
  pendingCount: number;
  activeStaffCount: number;
  activeServicesCount: number;
  salonAppointmentsCount: number;
  homeAppointmentsCount: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
