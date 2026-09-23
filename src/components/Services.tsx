import React, { useState, useEffect } from 'react';
import { SERVICES, SERVICE_CATEGORIES } from '../data/services';
import { ServiceCard } from './ServiceCard';
import { Scissors } from 'lucide-react';
import { ServiceItem } from '../types';
import { apiClient } from '../api/client';

interface ServicesProps {
  onBookService: (serviceId: string) => void;
  onViewAllServices?: () => void;
}

export const Services: React.FC<ServicesProps> = ({ onBookService, onViewAllServices }) => {
  const [services, setServices] = useState<ServiceItem[]>(SERVICES);
  const [activeCategory, setActiveCategory] = useState<string>('all');

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
        console.warn('[Home Services] Failed to fetch live services, using default:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = activeCategory === 'all'
    ? services.filter((s) => s.active)
    : services.filter((s) => s.active && s.category === activeCategory);

  return (
    <section id="services" className="py-20 md:py-28 bg-[#0c0d0e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#20242e] pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880] mb-2">
              <span>01. Service Menu</span>
              <span aria-hidden="true">·</span>
              <span>Grooming & Personal Care</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal">
              Services & Pricing
            </h2>
            <p className="text-sm sm:text-base text-[#9ea3ae] mt-2 max-w-xl">
              From classic haircuts and straight razor shaves to traditional head champi and body relaxation. All services include personal consultation and attentive care.
            </p>
          </div>

          {/* Interactive Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#14161a] border border-[#232731] rounded-xl self-start md:self-auto">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#c5a880] text-black font-semibold shadow-sm'
                    : 'text-[#9ea3ae] hover:text-white hover:bg-[#1c1f26]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBookService={onBookService}
            />
          ))}
        </div>

        {/* Bottom Custom Session Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#131518] border border-[#22262f] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#1c1f26] text-[#c5a880] shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Looking for a custom combination?</div>
              <div className="text-xs text-[#8c919d]">
                Mention your grooming preferences during booking or discuss with our barber when you arrive.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onBookService(SERVICES[0].id)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors whitespace-nowrap"
          >
            Book Session
          </button>
        </div>

      </div>
    </section>
  );
};
