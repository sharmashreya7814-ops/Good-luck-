import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Sparkles,
  AlertCircle,
  Scissors,
  Check,
  X,
  FileImage,
  Layers,
  Info
} from 'lucide-react';
import { apiClient, ApiImageModel, ImageSlotType } from '../../api/client';

const SLOTS: { label: string; value: ImageSlotType; description: string }[] = [
  { label: 'Hero Visual', value: 'HERO', description: 'Main hero showcase photograph on homepage' },
  { label: 'About Section', value: 'ABOUT', description: 'About & craftsmanship visual showcase' },
  { label: 'Gallery', value: 'GALLERY', description: 'Salon interior & grooming gallery grid' },
  { label: 'Service Card', value: 'SERVICE', description: 'Dedicated photo attached to a specific service' },
  { label: 'Logo / Brand', value: 'LOGO', description: 'Branding mark & salon identity visual' },
];

export const AdminImagesPage: React.FC = () => {
  const [images, setImages] = useState<ApiImageModel[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadSlot, setUploadSlot] = useState<ImageSlotType>('HERO');
  const [uploadServiceId, setUploadServiceId] = useState<string>('');
  const [uploadAltText, setUploadAltText] = useState<string>('');
  const [uploadIsActive, setUploadIsActive] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Preview Modal
  const [previewImage, setPreviewImage] = useState<ApiImageModel | null>(null);

  // Edit Alt Modal
  const [editingImage, setEditingImage] = useState<ApiImageModel | null>(null);
  const [editAltText, setEditAltText] = useState<string>('');

  // Replace file ref
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setActionError('');
      const data = await apiClient.getAdminImages();
      setImages(data || []);
    } catch (err: any) {
      setActionError(err.message || 'Failed to fetch media assets.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await apiClient.getServices();
      setServices(data || []);
      if (data && data.length > 0) {
        setUploadServiceId(data[0].id);
      }
    } catch (err) {
      console.warn('Could not fetch services for image association:', err);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchServices();
  }, []);

  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Quick client-side size check (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setActionError('Selected file exceeds 5MB size limit.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setActionError('Please select an image file to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError('');
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('slot', uploadSlot);
      formData.append('altText', uploadAltText.trim() || `Good Luck Hair Salon ${uploadSlot} visual`);
      formData.append('isActive', String(uploadIsActive));
      if (uploadSlot === 'SERVICE' && uploadServiceId) {
        formData.append('serviceId', uploadServiceId);
      }

      await apiClient.uploadAdminImage(formData);
      setActionSuccess('Image uploaded and registered successfully.');
      setIsUploadOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      setUploadAltText('');
      await fetchImages();
    } catch (err: any) {
      setActionError(err.message || 'Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle image active state
  const handleToggleActive = async (image: ApiImageModel) => {
    try {
      setActionError('');
      const newStatus = !image.isActive;
      await apiClient.updateAdminImage(image.id, { isActive: newStatus });
      setActionSuccess(`Image status changed to ${newStatus ? 'Active' : 'Inactive'}.`);
      await fetchImages();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update image status.');
    }
  };

  // Open replace file dialog
  const triggerReplace = (imageId: string) => {
    setReplacingImageId(imageId);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  // Execute file replacement
  const handleReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!replacingImageId || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setIsLoading(true);
      setActionError('');
      const formData = new FormData();
      formData.append('image', file);
      await apiClient.replaceAdminImage(replacingImageId, formData);
      setActionSuccess('Image file replaced successfully.');
      await fetchImages();
    } catch (err: any) {
      setActionError(err.message || 'Failed to replace file.');
    } finally {
      setReplacingImageId(null);
      setIsLoading(false);
    }
  };

  // Delete image
  const handleDeleteImage = async (image: ApiImageModel) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${image.slot} image?`)) {
      return;
    }

    try {
      setActionError('');
      await apiClient.deleteAdminImage(image.id);
      setActionSuccess('Image successfully deleted.');
      await fetchImages();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete image.');
    }
  };

  // Save edited alt text
  const handleSaveAltText = async () => {
    if (!editingImage) return;
    try {
      setActionError('');
      await apiClient.updateAdminImage(editingImage.id, { altText: editAltText });
      setActionSuccess('Image alt text updated.');
      setEditingImage(null);
      await fetchImages();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update alt text.');
    }
  };

  // Filtered images
  const filteredImages = images.filter((img) => {
    if (selectedSlotFilter === 'ALL') return true;
    return img.slot === selectedSlotFilter;
  });

  // Active Hero image
  const activeHeroImage = images.find((img) => img.slot === 'HERO' && img.isActive);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hidden file input for Replace action */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleReplaceFileChange}
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20242e] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#c5a880] font-semibold">
              Website Content
            </span>
            <span className="text-[#484e5c]">/</span>
            <span className="text-xs text-[#8c92a0]">Media Storage</span>
          </div>
          <h1 className="text-2xl font-serif text-white mt-1">
            Salon Image Management
          </h1>
          <p className="text-xs text-[#8c92a0] mt-1 max-w-xl">
            Upload, replace, and configure imagery across the website. Hero, service, and gallery images update in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchImages}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-[#a29e95] hover:text-white bg-[#14161b] hover:bg-[#1c2027] border border-[#242934] rounded-xl transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#c5a880]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActionError('');
              setActionSuccess('');
              setSelectedFile(null);
              setFilePreview(null);
              setIsUploadOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors shadow-lg shadow-[#c5a880]/15 cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Upload New Image</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {actionError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">{actionError}</div>
          <button type="button" onClick={() => setActionError('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <div className="flex-1">{actionSuccess}</div>
          <button type="button" onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Active Hero Spotlight Banner */}
      <div className="rounded-2xl border border-[#262c38] bg-gradient-to-r from-[#14171d] via-[#121419] to-[#0f1115] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-[#c5a880] font-semibold">
                Homepage Hero Status
              </span>
            </div>
            <h2 className="text-lg font-serif text-white">
              {activeHeroImage ? 'Custom Salon Visual Live on Homepage' : 'Using Dark Luxury Local Fallback'}
            </h2>
            <p className="text-xs text-[#8e94a2] mt-1.5 max-w-xl">
              {activeHeroImage
                ? `Active Hero: "${activeHeroImage.altText}". Only 1 Hero image can be active at a time; uploading or activating another automatically becomes primary.`
                : 'No custom Hero image uploaded yet. The homepage is currently displaying the refined local interior fallback. Upload a high-resolution photo to update.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Mini Preview */}
            <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden border border-[#2b303d] bg-black shrink-0 shadow-inner group">
              <img
                src={activeHeroImage ? activeHeroImage.publicUrl : '/assets/hero_salon.jpg'}
                alt={activeHeroImage ? activeHeroImage.altText : 'Good Luck Salon Fallback'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/assets/hero_salon.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[9px] font-mono text-[#c5a880] truncate">
                  {activeHeroImage ? 'Live Custom' : 'Default Fallback'}
                </span>
              </div>
            </div>

            {activeHeroImage ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => triggerReplace(activeHeroImage.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1e222b] hover:bg-[#282d3a] border border-[#303746] rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Replace Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(activeHeroImage)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#a29e95] hover:text-white bg-[#14161b] hover:bg-[#1a1d24] border border-[#222631] rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Fullsize</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setUploadSlot('HERO');
                  setUploadIsActive(true);
                  setIsUploadOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Salon Photo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs by Slot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#20242e] scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedSlotFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedSlotFilter === 'ALL'
              ? 'bg-[#c5a880] text-black font-semibold'
              : 'text-[#8c92a0] hover:text-white hover:bg-[#15171d]'
          }`}
        >
          All Slots ({images.length})
        </button>

        {SLOTS.map((slot) => {
          const count = images.filter((img) => img.slot === slot.value).length;
          return (
            <button
              key={slot.value}
              type="button"
              onClick={() => setSelectedSlotFilter(slot.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedSlotFilter === slot.value
                  ? 'bg-[#c5a880] text-black font-semibold'
                  : 'text-[#8c92a0] hover:text-white hover:bg-[#15171d]'
              }`}
            >
              {slot.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Images Ledger Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 border-2 border-[#c5a880] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#8c92a0] mt-3">Loading media assets...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#262c37] bg-[#111317]/50 p-8">
          <FileImage className="w-10 h-10 text-[#495062] mx-auto mb-3" />
          <h3 className="text-sm font-medium text-white">No images found for this filter</h3>
          <p className="text-xs text-[#798090] mt-1 max-w-sm mx-auto">
            Upload custom photographs in JPEG, PNG, or WebP format up to 5MB.
          </p>
          <button
            type="button"
            onClick={() => {
              if (selectedSlotFilter !== 'ALL') {
                setUploadSlot(selectedSlotFilter as ImageSlotType);
              }
              setIsUploadOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload {selectedSlotFilter !== 'ALL' ? selectedSlotFilter : ''} Image</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredImages.map((image) => {
            const associatedService = image.serviceId
              ? services.find((s) => s.id === image.serviceId)
              : null;

            return (
              <div
                key={image.id}
                className={`rounded-2xl border bg-[#13151b] overflow-hidden flex flex-col transition-all duration-200 ${
                  image.isActive
                    ? 'border-[#2d3444] hover:border-[#c5a880]/50 shadow-lg'
                    : 'border-[#1f222b] opacity-75 hover:opacity-100'
                }`}
              >
                {/* Image Visual Container */}
                <div className="relative aspect-[16/10] w-full bg-[#0a0b0d] overflow-hidden group">
                  <img
                    src={image.publicUrl}
                    alt={image.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/hero_salon.jpg';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-medium tracking-wider rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[#c5a880]">
                      {image.slot}
                    </span>

                    {/* Active Indicator */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(image)}
                      title={image.isActive ? 'Click to deactivate' : 'Click to activate'}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-md border cursor-pointer transition-colors ${
                        image.isActive
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          image.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                        }`}
                      />
                      <span>{image.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(image)}
                      className="p-2 rounded-xl bg-[#1d212a]/90 text-white hover:text-[#c5a880] border border-white/10 transition-colors cursor-pointer"
                      title="Preview Full Image"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerReplace(image.id)}
                      className="p-2 rounded-xl bg-[#1d212a]/90 text-white hover:text-[#c5a880] border border-white/10 transition-colors cursor-pointer"
                      title="Replace Image File"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom details on image */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 text-[10px] text-zinc-300 flex items-center justify-between">
                    <span className="font-mono">{formatFileSize(image.fileSize)}</span>
                    <span className="font-mono">{image.mimeType.replace('image/', '.')}</span>
                  </div>
                </div>

                {/* Metadata & Actions Area */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Associated Service indicator */}
                    {associatedService && (
                      <div className="text-[11px] text-[#c5a880] flex items-center gap-1 font-medium mb-1">
                        <Scissors className="w-3 h-3" />
                        <span>{associatedService.name}</span>
                      </div>
                    )}

                    {/* Alt Text */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-[#e0dcd5] line-clamp-2" title={image.altText}>
                        {image.altText || <span className="text-[#6c7282] italic">No alt text specified</span>}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingImage(image);
                          setEditAltText(image.altText);
                        }}
                        className="text-[#8c92a0] hover:text-[#c5a880] p-1 rounded-md hover:bg-[#1a1d24] transition-colors cursor-pointer shrink-0"
                        title="Edit Alt Text"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[10px] text-[#696f7e] mt-2 font-mono">
                      Uploaded {formatDate(image.createdAt)}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#1e222b] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(image)}
                      className="text-xs text-[#a29e95] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {image.isActive ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Set Active</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => triggerReplace(image.id)}
                        className="text-xs text-[#a29e95] hover:text-[#c5a880] flex items-center gap-1 p-1 rounded hover:bg-[#1a1d25] transition-colors cursor-pointer"
                        title="Replace File"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image)}
                        className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[#2b313d] bg-[#121419] p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#202530] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1c202a] border border-[#2d3342] flex items-center justify-center text-[#c5a880]">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif text-white font-medium">Upload Media Asset</h3>
                  <p className="text-[11px] text-[#808696]">JPEG, PNG, or WebP up to 5MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-[#808696] hover:text-white p-1 rounded-lg hover:bg-[#1c202a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Slot Target */}
              <div>
                <label className="block text-xs font-medium text-[#c5a880] mb-1.5">
                  Target Website Slot *
                </label>
                <select
                  value={uploadSlot}
                  onChange={(e) => setUploadSlot(e.target.value as ImageSlotType)}
                  className="w-full bg-[#181a21] border border-[#292e3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                >
                  {SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label} ({slot.value})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#717686] mt-1">
                  {SLOTS.find((s) => s.value === uploadSlot)?.description}
                </p>
              </div>

              {/* Service Association (if slot is SERVICE) */}
              {uploadSlot === 'SERVICE' && (
                <div>
                  <label className="block text-xs font-medium text-[#c5a880] mb-1.5">
                    Associate with Service *
                  </label>
                  <select
                    value={uploadServiceId}
                    onChange={(e) => setUploadServiceId(e.target.value)}
                    className="w-full bg-[#181a21] border border-[#292e3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* File Dropzone / Selector */}
              <div>
                <label className="block text-xs font-medium text-[#c5a880] mb-1.5">
                  Select Image File *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2d3342] hover:border-[#c5a880]/60 rounded-xl p-5 text-center cursor-pointer bg-[#15171e] hover:bg-[#181b23] transition-colors"
                >
                  {filePreview ? (
                    <div className="space-y-2">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-lg object-cover border border-[#2e3444]"
                      />
                      <p className="text-xs text-[#c5a880] font-medium">
                        {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                      </p>
                      <p className="text-[10px] text-[#8c92a0]">Click to choose a different file</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <FileImage className="w-8 h-8 text-[#565d70] mx-auto" />
                      <p className="text-xs text-white font-medium">Click to select photo</p>
                      <p className="text-[11px] text-[#7b8192]">Supports JPG, PNG, and WebP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-medium text-[#c5a880] mb-1.5">
                  Descriptive Alt Text *
                </label>
                <input
                  type="text"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="e.g. Vintage barber chair and ambient salon lighting"
                  className="w-full bg-[#181a21] border border-[#292e3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                  required
                />
                <p className="text-[10px] text-[#717686] mt-1">
                  Accurate description for accessibility and screen readers.
                </p>
              </div>

              {/* Make Active Immediately */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="uploadIsActive"
                  checked={uploadIsActive}
                  onChange={(e) => setUploadIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#c5a880] focus:ring-0"
                />
                <label htmlFor="uploadIsActive" className="text-xs text-[#e0dcd5] cursor-pointer">
                  Activate immediately upon upload
                  {uploadSlot === 'HERO' && ' (will replace current active Hero)'}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#202530] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs text-[#8c92a0] hover:text-white bg-[#181a21] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Uploading Asset...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSIZE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="max-w-3xl w-full rounded-2xl border border-[#2b303d] bg-[#121419] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#202530] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#c5a880]">{previewImage.slot}</span>
                <h4 className="text-sm font-medium text-white truncate max-w-md">{previewImage.altText}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={previewImage.publicUrl}
                alt={previewImage.altText}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded"
              />
            </div>
            <div className="p-3 border-t border-[#202530] flex items-center justify-between text-xs text-[#8c92a0]">
              <span>Storage Key: <code className="text-zinc-300 font-mono">{previewImage.storageKey}</code></span>
              <span>{formatFileSize(previewImage.fileSize)}</span>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ALT TEXT MODAL */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl border border-[#2b313d] bg-[#121419] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-serif text-white font-medium">Edit Alt Text</h4>
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs text-[#c5a880] mb-1">Image Description (Alt Text)</label>
              <textarea
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                rows={3}
                className="w-full bg-[#181a21] border border-[#292e3b] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAltText}
                className="px-4 py-1.5 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl cursor-pointer"
              >
                Save Alt Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
