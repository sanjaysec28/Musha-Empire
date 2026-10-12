/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { WHY_CHOOSE_US_DATA } from '../../data/salonData';
import Card from '../ui/Card';
import { Shield, Sparkles, Star, Heart, Compass, Clipboard } from 'lucide-react';

export default function WhyChooseUs() {
  const getIcon = (id: string) => {
    switch (id) {
      case 'why-1': return <Star className="h-5 w-5 text-brand-secondary" />;
      case 'why-2': return <Compass className="h-5 w-5 text-brand-secondary" />;
      case 'why-3': return <Sparkles className="h-5 w-5 text-brand-secondary" />;
      case 'why-4': return <Shield className="h-5 w-5 text-brand-secondary" />;
      case 'why-5': return <Heart className="h-5 w-5 text-brand-secondary" />;
      case 'why-6': return <Clipboard className="h-5 w-5 text-brand-secondary" />;
      default: return <Sparkles className="h-5 w-5 text-brand-secondary" />;
    }
  };

  return (
    <section id="experience" className="py-24 bg-brand-surface-muted/35 border-y border-brand-accent/20 relative">
      {/* Decorative subtle background gold haze */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square bg-brand-secondary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Row Layout for Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-16 pb-8 border-b border-brand-accent/20">
          <div className="lg:col-span-5 space-y-3">
            <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary block">
              THE SOVEREIGN DIFFERENCE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary">
              Why Discerning Guests <br />
              <span className="italic font-bold text-gold-gradient">Choose Musha Empire</span>
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed font-normal">
              We reject the industrial assembly line salon structure. At Musha Empire, we treat hair and skin care as sacred, individual design assignments. Every hour spent with us is a personalized, unhurried, luxury ritual.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid - Bento styled layouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_CHOOSE_US_DATA.map((item, idx) => (
            <motion.div
              key={item.id}
              id={`why-card-wrapper-${item.id}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card
                id={`why-card-${item.id}`}
                variant="bordered"
                hoverable
                className="h-full bg-brand-surface border-brand-accent/35 p-8 flex flex-col justify-between space-y-6"
              >
                {/* Header info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 flex items-center justify-center border border-brand-secondary/35 bg-brand-bg rounded-none">
                      {getIcon(item.id)}
                    </div>
                    <span className="font-mono text-xs text-brand-secondary/60">0{idx + 1}</span>
                  </div>
                  
                  <h3 className="font-serif text-lg md:text-xl font-bold text-brand-primary">
                    {item.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
                  {item.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
