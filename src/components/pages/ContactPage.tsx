/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Phone, Mail, Clock, MessageSquare, Send, Instagram, Facebook, AlertCircle, CheckCircle } from 'lucide-react';
import { settingsRepository } from '../../lib/firestoreService';
import { FirestoreSalonSettings } from '../../types/firestore';
import Button from '../ui/Button';

export default function ContactPage({
  triggerToast,
}: {
  triggerToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Consultation Request',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsRepository.getSalonSettings().then((settings) => {
      if (isMounted && settings) {
        setSalonSettings(settings);
      }
    }).catch(err => {
      console.warn('Notice reading salon settings from Firestore:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const phoneDisplay = salonSettings?.phone || 'Contact unavailable';
  const emailDisplay = salonSettings?.email || 'Email unavailable';
  const hasAddress = Boolean(salonSettings?.address);
  const addressLine1 = typeof salonSettings?.address === 'object'
    ? `${salonSettings.address.line1}${salonSettings.address.line2 ? `, ${salonSettings.address.line2}` : ''}`
    : (salonSettings?.address || 'Address unavailable');
  const addressLine2 = typeof salonSettings?.address === 'object'
    ? `${salonSettings.address.city || ''}, ${salonSettings.address.state || ''} ${salonSettings.address.zipCode || ''}`.trim()
    : (hasAddress ? '' : 'Location details not yet configured');

  const contactDetails = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: 'Salon Address',
      line1: addressLine1,
      line2: addressLine2,
      link: salonSettings?.address ? 'https://maps.google.com' : '#',
      linkLabel: salonSettings?.address ? 'Get Directions' : 'Address details pending',
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: 'Reservations Desk',
      line1: phoneDisplay,
      line2: salonSettings?.whatsapp ? `WhatsApp: ${salonSettings.whatsapp}` : '',
      link: salonSettings?.phone ? `tel:${salonSettings.phone.replace(/[^\d+]/g, '')}` : '#',
      linkLabel: salonSettings?.phone ? 'Call Reservation Desk' : 'Contact pending',
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: 'Concierge Mailbox',
      line1: emailDisplay,
      line2: '',
      link: salonSettings?.email ? `mailto:${salonSettings.email}` : '#',
      linkLabel: salonSettings?.email ? 'Email Concierge Desk' : 'Email pending',
    },
  ];

  const hoursList = (Array.isArray(salonSettings?.opening_hours) && salonSettings.opening_hours.length > 0)
    ? salonSettings.opening_hours
    : (Array.isArray(salonSettings?.openingHours) && salonSettings.openingHours.length > 0)
    ? salonSettings.openingHours
    : null;

  const workingHours = hoursList && hoursList.length > 0
    ? hoursList.map(h => ({
        day: h.day,
        hours: h.isClosed ? 'Closed' : `${h.open} - ${h.close}`
      }))
    : [{ day: 'Operating Schedule', hours: 'Hours unavailable' }];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate backend submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Consultation Request',
        message: '',
      });

      if (triggerToast) {
        triggerToast(
          'success',
          'Inquiry Submitted',
          'Thank you. Our luxury concierge desk will contact you within 2 business hours.'
        );
      }
    }, 1800);
  };

  return (
    <div id="contact-page-wrapper" className="pb-24 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <section id="contact-header" className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-brand-secondary block mb-3">
          Concierge Services
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-primary font-bold tracking-tight">
          Establish <span className="font-serif-italic text-brand-gold-dark italic">Connection</span>
        </h1>
        <div className="luxury-divider my-6" />
        <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
          Whether you require a bespoke wedding style outline, custom scalp recovery diagnostics, or priority VIP room lockouts, our concierge team is at your absolute disposal.
        </p>
      </section>

      {/* Grid: Details & Form */}
      <div id="contact-content-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Side: Info & Hours */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Card Blocks */}
          <div id="contact-blocks-list" className="space-y-6">
            {contactDetails.map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-brand-surface border border-brand-accent/20 flex gap-4 hover:border-brand-secondary/40 transition-all duration-300"
              >
                <div className="h-10 w-10 border border-brand-accent/20 text-brand-secondary flex items-center justify-center bg-brand-bg shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1 font-sans">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
                    {item.title}
                  </h4>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    {item.line1}
                    <br />
                    {item.line2}
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-[10px] text-brand-gold-dark font-semibold hover:underline underline-offset-4 uppercase tracking-wider pt-1.5"
                  >
                    {item.linkLabel} &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Working Hours Frame */}
          <div id="contact-working-hours" className="bg-brand-surface border border-brand-accent/25 p-6 md:p-8">
            <h3 className="font-serif text-xl text-brand-primary font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-secondary" /> Sanctuary Operating Hours
            </h3>
            <div className="luxury-divider mb-4" />
            <div className="space-y-3 font-sans text-xs">
              {workingHours.map((wh) => (
                <div key={wh.day} className="flex justify-between items-center text-brand-text-muted border-b border-brand-accent/10 pb-2">
                  <span className="font-semibold text-brand-primary">{wh.day}</span>
                  <span>{wh.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp CTA & Social Card */}
          <div id="whatsapp-direct-card" className="bg-brand-surface border border-brand-secondary/15 p-6 md:p-8 text-brand-text space-y-4">
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-brand-secondary font-semibold block">
              Direct WhatsApp Messenger
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Need Instant Answers?
            </h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
              Skip the queue entirely. Chat directly with our private lounge concierge live regarding walk-in availability or master therapist standby schedules.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              {salonSettings?.whatsapp ? (
                <a
                  id="contact-whatsapp-link"
                  href={`https://wa.me/${salonSettings.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto text-center inline-flex justify-center items-center gap-2 bg-[#25D366] text-white font-sans text-xs uppercase tracking-widest font-semibold px-6 py-3 hover:bg-opacity-90 transition-all duration-300"
                >
                  <MessageSquare className="h-4 w-4 fill-white text-transparent" /> Message WhatsApp Desk
                </a>
              ) : (
                <span className="w-full sm:w-auto text-center inline-flex justify-center items-center gap-2 border border-brand-accent/30 text-brand-text-muted font-sans text-xs uppercase tracking-widest font-semibold px-6 py-3">
                  <MessageSquare className="h-4 w-4" /> WhatsApp Unavailable
                </span>
              )}
              
              {/* Social Directory Links */}
              <div className="flex items-center gap-3">
                {salonSettings?.social_links?.instagram || salonSettings?.socialLinks?.instagram ? (
                  <a
                    href={salonSettings?.social_links?.instagram || salonSettings?.socialLinks?.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 border border-brand-secondary/20 hover:border-brand-secondary hover:text-brand-secondary rounded-none flex items-center justify-center text-brand-text-muted transition-colors"
                    aria-label="Instagram Link"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                ) : null}
                {salonSettings?.social_links?.facebook || salonSettings?.socialLinks?.facebook ? (
                  <a
                    href={salonSettings?.social_links?.facebook || salonSettings?.socialLinks?.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 border border-brand-secondary/20 hover:border-brand-secondary hover:text-brand-secondary rounded-none flex items-center justify-center text-brand-text-muted transition-colors"
                    aria-label="Facebook Link"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Inquiry Form */}
        <div className="lg:col-span-7 bg-brand-surface border border-brand-accent/25 p-6 sm:p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Dispatch Inquiry
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-primary font-bold">
              Interactive Contact Form
            </h2>
            <div className="luxury-divider" />
          </div>

          <form id="contact-interactive-form" onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="contact-form-name" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                  Full Name <span className="text-brand-secondary">*</span>
                </label>
                <input
                  id="contact-form-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Richard Sterling"
                  className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/40 py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="contact-form-email" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                  Email Address <span className="text-brand-secondary">*</span>
                </label>
                <input
                  id="contact-form-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. richard@sterling.com"
                  className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/40 py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="contact-form-phone" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                  Phone Number
                </label>
                <input
                  id="contact-form-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +44 7700 900077"
                  className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/40 py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none"
                />
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label htmlFor="contact-form-subject" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                  Nature of Inquiry <span className="text-brand-secondary">*</span>
                </label>
                <select
                  id="contact-form-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none"
                >
                  <option value="Consultation Request">Custom Consultation Request</option>
                  <option value="Bridal Suite Booking">Bridal & Wedding Suite Booking</option>
                  <option value="VIP Cabin Lockout">VIP Golden Cabin Lockout</option>
                  <option value="Corporate Membership">Corporate Club Memberships</option>
                  <option value="Other feedback">Other General Inquiry</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="contact-form-message" className="block font-sans text-[10px] uppercase tracking-wider font-semibold text-brand-primary">
                Your Detailed Message <span className="text-brand-secondary">*</span>
              </label>
              <textarea
                id="contact-form-message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Explain what bespoke assistance you require..."
                className="w-full bg-brand-surface-muted/30 border border-brand-accent/40 text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/40 py-3.5 px-4 outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all rounded-none resize-none"
              />
            </div>

            {/* Form Alert States */}
            <AnimatePresence>
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 text-green-800 p-4 border border-green-200 text-xs font-sans flex items-start gap-2.5"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Message Dispatched Successfully!</strong>
                    <span>Your request has been filed under tracking index #{Date.now().toString().slice(-6)}. Our primary concierge will connect with you via email or SMS in less than 2 hours.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Trigger */}
            <Button
              id="contact-form-submit-btn"
              variant="secondary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Send className="h-4 w-4" />}
              className="w-full uppercase font-bold"
            >
              Dispatch Inquiry
            </Button>
          </form>
        </div>

      </div>

      {/* Google Maps Blueprint Placeholder */}
      <section id="contact-map-section" className="mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary">
            Find the Lounge
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-primary font-bold">
            An Elegant Blueprint Map Location
          </h2>
          <div className="luxury-divider my-3 max-w-xs mx-auto" />
        </div>

        {/* Mock Blueprint Map design */}
        <div
          id="mock-blueprint-map"
          className="relative w-full h-[350px] md:h-[450px] border border-brand-secondary/35 bg-[#121110] overflow-hidden select-none"
        >
          {/* Subtle vectors grid lines representing roads */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
          
          {/* Abstract map roads as gold pathways */}
          <div className="absolute inset-x-0 top-1/3 h-[2px] bg-brand-secondary/35" />
          <div className="absolute inset-x-0 top-2/3 h-[2px] bg-brand-secondary/20" />
          <div className="absolute left-1/4 inset-y-0 w-[2px] bg-brand-secondary/25" />
          <div className="absolute left-2/3 inset-y-0 w-[2px] bg-brand-secondary/40" />
          
          {/* Centralized landmark point representing Musha Empire */}
          <div className="absolute left-2/3 top-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            {/* Pulsing indicator circle */}
            <div className="relative h-14 w-14 flex items-center justify-center">
              <span className="absolute animate-ping h-8 w-8 rounded-full bg-brand-secondary opacity-60" />
              <div className="h-4 w-4 rounded-full bg-brand-secondary border-2 border-[#121110] relative z-10" />
            </div>

            {/* Premium Gold overlay tag */}
            {/* Gold overlay tag */}
            <div className="bg-[#121110] border border-brand-secondary text-brand-secondary py-3 px-5 -mt-2 shadow-2xl relative z-10 text-center select-none whitespace-nowrap">
              <p className="font-serif text-sm font-semibold tracking-wide text-brand-secondary">{salonSettings?.salon_name || salonSettings?.salonName || 'MUSHA EMPIRE'}</p>
              <p className="font-sans text-[8px] text-brand-accent/55 tracking-widest uppercase mt-0.5">{addressLine1}</p>
            </div>
          </div>

          {/* Compass Rose icon */}
          <div className="absolute bottom-6 right-6 h-12 w-12 border border-brand-secondary/25 flex items-center justify-center text-brand-secondary font-mono text-[9px]">
            N &uarr;
          </div>

          {/* Leftside map overlay */}
          <div className="absolute left-6 top-6 max-w-xs bg-[#1A1917]/95 border border-brand-accent/20 p-5 space-y-3 text-brand-bg backdrop-blur-sm hidden sm:block">
            <h4 className="font-serif text-sm text-brand-secondary font-semibold">Salon Arrival</h4>
            <p className="font-sans text-[11px] text-brand-accent/70 leading-relaxed">
              {hasAddress
                ? `Located at ${addressLine1}. Arrival directions will be provided upon appointment reservation confirmation.`
                : 'Salon address and arrival directions will be confirmed upon reservation confirmation.'}
            </p>
            {hasAddress ? (
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider font-bold text-brand-secondary hover:underline"
              >
                Open External Google Maps &rarr;
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
