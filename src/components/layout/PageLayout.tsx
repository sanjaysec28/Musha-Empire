/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  id: string;
  currentView?: 'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404';
  onNavigate?: (view: 'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404') => void;
  onOpenAppointments?: () => void;
  appointmentsCount?: number;
}

export default function PageLayout({
  children,
  id,
  currentView,
  onNavigate,
  onOpenAppointments,
  appointmentsCount
}: PageLayoutProps) {
  const isPortal = currentView === 'portal';

  return (
    <div id={id} className="min-h-screen flex flex-col bg-brand-bg text-brand-text relative selection:bg-brand-secondary/25 selection:text-brand-primary">
      {/* Background Subtle Luxury Grid overlay */}
      <div id={`${id}-bg-grid`} className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#C5A880_1px,transparent_1px),linear-gradient(to_bottom,#C5A880_1px,transparent_1px)] bg-[size:4rem_4rem] z-0" />
      
      {/* Top Header */}
      {!isPortal && (
        <Navbar
          currentView={currentView}
          onNavigate={onNavigate}
          onOpenAppointments={onOpenAppointments}
          appointmentsCount={appointmentsCount}
        />
      )}

      {/* Main Content Area */}
      <motion.main
        id={`${id}-main-content`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`flex-grow relative z-10 ${isPortal || currentView === 'home' ? 'pt-0' : 'pt-20 sm:pt-24'}`}
      >
        {children}
      </motion.main>

      {/* Luxury Footer */}
      {!isPortal && <Footer onNavigate={onNavigate} />}
    </div>
  );
}
