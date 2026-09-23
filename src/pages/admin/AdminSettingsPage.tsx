import React, { useState, useEffect } from 'react';
import { Settings, Clock, Users, Home, Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch business configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const updated = await apiClient.updateAdminSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save updated settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <RefreshCw className="w-6 h-6 text-[#c5a880] animate-spin mx-auto mb-2" />
        <p className="text-xs text-[#8c92a0]">Loading business configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f232c]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">
            Operational Parameters
          </span>
          <h1 className="text-2xl font-serif text-white tracking-tight">
            Salon Operating Rules
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="px-3.5 py-2 text-xs text-[#9ea3ae] hover:text-white bg-[#14161b] hover:bg-[#1a1d24] border border-[#242834] rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Salon operating settings updated successfully across the appointment engine.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Working Hours Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111317] border border-[#20242e] space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Clock className="w-4 h-4 text-[#c5a880]" />
            <h2>Standard Schedule (Sunday - Friday)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8a909e] uppercase mb-1.5">
                Salon Opening Time
              </label>
              <input
                type="text"
                value={settings?.openingTime || '09:00'}
                onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                placeholder="09:00"
                className="w-full bg-[#181a20] border border-[#272b36] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-[#c5a880] focus:outline-none"
              />
              <p className="text-[11px] text-[#636877] mt-1">24-hour format (e.g. 09:00)</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8a909e] uppercase mb-1.5">
                Salon Closing Time
              </label>
              <input
                type="text"
                value={settings?.closingTime || '21:00'}
                onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                placeholder="21:00"
                className="w-full bg-[#181a20] border border-[#272b36] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-[#c5a880] focus:outline-none"
              />
              <p className="text-[11px] text-[#636877] mt-1">24-hour format (e.g. 21:00)</p>
            </div>
          </div>
        </div>

        {/* Afternoon Break Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111317] border border-[#20242e] space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2>Daily Rest Break (Sunday - Friday)</h2>
          </div>

          <p className="text-xs text-[#8a909e]">
            Slots overlapping this window are automatically marked unavailable for appointment booking.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8a909e] uppercase mb-1.5">
                Break Starts
              </label>
              <input
                type="text"
                value={settings?.breakStart || '14:00'}
                onChange={(e) => setSettings({ ...settings, breakStart: e.target.value })}
                placeholder="14:00"
                className="w-full bg-[#181a20] border border-[#272b36] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-[#c5a880] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8a909e] uppercase mb-1.5">
                Break Concludes
              </label>
              <input
                type="text"
                value={settings?.breakEnd || '15:00'}
                onChange={(e) => setSettings({ ...settings, breakEnd: e.target.value })}
                placeholder="15:00"
                className="w-full bg-[#181a20] border border-[#272b36] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-[#c5a880] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Saturday Half Day Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111317] border border-[#20242e] space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Clock className="w-4 h-4 text-sky-400" />
            <h2>Saturday Half-Day Schedule</h2>
          </div>

          <p className="text-xs text-[#8a909e]">
            On Saturdays, appointments are strictly scheduled up to this designated early closing time.
          </p>

          <div className="max-w-xs">
            <label className="block text-xs font-mono text-[#8a909e] uppercase mb-1.5">
              Saturday Closing Time
            </label>
            <input
              type="text"
              value={settings?.saturdayClosingTime || '14:00'}
              onChange={(e) => setSettings({ ...settings, saturdayClosingTime: e.target.value })}
              placeholder="14:00"
              className="w-full bg-[#181a20] border border-[#272b36] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-[#c5a880] focus:outline-none"
            />
          </div>
        </div>

        {/* Capacity & Home Visits Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111317] border border-[#20242e] space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Users className="w-4 h-4 text-emerald-400" />
            <h2>Chairs Capacity & Home Delivery</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8a909e] uppercase mb-1.5">
                Concurrent Active Chairs
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings?.staffCount || 2}
                onChange={(e) => setSettings({ ...settings, staffCount: parseInt(e.target.value, 10) || 2 })}
                className="w-full bg-[#181a20] border border-[#272b36] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-[#c5a880] focus:outline-none"
              />
              <p className="text-[11px] text-[#636877] mt-1">Allows up to 2 concurrent bookings per slot</p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-mono text-[#8a909e] uppercase mb-2">
                Salon-Wide Home Visits
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#171920] border border-[#252834] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings?.homeServiceEnabled)}
                  onChange={(e) => setSettings({ ...settings, homeServiceEnabled: e.target.checked })}
                  className="rounded border-[#2f3545] text-[#c5a880] focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-white">
                  Accept Home Service Appointments
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#c5a880] hover:bg-[#d8be98] text-black font-semibold text-xs tracking-wide uppercase rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Operating Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
