import React from 'react';
import { Clock, Check, ArrowRight } from 'lucide-react';
import { SERVICES } from '../data/services';

interface MassageSectionProps {
  onBookService: (serviceId: string) => void;
}

export const MassageSection: React.FC<MassageSectionProps> = ({ onBookService }) => {
  const massageServices = SERVICES.filter((s) => s.category === 'massage' && s.active);

  return (
    <section id="massage" className="py-20 md:py-28 bg-[#0c0d0e] relative border-t border-[#1e2229]">
      {/* Ambient warm glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 right-10 -translate-y-1/2 w-[500px] h-[300px] bg-[#c5a880]/5 blur-[120px] rounded-full pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880]">
            <span>03. Massage Care</span>
            <span aria-hidden="true">·</span>
            <span>Relaxation & Rest</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal">
            Head & Body Massage
          </h2>
          <p className="text-sm sm:text-base text-[#9ea3ae] leading-relaxed">
            Massage is a core service at our salon. Traditional head champi and muscular relaxation sessions provide comfort, calmness, and physical ease after long workdays.
          </p>
        </div>

        {/* Massage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {massageServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#131518] border border-[#22262f] hover:border-[#383e4d] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/30 group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#c5a880] mb-2 font-mono">
                  <span>{service.duration || service.durationMinutes} Minutes</span>
                  <span className="text-white font-medium text-sm">{service.price || service.priceDisplay}</span>
                </div>

                <h3 className="text-xl font-serif text-white group-hover:text-[#c5a880] transition-colors font-medium mb-1">
                  {service.name}
                </h3>

                {service.tagline && (
                  <p className="text-xs text-[#c5a880]/90 italic font-serif mb-3">
                    "{service.tagline}"
                  </p>
                )}

                <p className="text-xs text-[#9ea3ae] leading-relaxed mb-4">
                  {service.description}
                </p>

                {service.highlights && (
                  <ul className="space-y-1.5 pt-3 border-t border-[#1e2229] mb-6">
                    {service.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[#b0aba2]">
                        <Check className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-4 border-t border-[#1e2229] mt-auto">
                <button
                  type="button"
                  onClick={() => onBookService(service.id)}
                  className="w-full py-2.5 px-4 bg-[#181b21] hover:bg-[#c5a880] text-[#e2ded7] hover:text-black border border-[#2c323f] hover:border-[#c5a880] rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Book {service.name.split(' ')[0]} Massage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance Banner */}
        <div className="rounded-2xl border border-[#232731] bg-[#14161a] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-serif text-white font-medium">
              A Quiet Space for Rest and Relaxation
            </h4>
            <p className="text-xs text-[#8c919d] max-w-xl">
              All massage sessions use hair oils with traditional manual techniques calibrated to your pressure preference. Unhurried and dedicated to your comfort.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onBookService('head-massage-champi')}
            className="px-6 py-3 text-xs font-semibold text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors whitespace-nowrap shadow-md cursor-pointer"
          >
            Book Head Champi
          </button>
        </div>

      </div>
    </section>
  );
};
