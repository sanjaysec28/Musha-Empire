/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DashboardViewType =
  | 'overview'
  | 'appointments'
  | 'history'
  | 'wallet'
  | 'rewards'
  | 'membership'
  | 'addresses'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'reviews'
  | 'staff';

export type AuthScreenType =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'otp-verification';

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  walletBalance: number;
  loyaltyPoints: number;
  membershipPlan: 'Silver' | 'Royal Elite' | 'Imperial Gold' | 'None';
  membershipRenewalDate: string;
  membershipStartDate?: string;
  membershipExpiryDate?: string;
  membershipRemainingDays?: number;
  membershipStatus?: string;
  addresses: UserAddress[];
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    newsletter: boolean;
    appointmentReminders: boolean;
    smsNotifications: boolean;
  };
}

export interface UserAddress {
  id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface DashboardAppointment {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  stylistName: string;
  stylistAvatar: string;
  date: string;
  timeSlot: string;
  price: number;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  qrCodeUrl: string;
  invoiceUrl: string;
  realStatus?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  status: 'success' | 'failed' | 'pending';
}

export interface LoyaltyRewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  iconName: string;
  claimedAt?: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: 'appointment' | 'wallet' | 'membership' | 'general' | 'reward';
}
