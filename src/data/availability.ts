import { BUSINESS_INFO } from './business';
import { TimeSlotAvailability, ExistingAppointmentMock } from '../types';

/**
 * MOCK EXISTING APPOINTMENTS
 * 
 * Separated mock data representing currently booked slots across the 2 service chairs.
 * In a future backend implementation, this will be fetched from the database / API.
 */
export const MOCK_EXISTING_APPOINTMENTS: ExistingAppointmentMock[] = [
  // Example mock bookings to demonstrate real capacity calculation (staffCount = 2)
  {
    id: 'mock-b1',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM',
    durationMinutes: 30,
    staffAssigned: 1, // 1 staff busy, 1 staff still available
  },
  {
    id: 'mock-b2',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '17:00 PM', // 5:00 PM
    durationMinutes: 60,
    staffAssigned: 2, // Both chairs busy at 5:00 PM today
  },
];

/**
 * ARCHITECTURE FOR CALCULATING REAL AVAILABILITY
 * 
 * Uses business parameters:
 * - openingTime & closingTime (9:00 AM – 9:00 PM)
 * - saturdaySchedule (9:00 AM – 2:00 PM)
 * - breakStart & breakEnd (2:00 PM – 3:00 PM daily break)
 * - staffCount (2 service providers)
 * - serviceDuration
 * - existing appointments
 */
export function calculateAvailableSlots(options: {
  date: string; // YYYY-MM-DD
  serviceDuration: number; // in minutes
  staffCount?: number;
  existingAppointments?: ExistingAppointmentMock[];
}): TimeSlotAvailability[] {
  const {
    date,
    serviceDuration,
    staffCount = BUSINESS_INFO.staffCount,
    existingAppointments = MOCK_EXISTING_APPOINTMENTS,
  } = options;

  // Determine day of week
  // Appending T00:00:00 ensures local parsing without UTC day shifts
  const dateObj = new Date(`${date}T00:00:00`);
  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
  const isSaturday = dayOfWeek === 6;

  // Operating window in 24h format
  const openHour = 9;
  const openMinute = 0;
  const closeHour = isSaturday ? 14 : 21; // 2:00 PM on Sat, 9:00 PM on others
  const closeMinute = 0;

  // Break window: 2:00 PM – 3:00 PM
  const breakStartHour = 14;
  const breakEndHour = 15;

  const slots: TimeSlotAvailability[] = [];

  // Generate 30-minute intervals
  for (let h = openHour; h < closeHour; h++) {
    for (const m of [0, 30]) {
      const slotStartMinutes = h * 60 + m;
      const slotEndMinutes = slotStartMinutes + serviceDuration;
      const closeLimitMinutes = closeHour * 60 + closeMinute;

      // Check if service would extend past closing time
      if (slotEndMinutes > closeLimitMinutes) {
        continue;
      }

      // Format human-readable time string
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const displayMinute = m === 0 ? '00' : '30';
      const timeString = `${displayHour}:${displayMinute} ${period}`;

      // Check break overlap (2:00 PM to 3:00 PM)
      const isDuringBreak = h >= breakStartHour && h < breakEndHour;
      if (isDuringBreak) {
        slots.push({
          time: timeString,
          hour24: h,
          minute: m,
          isAvailable: false,
          remainingCapacity: 0,
          reason: 'Daily staff break (2:00 PM – 3:00 PM)',
        });
        continue;
      }

      // Check existing booked capacity for this date and time
      const conflictingBookings = existingAppointments.filter(
        (app) => app.date === date && app.timeSlot.toLowerCase() === timeString.toLowerCase()
      );
      const bookedStaffCount = conflictingBookings.reduce(
        (sum, app) => sum + app.staffAssigned,
        0
      );
      const remainingCapacity = Math.max(0, staffCount - bookedStaffCount);
      const isAvailable = remainingCapacity > 0;

      slots.push({
        time: timeString,
        hour24: h,
        minute: m,
        isAvailable,
        remainingCapacity,
        reason: isAvailable ? undefined : 'All service chairs reserved for this slot',
      });
    }
  }

  return slots;
}

/**
 * Backend-connected async helper function.
 * Calls the backend /api/availability endpoint and falls back gracefully to local calculations.
 */
export async function fetchAvailableTimeSlots(
  date: string,
  serviceDuration: number,
  serviceId?: string,
  locationType: 'SALON' | 'HOME' = 'SALON'
): Promise<TimeSlotAvailability[]> {
  try {
    if (serviceId) {
      const response = await fetch(
        `/api/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}&locationType=${locationType}`
      );
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data?.slots)) {
          // Map backend slot format to UI TimeSlotAvailability
          return json.data.slots.map((s: any) => {
            const [h, m] = s.time.split(':').map(Number);
            const period = h >= 12 ? 'PM' : 'AM';
            const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
            const displayMinute = m === 0 ? '00' : '30';
            const timeString = `${displayHour}:${displayMinute} ${period}`;

            return {
              time: timeString,
              hour24: h,
              minute: m,
              isAvailable: s.isAvailable,
              remainingCapacity: s.remainingCapacity,
              reason: s.reason,
            };
          });
        }
      }
    }
  } catch (e) {
    // Graceful fallback to client engine
  }

  // Local fallback calculation
  return calculateAvailableSlots({ date, serviceDuration });
}
