/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowRight, Award } from 'lucide-react';

export interface HeroProps {
  onBookClick?: () => void;
  onExploreClick?: () => void;
}

function AnimatedCounter({ value, duration = 2000, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      setCount(Math.floor(easedProgress * value));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count}{suffix}</span>;
}

export default function Hero({ onBookClick, onExploreClick }: HeroProps) {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onPrimaryClick = () => {
    if (onBookClick) {
      onBookClick();
    } else {
      handleScrollTo('booking');
    }
  };

  const onSecondaryClick = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      handleScrollTo('services');
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen lg:h-screen lg:min-h-[850px] flex flex-col lg:flex-row bg-brand-bg text-brand-text overflow-hidden"
    >
      {/* ----------------- MOBILE HERO IMAGE (ONLY ON MOBILE <= 767px) ----------------- */}
      <div className="block md:hidden relative w-full h-[48vh] min-h-[320px] overflow-hidden bg-brand-surface">
        {/* Subtle decorative gold frame inside the image section */}
        <div className="absolute inset-4 border border-brand-secondary/10 z-20 pointer-events-none" />
        
        {/* Dark overlays to ensure premium cinematic contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-black/30 z-5" />

        {/* Cinematic Salon Background */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80"
            alt="Musha Empire Luxury Salon Interior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      {/* ----------------- EDITORIAL CONTENT (LEFT ON DESKTOP/TABLET, BELOW ON MOBILE) ----------------- */}
      <div className="w-full md:w-[50%] lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-6 sm:px-12 md:px-10 lg:px-16 xl:px-24 py-12 md:py-16 lg:py-0 relative z-20 bg-brand-bg border-r border-brand-secondary/5">
        <div className="space-y-6 md:space-y-8 max-w-xl mx-auto lg:mx-0 text-center md:text-left">
          
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 text-brand-secondary text-[10px] sm:text-xs uppercase tracking-[0.3em] font-sans font-semibold justify-center md:justify-start"
          >
            <span className="h-1.5 w-1.5 rounded-none bg-brand-secondary animate-pulse" />
            The Sanctuary of Sovereign Artistry
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-light tracking-tight leading-[1.12] text-white"
          >
            Where Heritage <br className="hidden md:inline" />
            Meets <span className="text-gold-gradient font-medium italic">Avant-Garde</span> <br />
            Styling.
          </motion.h1>

          {/* Supporting Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed font-light max-w-md mx-auto md:mx-0"
          >
            Welcome to the Musha Empire. We harmonize clinical precision with Vidal Sassoon hair artistry and premium organic botanicals. Step into a quiet, unhurried sanctuary tailored exclusively for the modern elite.
          </motion.p>

          {/* Action Buttons (Responsive: Stacked with Rounded corners on Mobile, Split/Square on Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pt-2 w-full"
          >
            {/* Mobile View Buttons: Rounded & Stacked */}
            <div className="flex md:hidden flex-col gap-3.5 w-full">
              <button
                id="hero-book-cta-mobile"
                onClick={onPrimaryClick}
                className="w-full h-[54px] bg-brand-secondary text-brand-bg font-sans font-bold text-xs tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer rounded-[16px] border border-transparent shadow-[0_4px_15px_rgba(197,168,128,0.25)]"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Reserve Experience</span>
              </button>
              <button
                id="hero-explore-cta-mobile"
                onClick={onSecondaryClick}
                className="w-full h-[54px] bg-transparent text-brand-secondary border border-brand-secondary/40 font-sans font-bold text-xs tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer rounded-[16px]"
              >
                <span>Explore Services</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>

            {/* Tablet & Desktop View Buttons: Square & Inline */}
            <div className="hidden md:flex flex-row gap-4 w-full">
              <button
                id="hero-book-cta-desktop"
                onClick={onPrimaryClick}
                className="flex-1 h-[54px] px-6 bg-brand-secondary text-brand-bg font-sans font-bold text-xs tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white hover:text-brand-bg hover:shadow-[0_0_20px_rgba(197,168,128,0.35)] cursor-pointer rounded-none border border-transparent"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Reserve Experience</span>
              </button>
              <button
                id="hero-explore-cta-desktop"
                onClick={onSecondaryClick}
                className="flex-1 h-[54px] px-6 bg-transparent text-brand-secondary border border-brand-secondary/40 font-sans font-bold text-xs tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-brand-secondary/10 hover:border-brand-secondary cursor-pointer rounded-none"
              >
                <span>Explore Services</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </motion.div>

          {/* Statistics Section (Responsive Layout) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="pt-8 border-t border-brand-secondary/10 max-w-xl mx-auto md:mx-0"
          >
            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center md:text-left">
              <div className="space-y-1">
                <div className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-secondary font-light">
                  <AnimatedCounter value={15} suffix="+" />
                </div>
                <div className="font-sans text-[9px] sm:text-[10px] text-brand-text-muted uppercase tracking-widest leading-relaxed">
                  Years of Excellence
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-secondary font-light">
                  <AnimatedCounter value={12} suffix="k+" />
                </div>
                <div className="font-sans text-[9px] sm:text-[10px] text-brand-text-muted uppercase tracking-widest leading-relaxed">
                  Happy Clients
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand-secondary font-light">
                  <AnimatedCounter value={25} suffix="+" />
                </div>
                <div className="font-sans text-[9px] sm:text-[10px] text-brand-text-muted uppercase tracking-widest leading-relaxed">
                  Premium Services
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ----------------- TABLET & DESKTOP HERO IMAGE (HIDDEN ON MOBILE <= 767px) ----------------- */}
      <div className="hidden md:flex w-[50%] lg:w-[55%] xl:w-[60%] relative h-auto overflow-hidden bg-brand-surface items-center justify-center">
        
        {/* Subtle decorative gold frame inside the image section */}
        <div className="absolute inset-8 border border-brand-secondary/10 z-20 pointer-events-none hidden lg:block" />
        
        {/* Ambient Dark Overlay to match text readability & subtle atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-transparent to-transparent z-10 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/25 to-transparent z-10" />
        
        {/* Slowly Panning Background Image */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1600&q=80"
            alt="Musha Empire Salon Interior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Floating Sovereign Privilege card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-12 left-12 z-25 bg-[#121212]/90 backdrop-blur-md border border-brand-secondary/20 p-6 rounded-none shadow-2xl max-w-sm hidden xl:block text-left"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2 text-brand-secondary mb-2">
              <Award className="h-4 w-4" />
              <span className="font-sans text-[9px] uppercase tracking-widest font-semibold">SOVEREIGN PRIVILEGE</span>
            </div>
            <p className="font-serif text-base text-white font-light leading-snug">
              Each experience is paired with premium Single-Estate organic White Lotus tea & holistic scalp diagnostics.
            </p>
          </motion.div>
        </motion.div>

        {/* Floating Member Score card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-12 right-12 z-25 bg-[#121212]/90 backdrop-blur-md border border-brand-secondary/20 p-5 rounded-none shadow-xl max-w-[200px] hidden xl:block text-left"
        >
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="text-3xl font-serif text-brand-secondary font-light">9.9<span className="text-sm">/10</span></div>
            <p className="font-sans text-[10px] text-brand-text-muted uppercase tracking-widest font-medium mt-1">
              Rated by distinguished members across 1,200+ exclusive visits
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
