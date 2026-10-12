/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Trash2,
  Plus,
  Check,
  Globe,
  Bell,
  Lock,
  Database,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { DashboardUser, UserAddress } from './types';
import { settingsRepository } from '../../lib/firestoreService';
import { FirestoreSalonSettings } from '../../types/firestore';
import Button from '../ui/Button';
import { Input } from '../ui/InputFields';
import { Modal } from '../ui/Overlay';

interface DashboardProfileAndSettingsProps {
  id: string;
  user: DashboardUser;
  onUpdateUser: (updatedUser: Partial<DashboardUser>) => void;
  onAddAddress: (address: Omit<UserAddress, 'id'>) => void;
  onDeleteAddress: (addressId: string) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function DashboardProfileAndSettings({
  id,
  user,
  onUpdateUser,
  onAddAddress,
  onDeleteAddress,
  triggerToast
}: DashboardProfileAndSettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'settings'>('profile');

  // Form profile states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [isLoading, setIsLoading] = useState(false);
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsRepository.getSalonSettings().then((s) => {
      if (isMounted && s) setSalonSettings(s);
    }).catch(err => {
      console.warn('Notice reading salon settings in DashboardProfileAndSettings:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const addressPlaceholder = salonSettings?.address
    ? (typeof salonSettings.address === 'object' ? `${salonSettings.address.line1}` : salonSettings.address)
    : 'Address unavailable';

  // Address creation states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addrTitle, setAddrTitle] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // App preferences
  const [appLanguage, setAppLanguage] = useState(user.preferences.language);
  const [newsletter, setNewsletter] = useState(user.preferences.newsletter);
  const [reminders, setReminders] = useState(user.preferences.appointmentReminders);
  const [smsNotifs, setSmsNotifs] = useState(user.preferences.smsNotifications);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onUpdateUser({ name, email, phone });
      triggerToast('success', 'Profile Records Updated', 'Your identity details have been successfully saved.');
    }, 1200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      triggerToast('error', 'Incomplete Form', 'Please complete all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('error', 'Mismatch Error', 'New passwords do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('success', 'Credentials Re-secured', 'Your password credentials have been successfully updated.');
    }, 1500);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle || !addrStreet || !addrCity || !addrState || !addrZip) {
      triggerToast('error', 'Form Incomplete', 'Please fill out all address fields.');
      return;
    }

    onAddAddress({
      title: addrTitle,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zipCode: addrZip
    });

    triggerToast('success', 'Address Saved', `Location "${addrTitle}" has been added to your profile.`);
    setIsAddressModalOpen(false);

    // reset forms
    setAddrTitle('');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrZip('');
  };

  const handlePreferencesSave = () => {
    onUpdateUser({
      preferences: {
        ...user.preferences,
        language: appLanguage,
        newsletter,
        appointmentReminders: reminders,
        smsNotifications: smsNotifs
      }
    });
    triggerToast('success', 'Preferences Updated', 'Your dashboard configurations have been synchronized.');
  };

  const handleAvatarUpdateClick = () => {
    triggerToast('info', 'Secure Image Service', 'Connecting secure storage service. Selecting new portrait asset...');
    
    setTimeout(() => {
      onUpdateUser({
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      });
      triggerToast('success', 'Avatar Uploaded', 'Your profile portrait has been successfully updated.');
    }, 1000);
  };

