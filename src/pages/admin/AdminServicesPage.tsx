import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Clock, 
  Home, 
  Check, 
  X, 
  Edit3, 
  Save, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    price: string;
    duration: number;
    homeServiceAvailable: boolean;
    active: boolean;
  }>({
    price: '',
    duration: 30,
    homeServiceAvailable: false,
    active: true,
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load services list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleStartEdit = (service: any) => {
    setEditingServiceId(service.id);
    setEditForm({
      price: service.price,
      duration: service.duration,
      homeServiceAvailable: service.homeServiceAvailable,
      active: service.active,
    });
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
  };

  const handleSaveEdit = async (serviceId: string) => {
    setSaveStatus('Saving...');
    try {
      await apiClient.updateService(serviceId, editForm);
      await fetchServices();
      setEditingServiceId(null);
      setSaveStatus(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update service.');
      setSaveStatus(null);
    }
  };

  const handleQuickToggleActive = async (service: any) => {
    try {
      await apiClient.updateService(service.id, { active: !service.active });
      await fetchServices();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle active state.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f232c]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">
            Catalog Governance
          </span>
          <h1 className="text-2xl font-serif text-white tracking-tight">
            Service Menu & Pricing
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchServices}
          className="px-3.5 py-2 text-xs text-[#9ea3ae] hover:text-white bg-[#14161b] hover:bg-[#1a1d24] border border-[#242834] rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <p className="text-xs text-[#8d93a2]">
        Configure service durations, indicative pricing placeholders, and enable/disable services or home visit eligibility in real time.
      </p>

      {/* Services List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 text-[#c5a880] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#8c92a0]">Loading services...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        ) : (
          services.map((service) => {
            const isEditing = editingServiceId === service.id;

            return (
              <div
                key={service.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  service.active
                    ? 'bg-[#111317] border-[#212530]'
                    : 'bg-[#0e1013] border-[#1a1d24] opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-semibold text-white">
                        {service.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c202a] text-[#a4a098] border border-[#262b37] uppercase">
                        {service.category}
                      </span>
                      {!service.active && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Inactive (Hidden)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#858b99]">
                      {service.description}
                    </p>
                  </div>

                  {/* Attributes & Edit Controls */}
                  <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto shrink-0">
                    {isEditing ? (
                      /* Edit Mode Controls */
                      <div className="flex items-center gap-3 bg-[#171920] p-3 rounded-xl border border-[#272c38]">
                        <div>
                          <label className="text-[10px] font-mono text-[#8a909f] block">Price</label>
                          <input
                            type="text"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            className="w-24 bg-[#0c0d10] border border-[#282d3a] rounded px-2 py-1 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-[#8a909f] block">Mins</label>
                          <input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value, 10) || 15 })}
                            className="w-16 bg-[#0c0d10] border border-[#282d3a] rounded px-2 py-1 text-xs text-white"
                            min="10"
                            max="180"
                            step="5"
                          />
                        </div>

                        <div className="pt-3">
                          <label className="flex items-center gap-1.5 text-[11px] text-[#cfcac1] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.homeServiceAvailable}
                              onChange={(e) => setEditForm({ ...editForm, homeServiceAvailable: e.target.checked })}
                              className="rounded border-[#2f3545] text-[#c5a880] focus:ring-0"
                            />
                            <span>Home</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-1.5 pt-3">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(service.id)}
                            className="px-2.5 py-1 bg-[#c5a880] text-black font-semibold text-xs rounded hover:bg-[#d8be98]"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-[#232732] text-[#a1a7b5] text-xs rounded hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <>
                        <div className="text-right">
                          <div className="text-xs font-mono font-medium text-[#c5a880]">
                            {service.price}
                          </div>
                          <div className="text-[11px] text-[#717685] flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{service.duration} mins</span>
                          </div>
                        </div>

                        <div>
                          {service.homeServiceAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Home className="w-2.5 h-2.5" />
                              <span>Home OK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                              <span>Salon Only</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(service)}
                            className="p-1.5 text-[#8b919f] hover:text-white hover:bg-[#1c202a] rounded-lg transition-colors"
                            title="Edit Service"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickToggleActive(service)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              service.active
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300'
                            }`}
                          >
                            {service.active ? 'Hide' : 'Activate'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
