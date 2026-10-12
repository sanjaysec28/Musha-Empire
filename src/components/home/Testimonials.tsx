/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, MessageSquare } from 'lucide-react';
import Card from '../ui/Card';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-brand-surface-muted/30 border-y border-brand-secondary/15 relative overflow-hidden">
      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-brand-gold-dark/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary block">
            PATRON TESTIMONIALS & EXPERIENCES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary">
            Sought by the <span className="italic font-bold text-gold-gradient">Discerning Elite</span>
          </h2>
          <div className="luxury-divider" />
        </div>

        {/* Clean Empty State */}
        <div className="max-w-2xl mx-auto">
          <Card
            id="testimonials-empty-card"
            variant="bordered"
            className="bg-brand-surface border-brand-secondary/15 p-10 text-center space-y-4"
          >
            <MessageSquare className="h-8 w-8 text-brand-secondary/60 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-primary">No reviews available yet</h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed max-w-md mx-auto font-normal">
              Patron testimonials and verified guest reflections are currently being compiled. Share your experience directly with our concierge desk during your next reservation.
            </p>
          </Card>
        </div>

      </div>
    </section>
  );
}
