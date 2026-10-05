/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  ArrowUpDown,
  QrCode,
  Download,
  AlertCircle,
  XCircle,
  Sparkles,
  MapPin,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { DashboardAppointment } from './types';
import Button from '../ui/Button';
import { Modal } from '../ui/Overlay';

interface DashboardAppointmentsProps {
  id: string;
  appointments: DashboardAppointment[];
  onCancelAppointment: (id: string) => void;
  onRescheduleAppointment: (id: string, date: string, time: string) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function DashboardAppointments({
  id,
  appointments,
  onCancelAppointment,
  onRescheduleAppointment,
  triggerToast
}: DashboardAppointmentsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStylist, setSelectedStylist] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'price-desc' | 'price-asc'>('date-asc');

  // Detail & Action modal triggers
  const [activeDetailAppointment, setActiveDetailAppointment] = useState<DashboardAppointment | null>(null);
  const [activeCancelConfirm, setActiveCancelConfirm] = useState<DashboardAppointment | null>(null);
  const [activeReschedule, setActiveReschedule] = useState<DashboardAppointment | null>(null);

  // Reschedule form inputs
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Extract list of stylists for filtering
  const stylists = Array.from(new Set(appointments.map((app) => app.stylistName)));

  // Filter & Search Logic
  const filteredAppointments = appointments.filter((app) => {
    // Tab validation
    if (app.status !== activeTab) return false;

    // Search query matches service or stylist
    const matchSearch =
      app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.stylistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Stylist match
    const matchStylist = selectedStylist === 'all' || app.stylistName === selectedStylist;

    return matchSearch && matchStylist;
  });

