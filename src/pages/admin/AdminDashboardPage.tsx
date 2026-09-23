import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Home, 
  Scissors, 
  RefreshCw,
  Phone,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: 'appointments' | 'services' | 'settings' | 'images') => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAdminDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    setActionInProgress(appointmentId);
    try {
      await apiClient.updateAppointmentStatus(appointmentId, newStatus);
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <RefreshCw className="w-8 h-8 text-[#c5a880] animate-spin mb-3" />
        <p className="text-xs text-[#9ea3ae] font-mono">Loading operations dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <h2 className="text-sm font-semibold">Error Loading Dashboard</h2>
        </div>
        <p className="text-xs mb-4">{error}</p>
        <button
          type="button"
          onClick={fetchDashboard}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const todayAppointments = data?.todayAppointments || [];
  const settings = data?.settings || {};

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2028]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">
            Operational Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
            Today's Salon Deck
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboard}
            className="px-3.5 py-2 text-xs text-[#9ea3ae] hover:text-white bg-[#14161b] hover:bg-[#1a1d24] border border-[#242834] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Appointments */}
        <div className="p-4 rounded-2xl bg-[#121418] border border-[#1f232d] shadow-sm">
          <div className="flex items-center justify-between text-[#8a909e] mb-2">
            <span className="text-xs font-mono uppercase">Today's Total</span>
            <Calendar className="w-4 h-4 text-[#c5a880]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {metrics.todayAppointmentsCount ?? 0}
          </div>
          <div className="text-[11px] text-[#717684] mt-1">Appointments booked for today</div>
        </div>

        {/* Upcoming Appointments */}
        <div className="p-4 rounded-2xl bg-[#121418] border border-[#1f232d] shadow-sm">
          <div className="flex items-center justify-between text-[#8a909e] mb-2">
            <span className="text-xs font-mono uppercase">Upcoming</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {metrics.upcomingAppointmentsCount ?? 0}
          </div>
          <div className="text-[11px] text-[#717684] mt-1">Confirmed future visits</div>
        </div>

        {/* Active Chairs / Staff */}
        <div className="p-4 rounded-2xl bg-[#121418] border border-[#1f232d] shadow-sm">
          <div className="flex items-center justify-between text-[#8a909e] mb-2">
            <span className="text-xs font-mono uppercase">Active Chairs</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {metrics.activeStaffCount ?? 2}
          </div>
          <div className="text-[11px] text-[#717684] mt-1">Operating concurrently</div>
        </div>

        {/* Salon vs Home Split */}
        <div className="p-4 rounded-2xl bg-[#121418] border border-[#1f232d] shadow-sm">
          <div className="flex items-center justify-between text-[#8a909e] mb-2">
            <span className="text-xs font-mono uppercase">Location Split</span>
            <Home className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-serif font-medium text-white flex items-center gap-2">
            <span>{metrics.salonAppointmentsCount ?? 0} Salon</span>
            <span className="text-xs text-[#6e7482]">/</span>
            <span>{metrics.homeAppointmentsCount ?? 0} Home</span>
          </div>
          <div className="text-[11px] text-[#717684] mt-1">Lifetime service locations</div>
        </div>
      </div>

      {/* Today's Schedule Agenda */}
      <div className="bg-[#111317] border border-[#1f232d] rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-serif text-white tracking-tight">Today's Appointment Schedule</h2>
            <p className="text-xs text-[#8c92a0] mt-0.5">
              Operating hours: {settings.openingTime || '09:00'} - {settings.closingTime || '21:00'} · Break: {settings.breakStart || '14:00'} - {settings.breakEnd || '15:00'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('appointments')}
            className="text-xs text-[#c5a880] hover:underline font-medium cursor-pointer"
          >
            View All Dates &rarr;
          </button>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-[#0e1013] border border-[#1c1f26]">
            <Calendar className="w-8 h-8 text-[#555a68] mx-auto mb-2" />
            <p className="text-sm text-[#8a909e]">No appointments scheduled for today yet.</p>
            <p className="text-xs text-[#636877] mt-1">
              New customer reservations will populate here immediately upon booking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1f232c] text-[#7a808e] uppercase font-mono tracking-wider text-[11px]">
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Ref ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1e26]">
                {todayAppointments.map((apt: any) => {
                  const isPending = apt.status === 'PENDING';
                  const isConfirmed = apt.status === 'CONFIRMED';
                  const isCompleted = apt.status === 'COMPLETED';
                  const isCancelled = apt.status === 'CANCELLED';

                  return (
                    <tr key={apt.id} className="hover:bg-[#14161c] transition-colors">
                      {/* Time */}
                      <td className="py-3 px-3 font-mono font-medium text-white whitespace-nowrap">
                        {apt.startTime} – {apt.endTime}
                      </td>

                      {/* Reference */}
                      <td className="py-3 px-3 font-mono text-[#c5a880] whitespace-nowrap">
                        {apt.bookingReference}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-white">{apt.customerName}</div>
                        <a
                          href={`tel:${apt.mobile}`}
                          className="text-[11px] text-[#7d8392] hover:text-white flex items-center gap-1 mt-0.5 font-mono"
                        >
                          <Phone className="w-3 h-3 text-[#c5a880]" />
                          <span>+91 {apt.mobile}</span>
                        </a>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-3 text-[#d1cdc7]">
                        {apt.serviceName || apt.serviceId}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3">
                        {apt.locationType === 'HOME' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Home className="w-2.5 h-2.5" />
                            <span>Home</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-700/30 text-zinc-300 border border-zinc-700/50">
                            <span>Salon</span>
                          </span>
                        )}
                        {apt.address && (
                          <p className="text-[10px] text-[#717684] truncate max-w-[150px] mt-0.5">
                            {apt.address}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold ${
                            isConfirmed
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isCompleted
                              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              : isCancelled
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        {!isCompleted && !isCancelled && (
                          <button
                            type="button"
                            disabled={actionInProgress === apt.id}
                            onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {!isCancelled && (
                          <button
                            type="button"
                            disabled={actionInProgress === apt.id}
                            onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
