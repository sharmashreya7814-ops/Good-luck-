import { db } from '../db/dbClient';
import { 
  TimeSlotAvailability, 
  LocationType, 
  ServiceModel, 
  BusinessSettingsModel,
  StaffModel,
  AppointmentModel 
} from '../types';
import { 
  timeToMinutes, 
  minutesToTime, 
  addMinutesToTime, 
  isSaturday, 
  isTimeOverlap 
} from '../utils/dateUtils';

export class AvailabilityService {
  /**
   * Computes available slots for a given service, date, and location.
   */
  async getAvailability(
    serviceId: string,
    date: string,
    locationType: LocationType = 'SALON'
  ): Promise<{
    date: string;
    service: ServiceModel;
    settings: BusinessSettingsModel;
    slots: TimeSlotAvailability[];
  }> {
    // 1. Fetch Service & validate
    const service = await db.getServiceById(serviceId);
    if (!service || !service.active) {
      throw { status: 404, message: 'Requested service is either inactive or does not exist.' };
    }

    // 2. Fetch Business Settings
    const settings = await db.getBusinessSettings();

    // 3. Location validation
    if (locationType === 'HOME') {
      if (!settings.homeServiceEnabled) {
        throw { status: 400, message: 'Home visits are currently paused salon-wide.' };
      }
      if (!service.homeServiceAvailable) {
        throw { status: 400, message: `The service "${service.name}" is exclusively offered at the salon.` };
      }
    }

    // 4. Determine schedule for the given date
    const isSat = isSaturday(date);
    const openingTime = settings.openingTime; // '09:00'
    const closingTime = isSat ? settings.saturdayClosingTime : settings.closingTime; // '14:00' vs '21:00'
    const breakStart = settings.breakStart;   // '14:00'
    const breakEnd = settings.breakEnd;       // '15:00'

    // 5. Fetch Active Staff
    const activeStaff = await db.getStaff(true);
    const totalStaffCapacity = activeStaff.length > 0 ? activeStaff.length : settings.staffCount;

    // 6. Fetch Existing Non-Cancelled Appointments for this date
    const existingAppointments = await db.getAppointments({ date });
    const confirmedAppointments = existingAppointments.filter((a) => a.status !== 'CANCELLED');

    // 7. Generate Slots
    const step = settings.slotIntervalMinutes || 30;
    const startMins = timeToMinutes(openingTime);
    const closeMins = timeToMinutes(closingTime);
    const serviceDuration = service.duration;

    const slots: TimeSlotAvailability[] = [];

    // Current time check if booking for today
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = date === todayStr;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    for (let currentSlotMins = startMins; currentSlotMins < closeMins; currentSlotMins += step) {
      const slotStartTime = minutesToTime(currentSlotMins);
      const slotEndTime = addMinutesToTime(slotStartTime, serviceDuration);
      const slotEndMins = timeToMinutes(slotEndTime);

      // Condition A: Slot ends past salon closing time
      if (slotEndMins > closeMins) {
        slots.push({
          time: slotStartTime,
          endTime: slotEndTime,
          isAvailable: false,
          remainingCapacity: 0,
          totalCapacity: totalStaffCapacity,
          availableStaffIds: [],
          reason: `Service duration (${serviceDuration} mins) extends past closing time (${closingTime})`,
        });
        continue;
      }

      // Condition B: Afternoon Break (Mon-Fri & Sun)
      // Note: On Saturday half-day, closing is at 14:00, so break does not apply.
      if (!isSat && isTimeOverlap(slotStartTime, slotEndTime, breakStart, breakEnd)) {
        slots.push({
          time: slotStartTime,
          endTime: slotEndTime,
          isAvailable: false,
          remainingCapacity: 0,
          totalCapacity: totalStaffCapacity,
          availableStaffIds: [],
          reason: `Intersects with daily rest break (${breakStart} - ${breakEnd})`,
        });
        continue;
      }

      // Condition C: If today, slot must be at least 15 minutes ahead of current time
      if (isToday && currentSlotMins <= currentMins + 15) {
        slots.push({
          time: slotStartTime,
          endTime: slotEndTime,
          isAvailable: false,
          remainingCapacity: 0,
          totalCapacity: totalStaffCapacity,
          availableStaffIds: [],
          reason: 'Time slot has already elapsed for today',
        });
        continue;
      }

      // Condition D: Check Staff Overlap
      // For each active staff member, see if they are occupied
      const availableStaff: StaffModel[] = [];

      for (const staffMember of activeStaff) {
        // Check if this staff member has an overlapping appointment
        const hasConflict = confirmedAppointments.some((apt) => {
          // If appointment explicitly assigned to this staff member
          if (apt.staffId === staffMember.id) {
            return isTimeOverlap(slotStartTime, slotEndTime, apt.startTime, apt.endTime);
          }
          return false;
        });

        if (!hasConflict) {
          availableStaff.push(staffMember);
        }
      }

      // Also account for unassigned appointments occupying salon capacity
      const unassignedOverlaps = confirmedAppointments.filter(
        (apt) => !apt.staffId && isTimeOverlap(slotStartTime, slotEndTime, apt.startTime, apt.endTime)
      ).length;

      const remainingCapacity = Math.max(0, availableStaff.length - unassignedOverlaps);
      const isAvailable = remainingCapacity > 0;

      slots.push({
        time: slotStartTime,
        endTime: slotEndTime,
        isAvailable,
        remainingCapacity,
        totalCapacity: totalStaffCapacity,
        availableStaffIds: isAvailable ? availableStaff.map((s) => s.id) : [],
        reason: isAvailable ? undefined : 'All salon chairs booked for this time window',
      });
    }

    return {
      date,
      service,
      settings,
      slots,
    };
  }

  /**
   * Evaluates if a specific time window is available and assigns an available staff member.
   */
  async findAvailableStaffForSlot(
    date: string,
    startTime: string,
    durationMinutes: number
  ): Promise<string | null> {
    const endTime = addMinutesToTime(startTime, durationMinutes);
    const activeStaff = await db.getStaff(true);
    const existingAppointments = await db.getAppointments({ date });
    const activeAppointments = existingAppointments.filter((a) => a.status !== 'CANCELLED');

    for (const staff of activeStaff) {
      const isStaffBusy = activeAppointments.some(
        (apt) => apt.staffId === staff.id && isTimeOverlap(startTime, endTime, apt.startTime, apt.endTime)
      );
      if (!isStaffBusy) {
        return staff.id;
      }
    }

    return null;
  }
}

export const availabilityService = new AvailabilityService();