  // Sort Logic
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'price-desc') {
      return b.price - a.price;
    } else {
      return a.price - b.price;
    }
  });

  const handleDownloadInvoice = (app: DashboardAppointment) => {
    triggerToast(
      'success',
      'Generating Premium Invoice',
      `Invoice MSH-${app.id.slice(-6).toUpperCase()} is compiling. Download will begin momentarily.`
    );
  };

  const handleConfirmCancel = () => {
    if (activeCancelConfirm) {
      onCancelAppointment(activeCancelConfirm.id);
      triggerToast(
        'warning',
        'Appointment Released',
        `Your booking ${activeCancelConfirm.id} has been cancelled. Refund credits are added back to your wallet.`
      );
      setActiveCancelConfirm(null);
    }
  };

  const handleConfirmRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      triggerToast('error', 'Missing Information', 'Please select a valid date and available hour slot.');
      return;
    }

    if (activeReschedule) {
      onRescheduleAppointment(activeReschedule.id, newDate, newTime);
      triggerToast(
        'success',
        'Reservation Adjusted',
        `Treatment ${activeReschedule.serviceName} is rescheduled to ${newDate} at ${newTime}.`
      );
      setActiveReschedule(null);
      setNewDate('');
      setNewTime('');
    }
  };

  const timeSlots = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '01:30 PM',
    '03:00 PM',
    '04:30 PM',
    '06:00 PM',
    '07:30 PM',
  ];

  return (
    <div id={id} className="space-y-6">
      {/* Search, Filter, Sort Controls bar */}
      <div className="bg-brand-surface border border-brand-accent p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-muted" />
          <input
            id="appointments-search-field"
            type="text"
            placeholder="Search treatments, stylists, IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg text-brand-text pl-10 pr-4 py-2.5 font-sans text-xs border border-brand-accent focus:border-brand-secondary outline-none transition-all duration-300"
          />
        </div>

        {/* Filter / Sort Selects */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Stylist Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-brand-secondary" />
            <select
              id="appointments-stylist-filter"
              value={selectedStylist}
              onChange={(e) => setSelectedStylist(e.target.value)}
              className="bg-brand-bg text-brand-text border border-brand-accent px-3 py-2.5 font-sans text-xs outline-none focus:border-brand-secondary"
            >
              <option value="all">All Stylists</option>
              {stylists.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-brand-secondary" />
            <select
              id="appointments-sorting"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-brand-bg text-brand-text border border-brand-accent px-3 py-2.5 font-sans text-xs outline-none focus:border-brand-secondary"
            >
              <option value="date-asc">Date (Ascending)</option>
              <option value="date-desc">Date (Descending)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="price-asc">Price (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-brand-accent">
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = appointments.filter((app) => app.status === tab).length;
          return (
            <button
              key={tab}
              id={`tab-appointments-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 font-sans text-xs uppercase tracking-widest font-semibold border-b-2 text-center transition-all cursor-pointer ${
                isActive
                  ? 'border-brand-secondary text-brand-primary bg-brand-surface font-bold'
                  : 'border-transparent text-brand-text-muted hover:text-brand-primary'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Appointment Timeline List */}
      <div className="space-y-4">
        {sortedAppointments.length > 0 ? (
          <div className="space-y-4">
            {sortedAppointments.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-brand-surface border border-brand-accent p-6 hover:border-brand-secondary/40 transition-all duration-300 relative group"
              >
                {/* Visual state accent */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    app.status === 'upcoming'
                      ? 'bg-brand-secondary'
                      : app.status === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-red-400'
                  }`}
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* Left: Info */}
                  <div className="flex gap-4 items-center">
                    <img
                      src={app.stylistAvatar}
                      alt={app.stylistName}
                      className="h-12 w-12 border border-brand-accent rounded-none object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-brand-text-muted font-bold">
                          {app.id}
                        </span>
                        <span className="bg-brand-surface-muted text-brand-text-muted font-mono text-[8px] uppercase px-1.5 py-0.5 border border-brand-accent">
                          {app.category}
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-medium text-brand-primary mt-1">
                        {app.serviceName}
                      </h4>
                      <p className="font-sans text-xs text-brand-text-muted mt-0.5">
                        Senior Artist: <span className="text-brand-primary font-medium">{app.stylistName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Scheduled Details */}
                  <div className="flex flex-col md:items-end gap-1 font-sans text-xs text-brand-text-muted">
                    <div className="flex items-center gap-1.5 font-serif text-sm font-semibold text-brand-primary">
                      <Calendar className="h-3.5 w-3.5 text-brand-secondary" /> {app.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand-secondary" /> {app.timeSlot} ({app.duration})
                    </div>
                  </div>

                  {/* Right: Payment Status & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-brand-surface-muted pt-4 md:pt-0 w-full md:w-auto">
                    <div className="text-left md:text-right">
                      <span className="font-serif text-base font-medium text-brand-primary block">
                        ${app.price.toFixed(2)}
                      </span>
                      <span className="font-mono text-[9px] uppercase font-bold text-brand-gold-dark block">
                        {app.paymentStatus === 'paid' ? '● Fully Prepaid' : '○ Counter Pay'}
                      </span>
                      {app.realStatus && (
                        <span className="font-mono text-[9px] uppercase font-bold text-brand-secondary block mt-0.5">
                          Status: {app.realStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        id={`app-detail-trigger-${app.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveDetailAppointment(app)}
                        className="font-sans text-[10px] uppercase font-semibold py-1.5 px-3 border-brand-accent hover:border-brand-secondary"
                      >
                        Details
                      </Button>

                      {app.status === 'upcoming' && (
                        <>
                          <Button
                            id={`app-resched-trigger-${app.id}`}
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setActiveReschedule(app);
                              setNewDate(app.date);
                              setNewTime(app.timeSlot);
                            }}
                            className="font-sans text-[10px] uppercase font-semibold py-1.5 px-3"
                          >
                            Reschedule
                          </Button>
                          {(!app.realStatus || app.realStatus === 'pending') && (
                            <Button
                              id={`app-cancel-trigger-${app.id}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveCancelConfirm(app)}
                              className="font-sans text-[10px] uppercase font-semibold text-red-500 hover:bg-red-50 py-1.5 px-3 rounded-none"
                            >
                              Cancel
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-brand-surface border border-dashed border-brand-accent p-12 text-center flex flex-col items-center justify-center min-h-[260px]">
            <div className="h-12 w-12 rounded-none bg-brand-surface-muted flex items-center justify-center text-brand-text-muted mb-4 border border-brand-accent">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="font-serif text-lg font-medium text-brand-primary">No Matching Appointments</p>
            <p className="font-sans text-xs text-brand-text-muted max-w-sm mt-1.5">
              We couldn't detect any appointments matching this category or keywords. Try resetting your filter queries.
            </p>
          </div>
        )}
      </div>

      {/* ==============================================
          APPOINTMENT TICKET DETAIL MODAL (with QR Code)
          ============================================== */}
      <Modal
        id="appointment-ticket-modal"
        isOpen={activeDetailAppointment !== null}
        onClose={() => setActiveDetailAppointment(null)}
        title="Royal Access Ticket"
        size="md"
      >
        {activeDetailAppointment && (
          <div className="space-y-6 pt-2 pb-4">
            {/* Ticket Header QR layout */}
            <div className="bg-[#121212] text-brand-text p-6 border border-brand-secondary/25 relative text-center">
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#C5A880_1px,transparent_1px)] bg-[size:1rem_1rem]" />
              
              <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary font-bold block mb-1">
                TICKET SECURE PASS
              </span>
              <h3 className="font-serif text-2xl font-medium text-brand-primary">
                {activeDetailAppointment.serviceName}
              </h3>
              <p className="font-mono text-[10px] text-brand-secondary/70 mt-1">
                ID: {activeDetailAppointment.id}
              </p>

              {/* QR Code Placeholder Box */}
              <div className="bg-[#0A0A0A] border border-brand-secondary/20 p-4 h-36 w-36 mx-auto my-5 flex flex-col items-center justify-center shadow-lg relative group">
                <QrCode className="h-28 w-28 text-brand-secondary stroke-[1.25]" />
                <div className="absolute inset-0 bg-[#121212]/95 text-brand-primary flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="font-sans text-[8px] uppercase tracking-widest font-semibold mb-1">Priority Scanner</span>
                  <span className="font-mono text-[9px] font-bold text-brand-secondary">MSH-SECURE-99</span>
                </div>
              </div>

              <p className="font-sans text-[10px] text-brand-text-muted max-w-xs mx-auto leading-relaxed">
                Present this QR ticket pass at the concierge desk upon priority arrival for instant check-in.
              </p>
            </div>

            {/* Treatment Specifications */}
            <div className="grid grid-cols-2 gap-4 border-b border-brand-accent pb-5">
              <div>
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                  SERVICE ARTIST
                </span>
                <p className="font-serif text-base font-semibold text-brand-primary mt-1">
                  {activeDetailAppointment.stylistName}
                </p>
              </div>
              <div>
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                  TREATMENT ROOM
                </span>
                <p className="font-serif text-base font-semibold text-brand-primary mt-1 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-secondary" /> Sovereign Salon Suite 4
                </p>
              </div>
              <div className="mt-2">
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                  SCHEDULED SLOT
                </span>
                <p className="font-serif text-sm font-semibold text-brand-primary mt-1">
                  {activeDetailAppointment.date}
                </p>
                <p className="font-sans text-xs text-brand-text-muted mt-0.5">
                  {activeDetailAppointment.timeSlot} ({activeDetailAppointment.duration})
                </p>
              </div>
              <div className="mt-2">
                <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                  BILLING DETAILS
                </span>
                <p className="font-serif text-sm font-semibold text-brand-primary mt-1">
                  ${activeDetailAppointment.price.toFixed(2)}
                </p>
                <p className="font-mono text-[9px] font-bold text-brand-gold-dark mt-0.5 uppercase">
                  {activeDetailAppointment.paymentStatus === 'paid' ? 'Paid via Wallet' : 'Pay On Location'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-1">
              <Button
                id="ticket-download-invoice-btn"
                variant="outline"
                size="md"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleDownloadInvoice(activeDetailAppointment)}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary"
              >
                Invoice Receipt
              </Button>
              <Button
                id="ticket-close-btn"
                variant="primary"
                size="md"
                onClick={() => setActiveDetailAppointment(null)}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold px-6"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==============================================
          APPOINTMENT CANCEL CONFIRM DIALOG
          ============================================== */}
      <Modal
        id="cancel-confirmation-modal"
        isOpen={activeCancelConfirm !== null}
        onClose={() => setActiveCancelConfirm(null)}
        title="Confirm Session Release"
        size="sm"
      >
        {activeCancelConfirm && (
          <div className="space-y-4 pt-2 pb-4 text-center">
            <div className="h-12 w-12 bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto rounded-none">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div>
              <p className="font-serif text-lg font-semibold text-brand-primary">Release this Appointment?</p>
              <p className="font-sans text-xs text-brand-text-muted max-w-sm mx-auto mt-2 leading-relaxed">
                Are you sure you wish to cancel your scheduled slot for <strong className="text-brand-primary">{activeCancelConfirm.serviceName}</strong> with <strong className="text-brand-primary">{activeCancelConfirm.stylistName}</strong>?
              </p>
              <p className="font-sans text-[10px] text-brand-gold-dark bg-brand-gold-light border border-brand-secondary/35 p-2.5 mt-3 leading-relaxed">
                Credits of ${activeCancelConfirm.price.toFixed(2)} will be refunded instantly back into your personal salon wallet.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-3">
              <Button
                id="cancel-deny-btn"
                variant="outline"
                size="md"
                onClick={() => setActiveCancelConfirm(null)}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary flex-1"
              >
                Keep Booking
              </Button>
              <Button
                id="cancel-approve-btn"
                variant="primary"
                size="md"
                onClick={handleConfirmCancel}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold bg-red-600 hover:bg-red-700 text-white border-none flex-1"
              >
                Yes, Release Slot
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ==============================================
          APPOINTMENT RESCHEDULE CONTROL SHEET
          ============================================== */}
      <Modal
        id="reschedule-modal"
        isOpen={activeReschedule !== null}
        onClose={() => setActiveReschedule(null)}
        title="Reschedule Slot"
        size="md"
      >
        {activeReschedule && (
          <form onSubmit={handleConfirmRescheduleSubmit} id="reschedule-form" className="space-y-5 pt-2 pb-4">
            <div className="bg-brand-surface-muted p-4 border border-brand-accent">
              <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                CURRENT APPOINTMENT
              </span>
              <h4 className="font-serif text-base font-semibold text-brand-primary mt-1">
                {activeReschedule.serviceName}
              </h4>
              <p className="font-sans text-xs text-brand-text-muted mt-0.5">
                Stylist: {activeReschedule.stylistName} | Slot: {activeReschedule.date} at {activeReschedule.timeSlot}
              </p>
            </div>

            {/* Select Date */}
            <div>
              <label htmlFor="reschedule-date" className="font-sans text-xs uppercase tracking-wider font-medium text-brand-text mb-2 block">
                Choose New Date
              </label>
              <input
                id="reschedule-date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-brand-surface text-brand-text px-4 py-3 border border-brand-accent focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none font-sans text-sm"
              />
            </div>

            {/* Select Time Slot Grid */}
            <div>
              <span className="font-sans text-xs uppercase tracking-wider font-medium text-brand-text mb-2.5 block">
                Select Available Hour
              </span>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = slot === newTime;
                  return (
                    <button
                      key={slot}
                      type="button"
                      id={`reschedule-time-slot-${slot.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setNewTime(slot)}
                      className={`py-2.5 px-2 border text-center font-sans text-xs transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-brand-secondary bg-brand-gold-light text-brand-gold-dark font-bold'
                          : 'border-brand-accent hover:border-brand-secondary bg-brand-surface text-brand-text'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <Button
                id="reschedule-cancel-btn"
                type="button"
                variant="outline"
                size="md"
                onClick={() => setActiveReschedule(null)}
                className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary"
              >
                Discard
              </Button>
              <Button
                id="reschedule-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                className="font-sans text-[10px] uppercase tracking-wider font-semibold px-6"
              >
                Confirm Adjustment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