  return (
    <div id={id} className="space-y-6">
      
      {/* Sub-tab navigation */}
      <div className="flex border-b border-brand-accent bg-brand-surface p-2 border">
        {(['profile', 'addresses', 'settings'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              id={`tab-settings-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 font-sans text-xs uppercase tracking-wider font-semibold text-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-secondary text-brand-bg font-bold'
                  : 'text-brand-text-muted hover:text-brand-primary'
              }`}
            >
              {tab === 'profile' ? 'Identity & Credentials' : tab === 'addresses' ? 'Saved Locations' : 'App preferences'}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        
        {/* IDENTITY & CREDENTIALS SUB-TAB */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Photo Upload placeholder */}
            <div className="bg-brand-surface border border-brand-accent p-6 text-center space-y-4">
              <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                PROFILE PORTRAIT
              </span>

              <div className="relative w-28 h-28 mx-auto group">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-28 h-28 border border-brand-accent rounded-none object-cover"
                />
                <button
                  id="avatar-upload-icon-trigger"
                  type="button"
                  onClick={handleAvatarUpdateClick}
                  className="absolute inset-0 bg-[#121212]/90 text-brand-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="h-6 w-6 text-brand-secondary" />
                </button>
              </div>

              <div>
                <h4 className="font-serif text-lg font-semibold text-brand-primary">
                  {user.name}
                </h4>
                <p className="font-sans text-xs text-brand-text-muted">{user.email}</p>
              </div>

              <div className="bg-brand-gold-light border border-brand-secondary/35 p-3 text-left">
                <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-brand-gold-dark block">
                  ROLE PRIVILEGE
                </span>
                <p className="font-serif text-sm font-semibold text-brand-primary mt-1">
                  Active Royal Guest member
                </p>
                <p className="font-sans text-[10px] text-brand-text-muted mt-0.5">
                  Priority scheduling and billing ledger integration enabled.
                </p>
              </div>
            </div>

            {/* Middle Column: Personal details form */}
            <div className="bg-brand-surface border border-brand-accent p-6 md:p-8 lg:col-span-2 space-y-6">
              <h3 className="font-serif text-lg font-semibold text-brand-primary border-b border-brand-surface-muted pb-3 flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-brand-secondary" /> Edit Identity Profile
              </h3>

              <form onSubmit={handleProfileSubmit} id="profile-details-form" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="profile-name"
                    type="text"
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="h-4 w-4 text-brand-text-muted" />}
                    required
                  />
                  <Input
                    id="profile-email"
                    type="email"
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4 text-brand-text-muted" />}
                    required
                  />
                </div>

                <Input
                  id="profile-phone"
                  type="tel"
                  label="Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4 text-brand-text-muted" />}
                  disabled={true}
                  helperText="Authoritative mobile identity verified via phone authentication."
                />

                <div className="flex justify-end pt-2">
                  <Button
                    id="profile-details-submit"
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    className="font-sans text-[10px] uppercase tracking-widest font-bold py-3 px-6"
                  >
                    Save Records
                  </Button>
                </div>
              </form>

              {/* Password update section */}
              <div className="luxury-divider" />

              <h3 className="font-serif text-lg font-semibold text-brand-primary pb-1 flex items-center gap-2">
                <Lock className="h-4.5 w-4.5 text-brand-secondary" /> Adjust Security Credentials
              </h3>

              <form onSubmit={handlePasswordSubmit} id="profile-password-form" className="space-y-4">
                <Input
                  id="pass-current"
                  type="password"
                  label="Current Access Password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="pass-new"
                    type="password"
                    label="Define New Password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    id="pass-confirm"
                    type="password"
                    label="Confirm New Password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    id="profile-password-submit"
                    type="submit"
                    variant="outline"
                    size="md"
                    className="font-sans text-[10px] uppercase tracking-widest font-bold py-3 px-6 border-brand-accent hover:border-brand-secondary"
                  >
                    Renew Credentials
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* SAVED LOCATIONS SUB-TAB */}
        {activeTab === 'addresses' && (
          <motion.div
            key="addresses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-brand-surface p-4 border border-brand-accent">
              <div>
                <h3 className="font-serif text-lg font-semibold text-brand-primary">
                  Stored Locations
                </h3>
                <p className="font-sans text-xs text-brand-text-muted">
                  Manage standard addresses for bespoke home-salon treatments or invoice billing.
                </p>
              </div>

              <Button
                id="add-address-trigger-btn"
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setIsAddressModalOpen(true)}
                className="font-sans text-[10px] uppercase tracking-wider font-bold py-2.5 px-4"
              >
                Add Address
              </Button>
            </div>

            {/* List of Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-brand-surface border border-brand-accent p-5 flex justify-between hover:border-brand-secondary/40 transition-all duration-300 relative group"
                >
                  <div className="space-y-2">
                    <span className="bg-brand-gold-light text-brand-gold-dark font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 border border-brand-secondary/20">
                      {addr.title}
                    </span>
                    <p className="font-serif text-base font-semibold text-brand-primary mt-2">
                      {addr.street}
                    </p>
                    <p className="font-sans text-xs text-brand-text-muted">
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                  </div>

                  <button
                    id={`delete-address-btn-${addr.id}`}
                    onClick={() => {
                      onDeleteAddress(addr.id);
                      triggerToast('warning', 'Address Deleted', `Location "${addr.title}" is discarded.`);
                    }}
                    className="text-brand-text-muted hover:text-red-500 transition-colors p-2 self-start cursor-pointer"
                    title="Delete saved address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {user.addresses.length === 0 && (
                <div className="col-span-2 bg-brand-surface border border-dashed border-brand-accent p-10 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <MapPin className="h-6 w-6 text-brand-text-muted mb-2" />
                  <p className="font-serif text-base font-semibold text-brand-primary">No Stored Locations</p>
                  <p className="font-sans text-xs text-brand-text-muted mt-1">
                    Store addresses for priority home concierge beauty treatments or express shipping.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SETTINGS SUB-TAB */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* General Preferences form */}
            <div className="bg-brand-surface border border-brand-accent p-6 md:p-8 lg:col-span-2 space-y-6">
              <h3 className="font-serif text-lg font-semibold text-brand-primary border-b border-brand-surface-muted pb-3 flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-brand-secondary" /> System & Language
              </h3>

              {/* Language Selection */}
              <div className="space-y-2">
                <label htmlFor="language-select" className="font-sans text-xs uppercase tracking-wider font-semibold text-brand-text">
                  Portal Language
                </label>
                <select
                  id="language-select"
                  value={appLanguage}
                  onChange={(e) => setAppLanguage(e.target.value)}
                  className="w-full bg-brand-bg text-brand-text border border-brand-accent px-3 py-3 font-sans text-xs outline-none focus:border-brand-secondary"
                >
                  <option value="en">English (US Luxury Standard)</option>
                  <option value="fr">Français (Paris Elegant)</option>
                  <option value="it">Italiano (Milan Couture)</option>
                  <option value="ar">العربية (Dubai Premium)</option>
                </select>
              </div>

              {/* Notification Checklist */}
              <div className="luxury-divider" />

              <h3 className="font-serif text-lg font-semibold text-brand-primary flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-brand-secondary" /> Notifications & Reminders
              </h3>

              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-start gap-3">
                  <input
                    id="notif-reminders"
                    type="checkbox"
                    checked={reminders}
                    onChange={(e) => setReminders(e.target.checked)}
                    className="h-4.5 w-4.5 text-brand-secondary border-brand-accent focus:ring-brand-secondary"
                  />
                  <div>
                    <label htmlFor="notif-reminders" className="font-semibold text-brand-primary">Appointment Reminders</label>
                    <p className="text-brand-text-muted mt-0.5">Receive email alerts 24 hours prior to scheduled concierge slots.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="notif-sms"
                    type="checkbox"
                    checked={smsNotifs}
                    onChange={(e) => setSmsNotifs(e.target.checked)}
                    className="h-4.5 w-4.5 text-brand-secondary border-brand-accent focus:ring-brand-secondary"
                  />
                  <div>
                    <label htmlFor="notif-sms" className="font-semibold text-brand-primary">SMS Dispatches</label>
                    <p className="text-brand-text-muted mt-0.5">Transmit instant text schedules when booking or rescheduling slots.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="notif-news"
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="h-4.5 w-4.5 text-brand-secondary border-brand-accent focus:ring-brand-secondary"
                  />
                  <div>
                    <label htmlFor="notif-news" className="font-semibold text-brand-primary">Sovereign Journal & Vouchers</label>
                    <p className="text-brand-text-muted mt-0.5">Receive monthly lifestyle journals, trend updates, and priority member vouchers.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  id="preferences-submit-btn"
                  onClick={handlePreferencesSave}
                  variant="primary"
                  size="md"
                  className="font-sans text-[10px] uppercase tracking-widest font-bold py-3 px-6"
                >
                  Save Preferences
                </Button>
              </div>
            </div>

            {/* Right column: Database Integration Showcase */}
            <div className="bg-brand-surface border border-brand-accent p-6 space-y-4">
              <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted font-bold block">
                INTEGRATIONS HUB
              </span>

              <div className="flex items-center gap-2 border-b border-brand-surface-muted pb-3.5">
                <Database className="h-5 w-5 text-brand-secondary" />
                <h4 className="font-serif text-base font-semibold text-brand-primary">
                  Supabase Integration
                </h4>
              </div>

              <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                This client-side dashboard is built to be completely compatible with <strong className="text-brand-primary">Supabase</strong>. The tables for <code>profiles</code>, <code>appointments</code>, <code>wallet_logs</code>, and <code>saved_addresses</code> can be connected instantly via the environmental schema variables.
              </p>

              <div className="bg-brand-gold-light border border-brand-secondary/35 p-3 flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-gold-dark flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-sans text-[10px] uppercase font-bold text-brand-gold-dark block">
                    CLIENT-SIDE PRE-CONFIGURED
                  </span>
                  <span className="font-sans text-[10px] text-brand-text-muted block mt-0.5">
                    Forms, handlers, and persistence hooks are ready for immediate server integration.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ==============================================
          ADD LOCATION ADDRESS POPUP SHEET
          ============================================== */}
      <Modal
        id="profile-add-address-modal"
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add Saved Location"
        size="md"
      >
        <form onSubmit={handleAddAddressSubmit} id="add-address-form" className="space-y-4 pt-2 pb-4">
          <Input
            id="addr-input-title"
            type="text"
            label="Location Label (e.g. Home, Office, Beach Club)"
            placeholder="Home Suite"
            value={addrTitle}
            onChange={(e) => setAddrTitle(e.target.value)}
            required
          />

          <Input
            id="addr-input-street"
            type="text"
            label="Street Address Line 1"
            placeholder={addressPlaceholder}
            value={addrStreet}
            onChange={(e) => setAddrStreet(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Input
                id="addr-input-city"
                type="text"
                label="City"
                placeholder="City"
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                id="addr-input-state"
                type="text"
                label="State"
                placeholder="State / Region"
                value={addrState}
                onChange={(e) => setAddrState(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                id="addr-input-zip"
                type="text"
                label="ZIP Code"
                placeholder="10001"
                value={addrZip}
                onChange={(e) => setAddrZip(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-brand-surface-muted">
            <Button
              id="address-cancel-btn"
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddressModalOpen(false)}
              className="font-sans text-[10px] uppercase tracking-wider font-semibold border-brand-accent hover:border-brand-secondary"
            >
              Cancel
            </Button>
            <Button
              id="address-submit-btn"
              type="submit"
              variant="primary"
              size="md"
              className="font-sans text-[10px] uppercase tracking-wider font-semibold px-6"
            >
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
