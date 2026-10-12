/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function RefundPage() {
  return (
    <div id="refund-page-wrapper" className="pb-24 pt-8 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <section id="refund-header" className="mb-12">
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-secondary block mb-2">
          Concierge Fairness
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold">
          Cancellation & Refund Policy
        </h1>
        <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-brand-text-muted uppercase tracking-wider">
          <Calendar className="h-3.5 w-3.5 text-brand-secondary" /> Last Updated: June 30, 2026
        </div>
        <div className="luxury-divider mt-6" />
      </section>

      {/* Policy Content */}
      <article id="refund-article" className="space-y-8 font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed">
        
        <p className="font-medium text-brand-primary">
          At Musha Empire, we value your time and the absolute commitment of our master stylists and spa therapists. Because our sessions are highly personalized and completely un-overlapped, we operate according to a transparent and fair cancellation and refund protocol.
        </p>

        {/* Section 1 */}
        <section id="refund-sec-1" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-brand-secondary" /> 1. Cancellation & Rescheduling Windows
          </h2>
          <p>
            We require a minimum of <strong className="text-brand-primary">24 hours notice</strong> for any rescheduling or cancellations of standard appointments.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-brand-primary">More than 24 hours notice:</strong> You can cancel or reschedule with zero penalty. Any pre-paid card hold or deposit is fully refunded to your card within 3 business days.</li>
            <li><strong className="text-brand-primary">Less than 24 hours notice:</strong> Cancellations made within this window are subject to a 50% reservation release fee. This fee is used to partially compensate the master stylist whose blocked time cannot be re-allocated.</li>
            <li><strong className="text-brand-primary">No-Show:</strong> Failure to attend without any notice (No-Show) will result in a 100% service fee charge. Future bookings will require full upfront pre-payments.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section id="refund-sec-2" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-secondary" /> 2. Master Artistry Satisfaction Guarantee
          </h2>
          <p>
            Hair and skincare are highly personal arts. We do not offer cash refunds on completed styling or technical chemical treatments. However, we are completely dedicated to your absolute happiness:
          </p>
          <p className="border-l-2 border-brand-secondary pl-4 font-serif-italic text-sm italic text-brand-primary bg-brand-surface-muted/30 p-3">
            If your haircut shape, texturizing swing, or balayage hue requires slight modification, please contact our concierge desk within 5 calendar days of your appointment. We will schedule a complimentary adjustment session with your original artisan or a senior master director.
          </p>
        </section>

        {/* Section 3 */}
        <section id="refund-sec-3" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <RefreshCw className="h-4.5 w-4.5 text-brand-secondary" /> 3. Membership Refund Terms
          </h2>
          <p>
            Silver Shield, Gold Crown, and Platinum Sovereign subscription payments are processed monthly or annually.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-brand-primary">Monthly Subscriptions:</strong> Non-refundable once processed. You can cancel your subscription at any time to prevent auto-renewal on the next billing date.</li>
            <li><strong className="text-brand-primary">Yearly Subscriptions:</strong> Eligible for a pro-rated refund within the first 30 calendar days of subscription, subject to a £50 administrative card processing fee and deductions for any complimentary services utilized during that month at their standard non-member prices.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="refund-sec-4" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 text-brand-secondary" /> 4. Custom Spa Product Retail Returns
          </h2>
          <p>
            We stand behind our custom blended eco-botanical elixirs and shampoos. Unopened home retail items in their original sealed packaging can be returned for a full refund or exchange within 14 days of purchase. Opened products are eligible strictly for a store credit note, provided at least 80% of the volume remains unused.
          </p>
        </section>

        {/* Section 5 */}
        <section id="refund-sec-5" className="space-y-3 pt-4 border-t border-brand-accent/20">
          <h2 className="font-serif text-lg text-brand-primary font-medium">
            5. Concierge Refund Support
          </h2>
          <p>
            To initiate a product return, check-out adjustment, or membership cancellation refund request, please speak with our Operations Manager at the salon reception desk, or send an email to: <a href="mailto:refunds@mushaempire.com" className="text-brand-gold-dark hover:underline">refunds@mushaempire.com</a>.
          </p>
        </section>

      </article>
    </div>
  );
}
