/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Calendar, ArrowRight, Award } from 'lucide-react';

export interface HeroProps {
  onBookClick?: () => void;
  onExploreClick?: () => void;
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
      className="relative min-h-screen lg:h-screen lg:min-h-[850px] flex flex-col lg:flex-row bg-brand-bg text-brand-text overflow-hidden pt-14 md:pt-0"
    >
      {/* ----------------- MOBILE HERO IMAGE (ONLY ON MOBILE <= 767px) ----------------- */}
      <div className="block md:hidden relative w-full h-[34vh] min-h-[240px] max-h-[320px] overflow-hidden bg-brand-surface">
        {/* Subtle decorative gold frame inside the image section */}
        <div className="absolute inset-3 border border-brand-secondary/15 z-20 pointer-events-none" />
        
        {/* Dark overlays to ensure premium cinematic contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/25 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/25 z-5" />

        {/* Cinematic Unisex Salon Interior Background */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
            alt="Musha Empire Luxury Unisex Salon & Spa"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[center_35%]"
            animate={{
              scale: [1, 1.03, 1],
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
      <div className="w-full md:w-[50%] lg:w-[48%] xl:w-[42%] flex flex-col justify-center px-4 sm:px-8 md:px-8 lg:px-12 xl:px-20 pt-6 pb-28 md:py-16 lg:py-0 relative z-20 bg-brand-bg border-r border-brand-secondary/10">
        <div className="space-y-5 md:space-y-7 max-w-xl mx-auto lg:mx-0 text-center md:text-left">
          
          {/* Eyebrow Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-brand-secondary text-[10px] sm:text-xs uppercase tracking-[0.24em] sm:tracking-[0.28em] font-sans font-bold justify-center md:justify-start"
          >
            <span className="h-1.5 w-1.5 rounded-none bg-brand-secondary animate-pulse" />
            The Sanctuary of Sovereign Artistry
          </motion.div>

          {/* Headline - Modern Editorial Manrope with Balanced Wrapping */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-[2.6rem] lg:text-[3.15rem] xl:text-[3.65rem] font-serif font-bold tracking-tight leading-[1.12] text-white max-w-lg lg:max-w-xl mx-auto md:mx-0"
          >
            Where Heritage Meets <br className="hidden sm:inline" />
            <span className="text-gold-gradient font-bold italic">Avant-Garde</span> Styling
          </motion.h1>

          {/* Supporting Paragraph - Authentic, Neutral Luxury Tone */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed font-normal max-w-md mx-auto md:mx-0"
          >
            Welcome to the Musha Empire. We harmonize meticulous craftsmanship with bespoke styling and pure botanical care. Step into a quiet, unhurried sanctuary tailored for an elevated unisex salon experience.
          </motion.p>

          {/* Action Buttons (Dominant Primary Booking + Quieter Secondary Explore) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pt-2 w-full"
          >
            {/* Mobile View Buttons: Rounded & Stacked */}
            <div className="flex md:hidden flex-col gap-3 w-full">
              <button
                id="hero-book-cta-mobile"
                onClick={onPrimaryClick}
                className="w-full h-[50px] bg-brand-secondary text-brand-bg font-sans font-bold text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer rounded-[12px] border border-transparent shadow-[0_4px_16px_rgba(197,168,128,0.22)]"
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Reserve Experience</span>
              </button>
              <button
                id="hero-explore-cta-mobile"
                onClick={onSecondaryClick}
                className="w-full h-[50px] bg-transparent text-brand-text-muted hover:text-brand-primary border border-brand-secondary/30 hover:border-brand-secondary/60 font-sans font-semibold text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer rounded-[12px]"
              >
                <span>Explore Services</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>

            {/* Tablet & Desktop View Buttons: Inline, Recognizable Hierarchy */}
            <div className="hidden md:flex flex-row gap-3.5 w-full">
              <button
                id="hero-book-cta-desktop"
                onClick={onPrimaryClick}
                className="flex-1 h-[52px] px-6 bg-brand-secondary text-brand-bg font-sans font-bold text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#D5B890] hover:shadow-[0_4px_20px_rgba(197,168,128,0.3)] active:scale-[0.99] cursor-pointer rounded-none border border-transparent"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Reserve Experience</span>
              </button>
              <button
                id="hero-explore-cta-desktop"
                onClick={onSecondaryClick}
                className="flex-1 h-[52px] px-6 bg-transparent text-white/80 border border-white/20 hover:text-brand-secondary hover:border-brand-secondary font-sans font-semibold text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-brand-secondary/5 active:scale-[0.99] cursor-pointer rounded-none"
              >
                <span>Explore Services</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </motion.div>

          {/* Brand Hallmarks (Aligned Columns, Authentic Editorial Facts) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="pt-6 sm:pt-7 border-t border-brand-secondary/15 max-w-xl mx-auto md:mx-0"
          >
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center md:text-left">
              <div className="space-y-1">
                <div className="font-serif text-sm sm:text-base lg:text-lg text-brand-secondary font-bold leading-tight">
                  Bespoke Artistry
                </div>
                <div className="font-sans text-[8.5px] sm:text-[9.5px] text-brand-text-muted uppercase tracking-wider font-semibold leading-relaxed">
                  Tailored Styling
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-sm sm:text-base lg:text-lg text-brand-secondary font-bold leading-tight">
                  Pure Botanicals
                </div>
                <div className="font-sans text-[8.5px] sm:text-[9.5px] text-brand-text-muted uppercase tracking-wider font-semibold leading-relaxed">
                  Clean Formulations
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-sm sm:text-base lg:text-lg text-brand-secondary font-bold leading-tight">
                  Private Suites
                </div>
                <div className="font-sans text-[8.5px] sm:text-[9.5px] text-brand-text-muted uppercase tracking-wider font-semibold leading-relaxed">
                  Unhurried Sanctuary
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ----------------- TABLET & DESKTOP HERO IMAGE (HIDDEN ON MOBILE <= 767px) ----------------- */}
      <div className="hidden md:flex w-[50%] lg:w-[52%] xl:w-[58%] relative h-auto overflow-hidden bg-brand-surface items-center justify-center">
        
        {/* Subtle decorative gold frame inside the image section */}
        <div className="absolute inset-6 xl:inset-8 border border-brand-secondary/15 z-20 pointer-events-none hidden lg:block" />
        
        {/* Ambient Dark Overlay to match text readability & subtle atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/15 to-transparent z-10 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/60 via-transparent to-transparent z-10" />
        
        {/* Slowly Panning Background Image - Unisex Salon Interior */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"
            alt="Musha Empire Luxury Unisex Salon Interior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[center_35%]"
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Floating Card 1: Unisex Atelier (Subordinate, Authentic & Non-colliding) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-10 left-8 z-25 bg-[#121212]/95 backdrop-blur-md border border-brand-secondary/20 p-5 rounded-none shadow-2xl max-w-[270px] hidden xl:block text-left"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="font-sans text-[9.5px] uppercase tracking-[0.2em] font-bold text-brand-secondary mb-1.5 flex items-center gap-1.5">
              <span className="h-1 w-1 bg-brand-secondary" />
              UNISEX ATELIER
            </div>
            <p className="font-serif text-sm text-white font-normal leading-snug">
              Dedicated styling stations and private treatment suites for unhurried comfort.
            </p>
          </motion.div>
        </motion.div>

        {/* Floating Card 2: Consultation Protocol (Authentic Brand Standard, Zero Fabricated Statistics) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-14 right-8 z-25 bg-[#121212]/95 backdrop-blur-md border border-brand-secondary/20 p-5 rounded-none shadow-xl max-w-[230px] hidden xl:block text-left"
        >
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="font-sans text-[9.5px] text-brand-secondary uppercase tracking-[0.2em] font-bold mb-1.5 flex items-center gap-1.5">
              <span className="h-1 w-1 bg-brand-secondary" />
              CONSULTATION FIRST
            </div>
            <p className="font-serif text-sm text-white font-normal leading-snug">
              Personalized hair and scalp analysis tailored to your individual style.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
