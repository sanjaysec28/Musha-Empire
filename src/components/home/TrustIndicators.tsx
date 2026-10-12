/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Award, Sparkles, Star, Users } from 'lucide-react';

export default function TrustIndicators() {
  const indicators = [
    {
      id: 'pillar-1',
      title: 'Certified Masters',
      tagline: 'Artisan Excellence',
      icon: <Award className="h-5 w-5 text-brand-secondary" />,
      description: 'Master stylists certified in Vidal Sassoon & haute couture techniques',
    },
    {
      id: 'pillar-2',
      title: 'Pure Botanicals',
      tagline: 'Clean Chemistry',
      icon: <Sparkles className="h-5 w-5 text-brand-secondary" />,
      description: 'Cruelty-free organic active elixirs with zero ammonia formulations',
    },
    {
      id: 'pillar-3',
      title: 'Private Suites',
      tagline: 'Sovereign Sanctuary',
      icon: <Users className="h-5 w-5 text-brand-secondary" />,
      description: 'Quiet, unhurried treatment suites with acoustic privacy',
    },
    {
      id: 'pillar-4',
      title: 'Bespoke Care',
      tagline: 'Personal Diagnostics',
      icon: <Star className="h-5 w-5 text-brand-secondary" />,
      description: 'Customized hair & scalp regimens tailored to your topology',
    }
  ];

  return (
    <section id="trust" className="py-12 sm:py-16 md:py-20 bg-brand-bg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {indicators.map((item, idx) => (
            <motion.div
              key={item.id}
              id={`trust-indicator-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col items-center text-center p-6 sm:p-7 lg:p-8 bg-[#121212] hover:bg-[#161616] border border-brand-secondary/20 hover:border-brand-secondary/40 rounded-[18px] transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)] h-full justify-between"
            >
              <div className="flex flex-col items-center w-full">
                {/* Outlined square icon frame */}
                <div className="w-12 h-12 flex items-center justify-center border border-brand-secondary/30 group-hover:border-brand-secondary/60 bg-[#0B0B0B] group-hover:bg-brand-secondary/10 rounded-md mb-5 transition-colors duration-300 shadow-sm shrink-0">
                  {item.icon}
                </div>

                {/* Heading */}
                <h3 className="text-lg sm:text-xl font-heading text-brand-primary font-bold tracking-tight leading-snug">
                  {item.title}
                </h3>

                {/* Gold uppercase subtitle */}
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-secondary mt-1.5 block">
                  {item.tagline}
                </span>

                {/* Description */}
                <p className="font-sans text-xs sm:text-[13px] text-brand-text-muted mt-3 leading-relaxed font-normal max-w-[240px]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
