/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';
import { ModalProps, DrawerProps } from '../../types';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  id,
}: ModalProps) {
  // Luxury sizes
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-0 h-full',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id={`${id}-wrapper`} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            id={`${id}-backdrop`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            id={id}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.1 } as any}
            className={`relative w-full ${sizes[size]} bg-brand-bg rounded-none border border-brand-secondary/15 shadow-2xl z-10 overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div id={`${id}-header`} className="px-6 py-5 border-b border-brand-secondary/15 flex items-start justify-between">
              <div>
                <h3 id={`${id}-title`} className="text-xl md:text-2xl font-serif text-brand-primary">
                  {title}
                </h3>
                {description && (
                  <p id={`${id}-desc`} className="text-brand-text-muted text-xs font-sans mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                id={`${id}-close`}
                onClick={onClose}
                className="text-brand-text-muted hover:text-brand-primary transition-colors p-1 cursor-pointer"
                aria-label="Close dialog"
              >
                <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div id={`${id}-content`} className="px-6 py-6 overflow-y-auto max-h-[60vh] text-brand-text font-sans text-sm leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div id={`${id}-footer`} className="px-6 py-4 border-t border-brand-secondary/15 bg-brand-surface-muted/50 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  id,
}: DrawerProps) {
  // Directional slide offsets
  const isRight = position === 'right';
  const motionProps = {
    initial: { x: isRight ? '100%' : '-100%' },
    animate: { x: 0 },
    exit: { x: isRight ? '100%' : '-100%' },
    transition: { type: 'spring', damping: 25, stiffness: 220 } as any,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id={`${id}-wrapper`} className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            id={`${id}-backdrop`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Drawer Container */}
          <motion.div
            id={id}
            {...motionProps}
            className={`fixed inset-y-0 ${isRight ? 'right-0' : 'left-0'} w-full max-w-md bg-brand-bg border-l border-brand-secondary/15 shadow-2xl z-10 flex flex-col`}
          >
            {/* Header */}
            <div id={`${id}-header`} className="px-6 py-5 border-b border-brand-secondary/15 flex items-center justify-between">
              <h3 id={`${id}-title`} className="text-xl font-serif text-brand-primary uppercase tracking-wider">
                {title}
              </h3>
              <button
                id={`${id}-close`}
                onClick={onClose}
                className="text-brand-text-muted hover:text-brand-primary transition-colors p-1 cursor-pointer"
                aria-label="Close drawer"
              >
                <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div id={`${id}-content`} className="flex-1 overflow-y-auto px-6 py-6 text-brand-text font-sans text-sm leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div id={`${id}-footer`} className="px-6 py-4 border-t border-brand-secondary/15 bg-brand-surface-muted/50 flex flex-col gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
