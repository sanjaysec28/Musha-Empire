/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Gift, Clock, ShieldAlert, CheckCircle, Tag, Copy, Check, Info } from 'lucide-react';
import { offersRepository } from '../../lib/firestoreService';
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
  const [firestoreOffers, setFirestoreOffers] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    offersRepository.getActiveOffers().then((records) => {
      if (!isMounted) return;
      if (records && records.length > 0) {
        const mapped: PromotionItem[] = records.map((o) => ({
          id: o.id,
          category: 'limited',
          title: o.title,
          badge: o.discount || 'Special Privilege',
          description: o.description,
          promoCode: o.code || 'ROYAL',
          expires: o.valid_until || o.validUntil || o.end_date || 'Ongoing Privilege',
          features: [o.description],
          terms: 'Subject to salon reservation availability.',
          image: o.image_url || o.imageUrl || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
        }));
        setFirestoreOffers(mapped);
      } else {
        setFirestoreOffers([]);
      }
    }).catch(err => {
      console.warn('Notice reading offers from Firestore:', err);
      if (isMounted) setFirestoreOffers([]);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const filters = [
    { value: 'all', label: 'All Privileges' },
    { value: 'limited', label: 'Limited Time' },
    { value: 'combo', label: 'Curated Combos' },
    { value: 'festival', label: 'Seasonal Festive' },
    { value: 'first-visit', label: 'Welcome Incentives' },
    { value: 'member', label: 'Member Specials' },
  ];

  const activePromotions = firestoreOffers;
  const filteredPromotions = activeFilter === 'all'
    ? activePromotions
    : activePromotions.filter((promo) => promo.category === activeFilter);

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
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-primary font-bold tracking-tight">
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
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="h-8 w-8 border-2 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin mx-auto" />
            <p className="font-sans text-xs uppercase tracking-widest text-brand-secondary">Retrieving Seasonal Privileges...</p>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/40 space-y-3 max-w-xl mx-auto">
            <Sparkles className="h-8 w-8 text-brand-secondary/60 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-primary">No active offers available yet</h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
              Our seasonal packages and privileges are currently being refreshed. Please consult our concierge desk for ongoing membership benefits.
            </p>
          </div>
        ) : (
          filteredPromotions.map((promo, idx) => (
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
                    <h3 className="font-serif text-2xl sm:text-3xl text-brand-primary font-bold">
                      {promo.title}
                    </h3>
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
          ))
        )}
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
