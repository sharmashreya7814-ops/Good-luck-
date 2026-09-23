import React from 'react';
import { Clock, Phone, MapPin, MessageSquare, CreditCard, Users, Home } from 'lucide-react';
import { BUSINESS_INFO } from '../data/business';

interface ContactProps {
  onOpenBooking: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onOpenBooking }) => {
  return (
    <section id="contact" className="py-20 md:py-28 bg-[#0c0d0e] border-t border-[#1e2229] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 border-b border-[#1f232d] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880] mb-2">
            <span>07. Hours & Location</span>
            <span aria-hidden="true">·</span>
            <span>Plan Your Visit</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal">
            Visit Good Luck Hair Salon
          </h2>
          <p className="text-sm sm:text-base text-[#9ea3ae] mt-2 max-w-xl">
            We are open 7 days a week. Appointments ensure immediate seating without standing in queues.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Opening Schedule & Payment Information */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Opening Hours Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#131518] border border-[#22262f] shadow-lg shadow-black/20">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1f232d]">
                <div className="p-2.5 rounded-xl bg-[#1c1f26] text-[#c5a880]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-white font-medium">Opening Hours</h3>
                  <div className="text-xs text-[#8c919d]">Open 7 days a week</div>
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#1a1d24]">
                  <span className="text-[#b0aba2]">Monday – Friday</span>
                  <span className="font-mono text-white font-medium">{BUSINESS_INFO.hours.weekdays}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#1a1d24]">
                  <span className="text-[#b0aba2]">Saturday</span>
                  <div className="text-right">
                    <span className="font-mono text-[#c5a880] font-medium">{BUSINESS_INFO.hours.saturday}</span>
                    <span className="block text-[11px] text-[#8c919d]">Half Day schedule</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#1a1d24]">
                  <span className="text-[#b0aba2]">Sunday</span>
                  <span className="font-mono text-white font-medium">{BUSINESS_INFO.hours.sunday}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#b0aba2]">Daily Rest Break</span>
                  <span className="font-mono text-[#c5a880]">{BUSINESS_INFO.hours.breakTime}</span>
                </div>
              </div>

              <div className="mt-6 p-3.5 rounded-xl bg-[#181a20] border border-[#252934] text-xs text-[#9ea3ae] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>2 dedicated service chairs ensure personal, attentive appointments.</span>
              </div>
            </div>

            {/* Payment & Home Service Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#131518] border border-[#22262f]">
                <CreditCard className="w-5 h-5 text-[#c5a880] mb-2" />
                <h4 className="text-sm font-semibold text-white">Payment Options</h4>
                <p className="text-xs text-[#8c919d] mt-1">
                  Cash and all major UPI apps (Google Pay, PhonePe, Paytm).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131518] border border-[#22262f]">
                <Home className="w-5 h-5 text-[#c5a880] mb-2" />
                <h4 className="text-sm font-semibold text-white">Doorstep Service</h4>
                <p className="text-xs text-[#8c919d] mt-1">
                  Home grooming available across the locality by prior reservation.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Details & Map Card */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="p-6 sm:p-8 rounded-2xl bg-[#131518] border border-[#22262f] shadow-lg shadow-black/20 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1f232d]">
                <div className="p-2.5 rounded-xl bg-[#1c1f26] text-[#c5a880]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-white font-medium">Salon Location & Contact</h3>
                  <div className="text-xs text-[#8c919d]">Centrally Located</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#8c919d] mb-1">
                    Address Notice
                  </div>
                  <div className="text-sm text-white font-medium">
                    {BUSINESS_INFO.contact.area}
                  </div>
                  <p className="text-xs text-[#8c919d] mt-0.5">
                    {BUSINESS_INFO.contact.addressNote}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s+/g, '')}`}
                    className="flex-1 p-3.5 rounded-xl bg-[#181a20] border border-[#252934] hover:border-[#383e4e] transition-colors flex items-center gap-3 text-white"
                  >
                    <Phone className="w-4 h-4 text-[#c5a880]" />
                    <div>
                      <div className="text-[11px] text-[#8c919d]">Call Directly</div>
                      <div className="text-xs font-mono font-medium">{BUSINESS_INFO.contact.phone}</div>
                    </div>
                  </a>

                  <a
                    href={BUSINESS_INFO.contact.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 p-3.5 rounded-xl bg-[#181a20] border border-[#252934] hover:border-[#383e4e] transition-colors flex items-center gap-3 text-white"
                  >
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <div>
                      <div className="text-[11px] text-[#8c919d]">WhatsApp Inquiries</div>
                      <div className="text-xs font-mono font-medium">{BUSINESS_INFO.contact.whatsappNumber}</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Elegant Map Placeholder */}
              <div className="rounded-xl overflow-hidden border border-[#242832] bg-[#16181d] aspect-[16/9] relative flex flex-col justify-center items-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-[#1c1f26] border border-[#2b303c] flex items-center justify-center text-[#c5a880] mb-2 shadow-inner">
                  <MapPin className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="text-sm font-serif text-white font-medium">Interactive Map & Directions</div>
                <div className="text-xs text-[#8c919d] max-w-xs mt-1">
                  Full GPS navigation pin is transmitted directly with your appointment confirmation.
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="w-full py-3 px-4 bg-[#c5a880] hover:bg-[#d8be98] text-black text-xs font-semibold rounded-xl transition-colors text-center"
                >
                  Reserve Your Next Appointment
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
