/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, Crown, Shield, Award, ArrowRight, Zap, Star } from 'lucide-react';
import Button from '../ui/Button';
import { Modal } from '../ui/Overlay';

interface DashboardMembershipProps {
  id: string;
  activePlan: 'Silver' | 'Royal Elite' | 'Imperial Gold' | 'None';
  renewalDate: string;
  walletBalance: number;
  onUpgradePlan: (newPlan: 'Silver' | 'Royal Elite' | 'Imperial Gold', price: number) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
  startDate?: string;
  expiryDate?: string;
  remainingDays?: number;
  status?: string;
}

export default function DashboardMembership({
  id,
  activePlan,
  renewalDate,
  walletBalance,
  onUpgradePlan,
  triggerToast,
  startDate = 'N/A',
  expiryDate = 'N/A',
  remainingDays = 365,
  status = 'Active'
}: DashboardMembershipProps) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const planTiers = [
    {
      name: 'Silver' as const,
      price: 0,
      period: 'lifetime',
      description: 'Standard luxury entry tier with essential booking priorities.',
      benefits: [
        'Advanced booking window up to 14 days',
        'Complimentary designer cologne splash on cut treatments',
        'Collect standard 10x Loyalty Points on services',
        'Access to basic mobile ticketing ticket desk'
      ],
      icon: Star,
      bg: 'bg-brand-surface'
    },
    {
      name: 'Royal Elite' as const,
      price: 150,
      period: 'year',
      description: 'Our most popular mid-tier upgrade for high-society gentlemen & ladies.',
      benefits: [
        'Extended booking window up to 45 days',
        'Complimentary Master Hair Spa treatment once per quarter',
        'Earn 15x Loyalty Points on services & items (1.5x boost)',
        'Private Sovereign Suite booking availability with beverage lounge',
        'Priority same-day rescheduling approvals (no penalties)'
      ],
      icon: Award,
      bg: 'bg-brand-gold-light border-brand-secondary/40'
    },
    {
      name: 'Imperial Gold' as const,
      price: 300,
      period: 'year',
      description: 'Absolute ultimate pinnacle of privilege. Exclusive, tailored, peerless.',
      benefits: [
        'Unlimited advanced booking window (1-year horizon)',
        'Unlimited complimentary hair spa upgrades on any cut',
        'Earn 20x Loyalty Points (2x boost matching elite tier)',
        'Private Imperial VIP lounge room access with complimentary bar',
        'Personal dedicated Concierge text-line coordinator',
        'Complimentary premium hair & beard grooming care gift-boxes'
      ],
      icon: Crown,
      bg: 'bg-gradient-to-br from-[#121212] to-[#1E1E1E] text-brand-text border-brand-secondary/60'
    }
  ];

  const handleUpgradeConfirm = () => {
    if (!selectedPlan) return;

    if (activePlan === selectedPlan.name) {
      triggerToast('info', 'Active Plan Selected', `You are already enrolled in the "${selectedPlan.name}" plan.`);
      setSelectedPlan(null);
      return;
    }

    if (walletBalance < selectedPlan.price) {
      triggerToast(
        'error',
        'Insufficient Wallet Balance',
        `Upgrade costs $${selectedPlan.price}. Please fund your Empire Wallet with $${(selectedPlan.price - walletBalance).toFixed(2)} to activate.`
      );
      setSelectedPlan(null);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onUpgradePlan(selectedPlan.name, selectedPlan.price);
      triggerToast(
        'success',
        'Membership Level Upgraded!',
        `Congratulations! You are now a verified "${selectedPlan.name}" privilege member.`
      );
      setSelectedPlan(null);
    }, 1800);
  };

  return (
    <div id={id} className="space-y-6">
      
      {/* Active Plan Detail Box */}
      <motion.div
        id={`${id}-active-detail`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-surface border border-brand-accent p-6 md:p-8 hover:border-brand-secondary/30 transition-all duration-300 relative group"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-surface-muted pb-5">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary font-bold block">
              YOUR PRIVILEGE ENROLLMENT
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Crown className="h-5.5 w-5.5 text-brand-secondary" />
              <h2 className="font-serif text-3.5xl font-semibold text-brand-primary">
                {activePlan === 'None' ? 'Standard Guest' : activePlan}
              </h2>
            </div>
            {activePlan !== 'None' && (
              <p className="font-sans text-xs text-brand-text-muted mt-1.5">
                Subscription renewal scheduled: <strong className="text-brand-primary">{renewalDate}</strong>
              </p>
            )}
          </div>

          <div className="bg-brand-gold-light border border-brand-secondary/25 text-brand-gold-dark font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-2.5">
            STATUS: ACTIVE & VALID
          </div>
        </div>

        {/* Membership Info Grid */}
        {activePlan !== 'None' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-brand-surface-muted">
            <div className="bg-brand-bg/40 p-4 border border-brand-accent">
              <span className="font-mono text-[8px] uppercase tracking-wider text-brand-text-muted font-bold block">START DATE</span>
              <span className="font-serif text-sm font-semibold text-brand-primary mt-1 block">{startDate}</span>
            </div>
            <div className="bg-brand-bg/40 p-4 border border-brand-accent">
              <span className="font-mono text-[8px] uppercase tracking-wider text-brand-text-muted font-bold block">EXPIRY DATE</span>
              <span className="font-serif text-sm font-semibold text-brand-primary mt-1 block">{expiryDate}</span>
            </div>
            <div className="bg-brand-bg/40 p-4 border border-brand-accent">
              <span className="font-mono text-[8px] uppercase tracking-wider text-brand-text-muted font-bold block">REMAINING DAYS</span>
              <span className="font-serif text-lg font-bold text-brand-secondary mt-1 block">{remainingDays} Days</span>
            </div>
            <div className="bg-brand-bg/40 p-4 border border-brand-accent">
              <span className="font-mono text-[8px] uppercase tracking-wider text-brand-text-muted font-bold block">TIER STATUS</span>
              <span className="font-sans text-xs font-bold uppercase text-brand-secondary mt-1.5 block flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {status}
              </span>
            </div>
          </div>
        )}

        {/* Benefits lists of active tier */}
        <div className="mt-6">
          <h4 className="font-serif text-base font-semibold text-brand-primary mb-3.5">
            Active Privileges & Amenities
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(planTiers.find((t) => t.name === activePlan) || planTiers[0]).benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs font-sans text-brand-text">
                <div className="h-5 w-5 bg-brand-gold-light text-brand-gold-dark border border-brand-secondary/25 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tiers Upgrade Grid */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-brand-primary flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-brand-secondary" /> Elevate Your Privilege Level
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {planTiers.map((tier) => {
            const isCurrent = activePlan === tier.name;
            const PlanIcon = tier.icon;
            
            return (
              <div
                key={tier.name}
                className={`border p-6 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 relative group ${tier.bg} ${
                  isCurrent ? 'border-brand-secondary' : 'border-brand-accent shadow-sm'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-secondary text-brand-primary font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                    CURRENTLY ACTIVE
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-10 w-10 bg-brand-surface border border-brand-accent flex items-center justify-center text-brand-secondary">
                      <PlanIcon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-2xl font-bold">
                        ${tier.price}
                      </span>
                      <span className="font-sans text-[10px] text-brand-text-muted block">
                        / {tier.period}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-serif text-xl font-medium text-brand-primary block">
                    {tier.name} Tier
                  </h4>
                  <p className="font-sans text-xs text-brand-text-muted mt-1 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="luxury-divider my-4" />

                  {/* Benefit Checkboxes */}
                  <div className="space-y-2.5">
                    {tier.benefits.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 text-xs font-sans">
                        <Check className="h-4 w-4 text-brand-secondary flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-brand-surface-muted/40 mt-6 pt-4">
                  <Button
                    id={`upgrade-plan-trigger-${tier.name}`}
                    variant={isCurrent ? 'outline' : tier.name === 'Imperial Gold' ? 'secondary' : 'primary'}
                    size="md"
                    onClick={() => setSelectedPlan(tier)}
                    disabled={isCurrent}
                    className="w-full font-sans text-[10px] uppercase tracking-widest font-bold py-3"
                  >
                    {isCurrent ? 'Enrollment Active' : `Enroll for $${tier.price}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==============================================
          CONFIRM UPGRADE ENROLLMENT DIALOG
          ============================================== */}
      <Modal
        id="upgrade-privilege-confirm-modal"
        isOpen={selectedPlan !== null}
        onClose={() => setSelectedPlan(null)}
        title="Elevate Account Status"
        size="sm"
      >
        {selectedPlan && (
          <div className="space-y-4 pt-2 pb-4 text-center">
            <div className="h-12 w-12 bg-brand-gold-light text-brand-gold-dark border border-brand-secondary/35 flex items-center justify-center mx-auto rounded-none">
              <Crown className="h-6 w-6" />
            </div>

            <div>
              <p className="font-serif text-lg font-semibold text-brand-primary">Authorize Subscription Upgrade?</p>
              <p className="font-sans text-xs text-brand-text-muted max-w-sm mx-auto mt-2 leading-relaxed">
                Do you wish to authorize enrollment in the <strong className="text-brand-primary">{selectedPlan.name} Plan</strong>?
              </p>
              <p className="font-serif text-lg font-bold text-brand-gold-dark mt-3.5">
                Price: ${selectedPlan.price.toFixed(2)}
              </p>
              <p className="font-sans text-[10px] text-brand-text-muted mt-1">
                Amount will be deducted directly from your Empire Wallet.
              </p>
              <div className="bg-brand-surface-muted border border-brand-accent p-2.5 mt-3 text-xs font-sans text-brand-text flex justify-between">
                <span>Your Wallet Balance:</span>
                <strong>${walletBalance.toFixed(2)}</strong>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-3 border-t border-brand-surface-muted">
              <Button
                id="upgrade-deny-btn"
                variant="outline"
                size="md"
                onClick={() => setSelectedPlan(null)}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary flex-1"
              >
                Cancel
              </Button>
              <Button
                id="upgrade-approve-btn"
                variant="primary"
                size="md"
                onClick={handleUpgradeConfirm}
                isLoading={isProcessing}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold flex-1"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
