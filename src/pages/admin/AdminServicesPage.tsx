import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import { 
  Scissors, 
  Clock, 
  Home, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Star, 
  Image as ImageIcon, 
  Upload, 
  LayoutGrid, 
  List, 
  ShieldAlert
} from 'lucide-react';
import { apiClient, ApiImageModel } from '../../api/client';
import { ServiceItem, ServiceCategory } from '../../types';
import { SERVICE_CATEGORIES } from '../../data/services';

interface ServiceFormState {
  id?: string;
  name: string;
  category: ServiceCategory;
  price: string;
  duration: number;
  tagline: string;
  description: string;
  highlights: string[];
  isPopular: boolean;
  homeServiceAvailable: boolean;
  active: boolean;
  imageUrl: string;
}

const INITIAL_FORM_STATE: ServiceFormState = {
  name: '',
  category: 'hair',
  price: '',
  duration: 30,
  tagline: '',
  description: '',
  highlights: [],
  isPopular: false,
  homeServiceAvailable: true,
  active: true,
  imageUrl: '',
};

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Layout State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<ServiceFormState>(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newHighlightInput, setNewHighlightInput] = useState<string>('');

  // Media / Service Images helper state
  const [availableServiceImages, setAvailableServiceImages] = useState<ApiImageModel[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Delete Confirmation State
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load Services from API
  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminServices();
      setServices(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load services list.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Load available service media images
  const fetchServiceImages = async () => {
    try {
      const images = await apiClient.getAdminImages({ slot: 'SERVICE' });
      setAvailableServiceImages(images);
    } catch {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    fetchServices();
    fetchServiceImages();
  }, []);

  // Quick Notification Helper
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Filtered and sorted services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && service.active) ||
        (statusFilter === 'inactive' && !service.active);
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (service.tagline && service.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        service.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [services, selectedCategory, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = services.length;
    const activeCount = services.filter((s) => s.active).length;
    const recommendedCount = services.filter((s) => s.isPopular).length;
    const homeCount = services.filter((s) => s.homeServiceAvailable).length;
    return { total, activeCount, recommendedCount, homeCount };
  }, [services]);

  // Open "Add Service" Modal
  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setNewHighlightInput('');
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open "Edit Service" Modal
  const handleOpenEditModal = (service: ServiceItem) => {
    const rawHighlights = service.features || service.highlights || [];
    setFormData({
      id: service.id,
      name: service.name,
      category: service.category,
      price: service.price.replace(/[^0-9.]/g, '') || service.price,
      duration: service.duration,
      tagline: service.tagline || '',
      description: service.description || '',
      highlights: [...rawHighlights],
      isPopular: Boolean(service.isPopular),
      homeServiceAvailable: Boolean(service.homeServiceAvailable),
      active: Boolean(service.active),
      imageUrl: service.imageUrl || service.image || '',
    });
    setFormErrors({});
    setNewHighlightInput('');
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Validate form client-side
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Service name is required.';
    }

    if (!formData.category) {
      errors.category = 'Please select a valid category.';
    }

    const numericPrice = parseFloat(formData.price.replace(/[^0-9.]/g, ''));
    if (!formData.price.trim() || isNaN(numericPrice) || numericPrice < 0) {
      errors.price = 'Price must be a valid non-negative number.';
    }

    const durationNum = Number(formData.duration);
    if (!durationNum || isNaN(durationNum) || durationNum <= 0) {
      errors.duration = 'Duration must be a positive number of minutes.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Partial<ServiceItem> = {
        name: formData.name.trim(),
        category: formData.category,
        price: formData.price.trim(),
        duration: Number(formData.duration),
        tagline: formData.tagline.trim() || undefined,
        description: formData.description.trim(),
        features: formData.highlights,
        highlights: formData.highlights,
        isPopular: formData.isPopular,
        homeServiceAvailable: formData.homeServiceAvailable,
        active: formData.active,
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      if (modalMode === 'add') {
        const created = await apiClient.createService(payload);
        showSuccess(`Service "${created.name}" created successfully.`);
      } else if (formData.id) {
        const updated = await apiClient.updateService(formData.id, payload);
        showSuccess(`Service "${updated.name}" updated successfully.`);
      }

      await fetchServices();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save service.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add highlight tag to form
  const handleAddHighlight = () => {
    const trimmed = newHighlightInput.trim();
    if (trimmed && !formData.highlights.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, trimmed],
      }));
      setNewHighlightInput('');
    }
  };

  // Remove highlight tag from form
  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Quick Toggle Active Status directly from table/card
  const handleQuickToggleActive = async (service: ServiceItem) => {
    try {
      const nextActive = !service.active;
      await apiClient.updateService(service.id, { active: nextActive });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, active: nextActive } : s))
      );
      showSuccess(
        `Service "${service.name}" ${nextActive ? 'activated and live' : 'hidden from public view'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle active state.';
      setError(msg);
    }
  };

  // Quick Toggle Recommended Status
  const handleQuickToggleRecommended = async (service: ServiceItem) => {
    try {
      const nextRecommended = !service.isPopular;
      await apiClient.updateService(service.id, { isPopular: nextRecommended });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isPopular: nextRecommended } : s))
      );
      showSuccess(
        `Service "${service.name}" ${nextRecommended ? 'marked as Recommended' : 'unmarked as Recommended'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle recommended state.';
      setError(msg);
    }
  };

  // Confirm and Execute Service Deletion (Soft-delete/Deactivation)
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await apiClient.deleteService(serviceToDelete.id);
      showSuccess(
        `Service "${serviceToDelete.name}" deactivated and removed from active booking catalog (historical appointments preserved).`
      );
      setServiceToDelete(null);
      await fetchServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete service.';
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Image Upload for Service
  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('image', file);
      uploadForm.append('slot', 'SERVICE');
      uploadForm.append('altText', formData.name ? `${formData.name} Good Luck Salon` : 'Service image');
      if (formData.id) {
        uploadForm.append('serviceId', formData.id);
      }
      uploadForm.append('isActive', 'true');

      const uploaded = await apiClient.uploadAdminImage(uploadForm);

      setFormData((prev) => ({
        ...prev,
        imageUrl: uploaded.publicUrl,
      }));
      showSuccess('Service image uploaded successfully.');
      await fetchServiceImages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload service image.';
      setError(msg);
    } finally {
      setIsUploadingImage(false);
      // Reset input value
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f232c]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880] block font-semibold">
            Catalog Governance
          </span>
          <h1 className="text-2xl font-serif text-white tracking-tight">
            Service Menu & Pricing Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchServices}
            className="px-3.5 py-2 text-xs text-[#9ea3ae] hover:text-white bg-[#14161b] hover:bg-[#1a1d24] border border-[#242834] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh service list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#c5a880]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-medium text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-500/20 rounded text-rose-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#121419] border border-[#20242e] rounded-xl p-3.5 sm:p-4">
          <div className="text-[11px] font-mono text-[#8c92a0] uppercase tracking-wider">Total Services</div>
          <div className="text-xl sm:text-2xl font-serif text-white mt-1 font-semibold">{stats.total}</div>
        </div>
        <div className="bg-[#121419] border border-[#20242e] rounded-xl p-3.5 sm:p-4">
          <div className="text-[11px] font-mono text-emerald-400/90 uppercase tracking-wider">Active Services</div>
          <div className="text-xl sm:text-2xl font-serif text-emerald-400 mt-1 font-semibold">{stats.activeCount}</div>
        </div>
        <div className="bg-[#121419] border border-[#20242e] rounded-xl p-3.5 sm:p-4">
          <div className="text-[11px] font-mono text-[#c5a880] uppercase tracking-wider">Recommended</div>
          <div className="text-xl sm:text-2xl font-serif text-[#c5a880] mt-1 font-semibold">{stats.recommendedCount}</div>
        </div>
        <div className="bg-[#121419] border border-[#20242e] rounded-xl p-3.5 sm:p-4">
          <div className="text-[11px] font-mono text-amber-400/90 uppercase tracking-wider">Home Service OK</div>
          <div className="text-xl sm:text-2xl font-serif text-amber-400 mt-1 font-semibold">{stats.homeCount}</div>
        </div>
      </div>

      {/* Controls Bar: Search, Category Filter, Status Filter, View Toggle */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#111317] border border-[#20242e] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606775]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service name, tagline, description..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#16181f] border border-[#242935] focus:border-[#c5a880] rounded-xl text-white placeholder-[#606775] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c92a0] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-[#16181f] border border-[#242935] rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
          >
            <option value="all">All Categories</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 text-xs bg-[#16181f] border border-[#242935] rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#16181f] border border-[#242935] rounded-xl p-0.5 ml-auto md:ml-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-[#252a37] text-white' : 'text-[#7e8595] hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'cards' ? 'bg-[#252a37] text-white' : 'text-[#7e8595] hover:text-white'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services List Content */}
      {isLoading ? (
        <div className="py-20 text-center rounded-2xl bg-[#111317] border border-[#20242e]">
          <RefreshCw className="w-6 h-6 text-[#c5a880] animate-spin mx-auto mb-2.5" />
          <p className="text-xs text-[#8c92a0]">Loading salon services catalog...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#111317] border border-[#20242e] p-8 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#181b22] border border-[#2a2f3d] flex items-center justify-center text-[#8c92a0]">
            <Scissors className="w-5 h-5 text-[#c5a880]" />
          </div>
          <h3 className="text-base font-serif text-white">No services found</h3>
          <p className="text-xs text-[#8c92a0] max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'No services match the current filter criteria. Try clearing search or reset filters.'
              : 'The service catalog is currently empty. Click "Add Service" to create your first salon service.'}
          </p>
          {(searchQuery || selectedCategory !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStatusFilter('all');
              }}
              className="text-xs text-[#c5a880] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Responsive Table View */
        <div className="overflow-x-auto rounded-2xl border border-[#20242e] bg-[#111317]">
          <table className="w-full text-left text-xs text-[#cfcac1]">
            <thead className="bg-[#14161b] text-[10px] font-mono uppercase tracking-wider text-[#8c92a0] border-b border-[#20242e]">
              <tr>
                <th className="py-3.5 px-4 font-medium">Service Name</th>
                <th className="py-3.5 px-4 font-medium">Category</th>
                <th className="py-3.5 px-4 font-medium">Price</th>
                <th className="py-3.5 px-4 font-medium">Duration</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium">Recommended</th>
                <th className="py-3.5 px-4 font-medium">Home Service</th>
                <th className="py-3.5 px-4 font-medium">Last Updated</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1f27]">
              {filteredServices.map((service) => {
                const categoryObj = SERVICE_CATEGORIES.find((c) => c.id === service.category);
                const categoryLabel = categoryObj ? categoryObj.label : service.category;
                const formattedDate = service.updatedAt
                  ? new Date(service.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';

                return (
                  <tr
                    key={service.id}
                    className={`hover:bg-[#16181f]/80 transition-colors ${
                      !service.active ? 'opacity-65 bg-[#0e1013]' : ''
                    }`}
                  >
                    {/* Service Name & Tagline */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {service.imageUrl || service.image ? (
                          <img
                            src={service.imageUrl || service.image}
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#262b37] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#181a20] border border-[#262b37] flex items-center justify-center text-[#c5a880] shrink-0">
                            <Scissors className="w-4 h-4 stroke-[1.75]" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white text-sm flex items-center gap-2">
                            <span>{service.name}</span>
                            {service.isPopular && (
                              <Star className="w-3.5 h-3.5 text-[#c5a880] fill-[#c5a880]" />
                            )}
                          </div>
                          {service.tagline && (
                            <p className="text-[11px] text-[#8c92a0] line-clamp-1 italic">
                              "{service.tagline}"
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#1a1d25] text-[#b3afaa] border border-[#272c38] uppercase">
                        {categoryLabel}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-white font-medium text-xs bg-[#171a22] px-2 py-1 rounded border border-[#242936]">
                        {service.price}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#a4a097]">
                        <Clock className="w-3 h-3 text-[#c5a880]" />
                        {service.duration} mins
                      </span>
                    </td>

                    {/* Active/Inactive Toggle Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleQuickToggleActive(service)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors cursor-pointer border ${
                          service.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                        }`}
                        title="Click to toggle visibility"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${service.active ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                        <span>{service.active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Recommended Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleQuickToggleRecommended(service)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                          service.isPopular
                            ? 'bg-[#c5a880]/15 text-[#c5a880] border-[#c5a880]/30 hover:bg-[#c5a880]/25'
                            : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                        }`}
                        title="Click to toggle recommended flag"
                      >
                        <Star className={`w-3 h-3 ${service.isPopular ? 'fill-[#c5a880]' : ''}`} />
                        <span>{service.isPopular ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    {/* Home Service Availability */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {service.homeServiceAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
                          <Home className="w-2.5 h-2.5" />
                          <span>Eligible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                          <span>Salon Only</span>
                        </span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#787e8e]">
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(service)}
                          className="p-1.5 text-[#8c92a0] hover:text-white hover:bg-[#1f232d] rounded-lg transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceToDelete(service)}
                          className="p-1.5 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Deactivate / Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Responsive Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const categoryObj = SERVICE_CATEGORIES.find((c) => c.id === service.category);
            const categoryLabel = categoryObj ? categoryObj.label : service.category;
            const rawHighlights = service.features || service.highlights || [];

            return (
              <div
                key={service.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  service.active
                    ? 'bg-[#111317] border-[#212530] hover:border-[#2d3342]'
                    : 'bg-[#0e1013] border-[#1a1d24] opacity-75'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1a1d25] text-[#c5a880] border border-[#272c38]">
                      {categoryLabel}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickToggleActive(service)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                          service.active
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {service.active ? 'Active' : 'Inactive'}
                      </button>

                      {service.isPopular && (
                        <span className="text-[10px] text-[#c5a880] bg-[#1e1c17] border border-[#c5a880]/30 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                          <Star className="w-2.5 h-2.5 fill-[#c5a880]" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex items-start gap-3 mb-2.5">
                    {service.imageUrl || service.image ? (
                      <img
                        src={service.imageUrl || service.image}
                        alt={service.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#262b37] shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#181a20] border border-[#262b37] flex items-center justify-center text-[#c5a880] shrink-0">
                        <Scissors className="w-5 h-5 stroke-[1.75]" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif text-base text-white font-medium">
                        {service.name}
                      </h3>
                      {service.tagline && (
                        <p className="text-xs text-[#c5a880]/85 italic line-clamp-1">
                          "{service.tagline}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#8c92a0] line-clamp-2 mb-3">
                    {service.description}
                  </p>

                  {/* Highlights pills */}
                  {rawHighlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {rawHighlights.slice(0, 3).map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-[#16181f] text-[#a8a39a] px-2 py-0.5 rounded border border-[#242935]"
                        >
                          {h}
                        </span>
                      ))}
                      {rawHighlights.length > 3 && (
                        <span className="text-[10px] text-[#717685] px-1 py-0.5 font-mono">
                          +{rawHighlights.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Pricing, Duration, and Actions */}
                <div className="pt-3 border-t border-[#1c1f27] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-white font-semibold">
                      {service.price}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[#8c92a0] text-[11px]">
                      <Clock className="w-3 h-3 text-[#c5a880]" />
                      {service.duration}m
                    </span>
                    {service.homeServiceAvailable && (
                      <span className="text-[10px] text-amber-300 font-mono">Home OK</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(service)}
                      className="p-1.5 text-[#8c92a0] hover:text-white hover:bg-[#1c202a] rounded-lg transition-colors cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceToDelete(service)}
                      className="p-1.5 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT SERVICE MODAL DIALOG                                           */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
        >
          <div className="w-full max-w-2xl bg-[#12141a] border border-[#272c39] rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#202532] flex items-center justify-between bg-[#151820]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1c202a] border border-[#2b3140] flex items-center justify-center text-[#c5a880]">
                  <Scissors className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-base font-serif text-white font-medium">
                    {modalMode === 'add' ? 'Add New Salon Service' : `Edit Service: ${formData.name}`}
                  </h2>
                  <p className="text-[11px] text-[#8c92a0]">
                    Configure pricing, duration, highlights, and public catalog visibility.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#8c92a0] hover:text-white rounded-lg hover:bg-[#1f2430] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#a29e95] uppercase mb-1.5">
                    Service Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Classic Haircut & Styling"
                    className={`w-full px-3.5 py-2 text-xs bg-[#161922] border rounded-xl text-white placeholder-[#5d6373] focus:outline-none transition-colors ${
                      formErrors.name ? 'border-rose-500' : 'border-[#262c3a] focus:border-[#c5a880]'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[10px] text-rose-400 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#a29e95] uppercase mb-1.5">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ServiceCategory })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-[#161922] border border-[#262c3a] rounded-xl text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Price and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#a29e95] uppercase mb-1.5">
                    Price (₹) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8c92a0] font-mono">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="150"
                      className={`w-full pl-8 pr-3.5 py-2 text-xs bg-[#161922] border rounded-xl text-white placeholder-[#5d6373] focus:outline-none transition-colors ${
                        formErrors.price ? 'border-rose-500' : 'border-[#262c3a] focus:border-[#c5a880]'
                      }`}
                    />
                  </div>
                  {formErrors.price && (
                    <p className="text-[10px] text-rose-400 mt-1">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#a29e95] uppercase mb-1.5">
                    Duration (Minutes) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="240"
                      step="5"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: parseInt(e.target.value, 10) || 15 })
                      }
                      placeholder="30"
                      className={`w-full px-3.5 py-2 text-xs bg-[#161922] border rounded-xl text-white placeholder-[#5d6373] focus:outline-none transition-colors ${
                        formErrors.duration ? 'border-rose-500' : 'border-[#262c3a] focus:border-[#c5a880]'
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-[#8c92a0] font-mono">
                      mins
                    </span>
                  </div>
                  {formErrors.duration && (
                    <p className="text-[10px] text-rose-400 mt-1">{formErrors.duration}</p>
                  )}
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-[11px] font-mono text-[#a29e95] uppercase mb-1.5">
                  Short Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Scissor precision and disciplined finishing"
                  className="w-full px-3.5 py-2 text-xs bg-[#161922] border border-[#262c3a] focus:border-[#c5a880] rounded-xl text-white placeholder-[#5d6373] focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono text-[#a29e95] uppercase mb-1.5">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide comprehensive details about this haircut, beard trim, or massage service..."
                  className="w-full px-3.5 py-2 text-xs bg-[#161922] border border-[#262c3a] focus:border-[#c5a880] rounded-xl text-white placeholder-[#5d6373] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Feature / Highlight List */}
              <div>
                <label className="block text-[11px] font-mono text-[#a29e95] uppercase mb-1.5">
                  Service Highlights / Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="Add a key feature (e.g. Style consultation, Hot towel finish)"
                    className="flex-1 px-3.5 py-2 text-xs bg-[#161922] border border-[#262c3a] focus:border-[#c5a880] rounded-xl text-white placeholder-[#5d6373] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3.5 py-2 bg-[#202532] hover:bg-[#2b3142] text-xs font-medium text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {formData.highlights.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-[#14161f] border border-[#202532]">
                    {formData.highlights.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#1d212b] border border-[#2e3445] text-[#dcd7ce]"
                      >
                        <Check className="w-3 h-3 text-[#c5a880]" />
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(index)}
                          className="ml-1 text-[#8c92a0] hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#6c7282] italic">
                    No highlights added yet. Adding 2-4 highlights helps clients understand the service scope.
                  </p>
                )}
              </div>

              {/* Service Image Selection & Upload */}
              <div className="p-4 rounded-xl bg-[#14161f] border border-[#222735] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-white block">
                      Service Card Image
                    </label>
                    <p className="text-[11px] text-[#8c92a0]">
                      Upload or select a photo to display on the public service card.
                    </p>
                  </div>

                  <label className="px-3 py-1.5 bg-[#202532] hover:bg-[#2b3142] text-xs text-[#c5a880] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#2f3546]">
                    <Upload className={`w-3.5 h-3.5 ${isUploadingImage ? 'animate-bounce' : ''}`} />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image URL Input & Preview */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#0c0d10] border border-[#282d3a] flex items-center justify-center overflow-hidden shrink-0">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Service preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#4d5363]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Or enter direct image URL (/uploads/... or https://...)"
                      className="w-full px-3 py-2 text-xs bg-[#0c0d10] border border-[#262c3a] focus:border-[#c5a880] rounded-xl text-white placeholder-[#5d6373] focus:outline-none transition-colors"
                    />
                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="text-[10px] text-rose-400 hover:underline mt-1"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>

                {/* Available library thumbnail selector */}
                {availableServiceImages.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-[#8c92a0] uppercase block mb-1.5">
                      Select from Media Gallery:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {availableServiceImages.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: img.publicUrl })}
                          className={`w-12 h-12 rounded-lg overflow-hidden border shrink-0 transition-transform ${
                            formData.imageUrl === img.publicUrl
                              ? 'border-[#c5a880] scale-105 ring-1 ring-[#c5a880]'
                              : 'border-[#272c38] opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.publicUrl}
                            alt={img.altText || 'Media item'}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles: Active, Recommended, Home Service */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Active Toggle */}
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#14161f] border border-[#202532] cursor-pointer hover:border-[#2d3342] transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded border-[#343b4d] text-[#c5a880] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Active Catalog</span>
                    <span className="text-[10px] text-[#8c92a0] block">Show on public menu</span>
                  </div>
                </label>

                {/* Recommended Toggle */}
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#14161f] border border-[#202532] cursor-pointer hover:border-[#2d3342] transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded border-[#343b4d] text-[#c5a880] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Recommended</span>
                    <span className="text-[10px] text-[#8c92a0] block">Show star badge</span>
                  </div>
                </label>

                {/* Home Service Available Toggle */}
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#14161f] border border-[#202532] cursor-pointer hover:border-[#2d3342] transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.homeServiceAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, homeServiceAvailable: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-[#343b4d] text-[#c5a880] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Home Service</span>
                    <span className="text-[10px] text-[#8c92a0] block">Available at doorstep</span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#202532] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs text-[#9ea3ae] hover:text-white bg-[#1a1d26] hover:bg-[#222633] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-medium text-black bg-[#c5a880] hover:bg-[#d8be98] disabled:opacity-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'add' ? 'Create Service' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE / DEACTIVATE CONFIRMATION DIALOG                                    */}
      {/* ========================================================================= */}
      {serviceToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-md bg-[#13151b] border border-[#2b2f3d] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-serif text-white font-medium">
                Deactivate Service?
              </h3>
              <p className="text-xs text-[#9ea3ae] leading-relaxed">
                Are you sure you want to deactivate <strong className="text-white font-semibold">"{serviceToDelete.name}"</strong>?
              </p>
              <div className="p-3 rounded-xl bg-[#181b24] border border-[#252a38] text-[11px] text-[#b3afaa] text-left mt-2">
                ✓ The service will be immediately hidden from the public booking catalog.<br />
                ✓ All historical bookings and existing customer appointments referencing this service will remain preserved.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs text-[#9ea3ae] hover:text-white bg-[#1a1d26] hover:bg-[#222633] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Deactivation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
