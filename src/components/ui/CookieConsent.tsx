/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';
import Button from './Button';

export default function CookieConsent({
  onPrivacyClick,
}: {
  onPrivacyClick: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('musha_cookie_consent');
      if (!consent) {
        // Delayed show for premium feel
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('musha_cookie_consent', 'accepted');
    } catch (e) {
      console.error('Failed to save consent', e);
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="cookie-consent-bar"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-6 right-6 md:right-auto md:max-w-md z-45 bg-[#121212]/95 text-brand-text p-5 sm:p-6 border border-brand-secondary/20 shadow-2xl backdrop-blur-md flex flex-col gap-4 rounded-none"
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 border border-brand-secondary/20 text-brand-secondary bg-[#0A0A0A] rounded-none shrink-0">
                <Cookie className="h-4.5 w-4.5" />
              </span>
              <h4 className="font-serif text-sm text-brand-primary font-medium tracking-wide uppercase">
                Privacy & Sanctuary Cookie Guard
              </h4>
            </div>
            <button
              id="close-cookie-consent"
              onClick={() => setIsVisible(false)}
              className="text-brand-text-muted hover:text-brand-secondary p-1 transition-colors cursor-pointer"
              aria-label="Dismiss Privacy Cookie Consent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="font-sans text-[11px] text-brand-text-muted leading-relaxed font-normal">
            We employ client-side caching (local storage cookies) to optimize your booking experience and customize your design tokens. No personal profiling or external database telemetry tracking is executed.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 border-t border-brand-secondary/15 pt-3 mt-1 text-[10px] font-sans">
            <button
              id="cookie-read-policy-btn"
              onClick={() => {
                onPrivacyClick();
                setIsVisible(false);
              }}
              className="text-brand-secondary hover:text-brand-primary transition-colors hover:underline underline-offset-4 font-semibold uppercase tracking-wider cursor-pointer"
            >
              Privacy Policy &rarr;
            </button>
            <Button
              id="cookie-accept-btn"
              variant="secondary"
              size="sm"
              className="px-4 py-2 uppercase text-[10px] h-auto font-bold tracking-widest"
              onClick={handleAccept}
            >
              Accept Caching
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
