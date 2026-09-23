import React from 'react';
import { Calendar, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import { BUSINESS_INFO } from '../data/business';

interface BookingCTAProps {
  onOpenBooking: () => void;
}

export const BookingCTA: React.FC<BookingCTAProps> = ({ onOpenBooking }) => {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-[#0c0d0e] via-[#121419] to-[#0c0d0e] relative border-t border-[#1e2229] overflow-hidden">
      {/* Warm ambient spotlight */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c5a880]/10 blur-[130px] rounded-full pointer-events-none" 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        {/* Subtle lead kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880]">
          <span>Direct Reservation</span>
          <span aria-hidden="true">·</span>
          <span>Scheduled Appointments</span>
        </div>

        {/* Marquee Heading */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white font-normal leading-tight tracking-tight">
          Your Time. Your Appointment.
        </h2>

        {/* Supporting Message */}
        <p className="text-base sm:text-lg text-[#9ea3ae] max-w-xl mx-auto leading-relaxed">
          Choose your service, pick a convenient time, and visit us without the wait. Enjoy the peaceful atmosphere of our two dedicated chairs.
        </p>

        {/* Primary and WhatsApp CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold tracking-wide text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-all duration-200 shadow-xl shadow-[#c5a880]/20 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c5a880]"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={BUSINESS_INFO.contact.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold tracking-wide text-white bg-[#1b1e25] hover:bg-[#252a35] border border-[#2b313e] hover:border-[#3d4557] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
            <span>WhatsApp Us</span>
          </a>
        </div>

        {/* Small trust notes below CTAs */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8c919d]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Appointments given first priority</span>
          </span>
          <span>·</span>
          <span>Cash + UPI accepted</span>
          <span>·</span>
          <span>Home service available on request</span>
        </div>

      </div>
    </section>
  );
};
