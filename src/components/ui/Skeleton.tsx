/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  id: string;
}

export default function Skeleton({
  variant = 'rectangular',
  className = '',
  id,
  ...props
}: SkeletonProps) {
  // Brand shimmer base classes
  const baseClasses = 'bg-brand-surface-muted animate-pulse relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent';

  const variants = {
    text: 'h-3 w-3/4 rounded-none my-1.5',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-none',
  };

  return (
    <div
      id={id}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
