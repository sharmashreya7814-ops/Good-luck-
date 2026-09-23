import React from 'react';
import { ShieldCheck, HeartHandshake, Scissors, Clock } from 'lucide-react';
import { BUSINESS_INFO } from '../data/business';

interface ExperienceProps {
  onOpenBooking: () => void;
}

export const Experience: React.FC<ExperienceProps> = ({ onOpenBooking }) => {
  const values = [
    {
      title: 'Individual Attention',
      description:
        'With only two barber chairs in the salon, we never double-book appointments. Every client receives patient, dedicated care from start to finish.',
    },
    {
      title: 'Classic Haircut Craft',
      description:
        'Focused scissor and trimmer work that respects the natural drape and texture of your hair for a sharp, clean finish.',
    },
    {
      title: 'Clean & Orderly Setup',
      description:
        'Clean shears, combs, fresh neck strips, and tidy stations are maintained for every client who sits in our chairs.',
    },
    {
      title: 'Neighborhood Trust',
      description:
        'Serving approximately 15 to 20 clients each day. Built upon consistent personal care, quiet respect, and warm familiarity.',
    },
  ];

  return (
    <section id="experience" className="py-20 md:py-28 bg-[#0e1013] border-t border-[#1e2229] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Editorial Showcase */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              
              {/* Outer decorative card */}
              <div className="rounded-2xl border border-[#252a35] bg-[#14161a] p-6 sm:p-8 space-y-6 shadow-2xl relative z-10">
                <div className="flex items-center justify-between border-b border-[#21252f] pb-4">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-[#c5a880]" />
                    <span className="text-xs uppercase tracking-wider text-[#c5a880] font-medium">
                      Service Approach
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#8c919d]">2 Chairs · Dedicated Care</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-serif text-white font-normal leading-tight">
                    "A haircut is personal care. It is time for quiet comfort and attentive grooming."
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9ea3ae] leading-relaxed">
                    Our founder's daily dedication to every client who visits our chairs.
                  </p>
                </div>

                {/* Practical metrics grounded in reality */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#21252f]">
                  <div className="p-3 rounded-xl bg-[#181b22] border border-[#232833]">
                    <div className="text-xl font-serif text-[#c5a880] font-semibold">15–20</div>
                    <div className="text-xs text-[#8c919d] mt-0.5">Clients served daily with personal attention</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#181b22] border border-[#232833]">
                    <div className="text-xl font-serif text-[#c5a880] font-semibold">7 Days</div>
                    <div className="text-xs text-[#8c919d] mt-0.5">Consistent neighborhood availability</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="w-full py-3 px-4 bg-[#c5a880] hover:bg-[#d8be98] text-black text-xs font-semibold rounded-xl transition-colors text-center"
                  >
                    Reserve an In-Salon Session
                  </button>
                </div>
              </div>

              {/* Decorative accent element behind */}
              <div 
                aria-hidden="true" 
                className="absolute -top-4 -left-4 w-full h-full rounded-2xl border border-[#c5a880]/20 pointer-events-none -z-0 hidden sm:block" 
              />
            </div>
          </div>

          {/* Right Column: Narrative & Principles */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880]">
              <span>02. The Salon Experience</span>
              <span aria-hidden="true">·</span>
              <span>Personal Service</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal leading-tight">
              A Personal Grooming Experience Rooted in Respect.
            </h2>

            <p className="text-base text-[#9ea3ae] leading-relaxed">
              At Good Luck Hair Salon, we value personal attention and a calm environment. Conversations are respectful, motions are deliberate, and grooming is done with care and pride.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              {values.map((val, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#131518] border border-[#20242e] space-y-1.5">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                    <span>{val.title}</span>
                  </h4>
                  <p className="text-xs text-[#8c919d] leading-relaxed">
                    {val.description}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
