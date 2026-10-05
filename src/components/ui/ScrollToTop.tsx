/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="scroll-to-top-btn"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onClick={handleScrollToTop}
          className="fixed bottom-24 right-6 z-40 bg-brand-surface border border-brand-secondary text-brand-secondary p-3 hover:bg-brand-primary hover:text-brand-bg hover:border-brand-primary shadow-xl transition-all duration-300 cursor-pointer rounded-none group"
          title="Scroll back to Top"
          aria-label="Scroll to Top"
        >
          <ArrowUp className="h-4.5 w-4.5 group-hover:-translate-y-1 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
