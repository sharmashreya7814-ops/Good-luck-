import { db } from '../db/dbClient';
import { 
  AppointmentModel, 
  CreateAppointmentDTO, 
  AppointmentStatus,
  LocationType 
} from '../types';
import { 
  timeToMinutes, 
  addMinutesToTime, 
  isSaturday, 
  isTimeOverlap,
  isValidDateString,
  isValidTimeString
} from '../utils/dateUtils';
import { generateBookingReference } from '../utils/referenceGenerator';

// Mutex lock to serialize concurrent booking checks and eliminate race conditions
class AsyncLock {
  private queue: Promise<void> = Promise.resolve();

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    let release: () => void;
    const nextInQueue = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentQueue = this.queue;
    this.queue = currentQueue.then(() => nextInQueue);

    await currentQueue;
    try {
      return await task();
    } finally {
      release!();
    }
  }
}

const bookingLock = new AsyncLock();

export class AppointmentService {
  /**
   * Creates an appointment following all 14 business rules with concurrency protection.
   */
  async createAppointment(data: CreateAppointmentDTO): Promise<AppointmentModel> {
    // Acquire mutex lock to ensure atomic slot verification and reservation
    return await bookingLock.acquire(async () => {
      // 1. Validate customer details
      const customerName = (data.customerName || '').trim();
      const mobile = (data.mobile || '').replace(/\D/g, '');
      if (customerName.length < 2) {
        throw { status: 400, message: 'Customer name must be at least 2 characters.' };
      }
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        throw { status: 400, message: 'A valid 10-digit Indian mobile number is required.' };
      }

      // 2. Validate service exists and is active
      const service = await db.getServiceById(data.serviceId);
      if (!service || !service.active) {
        throw { status: 404, message: 'Selected service is currently unavailable or inactive.' };
      }

      // 3. Validate date/time format
      if (!isValidDateString(data.appointmentDate)) {
        throw { status: 400, message: 'Invalid appointment date format (expected YYYY-MM-DD).' };
      }
      if (!isValidTimeString(data.startTime)) {
        throw { status: 400, message: 'Invalid start time format (expected HH:mm).' };
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (data.appointmentDate < todayStr) {
        throw { status: 400, message: 'Appointments cannot be booked for past dates.' };
      }

      // 4. Validate service duration & compute end time
      const duration = service.duration;
      const startTime = data.startTime;
      const endTime = addMinutesToTime(startTime, duration);

      // 5. Validate location
      const locationType: LocationType = data.locationType === 'HOME' ? 'HOME' : 'SALON';
      const settings = await db.getBusinessSettings();

      // 6. If HOME: verify home service is enabled globally and for this service
      if (locationType === 'HOME') {
        if (!settings.homeServiceEnabled) {
          throw { status: 400, message: 'Home visits are currently paused salon-wide.' };
        }
        if (!service.homeServiceAvailable) {
          throw { status: 400, message: `The service "${service.name}" is only performed at the salon.` };
        }
        if (!data.address || data.address.trim().length < 5) {
          throw { status: 400, message: 'A valid home address is required for home service.' };
        }
      }

      // 7. Check business hours
      const isSat = isSaturday(data.appointmentDate);
      const openTime = settings.openingTime; // '09:00'
      const closeTime = isSat ? settings.saturdayClosingTime : settings.closingTime; // '14:00' vs '21:00'

      const startMins = timeToMinutes(startTime);
      const endMins = timeToMinutes(endTime);
      const openMins = timeToMinutes(openTime);
      const closeMins = timeToMinutes(closeTime);

      if (startMins < openMins) {
        throw { status: 400, message: `The salon opens at ${openTime}. Selected time is before opening.` };
      }
      if (endMins > closeMins) {
        throw { 
          status: 400, 
          message: `The salon closes at ${closeTime}${isSat ? ' (Saturday Half Day)' : ''}. The ${duration}-min service would exceed closing hours.` 
        };
      }

      // 8. Check break (Mon-Fri & Sun: 14:00 to 15:00)
      if (!isSat && isTimeOverlap(startTime, endTime, settings.breakStart, settings.breakEnd)) {
        throw { 
          status: 400, 
          message: `Selected slot overlaps with the salon afternoon break (${settings.breakStart} - ${settings.breakEnd}).` 
        };
      }

      // 9. Check Saturday schedule (Half day 9:00 - 14:00 already enforced above)

      // 10. Find available staff and prevent overlapping booking
      const activeStaff = await db.getStaff(true);
      if (activeStaff.length === 0) {
        throw { status: 503, message: 'No salon staff are currently available to take appointments.' };
      }

      // Query confirmed bookings for this date
      const existingAppointments = await db.getAppointments({ date: data.appointmentDate });
      const activeBookings = existingAppointments.filter((a) => a.status !== 'CANCELLED');

      // Find which staff member is free for the exact interval [startTime, endTime)
      let assignedStaffId: string | undefined = undefined;

      for (const staffMember of activeStaff) {
        const hasStaffConflict = activeBookings.some((apt) => {
          if (apt.staffId === staffMember.id) {
            return isTimeOverlap(startTime, endTime, apt.startTime, apt.endTime);
          }
          return false;
        });

        if (!hasStaffConflict) {
          assignedStaffId = staffMember.id;
          break;
        }
      }

      // 11. Overlapping check: if no staff member is free
      if (!assignedStaffId) {
        throw { 
          status: 409, 
          message: 'Selected time slot is no longer available. All chairs are booked for this time window.' 
        };
      }

      // 12. Generate unique booking reference
      let bookingReference = generateBookingReference();
      let attempts = 0;
      while (await db.getAppointmentByReference(bookingReference)) {
        bookingReference = generateBookingReference();
        attempts++;
        if (attempts > 5) break;
      }

      // 13. Save appointment
      const newAppointment = await db.createAppointment({
        bookingReference,
        customerName,
        mobile,
        serviceId: service.id,
        serviceName: service.name,
        staffId: assignedStaffId,
        locationType,
        address: locationType === 'HOME' ? data.address?.trim() : undefined,
        locality: locationType === 'HOME' ? data.locality?.trim() : undefined,
        appointmentDate: data.appointmentDate,
        startTime,
        endTime,
        notes: data.notes?.trim() || undefined,
        status: 'CONFIRMED',
      });

      // 14. Return confirmation data
      return newAppointment;
    });
  }

