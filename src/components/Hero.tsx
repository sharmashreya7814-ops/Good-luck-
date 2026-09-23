import React from 'react';
import { ArrowRight, Clock, MapPin, Sparkles, Scissors, UserCheck, CheckCircle2 } from 'lucide-react';
import { BUSINESS_INFO } from '../data/business';

interface HeroProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExploreServices }) => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-[#111317] via-[#0c0d0e] to-[#0c0d0e]">
      {/* Subtle architectural ambient glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#c5a880]/5 blur-[120px] rounded-full pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Clean unboxed metadata lead-in (Zero-pill discipline) */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#c5a880] tracking-widest uppercase">
              <span>Men's Grooming</span>
              <span aria-hidden="true">·</span>
              <span>Head & Body Massage</span>
            </div>

            {/* Display Headline with balanced wrapping */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white font-normal leading-[1.1] tracking-tight max-w-2xl">
              Classic Grooming & Personal Care.
            </h1>

            {/* Supporting Description: Truthful, dignified, comfortable */}
            <p className="text-base sm:text-lg text-[#9ea3ae] leading-relaxed max-w-xl font-normal">
              A quiet neighborhood salon dedicated to classic haircuts, traditional shaves, and relaxing head and body massage. Dedicated personal attention in a clean, comfortable setting.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onOpenBooking}
                className="px-6 py-3 text-sm font-semibold tracking-wide text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-all duration-200 shadow-lg shadow-[#c5a880]/15 flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c5a880]"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExploreServices}
                className="px-6 py-3 text-sm font-medium text-[#e2ded7] hover:text-white bg-[#16181d] hover:bg-[#1f2229] border border-[#272b34] hover:border-[#3a414e] rounded-xl transition-all duration-200 cursor-pointer"
              >
                Explore Services
              </button>
            </div>

            {/* Quiet trust credentials (unboxed, legible text) */}
            <div className="pt-6 border-t border-[#1e2229] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#8c919d]">
              <div>
                <span className="block text-[#e2ded7] font-medium">Open 7 Days</span>
                <span>9:00 AM – 9:00 PM</span>
              </div>
              <div>
                <span className="block text-[#e2ded7] font-medium">2 Dedicated Chairs</span>
                <span>Personal one-on-one service</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[#e2ded7] font-medium">Payment Flexibility</span>
                <span>Cash & UPI Accepted</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase (High-end architectural canvas) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative frame with warm hairline border */}
              <div className="relative rounded-2xl overflow-hidden border border-[#282d38] bg-[#14161a] p-3 shadow-2xl">
                
                {/* Visual Canvas Container */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-gradient-to-br from-[#1d2027] via-[#15171c] to-[#0f1114] flex flex-col justify-between p-6 sm:p-8 border border-[#222631]">
                  
                  {/* Subtle decorative geometric motif */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c5a880_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  
                  {/* Top Bar inside card */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#20232b] border border-[#2b303b] flex items-center justify-center text-[#c5a880]">
                        <Scissors className="w-4 h-4" />
                      </div>
                      <span className="text-xs uppercase tracking-wider text-[#c5a880] font-medium">
                        Good Luck Salon
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8c919d] font-mono">Neighborhood Salon</span>
                  </div>

                  {/* Center Visual Statement */}
                  <div className="relative z-10 my-auto py-6">
                    <div className="w-12 h-0.5 bg-[#c5a880]/60 mb-3" />
                    <h3 className="text-2xl sm:text-3xl font-serif text-white font-normal leading-snug">
                      Classic Haircuts & Relaxing Massage.
                    </h3>
                    <p className="text-xs sm:text-sm text-[#9ea3ae] mt-2 max-w-xs">
                      Attentive haircutting and beard grooming paired with traditional head champi and body relaxation.
                    </p>
                  </div>

                  {/* Bottom Feature Badges (Single-line unboxed text) */}
                  <div className="relative z-10 pt-3 border-t border-[#242833] flex items-center justify-between text-xs text-[#b0aba2]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#c5a880]" />
                      <span>Clean Station</span>
                    </div>
                    <span>·</span>
                    <div>Home Service Available</div>
                    <span>·</span>
                    <div className="text-[#c5a880] font-medium">Personal Care</div>
                  </div>
                </div>

                {/* Overlaid Corner Accent Card */}
                <div className="absolute -bottom-4 -left-3 sm:-left-5 bg-[#171a20]/95 backdrop-blur-md border border-[#2b313d] rounded-xl p-3.5 shadow-xl max-w-[210px]">
                  <div className="text-[10px] uppercase tracking-wider text-[#c5a880] font-medium">
                    Chair Capacity
                  </div>
                  <div className="text-sm font-serif text-white font-medium mt-0.5">
                    2 Dedicated Chairs
                  </div>
                  <div className="text-[11px] text-[#8c919d] mt-1">
                    Book online to reserve your preferred time without queues.
                  </div>
                </div>

                {/* Overlaid Top-Right Accent Card */}
                <div className="absolute -top-3 -right-3 sm:-right-4 bg-[#171a20]/95 backdrop-blur-md border border-[#2b313d] rounded-xl px-3 py-2 shadow-xl">
                  <div className="text-[11px] text-[#e2ded7] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Open 7 Days</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
