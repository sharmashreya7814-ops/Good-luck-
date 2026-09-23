import React from 'react';
import { BUSINESS_INFO } from '../data/business';
import { SERVICES } from '../data/services';

interface FooterProps {
  onOpenBooking: () => void;
  onNavigatePage?: (page: 'home' | 'services' | 'booking') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onNavigatePage }) => {
  return (
    <footer className="bg-[#08090a] border-t border-[#1a1c22] text-[#8c919d] text-xs pt-16 pb-24 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#181a20]">
          
          {/* Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="#/"
              onClick={(e) => {
                if (onNavigatePage) {
                  e.preventDefault();
                  onNavigatePage('home');
                }
              }}
              className="text-2xl font-serif tracking-tight text-white hover:text-[#c5a880] transition-colors block"
            >
              Good Luck Hair Salon
            </a>
            <p className="text-xs leading-relaxed max-w-sm text-[#9ea3ae]">
              A classic men's grooming and massage establishment. Family owned and operated with pride, authentic scissor craft, and daily neighborhood dedication.
            </p>
            <div className="pt-2 text-[11px] text-[#787e8b]">
              <span>Men's Grooming</span> · <span>Head & Body Massage</span> · <span>Home Service</span>
            </div>
          </div>

          {/* Quick Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('home') : null}
                  className="hover:text-white transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('services') : null}
                  className="hover:text-white transition-colors text-left"
                >
                  Services Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigatePage ? onNavigatePage('booking') : onOpenBooking()}
                  className="hover:text-white transition-colors text-left"
                >
                  Book Appointment
                </button>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About the Salon
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Atmosphere
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Hours & Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Core Services (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white">
              Popular Services
            </h4>
            <ul className="space-y-2">
              {SERVICES.slice(0, 5).map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigatePage) {
                        onNavigatePage('booking');
                      } else {
                        onOpenBooking();
                      }
                    }}
                    className="hover:text-[#c5a880] transition-colors text-left"
                  >
                    {service.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Schedule & Immediate Action (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white">
              Operating Hours
            </h4>
            <div className="space-y-1.5 text-xs text-[#9ea3ae]">
              <div>Mon–Fri: {BUSINESS_INFO.hours.weekdays}</div>
              <div>Saturday: {BUSINESS_INFO.hours.saturday}</div>
              <div>Sunday: {BUSINESS_INFO.hours.sunday}</div>
              <div className="text-[#c5a880]">Daily Break: {BUSINESS_INFO.hours.breakTime}</div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigatePage ? onNavigatePage('booking') : onOpenBooking()}
                className="w-full py-2.5 px-3 bg-[#191c22] hover:bg-[#c5a880] text-[#e2ded7] hover:text-black border border-[#272b35] hover:border-[#c5a880] rounded-lg text-xs font-semibold tracking-wide transition-all"
              >
                Book Appointment Online
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Subtle Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6e7482]">
          <div>
            © {new Date().getFullYear()} Good Luck Hair Salon. All rights reserved.
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span>Payment: Cash & UPI</span>
            <span>·</span>
            <span>2 Dedicated Chairs</span>
            <span>·</span>
            <a
              href="#/admin"
              className="text-[#8c92a0] hover:text-[#c5a880] transition-colors underline font-mono text-[11px]"
            >
              Staff & Admin Portal
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
