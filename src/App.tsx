/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { isFirebaseConfigured } from './lib/firebase';
import { bookingsRepository } from './lib/firestoreService';
import { callCancelBooking } from './lib/firebaseFunctions';
import { EXTENDED_SERVICES_DATA } from './data/servicesExtendedData';
import { STYLISTS_DATA } from './data/salonData';

// Layout and Dev tools
import PageLayout from './components/layout/PageLayout';
import Toast from './components/ui/Toast';
import { ToastMessage } from './types';

// Homepage Sections
import Hero from './components/home/Hero';
import TrustIndicators from './components/home/TrustIndicators';
import Services from './components/home/Services';
import WhyChooseUs from './components/home/WhyChooseUs';
import Stylists from './components/home/Stylists';
import Membership from './components/home/Membership';
import Gallery from './components/home/Gallery';
import Testimonials from './components/home/Testimonials';
import FAQ from './components/home/FAQ';
import Booking from './components/home/Booking';

// New Sub-pages & Core Interactive Components
import ServicesPage from './components/services/ServicesPage';
import ServiceDetailPage from './components/services/ServiceDetailPage';
import BookingFlow, { BookingRecord } from './components/booking/BookingFlow';
import AppointmentsDrawer from './components/booking/AppointmentsDrawer';
import CustomerPortal from './components/dashboard/CustomerPortal';

// Additional Public Pages
import AboutPage from './components/pages/AboutPage';
import GalleryPage from './components/pages/GalleryPage';
import OffersPage from './components/pages/OffersPage';
import MembershipPage from './components/pages/MembershipPage';
import ContactPage from './components/pages/ContactPage';
import FAQPage from './components/pages/FAQPage';
import PrivacyPage from './components/pages/PrivacyPage';
import TermsPage from './components/pages/TermsPage';
import RefundPage from './components/pages/RefundPage';
import NotFoundPage from './components/pages/NotFoundPage';

// Global Utility Components
import CookieConsent from './components/ui/CookieConsent';
import ScrollToTop from './components/ui/ScrollToTop';
import PageLoader from './components/ui/PageLoader';
import StickyBookMobile from './components/ui/StickyBookMobile';
import NewsletterSection from './components/ui/NewsletterSection';

