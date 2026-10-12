/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { CheckCircle2, AlertOctagon, CornerUpLeft, RefreshCw, LucideIcon } from 'lucide-react';
import Button from './Button';

interface StatusStateProps {
  id: string;
  title: string;
  description: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export function SuccessState({
  id,
  title,
  description,
  primaryActionText,
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
}: StatusStateProps) {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 border border-brand-accent/20 bg-brand-surface max-w-xl mx-auto space-y-6"
    >
      {/* Icon Frame */}
      <div id={`${id}-icon-frame`} className="h-16 w-16 bg-green-50 text-green-600 border border-green-200 flex items-center justify-center rounded-none shadow-sm">
        <CheckCircle2 className="h-8 w-8 stroke-1.5" />
      </div>

      <div className="space-y-2">
        <h3 id={`${id}-title`} className="font-serif text-2xl md:text-3xl text-brand-primary font-bold">
          {title}
        </h3>
        <p id={`${id}-desc`} className="font-sans text-xs sm:text-sm text-brand-text-muted max-w-md leading-relaxed">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div id={`${id}-actions`} className="flex flex-col sm:flex-row gap-3 pt-2 w-full justify-center">
        {primaryActionText && onPrimaryAction && (
          <Button id={`${id}-primary-btn`} variant="secondary" size="md" onClick={onPrimaryAction} className="uppercase font-bold text-xs">
            {primaryActionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button id={`${id}-secondary-btn`} variant="outline" size="md" onClick={onSecondaryAction} className="uppercase font-bold text-xs">
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ErrorState({
  id,
  title,
  description,
  primaryActionText = 'Retry Connection',
  onPrimaryAction,
  secondaryActionText = 'Back Home',
  onSecondaryAction,
}: StatusStateProps) {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 border border-brand-accent/25 bg-brand-surface max-w-xl mx-auto space-y-6"
    >
      {/* Icon Frame */}
      <div id={`${id}-icon-frame`} className="h-16 w-16 bg-red-50 text-red-600 border border-red-100 flex items-center justify-center rounded-none shadow-sm animate-pulse">
        <AlertOctagon className="h-8 w-8 stroke-1.5" />
      </div>

      <div className="space-y-2">
        <h3 id={`${id}-title`} className="font-serif text-2xl md:text-3xl text-brand-primary font-bold">
          {title}
        </h3>
        <p id={`${id}-desc`} className="font-sans text-xs sm:text-sm text-brand-text-muted max-w-md leading-relaxed">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div id={`${id}-actions`} className="flex flex-col sm:flex-row gap-3 pt-2 w-full justify-center">
        {onPrimaryAction && (
          <Button
            id={`${id}-primary-btn`}
            variant="secondary"
            size="md"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={onPrimaryAction}
            className="uppercase font-bold text-xs"
          >
            {primaryActionText}
          </Button>
        )}
        {onSecondaryAction && (
          <Button
            id={`${id}-secondary-btn`}
            variant="outline"
            size="md"
            leftIcon={<CornerUpLeft className="h-4 w-4" />}
            onClick={onSecondaryAction}
            className="uppercase font-bold text-xs border-brand-accent hover:border-brand-primary"
          >
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
}
