/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'admin' | 'staff';

export interface UserAddress {
  id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  newsletter: boolean;
  appointmentReminders: boolean;
  smsNotifications: boolean;
}

export interface FirestoreUser {
  uid: string;
  id?: string;
  email: string;
  fullName: string;
  full_name?: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  avatar_url?: string;
  walletBalance: number;
  wallet_balance?: number;
  loyaltyPoints: number;
  loyalty_points?: number;
  membershipPlan: 'Silver' | 'Royal Elite' | 'Imperial Gold' | 'None';
  membership_plan?: string;
  membershipExpiryDate?: string;
  membershipStartDate?: string;
  addresses?: UserAddress[];
  preferences?: UserPreferences;
  isActive?: boolean;
  is_active?: boolean;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export type ServiceGenderCategory = 'Men' | 'Women' | 'Boy' | 'Girl' | 'Third Gender' | 'Other';

export interface FirestoreService {
  id: string;
  name: string;
  category: string;
  gender?: ServiceGenderCategory;
  price: number;
  duration_minutes: number;
  durationMinutes?: number;
  description: string;
  shortDescription?: string;
  image_url: string;
  imageUrl?: string;
  benefits?: string[];
  includedServices?: string[];
  popular?: boolean;
  rating?: number;
  reviewsCount?: number;
  is_active: boolean;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FirestoreOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  code?: string;
  discount_percent?: number;
  discountAmount?: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  image_url?: string;
  imageUrl?: string;
  start_date?: string;
  end_date?: string;
  validFrom?: string;
  validUntil?: string;
  valid_until?: string;
  is_active: boolean;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
}

export interface FirestoreGalleryItem {
  id: string;
  title: string;
  image_url: string;
  imageUrl?: string;
  video_url?: string;
  category: string;
  caption?: string;
  featured?: boolean;
  is_active: boolean;
  isActive?: boolean;
  sort_order?: number;
  order?: number;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
}

export interface SalonOpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface FirestoreSalonSettings {
  id?: string;
  salon_name: string;
  salonName?: string;
  tagline?: string;
  address?: string | {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  whatsapp?: string;
  email?: string;
  timezone?: string;
  time_zone?: string;
  holidays?: string[];
  opening_hours: SalonOpeningHours[] | string;
  openingHours?: SalonOpeningHours[];
  slotDurationMinutes?: number;
  maxConcurrentBookings?: number;
  social_links?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  logo_url?: string;
  hero_image_url?: string;
  updated_at?: string;
  updatedAt?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethodType = 'card' | 'upi' | 'wallet' | 'razorpay' | 'cash';

export interface FirestoreBooking {
  id: string;
  customer_id: string;
  userId?: string;
  service_id: string;
  serviceId?: string;
  service_name: string;
  serviceName?: string;
  serviceNameSnapshot?: string;
  gender: ServiceGenderCategory;
  booking_date: string; // YYYY-MM-DD
  date?: string;
  start_time: string; // e.g., "10:00 AM" or "10:00"
  startTime?: string;
  end_time: string; // e.g., "11:30 AM" or "11:30"
  endTime?: string;
  duration_minutes: number;
  durationMinutes?: number;
  price: number;
  priceSnapshot?: number;
  discountApplied?: number;
  promoCodeApplied?: string;
  status: BookingStatus;
  bookingStatus?: BookingStatus;
  payment_status: PaymentStatus;
  paymentStatus?: PaymentStatus;
  payment_method?: PaymentMethodType;
  paymentMethod?: PaymentMethodType;
  ticket_code: string;
  ticketCode?: string;
  notes?: string;
  // Staff assignment is strictly internal/salon-controlled (optional):
  staff_id?: string;
  staffId?: string;
  staff_name?: string;
  staffNameSnapshot?: string;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
}

export type PublicSlotStatus = 'available' | 'unavailable' | 'blocked';

export interface PublicSlotAvailability {
  date: string;
  start_time: string;
  end_time: string;
  status: PublicSlotStatus;
}

export type SlotStatus = 'available' | 'unavailable' | 'blocked';

export interface FirestoreSlot {
  id: string; // Format: "slot_YYYY-MM-DD_HH-MM"
  booking_date: string; // YYYY-MM-DD
  date?: string;
  start_time: string; // e.g., "10:00 AM" or "10:00"
  startTime?: string;
  end_time: string; // e.g., "10:30 AM" or "10:30"
  endTime?: string;
  status: SlotStatus;
  // Internal server & salon administration attributes (never exposed to customer availability reads):
  booking_id?: string;
  bookingId?: string;
  customer_id?: string;
  customerId?: string;
  staff_id?: string;
  staffId?: string;
  booked_count?: number;
  bookedCount?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export type TicketCheckInStatus = 'issued' | 'scanned' | 'expired';

export interface FirestoreTicket {
  id: string;
  booking_id: string;
  bookingId?: string;
  customer_id: string;
  customerId?: string;
  userId?: string;
  ticket_code: string;
  ticketCode?: string;
  customer_name: string;
  customerName?: string;
  service_name: string;
  serviceName?: string;
  gender: ServiceGenderCategory;
  booking_date: string;
  bookingDate?: string;
  date?: string;
  start_time: string;
  startTime?: string;
  end_time: string;
  endTime?: string;
  duration_minutes: number;
  durationMinutes?: number;
  amount: number;
  booking_status: BookingStatus;
  bookingStatus?: BookingStatus;
  qr_code_payload?: string;
  qrCodePayload?: string;
  checkInStatus?: TicketCheckInStatus;
  treatmentRoom?: string;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
}

export type ConciergeRequestStatus = 'submitted' | 'reviewed' | 'contacted' | 'completed' | 'cancelled';

export interface FirestoreConciergeRequest {
  id: string;
  customer_id: string;
  customerId?: string;
  customer_name: string;
  customerName?: string;
  customer_email?: string;
  customer_phone?: string;
  service_id: string;
  serviceId?: string;
  service_name: string;
  serviceName?: string;
  gender: ServiceGenderCategory;
  booking_date: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  total_amount: number;
  discount_applied?: number;
  promo_code?: string;
  notes?: string;
  status: ConciergeRequestStatus;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  staff_notes?: string;
}

