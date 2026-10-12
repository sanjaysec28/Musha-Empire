/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { BENEFITS_DATA } from '../../data/salonData';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/InputFields';
import { Crown, Check, Sparkles, Send, Gift, Clock, ShieldCheck } from 'lucide-react';

export default function Membership() {
  const [appSent, setAppSent] = useState(false);
  const [appEmail, setAppEmail] = useState('');
  const [appName, setAppName] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appEmail) {
      setEmailError('Please enter an invitation email.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(appEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setAppSent(true);
    setTimeout(() => {
      setAppSent(false);
      setAppEmail('');
      setAppName('');
    }, 4000);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'ben-1': return <Crown className="h-4.5 w-4.5 text-brand-secondary" />;
      case 'ben-2': return <Clock className="h-4.5 w-4.5 text-brand-secondary" />;
      case 'ben-3': return <Sparkles className="h-4.5 w-4.5 text-brand-secondary" />;
      case 'ben-4': return <Gift className="h-4.5 w-4.5 text-brand-secondary" />;
      default: return <Check className="h-4.5 w-4.5 text-brand-secondary" />;
    }
  };

  return (
    <section id="royal-club" className="py-24 bg-brand-bg text-brand-text relative overflow-hidden">
      {/* Immersive radial and linear cosmic ambient lighting */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-secondary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-gold-dark/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-secondary/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Royal Club Benefits Presentation */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary flex items-center gap-2">
                <Crown className="h-4 w-4" /> SOVEREIGN CIRCLE PRIVILEGE
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary tracking-tight leading-tight">
                Welcome to the <br />
                <span className="text-gold-gradient font-bold italic">Musha Royal Club</span>
              </h2>
              <p className="font-sans text-xs sm:text-sm text-brand-text-muted max-w-xl leading-relaxed font-normal">
                Our Royal Club tier is a membership roster curated for those who value absolute timing precision, privacy, and elite ritual upkeep. Membership is complimentary but restricted to ensure uncompromised service quality.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {BENEFITS_DATA.map((benefit) => (
                <div
                  key={benefit.id}
                  id={`benefit-item-${benefit.id}`}
                  className="p-5 border border-brand-secondary/15 bg-[#121212] hover:border-brand-secondary/35 transition-colors duration-300 rounded-none flex items-start gap-4"
                >
                  <div className="h-9 w-9 bg-brand-bg/40 border border-brand-secondary/20 rounded-none flex items-center justify-center shrink-0">
                    {getIcon(benefit.id)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-base text-brand-primary font-bold">{benefit.title}</h4>
                    <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Invitation Application Card */}
          <div className="lg:col-span-5 flex justify-center">
            <Card
              id="royal-club-application-card"
              variant="dark"
              className="w-full max-w-[420px] bg-[#121212] border-brand-secondary/30 p-8 relative overflow-hidden shadow-2xl"
            >
              {/* Gold borders */}
              <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-brand-secondary" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-brand-secondary" />
              <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-brand-secondary" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-brand-secondary" />

              {appSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="h-12 w-12 bg-brand-secondary/15 border border-brand-secondary/40 text-brand-secondary rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-xl text-brand-primary font-bold">Application Received</h3>
                  <p className="font-sans text-xs text-brand-text-muted max-w-xs mx-auto leading-relaxed font-normal">
                    Thank you. We have logged your request under referral code <span className="font-mono text-brand-secondary font-semibold">#MC-{Math.floor(1000 + Math.random() * 9000)}</span>. Our membership committee will review your request and dispatch your physical key card shortly.
                  </p>
                </motion.div>
              ) : (
                <form id="royal-club-form" onSubmit={handleApply} className="space-y-6">
                  <div className="space-y-2 text-center pb-2 border-b border-brand-secondary/10">
                    <h3 className="font-serif text-2xl text-brand-primary font-bold">Request Invitation</h3>
                    <p className="font-sans text-[10px] text-brand-secondary/70 uppercase tracking-widest">
                      MEMBERSHIP RETAILS AT $1,200/YR OR COMPLIMENTARY BY REFERRAL
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      id="royal-club-name"
                      label="Your Noble Name"
                      type="text"
                      placeholder="e.g., Lady Victoria Stirling"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      required
                      className="bg-transparent border-brand-secondary/20 text-brand-primary placeholder:text-brand-text-muted/40 font-sans"
                    />

                    <Input
                      id="royal-club-email"
                      label="Bespoke Invite Email"
                      type="email"
                      placeholder="e.g., victoria@stirlingholdings.com"
                      value={appEmail}
                      onChange={(e) => {
                        setAppEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      error={emailError}
                      required
                      className="bg-transparent border-brand-secondary/20 text-brand-primary placeholder:text-brand-text-muted/40 font-sans"
                    />
                  </div>

                  <Button
                    id="royal-club-submit"
                    variant="primary"
                    type="submit"
                    className="w-full flex justify-center items-center gap-2"
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Submit Application
                  </Button>

                  <p className="text-[9px] text-brand-text-muted/60 text-center font-sans uppercase tracking-wider">
                    *Musha Empire strictly respects confidentiality. No credentials are sold or shared.
                  </p>
                </form>
              )}
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
