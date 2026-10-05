/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Gift, Clock, ShieldAlert, CheckCircle, Tag, Copy, Check, Info } from 'lucide-react';
import Button from '../ui/Button';

interface PromotionItem {
  id: string;
  category: 'limited' | 'combo' | 'festival' | 'first-visit' | 'member';
  title: string;
  badge: string;
  description: string;
  price?: { original: string; promotional: string };
  bonusValue?: string;
  promoCode: string;
  expires: string;
  features: string[];
  terms: string;
  image: string;
}

export default function OffersPage({
  onBookClick,
  triggerToast,
}: {
  onBookClick: (serviceId?: string) => void;
  triggerToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'limited' | 'combo' | 'festival' | 'first-visit' | 'member'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filters = [
    { value: 'all', label: 'All Privileges' },
    { value: 'limited', label: 'Limited Time' },
    { value: 'combo', label: 'Curated Combos' },
    { value: 'festival', label: 'Seasonal Festive' },
    { value: 'first-visit', label: 'Welcome Incentives' },
    { value: 'member', label: 'Member Specials' },
  ];

  const promotions: PromotionItem[] = [
    {
      id: 'promo-1',
      category: 'limited',
      title: 'Summer Solstice Hair & Scalp Nourish',
      badge: 'Solstice Special',
      description: 'An advanced thermal UV-protection therapy designed to hydrate summer-bleached fibers and purify the scalp pores.',
      price: { original: '£140', promotional: '£95' },
      promoCode: 'SOLSTICE95',
      expires: 'August 31, 2026',
      features: [
        'Aromatic lavender water hair steam prep',
        'Botanical hydration hair masque infusing vitamins A & E',
        'Cranial acupressure oil massage (20 mins)',
        'Take-home UV restorative travel mist bottle',
      ],
      terms: 'Subject to weekday availability. Cannot be paired with external discount vouchers.',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'promo-2',
      category: 'combo',
      title: 'The Royal Sovereign Grooming Experience',
      badge: 'Crown Combo',
      description: 'Our ultimate multi-service package designed to restore skeletal symmetry, facial skin hydration, and mental calm.',
      price: { original: '£260', promotional: '£195' },
      promoCode: 'SOVEREIGN195',
      expires: 'December 31, 2026',
      features: [
        'Couture haircut & style by an Academy master stylist',
        'Premium hot-towel double shave or deep beard sculpting',
        'Charcoal steam extraction facial & collagen eye patch',
        'Organic ginger tea & champagne flute service',
      ],
      terms: 'Requires a 2.5-hour reservation window. Recommended to book 1 week in advance.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'promo-3',
      category: 'festival',
      title: 'Golden Hour Wedding & Gala Suite Prep',
      badge: 'Festival Suite',
      description: 'Prepare for gala season or wedding events inside our private executive cabin with bespoke photography-safe styling.',
      bonusValue: '£80 Complimentary Value',
      promoCode: 'GOLDENGALA',
      expires: 'Ongoing Seasonal',
      features: [
        'Premium trial consultation & design sketching (1 week prior)',
        'Gala-day hair-up or deep-wave couture blow dry',
        'HD airbrush makeup session with custom eyelash application',
        'Complimentary signature gel manicure treatment',
      ],
      terms: 'Valid only for verified events. Private suite booking is subject to matching cabin availability.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'promo-4',
      category: 'first-visit',
      title: 'First-Visit Welcome Privilege Invitation',
      badge: 'Welcome Gift',
      description: 'We welcome you to our sanctuary. Experience our unique aesthetic diagnostic process and luxurious treatment standards.',
      bonusValue: '15% Off Total + Free Scalp Diagnostics',
      promoCode: 'WELCOMEEMPIRE',
      expires: 'No Expiry',
      features: [
        'Detailed diagnostic fiber camera analysis report',
        '15% discount on your first major chemical or styling service',
        'Complimentary lavender scalp detox treatment upgrade',
        'Take-home custom hair care sample pouch',
      ],
      terms: 'Valid strictly for new clients on their maiden reservation with Musha Empire.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'promo-5',
      category: 'member',
      title: 'Royal Club Member: Private Suite Privilege',
      badge: 'Member Exclusive',
      description: 'An exclusive bonus designed for Silver, Gold, and Platinum active card holders to experience elite isolation.',
      bonusValue: 'Free Private Cabin Upgrade',
      promoCode: 'MEMBERSUITE',
      expires: 'Active Membership Only',
      features: [
        'Free upgrade to our acoustically isolated VIP Golden Cabin',
        'Complimentary single-estate ceremonial matcha tea service',
        'Personalised smart lighting & air purifier controls',
        'Early-priority access to emergency stylist slots',
      ],
      terms: 'Must present active digital wallet card or dashboard portal credential on entry.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const filteredPromotions = activeFilter === 'all'
    ? promotions
    : promotions.filter((promo) => promo.category === activeFilter);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    if (triggerToast) {
      triggerToast('success', 'Promo Code Copied!', `"${code}" has been saved to your clipboard.`);
    }
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div id="offers-page-wrapper" className="pb-24 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <section id="offers-header" className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-brand-secondary block mb-3">
          Atelier Privileges
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-primary font-light tracking-tight">
          Bespoke <span className="font-serif-italic text-brand-gold-dark italic">Promotional Vouchers</span>
        </h1>
        <div className="luxury-divider my-6" />
        <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
          Explore our collection of limited seasonal events, luxury multi-treatment bundles, and exclusive membership rewards designed to ensure uncompromised elegance.
        </p>
      </section>

      {/* Filter Tabs */}
      <section id="offers-filters" className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-16">
        {filters.map((f) => (
          <button
            key={f.value}
            id={`offers-filter-${f.value}`}
            onClick={() => setActiveFilter(f.value as any)}
            className={`px-5 py-2.5 font-sans text-[10px] md:text-xs uppercase tracking-widest font-semibold border transition-all duration-300 rounded-none cursor-pointer ${
              activeFilter === f.value
                ? 'bg-brand-primary border-brand-primary text-brand-bg font-bold'
                : 'bg-brand-surface border-brand-accent/25 text-brand-text hover:border-brand-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </section>

      {/* Promotions Cards Grid */}
      <section id="offers-grid" className="space-y-12">
        {filteredPromotions.map((promo, idx) => (
          <div
            key={promo.id}
            id={promo.id}
            className="group bg-brand-surface border border-brand-accent/25 hover:border-brand-secondary/40 transition-all duration-500 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Promo Image & Badge */}
            <div className="lg:col-span-4 relative overflow-hidden h-[240px] lg:h-auto min-h-[240px]">
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-102 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-brand-primary border border-brand-secondary/40 text-brand-bg text-[10px] uppercase tracking-widest px-4 py-1.5 font-sans font-semibold">
                {promo.badge}
              </div>
            </div>

            {/* Promo Details */}
            <div className="lg:col-span-8 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-brand-primary font-light">
                    {promo.title}
                  </h3>
                  {/* Pricing Box */}
                  {promo.price ? (
                    <div className="flex items-baseline gap-2 shrink-0">
                      <span className="font-sans text-xs text-brand-text-muted line-through">
                        {promo.price.original}
                      </span>
                      <span className="font-serif text-2xl text-brand-gold-dark font-medium">
                        {promo.price.promotional}
                      </span>
                    </div>
                  ) : promo.bonusValue ? (
                    <div className="font-serif text-lg text-brand-gold-dark font-medium bg-brand-gold-light/50 border border-brand-secondary/20 px-3 py-1 text-center whitespace-nowrap">
                      {promo.bonusValue}
                    </div>
                  ) : null}
                </div>

                <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
                  {promo.description}
                </p>

                {/* Features list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-2 border-t border-brand-accent/15">
                  {promo.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs font-sans text-brand-text-muted">
                      <CheckCircle className="h-4 w-4 text-brand-secondary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo code actions & footer */}
              <div className="mt-8 pt-6 border-t border-brand-accent/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-brand-text-muted">
                    <Clock className="h-3.5 w-3.5" /> Expires: <span className="text-brand-primary">{promo.expires}</span>
                  </div>
                  <p className="text-[9px] text-brand-text-muted font-sans leading-relaxed flex items-center gap-1 max-w-sm">
                    <ShieldAlert className="h-3 w-3 shrink-0" /> {promo.terms}
                  </p>
                </div>

                {/* Copiable Code field */}
                <div className="flex items-center gap-2">
                  <div className="bg-brand-surface-muted/60 border border-brand-accent/30 p-2 pl-4 pr-3 flex items-center justify-between gap-4">
                    <span className="font-mono text-xs font-bold tracking-widest text-brand-primary">
                      {promo.promoCode}
                    </span>
                    <button
                      id={`copy-btn-${promo.id}`}
                      onClick={() => handleCopyCode(promo.id, promo.promoCode)}
                      className="text-brand-text-muted hover:text-brand-secondary p-1 transition-colors cursor-pointer"
                      title="Copy promo code"
                    >
                      {copiedId === promo.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <Button id={`book-promo-${promo.id}`} variant="primary" size="sm" onClick={() => onBookClick(promo.id)}>
                    Claim Offer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Frequently checked terms */}
      <section id="offers-notes" className="mt-20 bg-brand-surface-muted/40 border border-brand-accent/20 p-8">
        <h4 className="font-serif text-lg text-brand-primary font-medium mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-brand-secondary" /> Royal Privilege Guidelines
        </h4>
        <ul className="space-y-2.5 font-sans text-xs text-brand-text-muted leading-relaxed list-disc pl-5">
          <li>Codes must be specified during the booking reservation wizard or presented directly to the reception concierge before treatment begins.</li>
          <li>Promotional prices do not affect the Royal Club points accrual of active Silver, Gold, or Platinum tier card holders.</li>
          <li>In the event of cancellation or rescheduling, the voucher will remain valid as long as the replacement booking complies with the expiration constraints.</li>
        </ul>
      </section>
    </div>
  );
}
