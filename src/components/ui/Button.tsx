/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ButtonProps } from '../../types';

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  id,
  type = 'button',
  ...props
}: ButtonProps) {
  // Premium base classes with strict design guidelines and luxury focus states
  const baseClasses = 'inline-flex items-center justify-center font-sans font-semibold uppercase tracking-[0.5px] rounded-[16px] transition-all duration-300 ease-in-out cursor-pointer relative select-none shrink-0 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#E7D2B4] focus:ring-offset-2 focus:ring-offset-[#121212] w-auto opacity-100';
  
  // Luxury brand unified variants
  const variants = {
    primary: 'bg-[#E7D2B4] text-[#1A1A1A] border-none hover:bg-[#DDC39D] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
    secondary: 'bg-transparent text-[#E7D2B4] border border-[#E7D2B4] hover:bg-[#E7D2B4]/10 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
    outline: 'bg-transparent text-[#E7D2B4] border border-[#E7D2B4] hover:bg-[#E7D2B4]/10 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
    dark: 'bg-[#121212] text-white border border-[#E7D2B4]/35 hover:bg-[#1A1A1A] hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]',
    accent: 'bg-[#121212] text-white border border-[#E7D2B4]/35 hover:bg-[#1A1A1A] hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]',
    text: 'bg-transparent text-[#E7D2B4] border-none hover:underline underline-offset-4 hover:translate-x-1 p-0 uppercase tracking-wider',
    ghost: 'bg-transparent text-[#E7D2B4] border-none hover:underline underline-offset-4 hover:translate-x-1 p-0 uppercase tracking-wider',
    link: 'bg-transparent text-[#E7D2B4] border-none hover:underline underline-offset-4 hover:translate-x-1 p-0 uppercase tracking-wider',
  };

  // Standardized premium heights and paddings
  const sizes = {
    sm: 'text-xs px-5 h-[48px]',
    md: 'text-sm px-7 h-[56px]',
    lg: 'text-sm px-8 h-[56px]',
  };

  // If text/ghost/link variants are used, make them auto-height instead of fixed height
  const isTextVariant = variant === 'text' || variant === 'ghost' || variant === 'link';
  const sizeClass = isTextVariant ? 'text-sm py-2' : sizes[size];

  return (
    <button
      id={id}
      type={type}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          id={`${id}-loader`}
          className="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span id={`${id}-left-icon`} className="mr-2 inline-flex items-center justify-center text-current shrink-0">{leftIcon}</span>
      ) : null}

      <span id={`${id}-text`} className="relative z-10 text-current flex items-center justify-center">{children}</span>

      {!isLoading && rightIcon && (
        <span id={`${id}-right-icon`} className="ml-2 inline-flex items-center justify-center text-current shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
