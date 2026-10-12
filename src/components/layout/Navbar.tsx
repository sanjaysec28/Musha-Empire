/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Menu, Sparkles, Phone, MapPin, Calendar } from 'lucide-react';
import { settingsRepository } from '../../lib/firestoreService';
import { FirestoreSalonSettings } from '../../types/firestore';
import { Drawer } from '../ui/Overlay';
import MushaEmpireLogo from '../ui/MushaEmpireLogo';

export interface NavbarProps {
  currentView?: 'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404';
  onNavigate?: (view: 'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404') => void;
  onOpenAppointments?: () => void;
  appointmentsCount?: number;
}

export default function Navbar({
  currentView = 'home',
  onNavigate,
  onOpenAppointments,
  appointmentsCount = 0
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsRepository.getSalonSettings().then((s) => {
      if (isMounted && s) setSalonSettings(s);
    }).catch(err => {
      console.warn('Notice reading salon settings in Navbar:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const addressDisplay = typeof salonSettings?.address === 'object'
    ? `${salonSettings.address.line1}${salonSettings.address.line2 ? `, ${salonSettings.address.line2}` : ''}`
    : (salonSettings?.address || 'Address unavailable');

  const hoursList = (Array.isArray(salonSettings?.opening_hours) && salonSettings.opening_hours.length > 0)
    ? salonSettings.opening_hours
    : (Array.isArray(salonSettings?.openingHours) && salonSettings.openingHours.length > 0)
    ? salonSettings.openingHours
    : null;

  const hoursDisplay = hoursList && hoursList.length > 0
    ? `${hoursList[0].day}: ${hoursList[0].isClosed ? 'Closed' : `${hoursList[0].open} - ${hoursList[0].close}`}`
    : 'Hours unavailable';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero', view: 'home' as const, hash: '' },
    { label: 'About Us', href: '#about', view: 'about' as const, hash: '' },
    { label: 'Services', href: '#services', view: 'services' as const, hash: '' },
    { label: 'Gallery', href: '#gallery', view: 'gallery' as const, hash: '' },
    { label: 'Offers', href: '#offers', view: 'offers' as const, hash: '' },
    { label: 'Membership', href: '#membership', view: 'membership' as const, hash: '' },
    { label: 'Contact', href: '#contact', view: 'contact' as const, hash: '' },
    { label: 'FAQ', href: '#faq', view: 'faq' as const, hash: '' },
    { label: 'Portal', href: '#portal', view: 'portal' as const, hash: '' },
  ];

  const handleLinkClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
    // If routing is supported
    if (onNavigate) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      
      if (link.view === 'home') {
        onNavigate('home');
        if (link.hash) {
          setTimeout(() => {
            const el = document.getElementById(link.hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        onNavigate(link.view);
      }
    } else {
      // Standard anchor scrolling if routing is not connected
      if (link.view === 'services') {
        const el = document.getElementById('services');
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const triggerBookingAction = () => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate('booking');
    } else {
      const el = document.getElementById('booking');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0B0B0B]/95 backdrop-blur-md border-b border-brand-secondary/20 shadow-[0_4px_24px_rgba(0,0,0,0.6)] py-2.5 sm:py-3'
          : 'bg-[#0B0B0B]/85 backdrop-blur-md border-b border-white/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.4)] py-3 sm:py-3.5'
      }`}
    >
      <div id="nav-container" className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div id="nav-flex" className="flex items-center justify-between gap-3 xl:gap-4">
          
          {/* Logo / Brand - Guaranteed No Distortion or Squeeze */}
          <a
            id="brand-logo"
            href="/"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center select-none group shrink-0 min-w-0"
          >
            <MushaEmpireLogo variant="horizontal" />
          </a>

          {/* Desktop Navigation Links - Soft-Rounded Individual Boxes */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-2">
            {navLinks.map((link) => {
              const isLinkActive = currentView === link.view;
              return (
                <a
                  key={link.label}
                  id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`font-heading text-[11px] xl:text-[11.5px] 2xl:text-xs uppercase tracking-wider px-2.5 xl:px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap relative select-none ${
                    isLinkActive
                      ? 'bg-[#1C1C1C] border border-brand-secondary/40 text-white font-bold shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                      : 'text-neutral-300 hover:text-brand-secondary hover:bg-white/[0.06] border border-transparent hover:border-brand-secondary/20 font-semibold'
                  }`}
                >
                  <span>{link.label}</span>
                  {isLinkActive && (
                    <span className="absolute bottom-1 left-2.5 right-2.5 h-[1.5px] bg-brand-secondary rounded-full shadow-[0_0_6px_rgba(197,168,128,0.6)]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA & Actions (Desktop & Tablet) */}
          <div id="nav-actions" className="hidden sm:flex items-center space-x-1.5 xl:space-x-2 shrink-0">
            <a
              id="phone-link"
              href={salonSettings?.phone ? `tel:${salonSettings.phone}` : '#contact'}
              className="text-neutral-300 hover:text-brand-secondary p-2 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-brand-secondary/20 transition-all cursor-pointer"
              title={salonSettings?.phone ? `Call Empire Desk: ${salonSettings.phone}` : 'Contact Empire Desk'}
            >
              <Phone className="h-4 w-4 stroke-1.5" />
            </a>
            
            {onOpenAppointments && (
              <button
                id="header-appointments-btn"
                onClick={onOpenAppointments}
                className="relative text-neutral-300 hover:text-brand-secondary p-2 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-brand-secondary/20 transition-all cursor-pointer"
                title="View Scheduled Treatments"
              >
                <Calendar className="h-4 w-4 stroke-1.5" />
                {appointmentsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-brand-secondary text-[#0A0A0A] text-[8px] font-bold rounded-full flex items-center justify-center border border-[#0A0A0A]">
                    {appointmentsCount}
                  </span>
                )}
              </button>
            )}

            {/* Primary Reservation CTA - Rounded Champagne-Gold Button with Dark Text */}
            <button
              id="header-booking-btn"
              onClick={triggerBookingAction}
              className="font-heading font-bold text-[11px] xl:text-xs uppercase tracking-wider text-[#0A0A0A] bg-brand-secondary hover:bg-[#D4BE9B] px-3.5 xl:px-5 py-2 xl:py-2.5 rounded-full transition-all duration-300 shadow-[0_2px_14px_rgba(197,168,128,0.25)] hover:shadow-[0_4px_20px_rgba(197,168,128,0.4)] hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-1.5 xl:gap-2 shrink-0 cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-[#0A0A0A] stroke-[2.2]" />
              <span>Reserve Experience</span>
            </button>
          </div>

          {/* Mobile Navigation Controls (Compact, Perfectly Sized, Zero Overlap) */}
          <div id="mobile-menu-trigger" className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
            {onOpenAppointments && (
              <button
                id="mobile-appointments-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAppointments();
                }}
                className="w-10 h-10 rounded-lg text-brand-secondary hover:text-brand-primary active:scale-95 border border-white/[0.1] hover:border-brand-secondary/35 bg-[#141414] flex items-center justify-center relative transition-all"
                aria-label="View Scheduled Treatments"
                title="View Scheduled Treatments"
              >
                <Calendar className="h-4.5 w-4.5 stroke-[1.75]" />
                {appointmentsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-brand-secondary text-brand-bg text-[9px] font-bold rounded-full flex items-center justify-center border border-brand-bg shadow-sm">
                    {appointmentsCount}
                  </span>
                )}
              </button>
            )}

            <button
              id="header-booking-mobile-icon"
              onClick={triggerBookingAction}
              className="w-10 h-10 rounded-lg text-brand-secondary hover:text-brand-primary active:scale-95 border border-white/[0.1] hover:border-brand-secondary/35 bg-[#141414] flex items-center justify-center transition-all"
              aria-label="Book Experience"
              title="Book Experience"
            >
              <Sparkles className="h-4.5 w-4.5 stroke-[1.75]" />
            </button>

            <button
              id="mobile-drawer-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 rounded-lg text-brand-primary hover:text-brand-secondary active:scale-95 border border-white/[0.1] hover:border-brand-secondary/35 bg-[#141414] flex items-center justify-center cursor-pointer transition-all"
              aria-label="Toggle Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5 stroke-[1.75]" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      <Drawer
        id="mobile-nav-drawer"
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Menu"
        position="right"
        footer={
          <div id="drawer-footer-container" className="pt-3 flex flex-col gap-4">
            <button
              id="drawer-book-btn"
              onClick={triggerBookingAction}
              className="w-full font-heading font-bold text-xs uppercase tracking-wider text-[#0A0A0A] bg-brand-secondary hover:bg-[#D4BE9B] py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_2px_14px_rgba(197,168,128,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Calendar className="h-4 w-4 stroke-[2.2]" />
              <span>Reserve Experience</span>
            </button>
            <div id="drawer-contact-details" className="text-center font-sans text-xs text-brand-text-muted mt-1 space-y-1">
              <p className="flex items-center justify-center gap-1.5 font-medium text-brand-primary">
                <MapPin className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {addressDisplay}
              </p>
              <p>{hoursDisplay}</p>
            </div>
          </div>
        }
      >
        <nav id="drawer-links-nav" className="flex flex-col space-y-2">
          {navLinks.map((link) => {
            const isLinkActive = currentView === link.view;
            return (
              <a
                key={link.label}
                id={`drawer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`w-full px-4 py-3 rounded-xl font-heading text-sm uppercase tracking-wider flex items-center justify-between transition-all ${
                  isLinkActive
                    ? 'bg-[#1C1C1C] border border-brand-secondary/40 text-brand-secondary font-bold shadow-sm'
                    : 'bg-[#141414] border border-white/[0.06] hover:border-brand-secondary/30 hover:bg-[#1A1A1A] text-brand-primary hover:text-brand-secondary font-semibold'
                }`}
              >
                <span>{link.label}</span>
                {isLinkActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary shadow-[0_0_6px_rgba(197,168,128,0.8)]" />
                ) : (
                  <span className="text-neutral-500 text-xs">&rarr;</span>
                )}
              </a>
            );
          })}
          
          <div id="drawer-highlight-item" className="p-4 rounded-xl bg-[#141414] border border-brand-secondary/20 mt-4">
            <p className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary flex items-center gap-1 mb-1">
              <Sparkles className="h-3 w-3" /> Member Privilege
            </p>
            <p className="font-sans text-xs text-brand-primary font-medium mb-2 leading-relaxed">
              Unlock Royal Club membership perks and receive bespoke complimentary treatments.
            </p>
            <a
              id="drawer-membership-link"
              href="#membership"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                if (onNavigate) onNavigate('membership');
              }}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-secondary hover:underline underline-offset-4 inline-flex items-center gap-1 cursor-pointer"
            >
              Learn More &rarr;
            </a>
          </div>
        </nav>
      </Drawer>
    </header>
  );
}
