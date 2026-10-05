/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Bell, Calendar, Wallet, Award, Sparkles, Trash2, CheckCheck, RefreshCw } from 'lucide-react';
import { DashboardNotification } from './types';
import Button from '../ui/Button';

interface DashboardNotificationsProps {
  id: string;
  notifications: DashboardNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function DashboardNotifications({
  id,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  triggerToast
}: DashboardNotificationsProps) {
  
  const handleMarkAllRead = () => {
    onMarkAllAsRead();
    triggerToast('success', 'Inbox Cleared', 'All pending notifications are marked as read.');
  };

  const getNotificationIcon = (type: DashboardNotification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4.5 w-4.5 text-brand-secondary" />;
      case 'wallet':
        return <Wallet className="h-4.5 w-4.5 text-emerald-600" />;
      case 'reward':
        return <Award className="h-4.5 w-4.5 text-brand-secondary" />;
      case 'membership':
        return <Sparkles className="h-4.5 w-4.5 text-brand-gold-dark" />;
      default:
        return <Bell className="h-4.5 w-4.5 text-brand-text-muted" />;
    }
  };

  return (
    <div id={id} className="space-y-6">
      
      {/* Notifications Header Control */}
      <div className="flex justify-between items-center bg-brand-surface p-4 border border-brand-accent">
        <div>
          <h3 className="font-serif text-lg font-semibold text-brand-primary">
            Notification Center
          </h3>
          <p className="font-sans text-xs text-brand-text-muted">
            Track scheduling updates, billing credits, and loyalty rewards updates.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <Button
            id="notifications-mark-all-read-btn"
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
            onClick={handleMarkAllRead}
            className="font-sans text-[10px] uppercase tracking-wider font-bold py-2.5 px-4 border-brand-accent hover:border-brand-secondary"
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List Container */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
              className={`bg-brand-surface border p-4.5 flex items-start justify-between gap-4 transition-all duration-300 relative group ${
                notif.isRead ? 'border-brand-accent opacity-75' : 'border-brand-secondary/40 shadow-sm'
              }`}
            >
              {/* Unread indicator */}
              {!notif.isRead && (
                <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-brand-secondary" />
              )}

              <div className="flex gap-4 items-start">
                {/* Visual Category Icon */}
                <div className="h-9 w-9 bg-brand-surface-muted border border-brand-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="space-y-1 pr-4">
                  <h4 className={`font-serif text-base font-semibold text-brand-primary ${!notif.isRead ? 'font-bold' : ''}`}>
                    {notif.title}
                  </h4>
                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed max-w-2xl">
                    {notif.description}
                  </p>
                  <span className="font-sans text-[9px] text-brand-text-muted block pt-1">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 self-center">
                {!notif.isRead && (
                  <button
                    id={`notif-read-btn-${notif.id}`}
                    onClick={() => onMarkAsRead(notif.id)}
                    className="text-xs font-sans font-bold text-brand-gold-dark hover:underline p-1.5 cursor-pointer"
                    title="Mark as read"
                  >
                    Read
                  </button>
                )}
                <button
                  id={`notif-delete-btn-${notif.id}`}
                  onClick={() => onClearNotification(notif.id)}
                  className="text-brand-text-muted hover:text-red-500 p-1.5 cursor-pointer transition-colors"
                  title="Dismiss notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="bg-brand-surface border border-dashed border-brand-accent p-12 text-center flex flex-col items-center justify-center min-h-[220px]">
            <div className="h-12 w-12 rounded-none bg-brand-surface-muted flex items-center justify-center text-brand-text-muted mb-4 border border-brand-accent">
              <Bell className="h-5 w-5" />
            </div>
            <p className="font-serif text-lg font-medium text-brand-primary">Inboxes are completely empty</p>
            <p className="font-sans text-xs text-brand-text-muted max-w-xs mt-1">
              You are completely up to date! We will alert you when active slots are updated or priority offers land.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
