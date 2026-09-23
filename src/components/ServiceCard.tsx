import React from 'react';
import { Clock, ArrowRight, Check, Home, Scissors, Sparkles } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceCardProps {
  service: ServiceItem;
  onBookService: (serviceId: string) => void;
  featured?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBookService, featured = false }) => {
  const duration = service.duration || service.durationMinutes || 30;
  const price = service.price || service.priceDisplay || 'Indicative Pricing';

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hair':
        return 'Hair & Grooming';
      case 'beard':
        return 'Beard & Shaving';
      case 'massage':
        return 'Massage';
      case 'other':
      default:
        return 'Other Services';
    }
  };

  return (
    <div
      className={`group relative bg-[#131518] border rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/20 hover:shadow-black/40 hover:-translate-y-0.5 motion-reduce:transform-none ${
        featured
          ? 'border-[#c5a880]/50 ring-1 ring-[#c5a880]/20'
          : 'border-[#22262f] hover:border-[#3d4454]'
      }`}
    >
      {/* Top Header */}
      <div>
        {/* Service Image / Stylized Visual Header if provided or default icon container */}
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-gradient-to-br from-[#1b1e25] via-[#14161b] to-[#0f1114] border border-[#232731] mb-5 flex flex-col justify-between p-4 group-hover:border-[#383e4d] transition-colors">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#c5a880] px-2 py-0.5 rounded bg-[#131518]/90 border border-[#2a2e38]">
              {getCategoryLabel(service.category)}
            </span>
            {service.isPopular && (
              <span className="text-[10px] text-[#c5a880] border border-[#c5a880]/30 px-2 py-0.5 rounded tracking-wide font-medium bg-[#1d1a15]">
                Recommended
              </span>
            )}
          </div>

          <div className="my-auto flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#1b1e25] border border-[#2b313d] flex items-center justify-center text-[#c5a880] group-hover:scale-105 group-hover:border-[#c5a880]/40 transition-all duration-300">
              <Scissors className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8c919d] z-10 pt-1 border-t border-[#1e2229]">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-[#c5a880]" />
              {duration} mins
            </span>
            <span className="font-mono text-white font-medium">
              {price}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <h3 className="text-lg sm:text-xl font-serif text-white font-medium group-hover:text-[#c5a880] transition-colors">
            {service.name}
          </h3>

          {service.tagline && (
            <p className="text-xs text-[#c5a880]/85 italic font-serif">
              "{service.tagline}"
            </p>
          )}
        </div>

        {/* Detailed Description */}
        <p className="text-xs sm:text-sm text-[#9ea3ae] leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Highlights List */}
        {service.highlights && service.highlights.length > 0 && (
          <ul className="space-y-1.5 mb-6 pt-3 border-t border-[#1e2229]">
            {service.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-[#b0aba2]">
                <Check className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Card Footer: Metadata and Booking Button */}
      <div className="pt-4 border-t border-[#1e2229] mt-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onBookService(service.id)}
            className="flex-1 py-2.5 px-4 bg-[#181b21] hover:bg-[#c5a880] text-[#e2ded7] hover:text-black border border-[#2c323f] hover:border-[#c5a880] rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#c5a880]"
          >
            <span>Book Service</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {service.homeServiceAvailable && (
            <div 
              className="p-2.5 rounded-xl bg-[#181b21] border border-[#272b35] text-[#8c919d] hover:text-white transition-colors"
              title="Home Service Available"
            >
              <Home className="w-4 h-4 text-[#c5a880]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
