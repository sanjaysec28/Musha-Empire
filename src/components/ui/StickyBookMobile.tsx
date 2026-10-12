/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Calendar, Sparkles } from 'lucide-react';
import Button from './Button';

export default function StickyBookMobile({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <div
      id="sticky-mobile-booking-bar"
      className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0E0E0E]/95 border-t border-brand-secondary/20 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-35 backdrop-blur-md flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
    >
      {/* Brand micro-label */}
      <div className="flex flex-col select-none">
        <span className="font-serif text-[13px] font-bold tracking-wide text-brand-secondary uppercase leading-none">
          Musha Empire
        </span>
        <span className="text-[8px] tracking-[0.22em] text-brand-text-muted uppercase font-sans mt-1 font-semibold">
          Royal Treatment Suites
        </span>
      </div>

      {/* Booking CTA Button - Perfectly Aligned & Touch-Friendly */}
      <Button
        id="sticky-mobile-book-btn"
        variant="primary"
        size="sm"
        leftIcon={<Calendar className="h-4 w-4" />}
        onClick={onClick}
        className="px-5 py-2.5 h-[44px] min-h-[44px] uppercase tracking-wider text-[11px] font-bold shadow-md active:scale-95 transition-transform cursor-pointer"
      >
        Book Experience
      </Button>
    </div>
  );
}