  async getAppointments(filters?: { date?: string; status?: AppointmentStatus; locationType?: LocationType }) {
    const list = await db.getAppointments(filters);
    // Enrich with service name if missing
    const services = await db.getServices();
    const serviceMap = new Map(services.map((s) => [s.id, s.name]));
    return list.map((a) => ({
      ...a,
      serviceName: a.serviceName || serviceMap.get(a.serviceId) || a.serviceId,
    }));
  }

  async getAppointmentById(id: string) {
    const appointment = await db.getAppointmentById(id);
    if (!appointment) {
      throw { status: 404, message: 'Appointment not found.' };
    }
    if (!appointment.serviceName) {
      const service = await db.getServiceById(appointment.serviceId);
      if (service) appointment.serviceName = service.name;
    }
    return appointment;
  }

  async getAppointmentByReference(reference: string) {
    const appointment = await db.getAppointmentByReference(reference);
    if (!appointment) {
      throw { status: 404, message: `No booking found matching reference "${reference}".` };
    }
    if (!appointment.serviceName) {
      const service = await db.getServiceById(appointment.serviceId);
      if (service) appointment.serviceName = service.name;
    }
    return appointment;
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const validStatuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw { status: 400, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }
    const updated = await db.updateAppointmentStatus(id, status);
    if (!updated) {
      throw { status: 404, message: 'Appointment not found.' };
    }
    return updated;
  }
}

export const appointmentService = new AppointmentService();
