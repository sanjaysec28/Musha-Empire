/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { ToastMessage } from '../../types';

interface ToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
  id: string;
}

export default function Toast({ messages, onRemove, id }: ToastProps) {
  // Brand alert styles
  const icons = {
    success: (
      <svg className="h-5 w-5 text-green-600 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-600 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-blue-600 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-amber-600 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  };

  const borders = {
    success: 'border-l-4 border-green-600 bg-brand-surface',
    error: 'border-l-4 border-red-600 bg-brand-surface',
    info: 'border-l-4 border-blue-600 bg-brand-surface',
    warning: 'border-l-4 border-amber-600 bg-brand-surface',
  };

  return (
    <div id={id} className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            id={msg.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className={`pointer-events-auto flex items-start p-4 shadow-xl border border-brand-accent ${borders[msg.type]} relative overflow-hidden`}
          >
            {/* Type Icon */}
            <div id={`${msg.id}-icon`} className="mr-3 mt-0.5 shrink-0">
              {icons[msg.type]}
            </div>

            {/* Title & Desc */}
            <div id={`${msg.id}-body`} className="flex-1 pr-4">
              <h4 id={`${msg.id}-title`} className="font-sans text-xs uppercase tracking-wider font-semibold text-brand-primary">
                {msg.title}
              </h4>
              {msg.description && (
                <p id={`${msg.id}-desc`} className="font-sans text-xs text-brand-text-muted mt-1 leading-relaxed">
                  {msg.description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              id={`${msg.id}-close`}
              onClick={() => onRemove(msg.id)}
              className="text-brand-text-muted hover:text-brand-primary transition-colors p-1 cursor-pointer shrink-0"
              aria-label="Dismiss message"
            >
              <svg className="h-4 w-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
