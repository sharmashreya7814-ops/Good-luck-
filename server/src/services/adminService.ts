import { db } from '../db/dbClient';
import { 
  AdminDashboardMetrics, 
  AppointmentModel, 
  BusinessSettingsModel, 
  StaffModel 
} from '../types';

export class AdminService {
  async getDashboardMetrics(): Promise<{
    metrics: AdminDashboardMetrics;
    todayAppointments: AppointmentModel[];
    settings: BusinessSettingsModel;
    staff: StaffModel[];
  }> {
    const todayStr = new Date().toISOString().split('T')[0];
    const allAppointments = await db.getAppointments();
    const activeStaff = await db.getStaff(true);
    const activeServices = await db.getServices(true);
    const settings = await db.getBusinessSettings();

    const todayAppointments = allAppointments.filter((a) => a.appointmentDate === todayStr);
    const upcomingAppointments = allAppointments.filter(
      (a) => a.appointmentDate > todayStr && a.status !== 'CANCELLED'
    );

    const completed = allAppointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = allAppointments.filter((a) => a.status === 'CANCELLED').length;
    const pending = allAppointments.filter((a) => a.status === 'PENDING').length;
    const salonApts = allAppointments.filter((a) => a.locationType === 'SALON').length;
    const homeApts = allAppointments.filter((a) => a.locationType === 'HOME').length;

    const metrics: AdminDashboardMetrics = {
      todayAppointmentsCount: todayAppointments.length,
      upcomingAppointmentsCount: upcomingAppointments.length,
      completedCount: completed,
      cancelledCount: cancelled,
      pendingCount: pending,
      activeStaffCount: activeStaff.length,
      activeServicesCount: activeServices.length,
      salonAppointmentsCount: salonApts,
      homeAppointmentsCount: homeApts,
    };

    const serviceMap = new Map(activeServices.map((s) => [s.id, s.name]));
    const enrichedTodayAppointments = todayAppointments.map((a) => ({
      ...a,
      serviceName: a.serviceName || serviceMap.get(a.serviceId) || a.serviceId,
    }));

    return {
      metrics,
      todayAppointments: enrichedTodayAppointments,
      settings,
      staff: activeStaff,
    };
  }

  async getCustomerDirectory(): Promise<Array<{
    customerName: string;
    mobile: string;
    totalBookings: number;
    lastAppointmentDate: string;
    preferredLocation: string;
  }>> {
    const appointments = await db.getAppointments();
    const customerMap = new Map<string, {
      customerName: string;
      mobile: string;
      totalBookings: number;
      lastAppointmentDate: string;
      salonCount: number;
      homeCount: number;
    }>();

    for (const apt of appointments) {
      const key = apt.mobile;
      const existing = customerMap.get(key);
      if (!existing) {
        customerMap.set(key, {
          customerName: apt.customerName,
          mobile: apt.mobile,
          totalBookings: 1,
          lastAppointmentDate: apt.appointmentDate,
          salonCount: apt.locationType === 'SALON' ? 1 : 0,
          homeCount: apt.locationType === 'HOME' ? 1 : 0,
        });
      } else {
        existing.totalBookings += 1;
        if (apt.appointmentDate > existing.lastAppointmentDate) {
          existing.lastAppointmentDate = apt.appointmentDate;
          existing.customerName = apt.customerName; // latest name variant
        }
        if (apt.locationType === 'SALON') existing.salonCount++;
        if (apt.locationType === 'HOME') existing.homeCount++;
      }
    }

    return Array.from(customerMap.values()).map((c) => ({
      customerName: c.customerName,
      mobile: c.mobile,
      totalBookings: c.totalBookings,
      lastAppointmentDate: c.lastAppointmentDate,
      preferredLocation: c.homeCount > c.salonCount ? 'HOME' : 'SALON',
    }));
  }

  async updateSettings(updates: Partial<BusinessSettingsModel>): Promise<BusinessSettingsModel> {
    return await db.updateBusinessSettings(updates);
  }
}

export const adminService = new AdminService();
