/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BadgeProps, ChipProps } from '../../types';

export function Badge({
  variant = 'linen',
  size = 'md',
  children,
  className = '',
  id,
  ...props
}: BadgeProps) {
  // Luxury brand colors for tags
  const variants = {
    gold: 'bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/35',
    charcoal: 'bg-brand-surface-muted text-brand-text border border-brand-secondary/20',
    linen: 'bg-brand-surface text-brand-text-muted border border-brand-secondary/15',
    success: 'bg-green-950/30 text-green-400 border border-green-800/30',
    warning: 'bg-amber-950/30 text-amber-400 border border-amber-800/30',
    info: 'bg-sky-950/30 text-sky-400 border border-sky-800/30',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase',
    md: 'text-xs px-3 py-1 tracking-wider uppercase',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center justify-center font-sans font-medium rounded-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function Chip({
  isSelected = false,
  onRemove,
  children,
  className = '',
  id,
  ...props
}: ChipProps) {
  return (
    <button
      id={id}
      type="button"
      className={`inline-flex items-center justify-center font-sans text-xs tracking-wider uppercase px-4 py-2 rounded-none border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
        isSelected
          ? 'bg-brand-secondary text-[#121212] border-brand-secondary font-semibold'
          : 'bg-brand-surface text-brand-text-muted border-brand-secondary/15 hover:text-brand-primary hover:border-brand-secondary/50'
      } ${className}`}
      {...props}
    >
      <span id={`${id}-label`} className="mr-1.5">{children}</span>
      {onRemove && (
        <span
          id={`${id}-remove`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-red-500 transition-colors p-0.5"
        >
          <svg className="h-3.5 w-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      )}
    </button>
  );
}
