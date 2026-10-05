/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import MushaEmpireLogo from './MushaEmpireLogo';

export default function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Premium loading transition window
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          id="global-page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 bg-[#1A1917] z-50 flex flex-col items-center justify-center text-center p-4 selection:bg-brand-secondary/35"
        >
          {/* Logo Frame */}
          <div className="space-y-4 mb-8 relative select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <MushaEmpireLogo variant="vertical" />
            </motion.div>
          </div>

          {/* Luxury Rotating Circular Shimmer */}
          <div className="relative h-10 w-10 flex items-center justify-center">
            {/* Shimmer Border */}
            <div className="absolute inset-0 rounded-full border border-brand-accent/10" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-t border-brand-secondary"
            />
          </div>

          {/* Small aesthetic indicator */}
          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-brand-accent/35 mt-6 animate-pulse">
            Configuring Design Harmony
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
