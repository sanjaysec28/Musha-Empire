/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Compass, Sparkles, Home, CornerUpLeft } from 'lucide-react';
import Button from '../ui/Button';

export default function NotFoundPage({
  onNavigateHome,
}: {
  onNavigateHome: () => void;
}) {
  return (
    <div id="not-found-page-wrapper" className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 sm:px-6">
      {/* Centered Illustration frame */}
      <div className="relative mb-8 max-w-sm w-full mx-auto flex flex-col items-center">
        {/* Glowing concentric background circle */}
        <div className="absolute inset-0 bg-brand-secondary/5 rounded-full blur-3xl" />
        
        {/* Mirror/Frame elegant icon */}
        <div className="h-28 w-28 border border-brand-secondary/30 flex items-center justify-center bg-brand-surface relative z-10 p-4">
          <svg className="h-full w-full text-brand-secondary stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {/* Mirror outline with a shattered effect line */}
            <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M12 3v18" className="opacity-45" />
            <path d="M3 12h18" className="opacity-45" />
            <path d="M3 5l18 14" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Floating small sparkles */}
        <div className="absolute -top-2 left-1/4 text-brand-secondary animate-pulse">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      {/* Details */}
      <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.35em] font-semibold text-brand-secondary block mb-3">
        Error Code: 404 &bull; Symmetry Lost
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl text-brand-primary font-bold tracking-tight max-w-xl mx-auto leading-tight">
        The Reflection has <span className="font-serif-italic text-brand-gold-dark italic">Shattered</span>
      </h1>
      <div className="luxury-divider my-6 max-w-xs mx-auto" />
      <p className="font-sans text-sm text-brand-text-muted max-w-md mx-auto leading-relaxed mb-10">
        The privilege path you are seeking has been moved, archived, or is temporarily out of service. Let us guide you back to the sanctuary entrance.
      </p>

      {/* Back to Home CTA */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button
          id="notfound-back-home-btn"
          variant="primary"
          size="md"
          leftIcon={<Home className="h-4 w-4" />}
          onClick={onNavigateHome}
          className="uppercase tracking-wider text-xs"
        >
          Return to Sanctuary
        </Button>
      </div>
    </div>
  );
}
