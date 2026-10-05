/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TESTIMONIALS_DATA } from '../../data/salonData';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  };

  const currentTestimonial = TESTIMONIALS_DATA[activeIndex];

  return (
    <section id="testimonials" className="py-24 bg-brand-surface-muted/30 border-y border-brand-secondary/15 relative overflow-hidden">
      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-brand-secondary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-brand-gold-dark/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary block">
            REVIEWS OF SOVEREIGN SATISFACTION
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-brand-primary">
            Sought by the <span className="italic font-medium">Discerning Elite</span>
          </h2>
          <div className="luxury-divider" />
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto relative px-10 md:px-16">
          
          {/* Quote Mark Decoration */}
          <div className="absolute -top-10 -left-2 text-brand-secondary/15 pointer-events-none">
            <Quote className="h-20 w-20 transform scale-x-[-1] stroke-[1px] fill-current" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card
                id={`testimonial-card-${currentTestimonial.id}`}
                variant="bordered"
                className="bg-brand-surface border-brand-secondary/15 p-8 md:p-12 relative shadow-xl space-y-8 flex flex-col items-center text-center"
              >
                {/* 5 Golden Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 text-brand-secondary fill-brand-secondary" />
                  ))}
                </div>

                {/* Review Text */}
                <blockquote className="font-serif text-lg md:text-xl lg:text-2xl font-light text-brand-primary italic leading-relaxed max-w-2xl">
                  {currentTestimonial.text}
                </blockquote>

                {/* Client Profile Row */}
                <div className="flex flex-col items-center space-y-3 pt-4 border-t border-brand-secondary/15 w-full max-w-sm">
                  <Avatar
                    id={`testimonial-avatar-${currentTestimonial.id}`}
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    fallback={currentTestimonial.name[0]}
                    size="lg"
                  />
                  <div>
                    <h4 className="font-serif text-base text-brand-primary leading-tight font-medium">
                      {currentTestimonial.name}
                    </h4>
                    <p className="font-sans text-[11px] text-brand-secondary uppercase tracking-widest font-semibold mt-0.5">
                      {currentTestimonial.role}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controllers */}
          <button
            id="testimonial-prev-btn"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-primary hover:text-brand-secondary border border-brand-secondary/15 rounded-none p-2.5 bg-brand-surface hover:shadow-md transition-all cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            id="testimonial-next-btn"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-primary hover:text-brand-secondary border border-brand-secondary/15 rounded-none p-2.5 bg-brand-surface hover:shadow-md transition-all cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS_DATA.map((_, index) => (
              <button
                key={index}
                id={`testimonial-dot-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 transition-all duration-300 rounded-none cursor-pointer ${
                  index === activeIndex ? 'w-8 bg-brand-secondary' : 'w-2 bg-brand-secondary/20 hover:bg-brand-secondary/40'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