export default function App() {
  // Navigation & Page state
  const [currentView, setCurrentView] = useState<'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404'>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedRecipientCategory, setSelectedRecipientCategory] = useState<string | null>(null);

  // Persistence - Recently Viewed Services
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('musha_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { user, loading } = useAuth();

  // Persistence - Appointments list
  const [appointments, setAppointments] = useState<BookingRecord[]>([]);

  // Toggle for bookings drawer
  const [isAppointmentsDrawerOpen, setIsAppointmentsDrawerOpen] = useState(false);

  // Toast notifications manager
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize Recently Viewed with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('musha_recently_viewed', JSON.stringify(recentlyViewedIds));
    } catch (e) {
      console.error('Failed to sync recently viewed', e);
    }
  }, [recentlyViewedIds]);

  // Load appointments from Firestore / Supabase when user changes
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setAppointments([]);
      return;
    }

    let isMounted = true;

    const fetchUserBookings = async () => {
      // 1. Try Firestore first if configured
      if (isFirebaseConfigured) {
        try {
          const fbBookings = await bookingsRepository.getMyBookings(user.id);
          if (isMounted) {
            if (fbBookings && fbBookings.length > 0) {
              const mapped: BookingRecord[] = fbBookings.map((b) => {
                const localService = EXTENDED_SERVICES_DATA.find(s => s.id === b.service_id || s.name.toLowerCase() === (b.service_name || '').toLowerCase());
                const durationMin = b.duration_minutes || localService?.durationValue || 60;
                const priceVal = b.price || localService?.priceValue || 95;

                return {
                  id: b.id,
                  service: {
                    id: b.service_id || 'service-1',
                    name: b.service_name || localService?.name || 'Sanctuary Ritual',
                    category: localService?.category || 'Exclusive',
                    price: `$${priceVal}`,
                    priceValue: priceVal,
                    duration: `${durationMin} Mins`,
                    durationValue: durationMin,
                    shortDescription: localService?.shortDescription || '',
                    longDescription: localService?.longDescription || '',
                    image: localService?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
                    benefits: localService?.benefits || [],
                    includedServices: localService?.includedServices || [],
                    popular: localService?.popular || false,
                    rating: localService?.rating || 4.9,
                    reviewsCount: localService?.reviewsCount || 12,
                    faqs: localService?.faqs || []
                  },
                  gender: b.gender,
                  date: b.booking_date,
                  timeSlot: b.start_time,
                  endTime: b.end_time,
                  totalAmount: b.price,
                  discountApplied: b.discountApplied || 0,
                  promoApplied: b.promoCodeApplied || '',
                  createdAt: b.created_at || new Date().toLocaleDateString(),
                  ticketCode: b.ticket_code,
                  customerName: user.displayName || 'Valued Patron',
                  stylist: null
                };
              });
              setAppointments(mapped);
            } else {
              setAppointments([]);
            }
            return;
          }
        } catch (fbErr) {
          console.warn('Notice reading user bookings from Firestore:', fbErr);
        }
      }

      if (!isSupabaseConfigured) {
        try {
          const saved = localStorage.getItem(`musha_appointments_${user.id}`);
          if (saved && isMounted) {
            setAppointments(JSON.parse(saved));
            return;
          }
        } catch (e) {
          console.warn('Local appointments restore error:', e);
        }
        if (isMounted) setAppointments([]);
        return;
      }

      try {
        const { data: dbBookings, error: bErr } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (bErr) throw bErr;

        if (!dbBookings || dbBookings.length === 0) {
          if (isMounted) setAppointments([]);
          return;
        }

        const { data: dbServices } = await supabase.from('services').select('*');
        const { data: dbStaff } = await supabase.from('staff').select('*');
        const { data: dbBookingServices } = await supabase.from('booking_services').select('*');

        const servicesList = dbServices || [];
        const staffList = dbStaff || [];
        const bookingServicesList = dbBookingServices || [];

        const mapped: BookingRecord[] = dbBookings.map((b) => {
          // Find associated service in booking_services
          const bServices = bookingServicesList.filter((bs) => bs.booking_id === b.id);
          const firstServiceId = bServices[0]?.service_id;

          const service = servicesList.find((s) => s.id === firstServiceId);
          const localService = EXTENDED_SERVICES_DATA.find(s => s.id === firstServiceId || s.name.toLowerCase() === service?.name?.toLowerCase());

          // Find stylist
          const stylist = staffList.find((s) => s.id === b.staff_id);
          const localStylist = STYLISTS_DATA.find(s => s.id === b.staff_id || s.name.toLowerCase() === stylist?.full_name?.toLowerCase());

          const mappedService = {
            id: firstServiceId || 'hair-cut-1',
            name: service?.name || localService?.name || 'Empire Hair & Scalp Nourish',
            category: localService?.category || 'Exclusive',
            price: service?.price ? `$${service.price}` : localService?.price || '$95',
            priceValue: service?.price || localService?.priceValue || 95,
            duration: service?.duration_minutes ? `${service.duration_minutes} Mins` : localService?.duration || '60 Mins',
            durationValue: service?.duration_minutes || localService?.durationValue || 60,
            shortDescription: service?.description || localService?.shortDescription || '',
            longDescription: service?.description || localService?.longDescription || '',
            image: service?.image_url || localService?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
            benefits: localService?.benefits || [],
            includedServices: localService?.includedServices || [],
            popular: localService?.popular || false,
            rating: localService?.rating || 4.9,
            reviewsCount: localService?.reviewsCount || 12,
            faqs: localService?.faqs || []
          };

          const mappedStylist = {
            id: b.staff_id || 'stylist-concierge',
            name: stylist?.full_name || 'Salon Concierge',
            role: stylist?.role === 'stylist' ? 'Master Stylist' : (stylist?.role || 'Master Artisan'),
            experience: 'Certified Artisan',
            specialty: stylist?.specialty || 'Luxury Artistry',
            bio: stylist?.bio || 'Certified salon artisan.',
            image: stylist?.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            instagram: '@musha_empire'
          };

          return {
            id: b.id,
            service: mappedService,
            stylist: mappedStylist,
            gender: b.gender || 'Other',
            date: b.booking_date,
            timeSlot: b.start_time,
            totalAmount: b.total_amount,
            discountApplied: 0,
            promoApplied: '',
            createdAt: new Date(b.created_at || Date.now()).toLocaleDateString()
          };
        });

        if (isMounted) {
          setAppointments(mapped);
        }
      } catch (err) {
        console.warn('Error fetching Supabase appointments in App.tsx:', err);
      }
    };

    fetchUserBookings();

    // Poll every 5 seconds to match portal and dashboard
    const interval = setInterval(fetchUserBookings, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, loading]);

  // Core Toast Dispatcher
  const triggerToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastMessage = { id, type, title, description, duration: 4500 };
    setToasts((prev) => [...prev, newToast]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // View service detail and add to recently viewed list
  const handleSelectService = (id: string) => {
    setSelectedServiceId(id);
    
    // Maintain uniqueness and a max size of 4
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [id, ...filtered].slice(0, 4);
    });

    setCurrentView('service-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initiate direct booking flow
  const handleBookService = (id: string) => {
    setSelectedServiceId(id);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Callback on successful reservation complete
  const handleBookingComplete = (record: BookingRecord) => {
    setAppointments((prev) => {
      const updated = [record, ...prev];
      if (user) {
        try {
          localStorage.setItem(`musha_appointments_${user.id}`, JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage error saving booking:', e);
        }
      }
      return updated;
    });

    triggerToast(
      'success',
      'Reservation Confirmed!',
      `Your session ${record.id} with ${record.stylist.name} is scheduled for ${record.timeSlot}.`
    );
  };

  // Cancel reservation slot via trusted Cloud Function
  const handleCancelAppointment = async (id: string) => {
    try {
      if (isFirebaseConfigured && user) {
        try {
          await callCancelBooking({ bookingId: id }, user.id);
        } catch (err: any) {
          console.warn('Notice cancelling via Cloud Function in App.tsx:', err);
        }
      }

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', id);

        if (error) throw error;
      }

      setAppointments((prev) => {
        const updated = prev.filter((app) => app.id !== id);
        if (user) {
          try {
            localStorage.setItem(`musha_appointments_${user.id}`, JSON.stringify(updated));
          } catch (e) {
            console.warn('LocalStorage error updating cancelled booking:', e);
          }
        }
        return updated;
      });

      triggerToast(
        'warning',
        'Appointment Cancelled',
        'Your reserved slot has been released back to the schedule.'
      );
    } catch (e: any) {
      console.warn('Notice cancelling appointment:', e);
      triggerToast('error', 'Cancellation Failed', e.message || 'Could not cancel booking in database.');
    }
  };

  // Custom Navigation dispatcher
  const handleNavigate = (view: 'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout
      id="musha-empire-app"
      currentView={currentView}
      onNavigate={handleNavigate}
      onOpenAppointments={() => setIsAppointmentsDrawerOpen(true)}
      appointmentsCount={appointments.length}
    >
      {/* Toast Render Node for custom actions */}
      <Toast id="global-toast-container" messages={toasts} onRemove={removeToast} />

      {/* 
        ========================================================================
        CLIENT-SIDE ROUTED VIEWS
        ========================================================================
      */}
      {currentView === 'home' && (
        <div id="homepage-scroller" className="space-y-0">
          {/* Hero Section with callbacks */}
          <Hero
            onBookClick={() => handleNavigate('booking')}
            onExploreClick={() => handleNavigate('services')}
          />

          {/* Trust Indicators */}
          <TrustIndicators />

          {/* Featured Services Section */}
          <Services
            onBookService={handleBookService}
            onExploreAll={() => handleNavigate('services')}
          />

          {/* Why Choose Musha Empire */}
          <WhyChooseUs />

          {/* Meet Our Stylists */}
          <Stylists />

          {/* Membership Preview */}
          <Membership />

          {/* Gallery Preview */}
          <Gallery onViewAll={() => handleNavigate('gallery')} />

          {/* Testimonials */}
          <Testimonials />

          {/* FAQ (Animated Accordion) */}
          <FAQ />

          {/* Final CTA Banner & Appointment Form */}
          <Booking onAddToast={triggerToast} />
        </div>
      )}

      {currentView === 'services' && (
        <ServicesPage
          onSelectService={handleSelectService}
          onBookService={handleBookService}
          recentlyViewedIds={recentlyViewedIds}
          onNavigate={handleNavigate}
          selectedRecipientCategory={selectedRecipientCategory}
          onSelectRecipientCategory={setSelectedRecipientCategory}
        />
      )}

      {currentView === 'service-detail' && selectedServiceId && (
        <ServiceDetailPage
          serviceId={selectedServiceId}
          onBack={() => handleNavigate('services')}
          onBook={handleBookService}
          onSelectService={handleSelectService}
        />
      )}

      {currentView === 'booking' && (
        <BookingFlow
          initialServiceId={selectedServiceId}
          initialRecipientCategory={selectedRecipientCategory}
          onBookingComplete={handleBookingComplete}
          onNavigateHome={() => handleNavigate('home')}
          onViewAppointments={() => {
            handleNavigate('portal');
          }}
          triggerToast={triggerToast}
        />
      )}

      {currentView === 'portal' && (
        <CustomerPortal
          id="main-customer-portal"
          triggerToast={triggerToast}
          onNavigateHome={() => handleNavigate('home')}
        />
      )}

      {currentView === 'about' && (
        <AboutPage
          onBookClick={() => handleNavigate('booking')}
          onNavigateHome={() => handleNavigate('home')}
        />
      )}

      {currentView === 'gallery' && (
        <GalleryPage onBookClick={() => handleNavigate('booking')} />
      )}

      {currentView === 'offers' && (
        <OffersPage
          onBookClick={(serviceId) => {
            if (serviceId) {
              setSelectedServiceId(serviceId);
            }
            handleNavigate('booking');
          }}
          triggerToast={triggerToast}
        />
      )}

      {currentView === 'membership' && (
        <MembershipPage
          onSubscribe={(planName, billing) => {
            triggerToast(
              'success',
              'Membership Activated!',
              `Welcome to ${planName}. Your ${billing} subscription is active.`
            );
            handleNavigate('portal');
          }}
        />
      )}

      {currentView === 'contact' && (
        <ContactPage triggerToast={triggerToast} />
      )}

      {currentView === 'faq' && (
        <FAQPage
          onBookClick={() => handleNavigate('booking')}
          onContactClick={() => handleNavigate('contact')}
        />
      )}

      {currentView === 'privacy' && (
        <PrivacyPage />
      )}

      {currentView === 'terms' && (
        <TermsPage />
      )}

      {currentView === 'refund' && (
        <RefundPage />
      )}

      {currentView === '404' && (
        <NotFoundPage onNavigateHome={() => handleNavigate('home')} />
      )}

      {/* Embedded Newsletter banner on non-portal / non-booking page views */}
      {currentView !== 'portal' && currentView !== 'booking' && (
        <NewsletterSection triggerToast={triggerToast} />
      )}

      {/* 
        ========================================================================
        GLOBAL PERSISTENT DRAWERS & CONTROLS
        ========================================================================
      */}

      {/* Active Scheduled Appointments Drawer */}
      <AppointmentsDrawer
        isOpen={isAppointmentsDrawerOpen}
        onClose={() => setIsAppointmentsDrawerOpen(false)}
        appointments={appointments}
        onCancelAppointment={handleCancelAppointment}
      />

      {/* 
        ========================================================================
        GLOBAL OVERLAY UTILITIES (Cookie consent, scroll top, page loading, CTAs)
        ========================================================================
      */}
      <PageLoader />
      <CookieConsent onPrivacyClick={() => handleNavigate('privacy')} />
      <ScrollToTop />
      {currentView !== 'booking' && currentView !== 'portal' && (
        <StickyBookMobile onClick={() => handleNavigate('booking')} />
      )}
    </PageLayout>
  );
}
