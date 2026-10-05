/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AvatarProps } from '../../types';

export default function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  className = '',
  id,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'h-10 w-10 text-xs',
    md: 'h-14 w-14 text-sm',
    lg: 'h-20 w-20 text-lg',
    xl: 'h-28 w-28 text-2xl',
  };

  const statusColors = {
    online: 'bg-green-500 ring-white',
    offline: 'bg-gray-400 ring-white',
    away: 'bg-amber-500 ring-white',
  };

  const statusPositions = {
    sm: 'bottom-0 right-0 h-2.5 w-2.5',
    md: 'bottom-0 right-0 h-3.5 w-3.5',
    lg: 'bottom-0.5 right-0.5 h-4 w-4',
    xl: 'bottom-1 right-1 h-5 w-5',
  };

  return (
    <div id={id} className={`relative inline-block select-none ${className}`} {...props}>
      <div className={`overflow-hidden rounded-full border border-brand-accent bg-brand-surface-muted flex items-center justify-center font-sans font-medium text-brand-text-muted ${sizes[size]}`}>
        {!src || hasError ? (
          <span id={`${id}-fallback`}>{fallback}</span>
        ) : (
          <img
            id={`${id}-img`}
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover rounded-full"
          />
        )}
      </div>

      {status && (
        <span
          id={`${id}-status`}
          className={`absolute rounded-full ring-2 ${statusColors[status]} ${statusPositions[size]}`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}
