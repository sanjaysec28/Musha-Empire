/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Accordion from '../ui/Accordion';
import { FAQ_DATA } from '../../data/salonData';
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
  const accordionItems = FAQ_DATA.map((item) => ({
    id: item.id,
    title: item.question,
    content: item.answer,
  }));

  return (
    <section id="faq" className="py-24 bg-brand-bg relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-16 space-y-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary flex items-center justify-center gap-1.5">
            <HelpCircle className="h-4 w-4" /> SANCTUARY FREQUENT ENQUIRIES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary">
            Frequently Asked <span className="italic font-bold text-gold-gradient">Questions</span>
          </h2>
          <div className="luxury-divider" />
          <p className="font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal max-w-xl mx-auto">
            Review detailed guidelines on our bookings, cancellations, product compounds, and private suite arrangements before scheduling your attendance.
          </p>
        </div>

        {/* Accordion List */}
        <div className="bg-brand-surface border border-brand-secondary/15 p-6 md:p-10 shadow-sm rounded-none">
          <Accordion
            id="salon-faq-accordion"
            items={accordionItems}
            allowMultiple={false}
            defaultOpenIds={['faq-1']}
          />
        </div>

        {/* Bottom Note */}
        <p className="text-[11px] text-brand-text-muted font-sans text-center mt-8 uppercase tracking-widest leading-relaxed">
          Have an unlisted custom request? Inquire via our private salon concierge desk or customer portal.
        </p>

      </div>
    </section>
  );
}
