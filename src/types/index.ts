export type ServiceCategory = 'hair' | 'beard' | 'massage' | 'other';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  tagline?: string;
  description: string;
  price: string; // Clearly marked as placeholder / starting indicative price
  priceDisplay?: string; // backwards compatibility
  priceNumeric?: number | null;
  duration: number; // in minutes
  durationMinutes?: number; // backwards compatibility
  homeServiceAvailable: boolean;
  active: boolean;
  isPopular?: boolean;
  highlights?: string[];
  features?: string[];
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessConfig {
  name: string;
  brandTagline: string;
  shortDescription: string;
  fatherTitle: string;
  fatherRole: string;
  openingTime: string; // e.g. "09:00"
  closingTime: string; // e.g. "21:00"
  breakStart: string;  // e.g. "14:00"
  breakEnd: string;    // e.g. "15:00"
  workingDays: number; // 7
  saturdaySchedule: {
    openingTime: string; // "09:00"
    closingTime: string; // "14:00"
    label: string;
  };
  staffCount: number; // 2
  homeServiceAvailable: boolean;
  paymentMethods: string[];
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    breakTime: string;
    openDaysCount: number;
  };
  capacity: {
    simultaneousChairs: number;
    dailyCapacityEstimate: string;
  };
  contact: {
    phone: string;
    whatsappNumber: string;
    whatsappLink: string;
    addressNote: string;
    area: string;
    googleMapsEmbedUrl?: string;
  };
}

export interface TimeSlotAvailability {
  time: string;
  hour24: number;
  minute: number;
  isAvailable: boolean;
  remainingCapacity: number;
  reason?: string;
}

export interface ExistingAppointmentMock {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  durationMinutes: number;
  staffAssigned: number;
}

export interface BookingFormData {
  serviceId: string;
  locationType: 'salon' | 'home';
  homeAddress?: string;
  homeArea?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export interface ConfirmedBooking extends BookingFormData {
  bookingId: string;
  serviceName: string;
  durationMinutes: number;
  priceDisplay: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  quote: string;
  clientName: string;
  relation: string;
  serviceType: string;
  rating: number;
}
