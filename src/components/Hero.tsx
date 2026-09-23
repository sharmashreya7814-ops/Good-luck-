import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
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

          {/* Right Column: Premium Salon Visual Container */}
          <div className="lg:col-span-5 w-full">
            <div className="relative mx-auto max-w-lg lg:max-w-none group">
              
              {/* Image Container with rounded borders, dark backdrop & overflow containment */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#2a2e39] bg-[#121418] shadow-2xl shadow-black/60">
                
                {/* Large high-quality men's grooming / barbershop image */}
                <img
                  src="/assets/hero_salon.jpg"
                  alt="Good Luck Hair Salon interior with vintage barber chairs and dark luxury aesthetic"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.indexOf('hero_barber_interior.jpg') === -1) {
                      target.src = '/assets/hero_barber_interior.jpg';
                    }
                  }}
                />

                {/* Subtle dark gradient overlay for depth, readability, and contrast */}
                <div 
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20 pointer-events-none" 
                />

                {/* Subtle luxury edge rim illumination */}
                <div 
                  aria-hidden="true"
                  className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl sm:rounded-3xl pointer-events-none" 
                />

                {/* Floating Badge 1: Open 7 Days (Top-Left inside container) */}
                <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-10 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#0e1014]/85 backdrop-blur-md border border-[#2d323e] text-xs font-medium text-[#e2ded7] shadow-lg shadow-black/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="tracking-wide">Open 7 Days</span>
                  </div>
                </div>

                {/* Floating Badge 2: Home Service Available (Bottom-Right inside container) */}
                <div className="absolute bottom-3.5 right-3.5 sm:bottom-5 sm:right-5 z-10 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#0e1014]/85 backdrop-blur-md border border-[#3e3428] text-xs font-medium text-[#c5a880] shadow-lg shadow-black/50">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                    <span className="tracking-wide">Home Service Available</span>
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
