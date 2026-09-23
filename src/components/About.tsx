import React from 'react';
import { User, CheckCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../data/business';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-20 md:py-28 bg-[#0e1013] border-t border-[#1e2229] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Father's Portrait Space */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Dignified Portrait Frame */}
              <div className="rounded-2xl border border-[#262c37] bg-[#14161b] p-4 shadow-2xl relative overflow-hidden">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1d24] via-[#121418] to-[#0c0e11] border border-[#202530] flex flex-col justify-between p-6 sm:p-8">
                  
                  {/* Watermark-free subtle texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(#c5a880_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#c5a880]">
                      Founder & Senior Barber
                    </span>
                    <span className="text-[11px] text-[#7d8390] font-mono">Good Luck Salon</span>
                  </div>

                  {/* Stylized Silhouette & Portrait Placeholder */}
                  <div className="relative z-10 my-auto text-center py-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-[#1b1e25] border border-[#2c3240] flex items-center justify-center text-[#c5a880] mb-4 shadow-inner">
                      <User className="w-12 h-12 stroke-[1.25]" />
                    </div>
                    <div className="text-xl font-serif text-white font-medium">
                      Senior Barber & Proprietor
                    </div>
                    <div className="text-xs text-[#9ea3ae] mt-1">
                      {BUSINESS_INFO.fatherTitle}
                    </div>
                  </div>

                  {/* Space reserved for official portrait note */}
                  <div className="relative z-10 p-3 rounded-lg bg-[#181b22]/90 border border-[#242934] text-[11px] text-[#8c919d] text-center">
                    A dedicated barber serving our neighborhood clients every single day.
                  </div>
                </div>

                {/* Overlaid Badge */}
                <div className="absolute -bottom-3 right-4 bg-[#181b22] border border-[#2e3442] rounded-xl px-4 py-2 shadow-xl">
                  <div className="text-xs font-serif text-[#c5a880] font-medium">
                    Personal Care
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Story & Family Business Roots */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880]">
              <span>04. Our Story & Roots</span>
              <span aria-hidden="true">·</span>
              <span>A Family Enterprise</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal leading-tight">
              Built on Trust, Quiet Skill, and Daily Devotion.
            </h2>

            <p className="text-base text-[#9ea3ae] leading-relaxed">
              Good Luck Hair Salon is a real, family-owned neighborhood establishment founded and operated by my father. In an industry increasingly dominated by quick-service chains, this salon remains devoted to what truly matters: personal attention, clean execution, and genuine care for each person who walks through our doors.
            </p>

            <p className="text-sm text-[#8c919d] leading-relaxed">
              Every day begins with preparing clean shears, orderly stations, and checking equipment to ensure that each of our daily clients receives attentive, comfortable service. Whether it is an early-morning haircut, a gentle grooming visit for an elder, or an evening head massage to unwind from the day’s fatigue, our father takes pride in consistent, reliable work.
            </p>

            {/* Core Commitments */}
            <div className="pt-4 border-t border-[#1e2229] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Attentive Hospitality
                  </h4>
                  <p className="text-xs text-[#8c919d] mt-0.5">
                    Respectful service where you receive focused personal care.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Neighborhood Reliability
                  </h4>
                  <p className="text-xs text-[#8c919d] mt-0.5">
                    Open 7 days a week with consistent daily hours and scheduled appointments.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
