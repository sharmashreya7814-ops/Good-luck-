import React from 'react';
import { Hero } from '../components/Hero';
import { TrustBar } from '../components/TrustBar';
import { Services } from '../components/Services';
import { Experience } from '../components/Experience';
import { MassageSection } from '../components/MassageSection';
import { About } from '../components/About';
import { Gallery } from '../components/Gallery';
import { BookingCTA } from '../components/BookingCTA';
import { Testimonials } from '../components/Testimonials';
import { Contact } from '../components/Contact';

interface HomePageProps {
  onOpenBooking: (serviceId?: string) => void;
  onNavigateServices: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenBooking,
  onNavigateServices,
}) => {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero
        onOpenBooking={() => onOpenBooking()}
        onExploreServices={onNavigateServices}
      />

      {/* 2. Trust & Schedule Bar */}
      <TrustBar />

      {/* 3. Services Showcase with category filter */}
      <Services
        onBookService={(serviceId) => onOpenBooking(serviceId)}
        onViewAllServices={onNavigateServices}
      />

      {/* 4. Experience & Service Approach */}
      <Experience onOpenBooking={() => onOpenBooking()} />

      {/* 5. Head & Body Massage Section */}
      <MassageSection onBookService={(serviceId) => onOpenBooking(serviceId)} />

      {/* 6. About the Salon & Founder */}
      <About />

      {/* 7. Atmosphere & Craft Gallery */}
      <Gallery />

      {/* 8. Booking CTA Banner */}
      <BookingCTA onOpenBooking={() => onOpenBooking()} />

      {/* 9. Patron Reflections / Reviews */}
      <Testimonials />

      {/* 10. Hours & Location / Contact */}
      <Contact onOpenBooking={() => onOpenBooking()} />
    </>
  );
};
