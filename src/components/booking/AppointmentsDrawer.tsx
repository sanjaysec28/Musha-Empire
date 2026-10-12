/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Drawer } from '../ui/Overlay';
import { BookingRecord } from './BookingFlow';
import { Calendar, Trash2, Clock, MapPin, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AppointmentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: BookingRecord[];
  onCancelAppointment: (id: string) => void;
}

export default function AppointmentsDrawer({
  isOpen,
  onClose,
  appointments,
  onCancelAppointment
}: AppointmentsDrawerProps) {
  return (
    <Drawer
      id="appointments-drawer"
      isOpen={isOpen}
      onClose={onClose}
      title="My Scheduled Experiences"
      position="right"
      footer={
        <div className="pt-4 border-t border-brand-accent text-center space-y-2">
          <p className="font-sans text-[10px] text-brand-text-muted leading-relaxed">
            Need high-priority shifts? Please contact our premium reservations concierge desk directly.
          </p>
        </div>
      }
    >
      <div id="appointments-drawer-body" className="space-y-6 text-left">
        {appointments.length > 0 ? (
          <div className="space-y-4">
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
              You have <span className="font-semibold text-brand-primary font-mono">{appointments.length}</span> upcoming luxury sessions scheduled:
            </p>

            <div className="space-y-4">
              {appointments.map((app) => (
                <div
                  key={app.id}
                  id={`drawer-app-item-${app.id}`}
                  className="border border-brand-accent bg-brand-surface p-4 relative space-y-3"
                >
                  {/* Top line with Booking ID */}
                  <div className="flex justify-between items-center pb-2 border-b border-brand-accent/40">
                    <span className="font-mono text-[9px] font-bold text-brand-gold-dark">{app.id}</span>
                    <Badge id={`badge-drawer-app-${app.id}`} variant="success" size="sm" className="text-[8px] uppercase tracking-wider">Confirmed</Badge>
                  </div>

                  {/* Service info */}
                  <div className="space-y-1">
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Ritual</span>
                    <h4 className="font-serif text-sm font-semibold text-brand-primary leading-tight">{app.service.name}</h4>
                  </div>

                  {/* Stylist & Schedule details */}
                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Artisan</span>
                      <span className="font-serif text-xs font-semibold text-brand-primary">{app.stylist?.name || 'Salon Concierge'}</span>
                    </div>
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Schedule</span>
                      <span className="font-sans text-[10px] text-brand-primary flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3 text-brand-secondary shrink-0" /> {app.timeSlot}
                      </span>
                    </div>
                  </div>

                  {/* Date detail */}
                  <div className="font-sans text-[10px] text-brand-text-muted font-normal flex items-center gap-1.5 pt-1 border-t border-brand-accent/30 mt-2">
                    <Calendar className="h-3.5 w-3.5 text-brand-secondary shrink-0" /> {app.date}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-brand-accent/40">
                    <div className="flex items-center gap-1 text-[9px] font-sans text-brand-text-muted">
                      <MapPin className="h-3 w-3 text-brand-secondary" /> Sanctuary Suite
                    </div>
                    
                    <button
                      id={`cancel-btn-${app.id}`}
                      onClick={() => onCancelAppointment(app.id)}
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-sans text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                      title="Cancel Booking"
                    >
                      <Trash2 className="h-3 w-3" /> Cancel Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-brand-accent bg-brand-surface p-6 space-y-3">
            <Calendar className="h-8 w-8 text-brand-text-muted mx-auto" />
            <h4 className="font-serif text-base text-brand-primary font-medium">No Upcoming Sessions</h4>
            <p className="font-sans text-xs text-brand-text-muted max-w-xs mx-auto leading-relaxed">
              You currently do not have any pending treatments scheduled. Select a beauty ritual from our catalog to get started.
            </p>
          </div>
        )}

        {/* Lounge Info Block */}
        <div className="p-4 bg-brand-surface border border-brand-accent mt-6">
          <p className="font-sans text-[9px] uppercase tracking-widest font-semibold text-brand-secondary flex items-center gap-1 mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Sanctuary Arrival Policy
          </p>
          <p className="font-sans text-[11px] text-brand-text-muted leading-relaxed font-normal">
            We kindly ask guests to arrive **10 minutes prior** to their scheduled time slot. You will be welcomed in our acoustic reception lounge and served artisanal white tea or espresso of your choice.
          </p>
        </div>
      </div>
    </Drawer>
  );
}
