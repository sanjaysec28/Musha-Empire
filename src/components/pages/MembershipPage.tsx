/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, X, ShieldCheck, CreditCard, Award, Crown, HelpCircle } from 'lucide-react';
import Button from '../ui/Button';

interface Plan {
  id: string;
  name: string;
  tier: 'silver' | 'gold' | 'platinum';
  tagline: string;
  price: { monthly: number; yearly: number };
  popular: boolean;
  features: string[];
}

interface ComparisonRow {
  benefit: string;
  silver: string | boolean;
  gold: string | boolean;
  platinum: string | boolean;
}

export default function MembershipPage({
  onSubscribe,
}: {
  onSubscribe: (planName: string, billing: 'monthly' | 'yearly') => void;
}) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: Plan[] = [
    {
      id: 'plan-silver',
      name: 'Silver Shield',
      tier: 'silver',
      tagline: 'Essential high-end maintenance for the modern professional.',
      price: { monthly: 45, yearly: 450 }, // 450 is 15% off (£540 value)
      popular: false,
      features: [
        '1 Complimentary Master Cut or Shave per month',
        '10% ongoing privilege discount on all additional styling',
        'Early invitation to seasonal botanical releases',
        'Unlimited specialty single-estate tea/champagne bar',
        'Basic scalp camera health diagnostics (bi-annually)',
      ],
    },
    {
      id: 'plan-gold',
      name: 'Gold Crown',
      tier: 'gold',
      tagline: 'Our recommended suite. Deep restorative care & elite privileges.',
      price: { monthly: 95, yearly: 950 }, // 950 is 15% off (£1140 value)
      popular: true,
      features: [
        '2 Complimentary Master Cuts, Shaves, or Blowouts per month',
        '1 Premium Scalp Spa or Steam Sauna treatment per month',
        '15% ongoing privilege discount on all extra services',
        'Priority same-day standby slots & emergency booking line',
        'Advanced genetic fiber diagnostics & digital health logs',
        'Complimentary companion beverage pass',
      ],
    },
    {
      id: 'plan-platinum',
      name: 'Platinum Sovereign',
      tier: 'platinum',
      tagline: 'The ultimate bespoke crown. Total isolation & absolute priority.',
      price: { monthly: 195, yearly: 1950 }, // 1950 is 15% off (£2340 value)
      popular: false,
      features: [
        'Unlimited master styling & sculpting services',
        'Unlimited aromatherapy steam saunas & hot stone spa sessions',
        '20% ongoing privilege discount on all custom therapies',
        'Guaranteed next-hour emergency booking & master priority',
        'Exclusive booking rights to our isolated VIP Golden Cabin',
        'Bespoke luxury grooming gift hamper (annually)',
        'Full multi-user family proxy sharing benefits',
      ],
    },
  ];

  const comparisonTable: ComparisonRow[] = [
    { benefit: 'Master Cuts & Blowouts', silver: '1 per month', gold: '2 per month', platinum: 'Unlimited' },
    { benefit: 'Spa Steam & Sauna access', silver: false, gold: '1 per month', platinum: 'Unlimited' },
    { benefit: 'Atelier Privilege Discount', silver: '10%', gold: '15%', platinum: '20%' },
    { benefit: 'VIP Private Cabin Booking', silver: false, gold: '10% discount', platinum: 'Complimentary' },
    { benefit: 'Scalp Health Diagnostics', silver: 'Basic (Bi-annual)', gold: 'Advanced (Quarterly)', platinum: 'Genetic / Continuous' },
    { benefit: 'Emergency Standby Booking', silver: false, gold: 'Same-day Priority', platinum: 'Guaranteed Next-hour' },
    { benefit: 'Spouse/Family Proxy Booking', silver: false, gold: false, platinum: true },
    { benefit: 'Luxury Botanical Gift Hamper', silver: false, gold: false, platinum: 'Annual Elite Box' },
  ];

  return (
    <div id="membership-page-wrapper" className="pb-24 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <section id="membership-header" className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-brand-secondary block mb-3">
          The Royal Club
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-primary font-bold tracking-tight">
          Elite <span className="font-serif-italic text-brand-gold-dark italic">Privilege Memberships</span>
        </h1>
        <div className="luxury-divider my-6" />
        <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
          Secure consistent crown grooming excellence. Join our private roster of premium club members to unlock continuous wellness therapies, high-tier pricing privileges, and priority emergency booking access.
        </p>
      </section>

      {/* Monthly/Yearly Toggle */}
      <div id="pricing-toggle-container" className="flex items-center justify-center gap-4 mb-16">
        <span className={`font-sans text-xs uppercase tracking-wider transition-colors ${billingCycle === 'monthly' ? 'text-brand-primary font-bold' : 'text-brand-text-muted'}`}>
          Monthly billing
        </span>
        <button
          id="billing-toggle-btn"
          onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
          className="relative h-7 w-14 bg-brand-surface border border-brand-accent rounded-full p-1 transition-colors duration-300 cursor-pointer"
          aria-label="Toggle Billing Cycle"
        >
          <div
            className={`h-5 w-5 bg-brand-secondary rounded-full transition-transform duration-300 ${
              billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex items-center gap-1.5">
          <span className={`font-sans text-xs uppercase tracking-wider transition-colors ${billingCycle === 'yearly' ? 'text-brand-primary font-bold' : 'text-brand-text-muted'}`}>
            Yearly billing
          </span>
          <span className="bg-brand-secondary/15 border border-brand-secondary/35 text-brand-gold-dark text-[9px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-none">
            Save 15%
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <section id="membership-cards-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {plans.map((plan) => {
          const currentPrice = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
          const priceLabel = billingCycle === 'monthly' ? '/mo' : '/yr';

          return (
            <div
              key={plan.id}
              id={plan.id}
              className={`relative bg-brand-surface border flex flex-col justify-between transition-all duration-500 overflow-hidden ${
                plan.popular
                  ? 'border-brand-secondary shadow-2xl md:-translate-y-4'
                  : 'border-brand-accent/25 hover:border-brand-secondary/40'
              }`}
            >
              {/* Popular Tag Ribbon */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-brand-secondary text-brand-primary text-[9px] uppercase tracking-widest font-extrabold px-4 py-1.5">
                  Most Requested
                </div>
              )}

              {/* Top Details */}
              <div className="p-8 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {plan.tier === 'silver' && <ShieldCheck className="h-5 w-5 text-brand-text-muted" />}
                    {plan.tier === 'gold' && <Award className="h-5 w-5 text-brand-secondary" />}
                    {plan.tier === 'platinum' && <Crown className="h-5 w-5 text-brand-gold-dark" />}
                    <h3 className="font-serif text-2xl text-brand-primary font-bold">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline text-brand-primary">
                  <span className="font-serif text-4xl sm:text-5xl font-bold">£{currentPrice}</span>
                  <span className="font-sans text-xs text-brand-text-muted ml-1">{priceLabel}</span>
                </div>

                <div className="luxury-divider" />

                {/* Features checklists */}
                <ul className="space-y-3.5 pt-2">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-sans text-brand-text-muted leading-relaxed">
                      <Check className="h-4 w-4 text-brand-secondary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe Trigger button */}
              <div className="p-8 sm:p-10 pt-0">
                <Button
                  id={`subscribe-btn-${plan.tier}`}
                  variant={plan.popular ? 'secondary' : 'outline'}
                  size="md"
                  className="w-full uppercase tracking-widest text-[11px]"
                  onClick={() => onSubscribe(plan.name, billingCycle)}
                >
                  Acquire Privilege Card
                </Button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Comparison Table Section */}
      <section id="membership-comparison" className="border border-brand-accent/25 bg-brand-surface overflow-hidden">
        <div className="p-6 md:p-8 border-b border-brand-accent/20 bg-brand-surface-muted/30">
          <h2 className="font-serif text-2xl text-brand-primary font-bold">
            Privilege Tier Comparison
          </h2>
          <p className="font-sans text-xs text-brand-text-muted mt-1">
            Compare specific features side-by-side to determine your optimum level of continuous crown care.
          </p>
        </div>

        {/* Responsive Table overflow wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-brand-accent/20 bg-brand-surface-muted/10">
                <th className="p-4 pl-6 font-semibold uppercase tracking-wider text-brand-primary w-2/5">Tier Benefit</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-brand-text-muted w-1/5">Silver Shield</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-brand-secondary w-1/5">Gold Crown</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-brand-gold-dark w-1/5">Platinum Sovereign</th>
              </tr>
            </thead>
            <tbody>
              {comparisonTable.map((row, idx) => (
                <tr
                  key={idx}
                  id={`comp-row-${idx}`}
                  className="border-b border-brand-accent/15 hover:bg-brand-surface-muted/20 transition-colors"
                >
                  <td className="p-4 pl-6 font-medium text-brand-primary font-serif text-sm">
                    {row.benefit}
                  </td>
                  
                  {/* Silver */}
                  <td className="p-4 text-brand-text-muted">
                    {typeof row.silver === 'boolean' ? (
                      row.silver ? <Check className="h-4 w-4 text-brand-secondary" /> : <X className="h-4 w-4 text-brand-text-muted/30" />
                    ) : (
                      row.silver
                    )}
                  </td>

                  {/* Gold */}
                  <td className="p-4 text-brand-primary font-semibold">
                    {typeof row.gold === 'boolean' ? (
                      row.gold ? <Check className="h-4 w-4 text-brand-secondary" /> : <X className="h-4 w-4 text-brand-text-muted/30" />
                    ) : (
                      row.gold
                    )}
                  </td>

                  {/* Platinum */}
                  <td className="p-4 text-brand-gold-dark font-extrabold bg-brand-gold-light/20">
                    {typeof row.platinum === 'boolean' ? (
                      row.platinum ? <Check className="h-4.5 w-4.5 text-brand-gold-dark" /> : <X className="h-4 w-4 text-brand-text-muted/30" />
                    ) : (
                      row.platinum
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Member Frequently Asked questions notice */}
      <section id="membership-faq-notice" className="mt-16 text-center max-w-xl mx-auto space-y-4">
        <h4 className="font-serif text-lg text-brand-primary font-medium flex items-center justify-center gap-2">
          <HelpCircle className="h-5 w-5 text-brand-secondary" /> Membership Guarantee
        </h4>
        <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
          Memberships operate on a flexible cancel-anytime policy. You can change plans or suspend billing cycle from your customer dashboard portal or by speaking directly with the Concierge desk at any time.
        </p>
      </section>
    </div>
  );
}
