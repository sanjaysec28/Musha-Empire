/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Award, ShieldAlert, Sparkles, Star, Users } from 'lucide-react';

export default function TrustIndicators() {
  const stats = [
    {
      id: 'stat-1',
      number: '16+',
      label: 'Years of Experience',
      icon: <Award className="h-5 w-5 text-brand-secondary" />,
      description: 'Artistry perfected globally since 2010',
    },
    {
      id: 'stat-2',
      number: '14,000+',
      label: 'Happy Clients',
      icon: <Users className="h-5 w-5 text-brand-secondary" />,
      description: 'Nurturing sovereign client relationships',
    },
    {
      id: 'stat-3',
      number: '100%',
      label: 'Premium Products',
      icon: <Sparkles className="h-5 w-5 text-brand-secondary" />,
      description: 'Organic botanical elixirs & zero ammonia',
    },
    {
      id: 'stat-4',
      number: '18+',
      label: 'Certified Professionals',
      icon: <Star className="h-5 w-5 text-brand-secondary" />,
      description: 'Vidal Sassoon and L’Oréal certified masters',
    }
  ];

  return (
    <section id="trust" className="py-12 bg-brand-surface-muted/50 border-y border-brand-accent/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y-0 divide-x-0 sm:divide-x sm:divide-brand-accent/20">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              id={`trust-indicator-${stat.id}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center text-center p-4 justify-center"
            >
              {/* Icon wrap */}
              <div className="h-10 w-10 flex items-center justify-center border border-brand-secondary/20 bg-brand-bg rounded-none mb-3">
                {stat.icon}
              </div>

              {/* Number */}
              <span className="text-3xl md:text-4xl font-serif text-brand-primary font-light tracking-tight">
                {stat.number}
              </span>

              {/* Label */}
              <span className="font-sans text-[11px] uppercase tracking-widest font-semibold text-brand-gold-dark mt-1">
                {stat.label}
              </span>

              {/* Subtitle */}
              <p className="font-sans text-xs text-brand-text-muted mt-2 max-w-[180px] leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
