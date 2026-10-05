/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
  id: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
  id,
}: EmptyStateProps) {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center p-8 md:p-16 border border-dashed border-brand-secondary/20 text-center bg-brand-surface max-w-xl mx-auto"
    >
      {/* Icon frame */}
      {icon ? (
        <div id={`${id}-icon-container`} className="mb-6 text-brand-secondary">
          {icon}
        </div>
      ) : (
        <div id={`${id}-default-icon-container`} className="mb-6 text-brand-secondary">
          <svg className="h-12 w-12 stroke-current fill-none stroke-1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
      )}

      {/* Title */}
      <h3 id={`${id}-title`} className="text-xl md:text-2xl font-serif text-brand-primary mb-3">
        {title}
      </h3>

      {/* Description */}
      <p id={`${id}-desc`} className="font-sans text-sm text-brand-text-muted max-w-sm leading-relaxed mb-8">
        {description}
      </p>

      {/* Action */}
      {actionText && onAction && (
        <Button id={`${id}-action-btn`} variant="outline" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
