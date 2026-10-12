/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface MushaEmpireLogoProps {
  variant?: 'horizontal' | 'vertical' | 'mark';
  className?: string;
  classNameLogo?: string;
  classNameText?: string;
}

export default function MushaEmpireLogo({
  variant = 'horizontal',
  className = '',
  classNameLogo = '',
  classNameText = '',
}: MushaEmpireLogoProps) {
  // Common Gold Gradient Definitions to be used in SVG
  const Gradients = () => (
    <defs>
      {/* Luxury Metallic Gold Gradient */}
      <linearGradient id="musha-gold" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8A6635" />
        <stop offset="20%" stopColor="#C5A880" />
        <stop offset="45%" stopColor="#EAD8C1" />
        <stop offset="60%" stopColor="#C5A880" />
        <stop offset="80%" stopColor="#9C7A4E" />
        <stop offset="100%" stopColor="#C5A880" />
      </linearGradient>

      {/* Shimmer / Accent Highlight Gold */}
      <linearGradient id="musha-gold-shimmer" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F6E7D2" />
        <stop offset="50%" stopColor="#C5A880" />
        <stop offset="100%" stopColor="#785628" />
      </linearGradient>

      {/* Deep Shadow for 3D appearance */}
      <filter id="musha-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
      </filter>
    </defs>
  );

  // High-fidelity rendering of the Crown & Monogram Emblem
  const Emblem = ({ size = 120 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${classNameLogo} shrink-0`}
      style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.4))' }}
      role="img"
      aria-label="Musha Empire Luxury Unisex Salon & Spa"
    >
      <title>Musha Empire Luxury Unisex Salon & Spa</title>
      <Gradients />

      {/* Outer Double Circular Crest */}
      <circle cx="60" cy="65" r="46" stroke="url(#musha-gold)" strokeWidth="1" strokeDasharray="1 3" opacity="0.4" />
      <circle cx="60" cy="65" r="42" stroke="url(#musha-gold)" strokeWidth="1.5" />
      
      {/* Outer crescent sweeping wings */}
      <path
        d="M 12,65 A 48,48 0 0,0 108,65"
        stroke="url(#musha-gold)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 18,65 A 42,42 0 0,0 102,65"
        stroke="url(#musha-gold)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Royal Gold Crown on Top */}
      <g id="crown" filter="url(#musha-shadow)">
        {/* Crown base */}
        <path
          d="M 44,25 Q 60,28 76,25 L 74,28 Q 60,30 46,28 Z"
          fill="url(#musha-gold-shimmer)"
        />
        {/* Crown spikes/peaks */}
        <path
          d="M 44,25 
             L 38,12 Q 44,18 48,16
             L 52,10 Q 56,18 60,13 Q 64,18 68,10
             L 72,16 Q 76,18 82,12
             L 76,25
             Q 60,28 44,25 Z"
          fill="url(#musha-gold)"
        />
        {/* Crown jewels */}
        <circle cx="60" cy="11.5" r="2" fill="#D32F2F" /> {/* Red Ruby Center */}
        <circle cx="48" cy="14" r="1.2" fill="#D32F2F" />
        <circle cx="72" cy="14" r="1.2" fill="#D32F2F" />
        <circle cx="39" cy="11.5" r="1" fill="#FFFFFF" opacity="0.9" />
        <circle cx="81" cy="11.5" r="1" fill="#FFFFFF" opacity="0.9" />
      </g>

      {/* Central "M" Monogram & Silhouettes */}
      <g id="monogram-and-silhouettes">
        {/* 1. Male Silhouette (Left side profile) */}
        <path
          d="M 33,52 
             Q 30,52 28,54
             Q 26,56 27,59
             Q 28,62 30,64
             L 28,66
             Q 27,68 29,69
             Q 31,70 32,68
             Q 33,66 34,68
             Q 35,70 33,72
             Q 32,74 34,75
             Q 36,76 38,73
             Q 40,70 39,66
             Q 38,62 39,59
             L 41,56"
          stroke="url(#musha-gold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Male styled hair flow */}
        <path
          d="M 33,52 
             Q 28,48 26,44
             Q 30,46 34,49
             M 31,48
             Q 26,42 24,37
             Q 29,40 33,45
             M 35,46
             Q 30,38 31,33
             Q 34,37 38,42"
          stroke="url(#musha-gold)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* 2. Female Silhouette (Right side profile) */}
        <path
          d="M 87,52
             Q 90,52 92,54
             Q 94,56 93,59
             Q 92,62 90,64
             L 92,66
             Q 93,68 91,69
             Q 89,70 88,68
             Q 87,66 86,68
             Q 85,70 87,72
             Q 88,74 86,75
             Q 84,76 82,73
             Q 80,70 81,66
             Q 82,62 81,59
             L 79,56"
          stroke="url(#musha-gold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Female long flowing hair */}
        <path
          d="M 87,52
             Q 93,48 94,40
             Q 95,48 91,56
             Q 89,62 92,68
             Q 94,74 91,80
             Q 88,86 85,88
             M 89,58
             Q 92,64 93,72
             Q 94,80 90,84"
          stroke="url(#musha-gold)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* 3. Luxurious Thick Serif "M" in center */}
        {/* Left vertical pillar */}
        <path
          d="M 44,45 L 48,45 L 48,82 L 44,82 Z"
          fill="url(#musha-gold)"
        />
        <path
          d="M 42,45 L 50,45"
          stroke="url(#musha-gold)"
          strokeWidth="1.5"
        />
        <path
          d="M 42,82 L 50,82"
          stroke="url(#musha-gold)"
          strokeWidth="1.5"
        />

        {/* Right vertical pillar */}
        <path
          d="M 72,45 L 76,45 L 76,82 L 72,82 Z"
          fill="url(#musha-gold)"
        />
        <path
          d="M 70,45 L 78,45"
          stroke="url(#musha-gold)"
          strokeWidth="1.5"
        />
        <path
          d="M 70,82 L 78,82"
          stroke="url(#musha-gold)"
          strokeWidth="1.5"
        />

        {/* Diagonal valleys of M */}
        <path
          d="M 48,45 
             L 60,74 
             L 72,45
             L 69,45
             L 60,67
             L 51,45 Z"
          fill="url(#musha-gold-shimmer)"
        />

        {/* Decorative central swirl base */}
        <path
          d="M 48,82 Q 60,86 72,82"
          stroke="url(#musha-gold)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 52,83 Q 60,92 68,83"
          stroke="url(#musha-gold-shimmer)"
          strokeWidth="1"
          fill="none"
        />
      </g>
    </svg>
  );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center transition-all duration-300 ease-out hover:scale-[1.03] hover:drop-shadow-[0_0_12px_rgba(197,168,128,0.45)] cursor-pointer ${className}`}>
        <Emblem size={42} />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2 sm:gap-3 select-none transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer shrink-0 ${className}`}>
        {/* Emblem - Scaled with preserveAspectRatio for mobile navbar */}
        <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center">
          <Emblem size={40} />
        </div>

        {/* Typography */}
        <div className={`flex flex-col text-left justify-center ${classNameText}`}>
          <span className="font-logo text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-[0.04em] text-white leading-none whitespace-nowrap">
            MUSHA EMPIRE
          </span>
          <span className="text-[6.5px] sm:text-[7.5px] md:text-[8px] uppercase tracking-[0.22em] sm:tracking-[0.32em] font-sans font-semibold text-brand-secondary mt-1 leading-none whitespace-nowrap">
            LUXURY UNISEX SALON & SPA
          </span>
        </div>
      </div>
    );
  }

  // Vertical layout - Ideal for Footer, Login screen, portal landing blocks
  return (
    <div className={`flex flex-col items-center text-center select-none transition-all duration-300 ease-out hover:scale-[1.03] hover:drop-shadow-[0_0_12px_rgba(197,168,128,0.45)] cursor-pointer ${className}`}>
      {/* Grand Emblem */}
      <Emblem size={96} />

      {/* Bold Serif Typography */}
      <div className={`flex flex-col mt-4 space-y-1 ${classNameText}`}>
        <span className="font-logo text-2xl sm:text-3xl font-medium tracking-[0.08em] text-white">
          MUSHA EMPIRE
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.45em] font-sans font-bold text-brand-secondary">
          LUXURY UNISEX SALON & SPA
        </span>
      </div>
    </div>
  );
}
