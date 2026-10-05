/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES_DATA, STYLISTS_DATA } from '../../data/salonData';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/InputFields';
import { Calendar, Clock, Smile, Sparkles, Send, Check, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

interface BookingProps {
  onAddToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export default function Booking({ onAddToast }: BookingProps) {
  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(SERVICES_DATA[0].id);
  const [stylist, setStylist] = useState('any');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:30 AM');
  const [notes, setNotes] = useState('');

  // Status state
  const [isBooking, setIsBooking] = useState(false);
  const [bookedReceipt, setBookedReceipt] = useState<any | null>(null);

  // Error check state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = [
    '09:00 AM',
    '11:30 AM',
    '02:00 PM',
    '04:30 PM',
    '07:00 PM'
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    if (!name.trim()) tempErrors.name = 'Please state your name.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Please provide a valid email.';
    if (!phone.trim()) tempErrors.phone = 'Telephone is required.';
    if (!date) tempErrors.date = 'Attendance date is required.';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      onAddToast('error', 'Form Verification Failed', 'Please review the highlighted items.');
      return;
    }

    setErrors({});
    setIsBooking(true);

    // Simulate luxury API call with extreme visual precision
    setTimeout(() => {
      setIsBooking(false);
      
      const selectedServiceObj = SERVICES_DATA.find((s) => s.id === service);
      const selectedStylistObj = STYLISTS_DATA.find((st) => st.id === stylist);
      const stylistName = selectedStylistObj ? selectedStylistObj.name : 'First Available Master Artist';

      const receipt = {
        id: `EMP-${Math.floor(100000 + Math.random() * 900000)}`,
        name,
        email,
        phone,
        serviceTitle: selectedServiceObj?.title || 'Bespoke Experience',
        price: selectedServiceObj?.price || 'TBD',
        duration: selectedServiceObj?.duration || '60 Mins',
        stylistName,
        date,
        time,
        notes
      };

      setBookedReceipt(receipt);
      onAddToast('success', 'Sanctuary Seat Reserved!', 'Your concierge confirmation email is on the way.');
    }, 2000);
  };

  const handleReset = () => {
    setBookedReceipt(null);
    setName('');
    setEmail('');
    setPhone('');
    setService(SERVICES_DATA[0].id);
    setStylist('any');
    setDate('');
    setTime('11:30 AM');
    setNotes('');
  };

  return (
    <section id="booking" className="py-24 bg-brand-surface-muted/20 border-t border-brand-accent/25 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Interactive final CTA banner pitch */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> SECURE YOUR BENCHMARK RITUAL
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-brand-primary leading-[1.1]">
                Reserve Your <br />
                <span className="text-gold-gradient font-medium italic">Sovereign Hour</span>
              </h2>
              <div className="luxury-divider !mx-0 !w-40" />
              <p className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed font-light">
                Secure your unhurried session at Musha Empire. Our online scheduler immediately holds your preferred slot. A concierge desk manager will telephone you within 15 minutes of booking to confirm your specific styling requirements.
              </p>
            </div>

            {/* Quick trust points */}
            <div className="space-y-4 pt-4 border-t border-brand-accent">
              <div className="flex items-start gap-3 text-xs text-brand-text-muted">
                <MapPin className="h-4.5 w-4.5 text-brand-secondary shrink-0" />
                <div>
                  <p className="font-semibold text-brand-primary">Our Sanctuary Lounge</p>
                  <p className="font-light mt-0.5">Mayfair Boulevard, Suite 500, London</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-brand-text-muted">
                <Phone className="h-4.5 w-4.5 text-brand-secondary shrink-0" />
                <div>
                  <p className="font-semibold text-brand-primary">Lounge Reservations Desk</p>
                  <p className="font-light mt-0.5">+44 (20) 7946 0923 (9:00 AM - 9:00 PM)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-brand-text-muted">
                <ShieldCheck className="h-4.5 w-4.5 text-brand-secondary shrink-0" />
                <div>
                  <p className="font-semibold text-brand-primary">Uncompromised Sanitation Guarantee</p>
                  <p className="font-light mt-0.5">Autoclaved instruments & medical-grade ventilation filtration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Gorgeous interactive reservation form */}
          <div className="lg:col-span-7 flex justify-center">
            <Card
              id="appointment-reservation-card"
              variant="elevated"
              className="w-full max-w-[620px] bg-brand-surface border-brand-accent p-6 md:p-10 relative shadow-2xl"
            >
              {/* Gold border hooks */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-secondary" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-brand-secondary" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-brand-secondary" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-secondary" />

              <AnimatePresence mode="wait">
                {bookedReceipt ? (
                  <motion.div
                    key="receipt-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6 text-center py-4"
                  >
                    <div className="h-14 w-14 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-7 w-7 stroke-[1.8]" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl text-brand-primary leading-tight font-medium">Reservation Blocked!</h3>
                      <p className="font-sans text-xs text-brand-text-muted">
                        A private suite has been blocked for you under record locator:
                      </p>
                      <span className="font-mono text-sm tracking-widest font-bold text-brand-secondary bg-brand-surface-muted px-4 py-1.5 border border-brand-accent inline-block">
                        {bookedReceipt.id}
                      </span>
                    </div>

                    {/* Receipt Breakdown */}
                    <div className="border border-brand-accent/60 bg-brand-surface-muted/30 p-5 font-sans text-xs text-left space-y-3.5 divide-y divide-brand-accent/40 rounded-none">
                      <div className="pb-2.5 flex justify-between items-center text-[10px] text-brand-secondary uppercase tracking-widest font-bold">
                        <span>Details Summary</span>
                        <span>Pending Concierge Call</span>
                      </div>
                      
                      <div className="pt-3 flex justify-between gap-4">
                        <span className="text-brand-text-muted font-light">Noble Guest:</span>
                        <span className="font-semibold text-brand-primary text-right">{bookedReceipt.name}</span>
                      </div>
                      
                      <div className="pt-3 flex justify-between gap-4">
                        <span className="text-brand-text-muted font-light">Aesthetic Ritual:</span>
                        <span className="font-semibold text-brand-primary text-right">{bookedReceipt.serviceTitle} ({bookedReceipt.price})</span>
                      </div>

                      <div className="pt-3 flex justify-between gap-4">
                        <span className="text-brand-text-muted font-light">Stylist Assigned:</span>
                        <span className="font-semibold text-brand-primary text-right">{bookedReceipt.stylistName}</span>
                      </div>

                      <div className="pt-3 flex justify-between gap-4">
                        <span className="text-brand-text-muted font-light">Attendance:</span>
                        <span className="font-semibold text-brand-primary text-right">{bookedReceipt.date} at {bookedReceipt.time}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <Button
                        id="new-booking-btn"
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1 uppercase text-xs"
                      >
                        Book Another Session
                      </Button>
                      <Button
                        id="close-receipt-btn"
                        variant="primary"
                        onClick={() => setBookedReceipt(null)}
                        className="flex-1 uppercase text-xs"
                      >
                        Return Home
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <form key="form-view" onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="text-center pb-4 border-b border-brand-accent/45">
                      <h3 className="font-serif text-2xl text-brand-primary leading-tight">Digital Booking Desk</h3>
                      <p className="font-sans text-[10px] text-brand-secondary uppercase tracking-widest mt-1">
                        Select preferred slot & master artist below
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="booking-name"
                        label="Your Noble Name"
                        type="text"
                        placeholder="Victoria Stirling"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        required
                        className="font-sans"
                      />

                      <Input
                        id="booking-email"
                        label="Your Private Email"
                        type="email"
                        placeholder="victoria@stirling.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        required
                        className="font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="booking-phone"
                        label="Telephone Number"
                        type="tel"
                        placeholder="+44 20 7946 0923"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={errors.phone}
                        required
                        className="font-sans"
                      />

                      <Input
                        id="booking-date"
                        label="Date of Attendance"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        error={errors.date}
                        required
                        className="font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        id="booking-service"
                        label="Aesthetic Ritual Selection"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        options={SERVICES_DATA.map((s) => ({
                          value: s.id,
                          label: `${s.title} (${s.price})`
                        }))}
                      />

                      <Select
                        id="booking-stylist"
                        label="Preferred Master Artist"
                        value={stylist}
                        onChange={(e) => setStylist(e.target.value)}
                        options={[
                          { value: 'any', label: 'First Available Master' },
                          ...STYLISTS_DATA.map((st) => ({
                            value: st.id,
                            label: st.name
                          }))
                        ]}
                      />
                    </div>

                    {/* Interactive Hour slots picker */}
                    <div className="space-y-2">
                      <label className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-text-muted flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-brand-secondary" /> Preferred Hour Block
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {timeSlots.map((slot) => {
                          const isSelected = time === slot;
                          return (
                            <button
                              key={slot}
                              id={`time-slot-${slot.replace(' ', '-').toLowerCase()}`}
                              type="button"
                              onClick={() => setTime(slot)}
                              className={`py-2 px-1 border font-sans text-[10px] tracking-wider transition-all duration-300 rounded-none cursor-pointer ${
                                isSelected
                                  ? 'bg-brand-primary text-brand-bg border-brand-primary font-semibold shadow-sm'
                                  : 'bg-brand-surface text-brand-text border-brand-accent hover:border-brand-secondary'
                              }`}
                            >
                              {slot.split(' ')[0]}
                              <span className="block text-[8px] opacity-60 uppercase">{slot.split(' ')[1]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Textarea
                      id="booking-notes"
                      label="Bespoke Request Notes (Optional)"
                      placeholder="Specify any requirements e.g., VIP styling cabin, refreshments preference, or specific details for wedding trials."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />

                    <Button
                      id="submit-booking-btn"
                      variant="primary"
                      type="submit"
                      isLoading={isBooking}
                      className="w-full uppercase font-sans text-xs flex justify-center items-center gap-2"
                      leftIcon={<Send className="h-4 w-4" />}
                    >
                      Book Attendance Slot
                    </Button>

                    <p className="text-[9px] text-brand-text-muted/60 text-center font-sans uppercase tracking-wider">
                      *By submitting, you agree to our 24-hour unhurried cancellation policy.
                    </p>
                  </form>
                )}
              </AnimatePresence>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
