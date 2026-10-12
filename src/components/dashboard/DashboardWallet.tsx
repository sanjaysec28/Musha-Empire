/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Tag,
  CreditCard,
  Gift,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { WalletTransaction } from './types';
import Button from '../ui/Button';
import { Modal } from '../ui/Overlay';

interface DashboardWalletProps {
  id: string;
  walletBalance: number;
  transactions: WalletTransaction[];
  onAddFunds: (amount: number) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function DashboardWallet({
  id,
  walletBalance,
  transactions,
  onAddFunds,
  triggerToast
}: DashboardWalletProps) {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  // Form inputs
  const [selectedBundle, setSelectedBundle] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Credit Card mock input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const bundles = [
    { value: 50, bonus: 5, label: 'Bronze Credit' },
    { value: 100, bonus: 15, label: 'Royal Gold Credit' },
    { value: 250, bonus: 45, label: 'Imperial Sovereign' },
    { value: 500, bonus: 100, label: 'Consul Privy Level' },
  ];

  const handleAddFundsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topUpAmount = customAmount ? parseFloat(customAmount) : selectedBundle;

    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      triggerToast('error', 'Invalid Amount', 'Please select a bundle or specify a custom sum.');
      return;
    }

    if (customAmount && (!cardNumber || !cardExpiry || !cardCVC)) {
      triggerToast('error', 'Billing Details Required', 'Please fill out your credit card billing credentials.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onAddFunds(topUpAmount);
      
      const bonusAmount = bundles.find(b => b.value === topUpAmount)?.bonus || 0;
      const totalCredited = topUpAmount + bonusAmount;

      triggerToast(
        'success',
        'Funds Added Successfully',
        `$${topUpAmount.toFixed(2)} funded + $${bonusAmount} royal bonus has been credited to your Empire Wallet.`
      );

      setIsAddFundsOpen(false);
      setCustomAmount('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
    }, 2000);
  };

  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      triggerToast('error', 'Empty Code', 'Please input a valid voucher passcode.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const code = promoCode.toUpperCase().trim();
      
      if (code === 'VIPEMPIRE' || code === 'ROYALTY100' || code === 'CONCIERGE25') {
        let redeemVal = 25;
        if (code === 'ROYALTY100') redeemVal = 100;

        onAddFunds(redeemVal);
        triggerToast(
          'success',
          'Voucher Code Verified',
          `Promo code ${code} is accepted! $${redeemVal} has been deposited in your pre-funded wallet.`
        );
        setIsRedeemOpen(false);
        setPromoCode('');
      } else {
        triggerToast('error', 'Invalid Voucher Token', 'The input promotional passcode is expired or does not exist.');
      }
    }, 1500);
  };

  return (
    <div id={id} className="space-y-6">
      
      {/* Wallet Balance Hero Card */}
      <motion.div
        id={`${id}-balance-banner`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-surface text-brand-text p-8 border border-brand-secondary/15 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#C5A880_1px,transparent_1px),linear-gradient(to_bottom,#C5A880_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary font-semibold block mb-2">
              EMPIRE PRE-PAID CARD
            </span>
            <span className="font-sans text-xs text-brand-text-muted block">Available Balance</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white mt-1">
              ${walletBalance.toFixed(2)}
            </h2>
            <p className="font-sans text-[11px] text-brand-text-muted mt-3 flex items-center gap-1">
              <Gift className="h-3.5 w-3.5 text-brand-secondary" /> Enjoy automatic 5% cashback credits on every premium hair spa treatment.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              id="wallet-add-funds-trigger"
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              onClick={() => setIsAddFundsOpen(true)}
              className="font-sans text-xs uppercase tracking-widest font-bold px-6"
            >
              Add Money
            </Button>
            <Button
              id="wallet-redeem-promo-trigger"
              variant="outline"
              size="md"
              leftIcon={<Tag className="h-4 w-4" />}
              onClick={() => setIsRedeemOpen(true)}
              className="border-brand-secondary/30 text-brand-secondary hover:border-brand-secondary hover:text-white hover:bg-brand-secondary/10 font-sans text-xs uppercase tracking-widest font-semibold"
            >
              Redeem Code
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Transaction History list */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-brand-primary flex items-center gap-2">
          <RefreshCw className="h-4.5 w-4.5 text-brand-secondary" /> Wallet Account Ledger
        </h3>

        <div className="bg-brand-surface border border-brand-accent p-0 overflow-hidden">
          {transactions.length > 0 ? (
            <div className="divide-y divide-brand-surface-muted">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-brand-bg/40 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Icon indicator */}
                    <div
                      className={`h-9 w-9 border flex items-center justify-center rounded-none ${
                        tx.type === 'credit'
                          ? 'bg-emerald-950/25 text-emerald-400 border-emerald-500/20'
                          : 'bg-brand-gold-light text-brand-gold-dark border-brand-secondary/20'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="h-4.5 w-4.5" />
                      ) : (
                        <ArrowUpRight className="h-4.5 w-4.5" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-serif text-sm font-semibold text-brand-primary">
                        {tx.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-brand-text-muted">
                          {tx.id}
                        </span>
                        <span className="text-brand-text-muted font-sans text-[10px]">&bull;</span>
                        <span className="text-brand-text-muted font-sans text-[10px]">{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-serif text-sm font-bold block ${
                        tx.type === 'credit' ? 'text-emerald-600' : 'text-brand-primary'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                    <span className="font-sans text-[9px] text-brand-text-muted uppercase tracking-wider font-semibold">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[220px]">
              <Wallet className="h-8 w-8 text-brand-text-muted mb-3" />
              <p className="font-serif text-base font-semibold text-brand-primary">No Transaction Records</p>
              <p className="font-sans text-xs text-brand-text-muted max-w-xs mt-1">
                Fund your wallet or purchase styling plans to see ledger line activities.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ==============================================
          ADD FUNDS POPUP MODAL SHEET
          ============================================== */}
      <Modal
        id="wallet-add-funds-modal"
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        title="Fund Empire Wallet"
        size="md"
      >
        <form onSubmit={handleAddFundsSubmit} id="add-funds-form" className="space-y-5 pt-2 pb-4">
          <span className="font-sans text-xs uppercase tracking-wider font-semibold text-brand-text block">
            Select Luxury Top-Up Bundle
          </span>

          {/* Bundle choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bundles.map((b) => {
              const isSelected = selectedBundle === b.value && !customAmount;
              return (
                <button
                  key={b.value}
                  type="button"
                  id={`bundle-card-${b.value}`}
                  onClick={() => {
                    setSelectedBundle(b.value);
                    setCustomAmount('');
                  }}
                  className={`p-4 border text-left flex justify-between items-center transition-all duration-300 relative cursor-pointer ${
                    isSelected
                      ? 'border-brand-secondary bg-brand-gold-light shadow-sm'
                      : 'border-brand-accent hover:border-brand-secondary/40 bg-brand-surface'
                  }`}
                >
                  <div>
                    <span className="font-sans text-[10px] uppercase font-bold text-brand-text-muted block">
                      {b.label}
                    </span>
                    <span className="font-serif text-2xl font-bold text-brand-primary mt-1 block">
                      ${b.value}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-brand-secondary text-brand-primary font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                      +${b.bonus} Free
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-brand-surface-muted"></div>
            <span className="flex-shrink mx-3 text-brand-text-muted font-sans text-[10px] uppercase tracking-widest font-semibold">Or enter custom amount</span>
            <div className="flex-grow border-t border-brand-surface-muted"></div>
          </div>

          {/* Custom Amount Field */}
          <div>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-serif text-lg text-brand-primary font-semibold">$</span>
              <input
                id="custom-add-amount"
                type="number"
                placeholder="Specify custom deposit (e.g. 150)"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedBundle(0);
                }}
                className="w-full bg-brand-surface text-brand-text pl-8 pr-4 py-3 font-sans border border-brand-accent focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none font-semibold text-sm"
              />
            </div>
            {customAmount && (
              <p className="text-[10px] font-sans text-brand-gold-dark mt-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Custom deposits get a default 10% complimentary bonus match.
              </p>
            )}
          </div>

          {/* Secure Billing Details */}
          <div className="border-t border-brand-accent pt-4 space-y-3">
            <span className="font-sans text-xs uppercase tracking-wider font-semibold text-brand-text flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-brand-secondary" /> Secure Checkout
            </span>

            <input
              id="billing-card-num"
              type="text"
              placeholder="Card Number (4111 2222 3333 4444)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-brand-surface text-brand-text px-4 py-2.5 font-sans text-xs border border-brand-accent focus:border-brand-secondary outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                id="billing-card-expiry"
                type="text"
                placeholder="Expiry (MM/YY)"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="bg-brand-surface text-brand-text px-4 py-2.5 font-sans text-xs border border-brand-accent focus:border-brand-secondary outline-none"
              />
              <input
                id="billing-card-cvc"
                type="text"
                placeholder="CVC (123)"
                value={cardCVC}
                onChange={(e) => setCardCVC(e.target.value)}
                className="bg-brand-surface text-brand-text px-4 py-2.5 font-sans text-xs border border-brand-accent focus:border-brand-secondary outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-brand-surface-muted">
            <Button
              id="add-funds-cancel-btn"
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddFundsOpen(false)}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary"
            >
              Discard
            </Button>
            <Button
              id="add-funds-submit-btn"
              type="submit"
              variant="primary"
              size="md"
              isLoading={isProcessing}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold px-6"
            >
              Authorize Pre-payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==============================================
          REDEEM PROMO CODE MODAL SHEET
          ============================================== */}
      <Modal
        id="wallet-redeem-promo-modal"
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        title="Redeem Promotional Card"
        size="sm"
      >
        <form onSubmit={handleRedeemVoucher} id="redeem-voucher-form" className="space-y-4 pt-2 pb-4 text-center">
          <div className="h-12 w-12 bg-brand-gold-light border border-brand-secondary/30 flex items-center justify-center mx-auto rounded-none">
            <Gift className="h-5 w-5 text-brand-gold-dark" />
          </div>

          <div>
            <p className="font-serif text-base font-semibold text-brand-primary">Claim Promotional Code</p>
            <p className="font-sans text-xs text-brand-text-muted max-w-xs mx-auto mt-1">
              Input verified VIP coupon cards or concierge codes to claim salon credit deposits.
            </p>
          </div>

          <input
            id="voucher-code-input"
            type="text"
            placeholder="VIPEMPIRE"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="w-full bg-brand-surface text-brand-text text-center py-3 font-mono text-base border border-brand-accent uppercase tracking-widest focus:border-brand-secondary outline-none"
            required
          />

          <div className="flex gap-3 pt-3">
            <Button
              id="redeem-cancel-btn"
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsRedeemOpen(false)}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary flex-1"
            >
              Cancel
            </Button>
            <Button
              id="redeem-submit-btn"
              type="submit"
              variant="primary"
              size="md"
              isLoading={isProcessing}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold flex-1"
            >
              Claim Credit
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
