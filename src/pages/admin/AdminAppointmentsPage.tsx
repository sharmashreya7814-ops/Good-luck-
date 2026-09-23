import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  Home, 
  RefreshCw, 
  Check, 
  X,
  AlertCircle 
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setActionInProgress(appointmentId);
    try {
      await apiClient.updateAppointmentStatus(appointmentId, newStatus);
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Could not update appointment status.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = apt.customerName?.toLowerCase().includes(q);
      const matchPhone = apt.mobile?.includes(q);
      const matchRef = apt.bookingReference?.toLowerCase().includes(q);
      const matchService = apt.serviceId?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchRef && !matchService) return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && apt.status !== selectedStatus) {
      return false;
    }

    // Location filter
    if (selectedLocation !== 'ALL' && apt.locationType !== selectedLocation) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f232c]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">
            Bookings Ledger
          </span>
          <h1 className="text-2xl font-serif text-white tracking-tight">
            Appointment Records
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          className="px-3.5 py-2 text-xs text-[#9ea3ae] hover:text-white bg-[#14161b] hover:bg-[#1a1d24] border border-[#242834] rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#656b7a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, mobile, or reference..."
            className="w-full bg-[#121418] border border-[#21252f] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#5c6170] focus:border-[#c5a880] focus:outline-none"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by appointment status"
            className="w-full bg-[#121418] border border-[#21252f] rounded-xl px-3.5 py-2.5 text-xs text-[#cfcac1] focus:border-[#c5a880] focus:outline-none"
          >
            <option value="ALL">All Statuses (Pending, Confirmed, Completed, Cancelled)</option>
            <option value="CONFIRMED">Confirmed Only</option>
            <option value="PENDING">Pending Only</option>
            <option value="COMPLETED">Completed Only</option>
            <option value="CANCELLED">Cancelled Only</option>
          </select>
        </div>

        {/* Location Dropdown */}
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            aria-label="Filter by appointment location"
            className="w-full bg-[#121418] border border-[#21252f] rounded-xl px-3.5 py-2.5 text-xs text-[#cfcac1] focus:border-[#c5a880] focus:outline-none"
          >
            <option value="ALL">All Locations (Salon & Home)</option>
            <option value="SALON">Salon Only</option>
            <option value="HOME">Home Service Only</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-[#111317] border border-[#1f232d] rounded-2xl overflow-hidden shadow-md">
        {isLoading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 text-[#c5a880] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#8c92a0]">Loading appointment ledger...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center text-[#737989]">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-[#4c515e]" />
            <p className="text-xs">No appointments match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1f232c] text-[#7a808e] uppercase font-mono tracking-wider text-[11px] bg-[#0e1013]">
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1e26]">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#14161c] transition-colors">
                    {/* Booking Reference */}
                    <td className="py-3.5 px-4 font-mono font-medium text-[#c5a880] whitespace-nowrap">
                      {apt.bookingReference}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-white">{apt.appointmentDate}</div>
                      <div className="text-[11px] text-[#868c9c] font-mono mt-0.5">
                        {apt.startTime} – {apt.endTime}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{apt.customerName}</div>
                      <a
                        href={`tel:${apt.mobile}`}
                        className="text-[11px] text-[#818796] hover:text-white flex items-center gap-1 mt-0.5 font-mono"
                      >
                        <Phone className="w-3 h-3 text-[#c5a880]" />
                        <span>+91 {apt.mobile}</span>
                      </a>
                      {apt.notes && (
                        <p className="text-[10px] text-[#787e8d] italic mt-1 max-w-xs">
                          "{apt.notes}"
                        </p>
                      )}
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4 text-[#d4d0ca] whitespace-nowrap">
                      {apt.serviceName || apt.serviceId}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      {apt.locationType === 'HOME' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Home className="w-2.5 h-2.5" />
                            <span>Home Visit</span>
                          </span>
                          {apt.address && (
                            <div className="text-[10px] text-[#828896] mt-1 max-w-[180px]">
                              {apt.address}
                              {apt.locality && <span>, {apt.locality}</span>}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-700/30 text-zinc-300 border border-zinc-700/50">
                          <span>Salon Chair</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : apt.status === 'COMPLETED'
                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                            : apt.status === 'CANCELLED'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    {/* Status Action Dropdown */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <select
                        value={apt.status}
                        disabled={actionInProgress === apt.id}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        aria-label={`Update status for booking ${apt.bookingReference}`}
                        className="bg-[#181a20] border border-[#262a34] rounded-lg px-2.5 py-1 text-[11px] text-white focus:border-[#c5a880] focus:outline-none"
                      >
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
