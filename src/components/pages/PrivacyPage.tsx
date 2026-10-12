/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Calendar, Lock, EyeOff } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div id="privacy-page-wrapper" className="pb-24 pt-8 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <section id="privacy-header" className="mb-12">
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-secondary block mb-2">
          Sanctuary Confidentiality
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold">
          Privacy Policy
        </h1>
        <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-brand-text-muted uppercase tracking-wider">
          <Calendar className="h-3.5 w-3.5 text-brand-secondary" /> Last Updated: June 30, 2026
        </div>
        <div className="luxury-divider mt-6" />
      </section>

      {/* Policy Content */}
      <article id="privacy-article" className="space-y-8 font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed">
        
        <p className="font-medium text-brand-primary">
          At Musha Empire, we believe absolute physical luxury is inextricably linked to absolute data sanctuary. This privacy statement documents how we handle, process, and protect your digital footprint, appointment schedule logs, and botanical health profiles.
        </p>

        {/* Section 1 */}
        <section id="privacy-sec-1" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-brand-secondary" /> 1. Information We Securely Collect
          </h2>
          <p>
            When utilizing our online reservation concierge or enrolling in our Royal Club, we collect essential records to ensure premium service delivery. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-brand-primary">Identity Details:</strong> Full name, biological age, and gender preferences to align cuts with natural crown growth and facial structural geometry.</li>
            <li><strong className="text-brand-primary">Contact Coordinates:</strong> Email addresses and phone numbers utilized strictly for reservation reminders, standby waitlist notifications, and privilege updates.</li>
            <li><strong className="text-brand-primary">Grooming & Skincare Logs:</strong> Custom notes recorded by your master stylist or therapist (e.g., scalp fiber densities, skin hydration indexes, and botanical allergen profiles).</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section id="privacy-sec-2" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-brand-secondary" /> 2. Zero-Third-Party Sharing Guarantee
          </h2>
          <p>
            We strictly enforce a clean-data policy. Your records, personal styling preferences, and booking frequencies are stored inside private encrypted database layers. 
          </p>
          <p className="border-l-2 border-brand-secondary pl-4 font-serif-italic text-sm italic text-brand-primary bg-brand-surface-muted/30 p-3">
            Musha Empire does NOT sell, rent, lease, or share client directory indices or styling records with external marketing aggregates, insurance firms, or commercial retailers. Your privacy is absolute.
          </p>
        </section>

        {/* Section 3 */}
        <section id="privacy-sec-3" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium flex items-center gap-2">
            <EyeOff className="h-4.5 w-4.5 text-brand-secondary" /> 3. Local Storage Caching & Cookies
          </h2>
          <p>
            To deliver frictionless loading speeds and remember your active scheduler states, we utilize standard client-side browser caching mechanisms (such as <code className="font-mono text-xs bg-brand-surface-muted px-1.5 py-0.5 border border-brand-accent text-brand-primary">localStorage</code>). These cache profiles store:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Your list of recently viewed styling treatments.</li>
            <li>Active, un-submitted booking session states.</li>
            <li>Your client profile preferences (e.g. font contrast configurations).</li>
          </ul>
          <p>
            These cookies remain localized to your specific machine browser and can be completely wiped at any turn by clearing your browser cache history.
          </p>
        </section>

        {/* Section 4 */}
        <section id="privacy-sec-4" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium">
            4. Billing Integrity & Payment Processing
          </h2>
          <p>
            Online prepayments, membership renewals, and credit card holds are processed exclusively using secure, PCI-DSS compliant payment gateways (such as Stripe). Musha Empire employees do not store, view, or have access to raw credit card credentials or banking codes.
          </p>
        </section>

        {/* Section 5 */}
        <section id="privacy-sec-5" className="space-y-3">
          <h2 className="font-serif text-lg sm:text-xl text-brand-primary font-medium">
            5. Your Sovereign Data Rights
          </h2>
          <p>
            At any turn, you hold complete sovereignty over your data. You may request our concierge desk to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide a complete, readable export of your styling history file.</li>
            <li>Update or correct old allergen reports or phone numbers.</li>
            <li>Permanently purge your digital client account and wipe all history logs from our secure database servers (the right to be forgotten).</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="privacy-sec-6" className="space-y-3 pt-4 border-t border-brand-accent/20">
          <h2 className="font-serif text-lg text-brand-primary font-medium">
            6. Contact Data Protection Officer
          </h2>
          <p>
            For any queries regarding your data protection, secure encryptions, or data purge requests, please connect directly with our data privacy desk via email: <a href="mailto:privacy@mushaempire.com" className="text-brand-gold-dark hover:underline">privacy@mushaempire.com</a>.
          </p>
        </section>

      </article>
    </div>
  );
}
