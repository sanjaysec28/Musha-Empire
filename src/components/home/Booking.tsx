/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { settingsRepository, servicesRepository } from '../../lib/firestoreService';
import { FirestoreSalonSettings, FirestoreService } from '../../types/firestore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/InputFields';
import { Sparkles, Send, MapPin, Phone, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

interface BookingProps {
  onAddToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  onLaunchBookingFlow?: (serviceId?: string) => void;
}

export default function Booking({ onAddToast, onLaunchBookingFlow }: BookingProps) {
  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);
  const [servicesList, setServicesList] = useState<FirestoreService[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    settingsRepository.getSalonSettings().then((s) => {
      if (isMounted && s) setSalonSettings(s);
    }).catch(err => {
      console.warn('Notice reading salon settings in Booking:', err);
    });

    servicesRepository.getActiveServices().then((svcs) => {
      if (isMounted && svcs && svcs.length > 0) {
        setServicesList(svcs);
        setService(svcs[0].id);
      }
    }).catch(err => {
      console.warn('Notice reading active services in Booking:', err);
    });

    return () => { isMounted = false; };
  }, []);

  const addressDisplay = typeof salonSettings?.address === 'object'
    ? `${salonSettings.address.line1}${salonSettings.address.line2 ? `, ${salonSettings.address.line2}` : ''}`
    : (salonSettings?.address || 'Address unavailable');

  const contactDisplay = salonSettings?.phone || 'Contact unavailable';

  const timeSlots = React.useMemo(() => {
    if (!salonSettings) return [];
    const hoursList = (salonSettings.opening_hours && Array.isArray(salonSettings.opening_hours))
      ? salonSettings.opening_hours
      : (salonSettings.openingHours && Array.isArray(salonSettings.openingHours))
      ? salonSettings.openingHours
      : null;
    if (!hoursList || hoursList.length === 0) return [];

    let targetDay = null;
    if (date) {
      const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
      targetDay = hoursList.find(h => h.day.toLowerCase() === dayName.toLowerCase());
    } else {
      targetDay = hoursList.find(h => !h.isClosed && h.open && h.close);
    }

    if (!targetDay || targetDay.isClosed || !targetDay.open || !targetDay.close) return [];

    const parseTimeToMin = (tStr: string) => {
      const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return null;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const formatMin = (min: number) => {
      const h24 = Math.floor(min / 60);
      const m = min % 60;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const oMin = parseTimeToMin(targetDay.open);
    const cMin = parseTimeToMin(targetDay.close);
    if (oMin === null || cMin === null || cMin <= oMin) return [];

    const slots: string[] = [];
    for (let m = oMin; m < cMin; m += 30) {
      slots.push(formatMin(m));
    }
    return slots;
  }, [salonSettings, date]);

  useEffect(() => {
    if (timeSlots.length > 0 && !time) {
      setTime(timeSlots[0]);
    }
  }, [timeSlots, time]);

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

    // Forward straight to authoritative multi-step booking engine
    if (onLaunchBookingFlow) {
      onLaunchBookingFlow(service);
      setIsBooking(false);
    } else {
      setIsBooking(false);
      onAddToast('info', 'Opening Reservation Desk', 'Proceeding to authoritative slot confirmation...');
    }
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary leading-[1.1]">
                Reserve Your <br />
                <span className="text-gold-gradient font-bold italic">Sovereign Hour</span>
              </h2>
              <div className="luxury-divider !mx-0 !w-40" />
              <p className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed font-normal">
                Secure your unhurried session at Musha Empire. Our online scheduler holds your preferred slot through atomic server reservation.
              </p>
            </div>

            {/* Quick trust points */}
            <div className="space-y-4 pt-4 border-t border-brand-accent">
              <div className="flex items-start gap-3 text-xs text-brand-text-muted">
                <MapPin className="h-4.5 w-4.5 text-brand-secondary shrink-0" />
                <div>
                  <p className="font-semibold text-brand-primary">Salon Location</p>
                  <p className="font-normal mt-0.5">{addressDisplay}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-brand-text-muted">
                <Phone className="h-4.5 w-4.5 text-brand-secondary shrink-0" />
                <div>
                  <p className="font-semibold text-brand-primary">Reservations Desk</p>
                  <p className="font-normal mt-0.5">{contactDisplay}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-brand-text-muted">
                <ShieldCheck className="h-4.5 w-4.5 text-brand-secondary shrink-0" />
                <div>
                  <p className="font-semibold text-brand-primary">Uncompromised Sanitation Guarantee</p>
                  <p className="font-normal mt-0.5">Autoclaved instruments & medical-grade ventilation filtration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive reservation form routing to atomic booking engine */}
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

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="text-center pb-4 border-b border-brand-accent/45">
                  <h3 className="font-serif text-2xl text-brand-primary leading-tight font-bold">Digital Booking Desk</h3>
                  <p className="font-sans text-[10px] text-brand-secondary uppercase tracking-widest mt-1">
                    Select preferred slot & ritual below
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="booking-name"
                    label="Your Noble Name"
                    type="text"
                    placeholder="Enter your full name"
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
                    placeholder="name@domain.com"
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
                    placeholder="Contact telephone"
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

                <div>
                  {servicesList.length === 0 ? (
                    <div className="text-xs text-brand-text-muted p-2 border border-brand-accent">
                      No services available yet
                    </div>
                  ) : (
                    <Select
                      id="booking-service"
                      label="Aesthetic Ritual Selection"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      options={servicesList.map((s) => ({
                        value: s.id,
                        label: `${s.name} ($${s.price})`
                      }))}
                    />
                  )}
                </div>

                {/* Interactive Hour slots picker */}
                <div className="space-y-2">
                  <label className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-text-muted flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-brand-secondary" /> Preferred Hour Block
                  </label>
                  {timeSlots.length === 0 ? (
                    <p className="font-sans text-xs text-brand-text-muted italic py-2">
                      Availability depends on selected date and salon operating hours
                    </p>
                  ) : (
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
                  )}
                </div>

                <Textarea
                  id="booking-notes"
                  label="Bespoke Request Notes (Optional)"
                  placeholder="Specify any requirements e.g., treatment preferences, or consultation details."
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
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Proceed to Confirmation Desk
                </Button>

                <p className="text-[9px] text-brand-text-muted/60 text-center font-sans uppercase tracking-wider">
                  *All appointments are validated via authoritative Cloud Functions and atomic slot lock.
                </p>
              </form>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
