/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CardProps } from '../../types';

export default function Card({
  variant = 'bordered',
  hoverable = false,
  children,
  className = '',
  id,
  ...props
}: CardProps) {
  // Luxury variants
  const variants = {
    bordered: 'border border-brand-secondary/15 bg-brand-surface',
    elevated: 'border border-brand-secondary/20 bg-brand-surface-muted shadow-lg shadow-black/40',
    glass: 'bg-brand-surface/75 backdrop-blur-md border border-brand-secondary/15',
    dark: 'bg-[#121212] text-brand-text border border-brand-secondary/15',
  };

  const hoverClasses = hoverable
    ? 'transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-secondary/5 gold-border-glow'
    : '';

  return (
    <div
      id={id}
      className={`rounded-none p-6 md:p-8 ${variants[variant]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
