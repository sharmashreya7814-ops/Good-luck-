import React, { useState, useMemo, useEffect } from 'react';
import { SERVICES, SERVICE_CATEGORIES } from '../data/services';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceCategory, ServiceItem } from '../types';
import { Scissors, Check, Sparkles, Clock, ArrowRight, ShieldCheck, Home, Calendar } from 'lucide-react';
import { BUSINESS_INFO } from '../data/business';
import { apiClient } from '../api/client';

interface ServicesPageProps {
  onBookService: (serviceId: string) => void;
  onNavigateHome: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onBookService, onNavigateHome }) => {
  const [services, setServices] = useState<ServiceItem[]>(SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getServices()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch((err) => {
        console.warn('[ServicesPage] Failed to fetch live services catalog, using fallback:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (!service.active) return false;
      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory;
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (service.tagline && service.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="pt-28 pb-24 bg-[#0c0d0e] min-h-screen text-[#e6e4df]">
      {/* 1. Services Page Hero */}
      <section className="relative py-14 sm:py-20 border-b border-[#1f232d] overflow-hidden bg-gradient-to-b from-[#121419] to-[#0c0d0e]">
        <div 
          aria-hidden="true" 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#c5a880]/5 blur-[120px] rounded-full pointer-events-none" 
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880]">
              <span>Good Luck Hair Salon</span>
              <span aria-hidden="true">·</span>
              <span>Grooming Menu</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white font-normal leading-tight tracking-tight">
              Services Designed Around You.
            </h1>

            <p className="text-base sm:text-lg text-[#9ea3ae] leading-relaxed max-w-2xl font-normal">
              Explore our grooming and personal care services and choose what works best for you. From classic haircuts and beard styling to relaxing scalp and body massages.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#8c919d]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Open 7 Days (9:00 AM – 9:00 PM)</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Home Service Available</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#e2ded7] font-medium">Cash + UPI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter & Navigation Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2229]">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#14161a] border border-[#232731] rounded-xl overflow-x-auto max-w-full">
            {SERVICE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#c5a880] text-black font-semibold shadow-sm'
                      : 'text-[#9ea3ae] hover:text-white hover:bg-[#1c1f26]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service name..."
              className="w-full px-3.5 py-2 text-xs bg-[#131518] border border-[#242830] focus:border-[#c5a880] rounded-xl text-white placeholder-[#606775] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Results Count & Salon Guarantee */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 text-xs text-[#8c919d]">
          <div>
            Showing <strong className="text-[#e2ded7] font-mono">{filteredServices.length}</strong> active service{filteredServices.length === 1 ? '' : 's'}
            {selectedCategory !== 'all' && ` in ${SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.label}`}
          </div>
          <div className="flex items-center gap-1.5 text-[#c5a880]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guaranteed fixed pricing & dedicated chair time</span>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBookService={onBookService}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-2xl border border-[#232731] bg-[#14161a] p-8 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#1c1f26] border border-[#2c3240] flex items-center justify-center text-[#8c919d]">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif text-white">No services found</h3>
            <p className="text-xs text-[#8c919d] max-w-sm mx-auto">
              No service matching "{searchQuery}" in this category. Try clearing your search or switching categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#1f232c] hover:bg-[#2b303c] text-white rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom Banner: Custom or Combination Inquiries */}
        <div className="mt-16 rounded-2xl border border-[#252a35] bg-[#14161b] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="text-xs font-mono uppercase tracking-wider text-[#c5a880]">
              Custom Grooming Request
            </div>
            <h3 className="text-xl font-serif text-white font-medium">
              Require a specific combination or tailored timing?
            </h3>
            <p className="text-xs sm:text-sm text-[#9ea3ae] max-w-xl">
              We gladly tailor our services to your preferences. You can reserve a standard slot and let our barber know your custom requirements upon arrival.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onBookService(SERVICES[0].id)}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#c5a880] hover:bg-[#d8be98] text-black font-semibold text-xs rounded-xl transition-colors whitespace-nowrap shadow-sm"
            >
              Book an Appointment
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-4 py-3 bg-[#181b21] hover:bg-[#21252e] text-white text-xs font-medium border border-[#2b303c] rounded-xl transition-colors whitespace-nowrap"
            >
              Back to Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
