import React, { useState, useEffect } from 'react';
import { Navbar, AppPage } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { BookingPage } from './pages/BookingPage';
import { Footer } from './components/Footer';
import { BookingModal } from './components/booking/BookingModal';
import { AdminLayout, AdminTab } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminImagesPage } from './pages/admin/AdminImagesPage';
import { apiClient } from './api/client';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState<boolean>(false);

  // Sync admin authentication state
  useEffect(() => {
    setIsAdminLoggedIn(Boolean(apiClient.getAdminToken()));
  }, []);

  // Parse URL hash to determine active view
  const parseRouteFromHash = () => {
    const hash = window.location.hash.toLowerCase();

    // Admin Routes
    if (hash.startsWith('#/admin') || hash.startsWith('#admin')) {
      setIsAdminMode(true);
      const clean = hash.replace(/^#\/?admin\/?/, '');
      if (clean.startsWith('appointments')) {
        setAdminTab('appointments');
      } else if (clean.startsWith('services')) {
        setAdminTab('services');
      } else if (clean.startsWith('images')) {
        setAdminTab('images');
      } else if (clean.startsWith('settings')) {
        setAdminTab('settings');
      } else {
        setAdminTab('dashboard');
      }
      return;
    }

    // Public Customer Routes
    setIsAdminMode(false);
    if (hash.startsWith('#/services')) {
      setCurrentPage('services');
      return;
    }
    if (hash.startsWith('#/booking')) {
      setCurrentPage('booking');
      return;
    }
    if (hash.startsWith('#')) {
      const cleanHash = hash.replace('#', '').replace('/', '');
      if (['services', 'experience', 'massage', 'about', 'gallery', 'contact'].includes(cleanHash)) {
        setCurrentPage('home');
        setTimeout(() => {
          const el = document.getElementById(cleanHash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 80);
        return;
      }
    }
    setCurrentPage('home');
  };

  useEffect(() => {
    parseRouteFromHash();
    window.addEventListener('hashchange', parseRouteFromHash);
    return () => window.removeEventListener('hashchange', parseRouteFromHash);
  }, []);

  const handleNavigate = (page: AppPage, anchor?: string) => {
    setIsAdminMode(false);
    setCurrentPage(page);

    if (page === 'home') {
      if (anchor) {
        window.location.hash = `#${anchor}`;
        setTimeout(() => {
          const el = document.getElementById(anchor);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 60);
      } else {
        window.location.hash = '#/';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (page === 'services') {
      window.location.hash = '#/services';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'booking') {
      window.location.hash = '#/booking';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBookService = (serviceId?: string) => {
    if (serviceId) {
      setPreselectedServiceId(serviceId);
    }
    handleNavigate('booking');
  };

  const handleAdminNavigateTab = (tab: AdminTab) => {
    setAdminTab(tab);
    window.location.hash = `#/admin/${tab}`;
  };

  const handleAdminLogout = () => {
    apiClient.setAdminToken(null);
    setIsAdminLoggedIn(false);
    window.location.hash = '#/admin/login';
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    window.location.hash = '#/admin/dashboard';
  };

  // If in Admin Mode, render the dedicated administrative control deck
  if (isAdminMode) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLoginPage
          onSuccess={handleAdminLoginSuccess}
          onBackToSite={() => handleNavigate('home')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onNavigateTab={handleAdminNavigateTab}
        onNavigateClient={() => handleNavigate('home')}
        onLogout={handleAdminLogout}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboardPage onNavigateTab={handleAdminNavigateTab} />
        )}
        {adminTab === 'appointments' && <AdminAppointmentsPage />}
        {adminTab === 'services' && <AdminServicesPage />}
        {adminTab === 'images' && <AdminImagesPage />}
        {adminTab === 'settings' && <AdminSettingsPage />}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#e6e4df] flex flex-col font-sans selection:bg-[#c5a880]/30 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenQuickBooking={handleBookService}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onOpenBooking={handleBookService}
            onNavigateServices={() => handleNavigate('services')}
          />
        )}

        {currentPage === 'services' && (
          <ServicesPage
            onBookService={handleBookService}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'booking' && (
          <BookingPage
            preselectedServiceId={preselectedServiceId}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateServices={() => handleNavigate('services')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleBookService()}
        onNavigatePage={(page) => handleNavigate(page)}
      />

      {/* Quick Booking Modal */}
      <BookingModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        preselectedServiceId={preselectedServiceId}
      />
    </div>
  );
}
