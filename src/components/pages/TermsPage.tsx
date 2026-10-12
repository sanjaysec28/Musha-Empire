/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, FileText, Compass, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div id="terms-page-wrapper" className="pb-24 pt-8 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <section id="terms-header" className="mb-12">
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-secondary block mb-2">
          Sanctuary Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold">
          Terms of Attendance & Service
        </h1>
        <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-brand-text-muted uppercase tracking-wider">
          <Calendar className="h-3.5 w-3.5 text-brand-secondary" /> Last Updated: June 30, 2026
        </div>
        <div className="luxury-divider mt-6" />
      </section>

      {/* Terms Content */}
      <article id="terms-article" className="space-y-8 font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed">
        
        <p className="font-medium text-brand-primary">
          Welcome to Musha Empire. By scheduling a bespoke styling session, booking a steam sauna, or subscribing to our Royal Club privilege tier, you agree to comply with the following terms, conditions, and sanctuary rules.
        </p>

        {/* Section 1 */}
        <section id="terms-sec-1" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <Compass className="h-4.5 w-4.5 text-brand-secondary" /> 1. Sanctuary Etiquette & Silence
          </h2>
          <p>
            To preserve the neural serenity of all clients, Musha Empire maintains a strict acoustic-isolation policy:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-brand-primary">Device Audios:</strong> All mobile devices, laptops, and tablets must be switched to silent mode upon crossing our lobby thresholds. Phone conversations are strictly prohibited inside the main styling rooms.</li>
            <li><strong className="text-brand-primary">Lounge Volume:</strong> Guests are requested to speak in lowered, whispering voices. No external speaker audio is permitted.</li>
            <li><strong className="text-brand-primary">Right of Dismissal:</strong> The management reserves the absolute right to terminate ongoing treatments and request the immediate departure of any guest whose conduct persistently disrupts the tranquility of other patrons.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section id="terms-sec-2" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-brand-secondary" /> 2. 1-on-1 Block Reservation Guarantee
          </h2>
          <p>
            When booking an appointment with a master stylist, that artist is completely blocked for your exclusive care. We guarantee zero over-booking. In turn, clients are expected to arrive punctually:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-brand-primary">Grace Window:</strong> We extend a 15-minute grace period. Arriving later than 15 minutes may result in an abbreviated treatment time to prevent overlapping into subsequent reservations.</li>
            <li><strong className="text-brand-primary">Late Cancellation Fee:</strong> Cancellations made within 24 hours of the scheduled start time will invoke a 50% reservation release fee. No-shows are charged the full amount.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="terms-sec-3" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-brand-secondary" /> 3. Chemical Treatments & Diagnostics
          </h2>
          <p>
            Our master colorists and therapists employ pure botanical, premium, low-chemical materials. However, certain complex hair bleach transformations, highlights, or skin exfoliations carry organic risks:
          </p>
          <p className="border-l-2 border-brand-secondary pl-4 font-serif-italic text-sm italic text-brand-primary bg-brand-surface-muted/30 p-3">
            Clients are required to disclose all past allergies, scalp skin sensitivities, and previous synthetic chemical dye histories prior to any major service. Musha Empire is not liable for structural fiber breakages or skin reactions resulting from undisclosed past histories.
          </p>
        </section>

        {/* Section 4 */}
        <section id="terms-sec-4" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium">
            4. Royal Club Membership Terms
          </h2>
          <p>
            Silver, Gold, and Platinum memberships are personal, non-transferable, and auto-renew on their monthly or yearly cycle dates. Members may easily suspend or cancel billing from their portal dashboard at least 48 hours prior to the next billing cycle. Benefits do not carry cash redemption values.
          </p>
        </section>

        {/* Section 5 */}
        <section id="terms-sec-5" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium">
            5. Limitation of Liability & Scope
          </h2>
          <p>
            While we take ultimate safety precautions to secure guest garments during hair washes, we are not liable for incidental splashes or damage to delicate luxury apparel that is not stored inside our complimentary cloakroom protection bags.
          </p>
        </section>

        {/* Section 6 */}
        <section id="terms-sec-6" className="space-y-3 pt-4 border-t border-brand-accent/20">
          <h2 className="font-serif text-lg text-brand-primary font-medium">
            6. Inquiries and Dispute Resolution
          </h2>
          <p>
            Any disputes regarding salon attendance, styling issues, or reservation billing anomalies will be handled with highest empathy by our Operations Director. Please address formal complaints directly to: <a href="mailto:operations@mushaempire.com" className="text-brand-gold-dark hover:underline">operations@mushaempire.com</a>.
          </p>
        </section>

      </article>
    </div>
  );
}
