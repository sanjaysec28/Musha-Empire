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
      className="lg:hidden fixed bottom-0 inset-x-0 bg-[#121212]/95 border-t border-brand-secondary/15 px-4 py-3 z-35 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xl"
    >
      {/* Brand micro-label */}
      <div className="flex flex-col select-none">
        <span className="font-serif text-xs font-semibold tracking-wide text-brand-secondary uppercase leading-none">
          Musha Empire
        </span>
        <span className="text-[8px] tracking-widest text-brand-text-muted uppercase font-sans mt-0.5 font-medium">
          Royal Treatment Suites
        </span>
      </div>

      {/* Booking CTA Button */}
      <Button
        id="sticky-mobile-book-btn"
        variant="secondary"
        size="sm"
        leftIcon={<Calendar className="h-4 w-4" />}
        onClick={onClick}
        className="px-5 py-2.5 uppercase tracking-widest text-[9px] font-bold"
      >
        Book Experience
      </Button>
    </div>
  );
}
