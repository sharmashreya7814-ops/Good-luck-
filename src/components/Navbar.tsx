import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Phone, Scissors } from 'lucide-react';
import { BUSINESS_INFO } from '../data/business';

export type AppPage = 'home' | 'services' | 'booking';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage, anchor?: string) => void;
  onOpenQuickBooking: (serviceId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenQuickBooking,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (page: AppPage, anchor?: string) => {
    setMobileMenuOpen(false);
    onNavigate(page, anchor);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0c0d0e]/95 backdrop-blur-md border-b border-[#22262f] shadow-lg shadow-black/25 py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Wordmark (Display font, clean and dignified) */}
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className="text-xl sm:text-2xl font-serif tracking-tight text-white hover:text-[#c5a880] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c5a880] whitespace-nowrap text-left cursor-pointer"
            >
              Good Luck Hair Salon
            </button>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-wider text-[#b5b1a9]">
              <button
                type="button"
                onClick={() => handleLinkClick('home')}
                className={`transition-colors cursor-pointer py-1 ${
                  currentPage === 'home'
                    ? 'text-white border-b-2 border-[#c5a880]'
                    : 'hover:text-white'
                }`}
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('services')}
                className={`transition-colors cursor-pointer py-1 ${
                  currentPage === 'services'
                    ? 'text-white border-b-2 border-[#c5a880]'
                    : 'hover:text-white'
                }`}
              >
                Services
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('booking')}
                className={`transition-colors cursor-pointer py-1 ${
                  currentPage === 'booking'
                    ? 'text-white border-b-2 border-[#c5a880]'
                    : 'hover:text-white'
                }`}
              >
                Book
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('home', 'about')}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                About
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('home', 'gallery')}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Atmosphere
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('home', 'contact')}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Contact
              </button>
            </nav>

            {/* Primary actions */}
            <div className="flex items-center gap-3">
              <a
                href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s+/g, '')}`}
                className="hidden lg:inline-flex items-center gap-2 text-xs text-[#9ea3ae] hover:text-white transition-colors px-3 py-2 font-mono"
                title="Call Salon"
              >
                <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>{BUSINESS_INFO.contact.phone}</span>
              </a>

              <button
                type="button"
                onClick={() => handleLinkClick('booking')}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold tracking-wide text-black bg-[#c5a880] hover:bg-[#d8be98] rounded-xl transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                Book Appointment
              </button>

              {/* Mobile menu trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#b5b1a9] hover:text-white hover:bg-[#1a1d22] rounded-lg transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#22262f] bg-[#111317]/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => handleLinkClick('home')}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === 'home'
                    ? 'text-white bg-[#1c1f26] font-semibold'
                    : 'text-[#d4cfc7] hover:bg-[#191c22]'
                }`}
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('services')}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === 'services'
                    ? 'text-white bg-[#1c1f26] font-semibold'
                    : 'text-[#d4cfc7] hover:bg-[#191c22]'
                }`}
              >
                Services Menu
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('booking')}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === 'booking'
                    ? 'text-white bg-[#1c1f26] font-semibold'
                    : 'text-[#d4cfc7] hover:bg-[#191c22]'
                }`}
              >
                Book Appointment
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('home', 'about')}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#d4cfc7] hover:bg-[#191c22] rounded-lg transition-colors"
              >
                About the Salon
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('home', 'gallery')}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#d4cfc7] hover:bg-[#191c22] rounded-lg transition-colors"
              >
                Atmosphere & Craft
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('home', 'contact')}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#d4cfc7] hover:bg-[#191c22] rounded-lg transition-colors"
              >
                Hours & Location
              </button>
            </nav>

            <div className="pt-3 border-t border-[#22262f] space-y-2">
              <button
                type="button"
                onClick={() => handleLinkClick('booking')}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-black bg-[#c5a880] rounded-xl hover:bg-[#d8be98] transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
              <a
                href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s+/g, '')}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-[#9ea3ae] border border-[#272b34] rounded-xl hover:bg-[#181b21] transition-colors font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Call {BUSINESS_INFO.contact.phone}</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Sticky Bottom Booking Bar for Mobile */}
      <aside
        aria-label="Quick appointment reservation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f1114]/95 backdrop-blur-md border-t border-[#222630] px-4 py-2.5 flex items-center justify-between gap-3 max-h-[14vh] shadow-2xl"
      >
        <div className="min-w-0">
          <div className="text-[10px] text-[#c5a880] font-medium uppercase font-mono tracking-wider">
            Open 7 Days · 2 Chairs
          </div>
          <div className="text-xs font-serif text-white truncate">
            No long wait in queue
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('booking')}
          className="shrink-0 px-4 py-2 bg-[#c5a880] hover:bg-[#d8be98] text-black text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          Book Now
        </button>
      </aside>
    </>
  );
};
