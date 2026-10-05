/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Menu, Sparkles, Phone, MapPin, Calendar, User } from 'lucide-react';
import Button from '../ui/Button';
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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-brand-bg/90 backdrop-blur-md shadow-sm border-brand-secondary/20 py-3'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div id="nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="nav-flex" className="flex items-center justify-between">
          
          {/* Logo / Brand */}
          <a id="brand-logo" href="/" className="flex items-center select-none group">
            <MushaEmpireLogo variant="horizontal" />
          </a>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isLinkActive = currentView === link.view;
              return (
                <a
                  key={link.label}
                  id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`font-sans text-xs uppercase tracking-widest font-medium relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-brand-secondary after:transition-transform after:duration-300 transition-colors ${
                    isLinkActive
                      ? 'text-brand-primary after:scale-x-100 font-bold'
                      : 'text-brand-text-muted hover:text-brand-primary after:scale-x-0 hover:after:scale-x-100'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* CTA & Actions */}
          <div id="nav-actions" className="hidden sm:flex items-center space-x-4">
            <a
              id="phone-link"
              href="tel:+123456789"
              className="text-brand-text-muted hover:text-brand-primary p-2 transition-colors"
              title="Call Empire Desk"
            >
              <Phone className="h-4.5 w-4.5 stroke-1.5" />
            </a>
            
            {onOpenAppointments && (
              <button
                id="header-appointments-btn"
                onClick={onOpenAppointments}
                className="relative text-brand-text-muted hover:text-brand-primary p-2 transition-colors cursor-pointer mr-1"
                title="View Scheduled Treatments"
              >
                <Calendar className="h-4.5 w-4.5 stroke-1.5" />
                {appointmentsCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-brand-secondary text-brand-primary text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                    {appointmentsCount}
                  </span>
                )}
              </button>
            )}

            <Button
              id="header-portal-btn"
              variant="outline"
              size="sm"
              leftIcon={<User className="h-3.5 w-3.5" />}
              onClick={() => onNavigate && onNavigate('portal')}
              className="border-brand-secondary/40 text-brand-gold-dark hover:border-brand-secondary"
            >
              Portal
            </Button>

            <Button
              id="header-booking-btn"
              variant="primary"
              size="sm"
              leftIcon={<Calendar className="h-3.5 w-3.5" />}
              onClick={triggerBookingAction}
            >
              Reserve Experience
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div id="mobile-menu-trigger" className="flex items-center space-x-2 lg:hidden">
            {onOpenAppointments && (
              <button
                id="mobile-appointments-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAppointments();
                }}
                className="text-brand-secondary hover:text-brand-primary p-2 border border-brand-accent rounded-none bg-brand-surface relative"
                aria-label="View Scheduled Treatments"
              >
                <Calendar className="h-4.5 w-4.5" />
                {appointmentsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-brand-secondary text-brand-primary text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                    {appointmentsCount}
                  </span>
                )}
              </button>
            )}

            <button
              id="header-booking-mobile-icon"
              onClick={triggerBookingAction}
              className="sm:hidden text-brand-secondary hover:text-brand-primary p-2 border border-brand-accent rounded-none bg-brand-surface"
              aria-label="Book appointment"
            >
              <Calendar className="h-4.5 w-4.5" />
            </button>
            <button
              id="mobile-drawer-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-brand-primary hover:text-brand-secondary p-2.5 border border-brand-accent rounded-none bg-brand-surface cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="h-5 w-5" />
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
          <div id="drawer-footer-container" className="pt-4 flex flex-col gap-4">
            <Button
              id="drawer-book-btn"
              variant="secondary"
              size="md"
              leftIcon={<Calendar className="h-4 w-4" />}
              className="w-full"
              onClick={triggerBookingAction}
            >
              Book Reservation
            </Button>
            <div id="drawer-contact-details" className="text-center font-sans text-xs text-brand-text-muted mt-2 space-y-1">
              <p className="flex items-center justify-center gap-1.5 font-medium text-brand-primary">
                <MapPin className="h-3.5 w-3.5 text-brand-secondary" /> Mayfair Boulevard, Suite 500
              </p>
              <p>Mondays - Sundays: 9:00 AM - 9:00 PM</p>
            </div>
          </div>
        }
      >
        <nav id="drawer-links-nav" className="flex flex-col space-y-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              id={`drawer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link)}
              className="font-serif text-xl font-medium text-brand-primary hover:text-brand-secondary transition-colors py-1 block border-b border-brand-surface-muted"
            >
              {link.label}
            </a>
          ))}
          
          <div id="drawer-highlight-item" className="p-4 bg-brand-surface-muted/60 border border-brand-accent mt-8">
            <p className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary flex items-center gap-1 mb-1">
              <Sparkles className="h-3 w-3" /> Member Privilege
            </p>
            <p className="font-serif text-sm text-brand-primary font-medium mb-2">
              Unlock Royal Club membership perks and get bespoke complimentary hair spa treats.
            </p>
            <a
              id="drawer-membership-link"
              href="#royal-club"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-gold-dark hover:underline underline-offset-4"
            >
              Learn More &rarr;
            </a>
          </div>
        </nav>
      </Drawer>
    </header>
  );
}
