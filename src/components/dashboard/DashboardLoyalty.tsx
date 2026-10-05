/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, Trophy, Check, ArrowRight, Shield, Zap, Gift } from 'lucide-react';
import { LoyaltyRewardItem } from './types';
import Button from '../ui/Button';
import { Modal } from '../ui/Overlay';

interface DashboardLoyaltyProps {
  id: string;
  loyaltyPoints: number;
  availableRewards: LoyaltyRewardItem[];
  onClaimReward: (rewardId: string, pointsCost: number) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function DashboardLoyalty({
  id,
  loyaltyPoints,
  availableRewards,
  onClaimReward,
  triggerToast
}: DashboardLoyaltyProps) {
  const [selectedReward, setSelectedReward] = useState<LoyaltyRewardItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Loyalty Progression Calculations
  // Gold Tier is between 1000 - 2500 points. Let's make a beautiful progress bar
  const currentTier = 'Gold Elite';
  const nextTier = 'Platinum Sovereign';
  const minPoints = 1000;
  const maxPoints = 2500;
  const pointsRemaining = maxPoints - loyaltyPoints;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((loyaltyPoints - minPoints) / (maxPoints - minPoints)) * 100)
  );

  const handleClaimSubmit = (reward: LoyaltyRewardItem) => {
    if (loyaltyPoints < reward.pointsCost) {
      triggerToast(
        'error',
        'Insufficient Points',
        `You require ${reward.pointsCost - loyaltyPoints} more loyalty points to claim this reward.`
      );
      setSelectedReward(null);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onClaimReward(reward.id, reward.pointsCost);
      triggerToast(
        'success',
        'Reward Claimed Successfully',
        `The reward "${reward.title}" has been successfully unlocked. Present the voucher details at the salon desk.`
      );
      setSelectedReward(null);
    }, 1500);
  };

  return (
    <div id={id} className="space-y-6">
      
      {/* Loyalty Status Card */}
      <motion.div
        id={`${id}-loyalty-banner`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-surface border border-brand-accent p-6 md:p-8 hover:border-brand-secondary/30 transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-secondary inline-flex items-center gap-1.5 mb-2">
              <Award className="h-3.5 w-3.5" /> EMPIRE PATRON REWARDS
            </span>
            <h2 className="font-serif text-3xl font-medium text-brand-primary">
              Privilege Tier: {currentTier}
            </h2>
            <p className="font-sans text-xs text-brand-text-muted mt-1 leading-relaxed max-w-md">
              Earn 10 points for every dollar spent on high-end beauty cuts, bespoke royal spas, and salon retail products.
            </p>
          </div>

          <div className="bg-brand-surface-muted text-brand-text px-6 py-4 border border-brand-secondary/15 text-center min-w-[150px]">
            <span className="font-sans text-[10px] uppercase tracking-widest text-brand-secondary font-bold block">
              TOTAL POINTS
            </span>
            <span className="font-serif text-3xl font-bold block mt-1 text-white">
              {loyaltyPoints} PTS
            </span>
          </div>
        </div>

        {/* Premium Progress Bar */}
        <div className="space-y-2 border-t border-brand-surface-muted pt-5">
          <div className="flex justify-between items-center text-xs font-sans">
            <span className="font-semibold text-brand-text flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-brand-secondary" /> {currentTier}
            </span>
            <span className="text-brand-text-muted">
              {pointsRemaining} points to <strong className="text-brand-primary">{nextTier}</strong>
            </span>
          </div>

          <div className="h-2 bg-brand-surface-muted border border-brand-accent/30 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gold-gradient"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-brand-text-muted">
            <span>{minPoints} PTS</span>
            <span>{maxPoints} PTS</span>
          </div>
        </div>
      </motion.div>

      {/* Available Rewards Catalog */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-brand-primary flex items-center gap-2">
          <Gift className="h-4.5 w-4.5 text-brand-secondary" /> Redeem Exclusive Voucher Vouchers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRewards.map((reward) => {
            const hasEnough = loyaltyPoints >= reward.pointsCost;
            return (
              <div
                key={reward.id}
                className="bg-brand-surface border border-brand-accent p-5 flex flex-col justify-between hover:border-brand-secondary/40 transition-all duration-300 relative group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="bg-brand-surface-muted text-brand-text-muted font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 border border-brand-accent">
                      {reward.category}
                    </span>
                    <span className="font-serif text-sm font-bold text-brand-gold-dark bg-brand-gold-light border border-brand-secondary/20 px-2.5 py-0.5">
                      {reward.pointsCost} PTS
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-medium text-brand-primary mt-3">
                    {reward.title}
                  </h4>
                  <p className="font-sans text-xs text-brand-text-muted mt-1 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="border-t border-brand-surface-muted mt-5 pt-3.5 flex justify-end items-center">
                  <Button
                    id={`claim-reward-trigger-${reward.id}`}
                    variant={hasEnough ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedReward(reward)}
                    disabled={!hasEnough}
                    className="font-sans text-[10px] uppercase tracking-wider font-semibold py-2"
                  >
                    {hasEnough ? 'Redeem Voucher' : 'Locked (Low Points)'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==============================================
          CONFIRM CLAIM REWARD DIALOG POPUP
          ============================================== */}
      <Modal
        id="loyalty-claim-confirm-modal"
        isOpen={selectedReward !== null}
        onClose={() => setSelectedReward(null)}
        title="Confirm Reward Redemption"
        size="sm"
      >
        {selectedReward && (
          <div className="space-y-4 pt-2 pb-4 text-center">
            <div className="h-12 w-12 bg-brand-gold-light text-brand-gold-dark border border-brand-secondary/30 flex items-center justify-center mx-auto rounded-none">
              <Trophy className="h-5 w-5" />
            </div>

            <div>
              <p className="font-serif text-lg font-semibold text-brand-primary">Redeem loyalty voucher?</p>
              <p className="font-sans text-xs text-brand-text-muted max-w-sm mx-auto mt-2 leading-relaxed">
                Are you sure you wish to swap <strong className="text-brand-primary">{selectedReward.pointsCost} loyalty points</strong> to unlock <strong className="text-brand-primary">"{selectedReward.title}"</strong>?
              </p>
              <p className="font-mono text-[9px] text-brand-gold-dark font-bold mt-2.5 bg-brand-gold-light border border-brand-secondary/25 p-2 uppercase">
                Remaining Balance: {loyaltyPoints - selectedReward.pointsCost} PTS
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-3 border-t border-brand-surface-muted">
              <Button
                id="loyalty-deny-btn"
                variant="outline"
                size="md"
                onClick={() => setSelectedReward(null)}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary flex-1"
              >
                Discard
              </Button>
              <Button
                id="loyalty-approve-btn"
                variant="primary"
                size="md"
                onClick={() => handleClaimSubmit(selectedReward)}
                isLoading={isProcessing}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold flex-1"
              >
                Yes, Claim Reward
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
