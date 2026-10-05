/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  History,
  Wallet,
  Award,
  Crown,
  MapPin,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  Star,
  Users
} from 'lucide-react';
import {
  DashboardViewType,
  DashboardUser,
  DashboardAppointment,
  WalletTransaction,
  LoyaltyRewardItem,
  DashboardNotification,
  UserAddress
} from './types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { EXTENDED_SERVICES_DATA } from '../../data/servicesExtendedData';
import { STYLISTS_DATA } from '../../data/salonData';

// Subviews
import DashboardOverview from './DashboardOverview';
import DashboardAppointments from './DashboardAppointments';
import DashboardWallet from './DashboardWallet';
import DashboardLoyalty from './DashboardLoyalty';
import DashboardMembership from './DashboardMembership';
import DashboardProfileAndSettings from './DashboardProfileAndSettings';
import DashboardNotifications from './DashboardNotifications';
import DashboardReviews from './DashboardReviews';
import MushaEmpireLogo from '../ui/MushaEmpireLogo';

interface DashboardModuleProps {
  id: string;
  onLogout: () => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
  userProfile: { name: string; email: string; phone: string };
}

// ==============================================
// SEED CONSTANTS FOR PRIVATE PORTAL
// ==============================================
const DEFAULT_USER: DashboardUser = {
  id: 'USR-89012-NY',
  name: 'Sanjay Kumar',
  email: 'sanjaykumar4747pc@gmail.com',
  phone: '+1 (555) 019-2834',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  walletBalance: 325.50,
  loyaltyPoints: 1450,
  membershipPlan: 'Silver',
  membershipRenewalDate: 'Jul 30, 2026',
  addresses: [
    { id: 'addr-1', title: 'Manhattan Penthouse', street: '512 Park Avenue, Suite 12A', city: 'New York', state: 'NY', zipCode: '10021' },
    { id: 'addr-2', title: 'Hamptons Villa', street: '14 Bayberry Lane', city: 'East Hampton', state: 'NY', zipCode: '11937' }
  ],
  preferences: {
    language: 'en',
    theme: 'light',
    newsletter: true,
    appointmentReminders: true,
    smsNotifications: true
  }
};

const DEFAULT_APPOINTMENTS: DashboardAppointment[] = [
  {
    id: 'MSH-89102-VX',
    serviceId: 'hair-cut-1',
    serviceName: 'Master Haircut & Styling',
    category: 'Styling',
    stylistName: 'Viktor Vance',
    stylistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
    date: '2026-07-04',
    timeSlot: '02:30 PM',
    price: 95.00,
    duration: '45 mins',
    status: 'upcoming',
    paymentStatus: 'paid',
    qrCodeUrl: '#qr-code-placeholder',
    invoiceUrl: '#invoice-download'
  },
  {
    id: 'MSH-78192-ER',
    serviceId: 'skin-facial-1',
    serviceName: 'Imperial Glow facial Therapy',
    category: 'Facial',
    stylistName: 'Elena Rostova',
    stylistAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100',
    date: '2026-06-25',
    timeSlot: '11:00 AM',
    price: 150.00,
    duration: '60 mins',
    status: 'completed',
    paymentStatus: 'paid',
    qrCodeUrl: '#qr-code-placeholder',
    invoiceUrl: '#invoice-download'
  },
  {
    id: 'MSH-67123-MB',
    serviceId: 'grooming-beard-1',
    serviceName: 'Classic Beard Sculpting & Massage',
    category: 'Grooming',
    stylistName: 'Marcus Brodie',
    stylistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
    date: '2026-06-12',
    timeSlot: '04:30 PM',
    price: 60.00,
    duration: '35 mins',
    status: 'cancelled',
    paymentStatus: 'refunded',
    qrCodeUrl: '#qr-code-placeholder',
    invoiceUrl: '#invoice-download'
  }
];

const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  { id: 'TX-90182', amount: 95.00, type: 'debit', description: 'Pre-payment: Haircut & Royal Styling', date: 'Jun 28, 2026', status: 'success' },
  { id: 'TX-89102', amount: 150.00, type: 'credit', description: 'Deposited funds via Visa Card (***4242)', date: 'Jun 25, 2026', status: 'success' },
  { id: 'TX-78123', amount: 15.00, type: 'credit', description: 'Loyalty points top-up reward credit', date: 'Jun 15, 2026', status: 'success' },
  { id: 'TX-67102', amount: 60.00, type: 'credit', description: 'Refund: Classic Beard Sculpt (Cancelled)', date: 'Jun 12, 2026', status: 'success' }
];

const DEFAULT_REWARDS: LoyaltyRewardItem[] = [
  { id: 'RWD-01', title: 'Bespoke Hot Stone Scalp massage', description: 'Add a deeply relaxing 20-minute hot basalt stone scalp loop to any haircut package.', pointsCost: 400, category: 'Scalp Care', iconName: 'Scalp' },
  { id: 'RWD-02', title: 'Signature Imperial Hair Spa upgrade', description: 'Nourish hair roots with steam mist loops and luxury natural botanical butter formulas.', pointsCost: 650, category: 'Hair Treatment', iconName: 'Spa' },
  { id: 'RWD-03', title: 'Privilege Beard Grooming & Cologne Spray', description: 'Sculpt sideburns with precise line grooming and premium bespoke sandalwood cologne splashes.', pointsCost: 350, category: 'Grooming', iconName: 'Beard' },
  { id: 'RWD-04', title: 'Sovereign Hydrating facial Therapy', description: 'Deep cell exfoliation with organic luxury gold-infused micro-scrub masks.', pointsCost: 1200, category: 'Facial', iconName: 'Facial' }
];

const DEFAULT_NOTIFICATIONS: DashboardNotification[] = [
  { id: 'NTF-1', title: 'Prepayment Confirmed', description: 'We verified your $95.00 transaction for Haircut & Styling on Jul 4. Your priority lounge ticket is generated.', timestamp: '2 hours ago', isRead: false, type: 'wallet' },
  { id: 'NTF-2', title: 'Welcome to the Privilege Circle', description: 'Your private salon digital manager is active. Manage pre-fundings, claim gift vouchers, or book master artists.', timestamp: '1 day ago', isRead: true, type: 'general' },
  { id: 'NTF-3', title: 'Congratulations! Level Up to Gold Tier', description: 'Your loyalty achievements crossed 1,000 pts. You are now a Gold Elite patron, unlocking quarterly spa perks.', timestamp: '2 weeks ago', isRead: true, type: 'reward' }
];

export default function DashboardModule({ id, onLogout, triggerToast, userProfile }: DashboardModuleProps) {
  const [currentView, setCurrentView] = useState<DashboardViewType>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);

  // Persistence State Managers
  const [user, setUser] = useState<DashboardUser>(() => {
    try {
      const saved = localStorage.getItem('musha_db_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sync registration details from login profile
        parsed.name = userProfile.name;
        parsed.email = userProfile.email;
        parsed.phone = userProfile.phone;
        return parsed;
      }
    } catch {}
    return { ...DEFAULT_USER, name: userProfile.name, email: userProfile.email, phone: userProfile.phone };
  });

  const [appointments, setAppointments] = useState<DashboardAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('musha_db_appointments');
      return saved ? JSON.parse(saved) : DEFAULT_APPOINTMENTS;
    } catch {
      return DEFAULT_APPOINTMENTS;
    }
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('musha_db_transactions');
      return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  });

  const [rewards, setRewards] = useState<LoyaltyRewardItem[]>(() => {
    try {
      const saved = localStorage.getItem('musha_db_rewards');
      return saved ? JSON.parse(saved) : DEFAULT_REWARDS;
    } catch {
      return DEFAULT_REWARDS;
    }
  });

  const [notifications, setNotifications] = useState<DashboardNotification[]>(() => {
    try {
      const saved = localStorage.getItem('musha_db_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up real-time subscription to auto-refresh state on remote database changes
  useEffect(() => {
    let activeChannel: any = null;
    let isMounted = true;

    const setupRealtime = async () => {
      if (!isSupabaseConfigured) return;
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || !isMounted) return;

      const channelId = `pub-changes-${authUser.id}-${Math.random().toString(36).substring(2, 9)}`;
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customers_wallet', filter: `customer_id=eq.${authUser.id}` },
          () => {
            if (isMounted) {
              setRefreshTrigger(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wallet_transactions', filter: `customer_id=eq.${authUser.id}` },
          () => {
            if (isMounted) {
              setRefreshTrigger(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `profile_id=eq.${authUser.id}` },
          () => {
            if (isMounted) {
              setRefreshTrigger(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customer_memberships', filter: `customer_id=eq.${authUser.id}` },
          () => {
            if (isMounted) {
              setRefreshTrigger(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reviews' },
          () => {
            if (isMounted) {
              setRefreshTrigger(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `customer_id=eq.${authUser.id}` },
          () => {
            if (isMounted) {
              setRefreshTrigger(prev => prev + 1);
            }
          }
        );

      if (isMounted) {
        activeChannel = channel;
        channel.subscribe();
      } else {
        supabase.removeChannel(channel);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, []);

  // Synchronize States with LocalStorage
  useEffect(() => {
    localStorage.setItem('musha_db_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('musha_db_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Synchronize entire user state, memberships, wallet, transactions and notifications with live Supabase database
  useEffect(() => {
    let isMounted = true;

    const fetchSupabaseProfileAndData = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        let profileName = userProfile.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Member';
        let profilePhone = userProfile.phone || authUser.user_metadata?.phone || '';
        let profileAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150';

        if (profile) {
          profileName = profile.full_name || profileName;
          profilePhone = profile.phone || profilePhone;
          profileAvatar = profile.avatar_url || profileAvatar;
        }

        // 2. Fetch Wallet
        let walletBalance = 325.50; // default seed balance
        let walletId = '';
        const { data: walletData } = await supabase
          .from('customers_wallet')
          .select('*')
          .eq('customer_id', authUser.id)
          .maybeSingle();

        if (walletData) {
          walletBalance = typeof walletData.balance === 'number' ? walletData.balance : parseFloat(walletData.balance) || 0;
          walletId = walletData.id;
        } else {
          // Create one if none exists
          const { data: newWallet } = await supabase
            .from('customers_wallet')
            .insert({
              customer_id: authUser.id,
              balance: walletBalance
            })
            .select()
            .maybeSingle();
          if (newWallet) {
            walletId = newWallet.id;
          }
        }

        // 3. Fetch Transactions
        let mappedTxs: WalletTransaction[] = [];
        if (walletId) {
          const { data: dbTxs } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('wallet_id', walletId)
            .order('created_at', { ascending: false });

          if (dbTxs && dbTxs.length > 0) {
            mappedTxs = dbTxs.map((tx) => ({
              id: tx.id,
              amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
              type: tx.transaction_type as 'credit' | 'debit',
              description: tx.description,
              date: new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: 'success'
            }));
          } else {
            // Seed transactions
            const initialTxs = DEFAULT_TRANSACTIONS.map(tx => ({
              wallet_id: walletId,
              amount: tx.amount,
              transaction_type: tx.type,
              description: tx.description,
              created_at: new Date().toISOString()
            }));
            await supabase.from('wallet_transactions').insert(initialTxs);
            mappedTxs = DEFAULT_TRANSACTIONS;
          }
        }

        // 4. Fetch Membership Status
        let membershipPlanName: 'Silver' | 'Royal Elite' | 'Imperial Gold' | 'None' = 'Silver';
        let membershipStartDate = '';
        let membershipExpiryDate = '';
        let membershipRemainingDays = 365;
        let membershipStatus = 'Active';

        const { data: dbMemberships } = await supabase
          .from('customer_memberships')
          .select('*')
          .eq('customer_id', authUser.id)
          .maybeSingle();

        // Ensure plans exist
        const { data: existingPlans } = await supabase.from('membership_plans').select('*');
        let planList = existingPlans || [];
        if (planList.length === 0) {
          const plansToSeed = [
            { name: 'Silver', price: 0, is_active: true },
            { name: 'Royal Elite', price: 150, is_active: true },
            { name: 'Imperial Gold', price: 300, is_active: true }
          ];
          const { data: seededPlans } = await supabase.from('membership_plans').insert(plansToSeed).select();
          planList = seededPlans || [];
        }

        if (dbMemberships) {
          const matchedPlan = planList.find(p => p.id === dbMemberships.membership_plan_id);
          if (matchedPlan) {
            membershipPlanName = matchedPlan.name as any;
          }
          const rawStart = dbMemberships.start_date || dbMemberships.created_at || new Date().toISOString();
          const rawEnd = dbMemberships.expires_at || dbMemberships.expiry_date || dbMemberships.end_date || new Date(new Date(rawStart).getTime() + 365 * 24 * 3600 * 1000).toISOString();
          
          membershipStartDate = new Date(rawStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          membershipExpiryDate = new Date(rawEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          membershipRemainingDays = Math.max(0, Math.ceil((new Date(rawEnd).getTime() - Date.now()) / (1000 * 3600 * 24)));
          membershipStatus = dbMemberships.status || 'Active';
        } else {
          // Initialize Silver membership
          const silverPlan = planList.find(p => p.name === 'Silver');
          if (silverPlan) {
            await supabase.from('customer_memberships').insert({
              customer_id: authUser.id,
              membership_plan_id: silverPlan.id,
              status: 'active'
            });
          }
          const rawStart = new Date().toISOString();
          const rawEnd = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
          
          membershipStartDate = new Date(rawStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          membershipExpiryDate = new Date(rawEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          membershipRemainingDays = 365;
          membershipStatus = 'active';
        }

        // 5. Fetch Notifications
        const { data: dbNotifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', authUser.id)
          .order('created_at', { ascending: false });

        let mappedNotifs: DashboardNotification[] = [];
        if (dbNotifs && dbNotifs.length > 0) {
          mappedNotifs = dbNotifs.map((n) => ({
            id: n.id,
            title: n.title,
            description: n.message,
            timestamp: new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            isRead: n.is_read,
            type: n.title.toLowerCase().includes('wallet') ? 'wallet' : 'general'
          }));
        } else {
          // Seed notifications
          const initialNotifs = DEFAULT_NOTIFICATIONS.map(n => ({
            profile_id: authUser.id,
            title: n.title,
            message: n.description,
            is_read: n.isRead,
            created_at: new Date().toISOString()
          }));
          await supabase.from('notifications').insert(initialNotifs);
          mappedNotifs = DEFAULT_NOTIFICATIONS;
        }

        if (isMounted) {
          setUser(prev => ({
            ...prev,
            name: profileName,
            email: authUser.email || profile?.email || prev.email,
            phone: profilePhone,
            avatar: profileAvatar,
            walletBalance: walletBalance,
            membershipPlan: membershipPlanName,
            membershipRenewalDate: membershipExpiryDate,
            membershipStartDate,
            membershipExpiryDate,
            membershipRemainingDays,
            membershipStatus
          }));

          setTransactions(mappedTxs);
          setNotifications(mappedNotifs);
        }

      } catch (err) {
        console.error('Error fetching Supabase profile & details:', err);
      }
    };

    fetchSupabaseProfileAndData();
  }, [userProfile, refreshTrigger]);

  // Synchronize appointments with live Supabase database
  useEffect(() => {
    let isMounted = true;
    
    const fetchSupabaseBookings = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // Fetch user bookings from Supabase
        const { data: dbBookings, error: bErr } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', authUser.id)
          .order('created_at', { ascending: false });

        if (bErr) throw bErr;

        // Fetch companion tables for in-memory mapping to avoid nested relation failures
        const { data: dbServices } = await supabase.from('services').select('*');
        const { data: dbStaff } = await supabase.from('staff').select('*');
        const { data: dbBookingServices } = await supabase.from('booking_services').select('*');

        if (!dbBookings || dbBookings.length === 0) {
          return;
        }

        const servicesList = dbServices || [];
        const staffList = dbStaff || [];
        const bookingServicesList = dbBookingServices || [];

        // Map database records to exact DashboardAppointment structures
        const mappedAppointments: DashboardAppointment[] = dbBookings.map((b) => {
          // Find associated service in booking_services
          const bServices = bookingServicesList.filter((bs) => bs.booking_id === b.id);
          const firstServiceId = bServices[0]?.service_id;
          
          const service = servicesList.find((s) => s.id === firstServiceId);
          const localService = EXTENDED_SERVICES_DATA.find(s => s.id === firstServiceId || s.name.toLowerCase() === service?.name?.toLowerCase());
          
          const serviceName = service?.name || localService?.name || 'Empire Hair & Scalp Nourish';
          const category = localService?.category || 'Exclusive';
          const duration = service?.duration_minutes ? `${service.duration_minutes} Mins` : localService?.duration || '60 Mins';
          const price = typeof b.total_amount === 'number' ? b.total_amount : parseFloat(b.total_amount) || localService?.priceValue || 95;

          // Find stylist
          const stylist = staffList.find((s) => s.id === b.staff_id);
          const localStylist = STYLISTS_DATA.find(s => s.id === b.staff_id || s.name.toLowerCase() === stylist?.full_name?.toLowerCase());
          const stylistName = stylist?.full_name || localStylist?.name || 'Arthur Pendragon';
          const stylistAvatar = stylist?.image_url || localStylist?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100';

          return {
            id: b.id,
            serviceId: firstServiceId || 'hair-spa-1',
            serviceName,
            category,
            stylistName,
            stylistAvatar,
            date: b.booking_date,
            timeSlot: b.start_time,
            price,
            duration,
            status: b.status === 'cancelled' ? 'cancelled' : (b.status === 'completed' ? 'completed' : 'upcoming'),
            paymentStatus: b.status === 'cancelled' ? 'refunded' : 'paid',
            qrCodeUrl: '#qr-code-placeholder',
            invoiceUrl: '#invoice-download',
            realStatus: b.status as any
          };
        });

        if (isMounted) {
          setAppointments(mappedAppointments);
        }
      } catch (err) {
        console.error('Error synchronizing database bookings with dashboard:', err);
      }
    };

    fetchSupabaseBookings();

    // Set up rapid polling interval for instant booking display synchronization
    const interval = setInterval(fetchSupabaseBookings, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshTrigger]);

  useEffect(() => {
    localStorage.setItem('musha_db_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('musha_db_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('musha_db_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // ==============================================
  // ACTIONS DISPATCHERS
  // ==============================================
  const handleUpdateUser = async (updatedFields: Partial<DashboardUser>) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const updateData: any = {};
      if (updatedFields.name !== undefined) updateData.full_name = updatedFields.name;
      if (updatedFields.phone !== undefined) updateData.phone = updatedFields.phone;
      if (updatedFields.avatar !== undefined) updateData.avatar_url = updatedFields.avatar;

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', authUser.id);
      }
    } catch (err) {
      console.warn('Notice updating user profile in Supabase:', err);
    }
  };

  const handleAddAddress = (addressFields: Omit<UserAddress, 'id'>) => {
    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      ...addressFields
    };
    setUser((prev) => ({
      ...prev,
      addresses: [...prev.addresses, newAddr]
    }));
  };

  const handleDeleteAddress = (addressId: string) => {
    setUser((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((addr) => addr.id !== addressId)
    }));
  };

  const handleCancelAppointment = async (appId: string) => {
    const targetApp = appointments.find((app) => app.id === appId);
    if (!targetApp) return;

    // Set status to cancelled in state
    setAppointments((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: 'cancelled', paymentStatus: 'refunded', realStatus: 'cancelled' } : app))
    );

    const refundAmt = targetApp.price;
    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + refundAmt
    }));

    // Register local Transaction
    const newTxId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTx: WalletTransaction = {
      id: newTxId,
      amount: refundAmt,
      type: 'credit',
      description: `Refund: ${targetApp.serviceName} Cancellation`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'success'
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Push local notification
    const newNotifId = `NTF-${Date.now()}`;
    const newNotif: DashboardNotification = {
      id: newNotifId,
      title: 'Appointment Cancelled & Refunded',
      description: `Your prepayment of $${refundAmt.toFixed(2)} for ${targetApp.serviceName} is deposited back to your Empire Wallet.`,
      timestamp: 'Just now',
      isRead: false,
      type: 'wallet'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 1. Update appointment status to 'cancelled' in Supabase
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', appId);

      // 2. Fetch or create wallet
      let walletId = '';
      const { data: walletData } = await supabase
        .from('customers_wallet')
        .select('*')
        .eq('customer_id', authUser.id)
        .maybeSingle();

      if (walletData) {
        walletId = walletData.id;
        const currentBalance = typeof walletData.balance === 'number' ? walletData.balance : parseFloat(walletData.balance) || 0;
        await supabase
          .from('customers_wallet')
          .update({ balance: currentBalance + refundAmt })
          .eq('id', walletId);
      } else {
        const { data: newWallet } = await supabase
          .from('customers_wallet')
          .insert({ customer_id: authUser.id, balance: 325.50 + refundAmt })
          .select()
          .maybeSingle();
        if (newWallet) walletId = newWallet.id;
      }

      // 3. Write transaction
      if (walletId) {
        await supabase.from('wallet_transactions').insert({
          wallet_id: walletId,
          amount: refundAmt,
          transaction_type: 'credit',
          description: `Refund: ${targetApp.serviceName} Cancellation`
        });
      }

      // 4. Create Notification
      await supabase.from('notifications').insert({
        profile_id: authUser.id,
        title: 'Appointment Cancelled & Refunded',
        message: `Your prepayment of $${refundAmt.toFixed(2)} for ${targetApp.serviceName} is deposited back to your Empire Wallet.`,
        is_read: false
      });

    } catch (err) {
      console.warn('Notice executing cancellation in database:', err);
    }
  };

  const handleRescheduleAppointment = async (appId: string, date: string, time: string) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, date, timeSlot: time } : app))
    );

    // Push local Notification
    const target = appointments.find((a) => a.id === appId);
    const newNotifId = `NTF-${Date.now()}`;
    const newNotif: DashboardNotification = {
      id: newNotifId,
      title: 'Appointment Schedule Adjusted',
      description: `Your session of ${target?.serviceName} is adjusted to ${date} at ${time}.`,
      timestamp: 'Just now',
      isRead: false,
      type: 'appointment'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Update booking date & time
      await supabase
        .from('bookings')
        .update({
          booking_date: date,
          start_time: time
        })
        .eq('id', appId);

      // Write notification
      await supabase.from('notifications').insert({
        profile_id: authUser.id,
        title: 'Appointment Schedule Adjusted',
        message: `Your session of ${target?.serviceName || 'Empire Treatment'} is adjusted to ${date} at ${time}.`,
        is_read: false
      });
    } catch (err) {
      console.warn('Notice rescheduling appointment in database:', err);
    }
  };

  const handleAddFunds = async (amount: number) => {
    const bonus = amount >= 500 ? 100 : amount >= 250 ? 45 : amount >= 100 ? 15 : amount >= 50 ? 5 : 0;
    const totalDeposited = amount + bonus;

    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + totalDeposited
    }));

    // Register local Transaction
    const newTxId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTx: WalletTransaction = {
      id: newTxId,
      amount: amount,
      type: 'credit',
      description: `Deposit: Wallet funded via Credit Card`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'success'
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (bonus > 0) {
      const bonusTx: WalletTransaction = {
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: bonus,
        type: 'credit',
        description: `Promo: Complimentary deposit top-up match`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'success'
      };
      setTransactions((prev) => [bonusTx, ...prev]);
    }

    // Push local notification
    const newNotifId = `NTF-${Date.now()}`;
    const newNotif: DashboardNotification = {
      id: newNotifId,
      title: 'Wallet Funded Successfully',
      description: `Deposited $${amount.toFixed(2)} with a $${bonus}.00 complimentary privilege reward match.`,
      timestamp: 'Just now',
      isRead: false,
      type: 'wallet'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 1. Fetch wallet
      let walletId = '';
      const { data: walletData } = await supabase
        .from('customers_wallet')
        .select('*')
        .eq('customer_id', authUser.id)
        .maybeSingle();

      if (walletData) {
        walletId = walletData.id;
        const currentBalance = typeof walletData.balance === 'number' ? walletData.balance : parseFloat(walletData.balance) || 0;
        await supabase
          .from('customers_wallet')
          .update({ balance: currentBalance + totalDeposited })
          .eq('id', walletId);
      } else {
        const { data: newWallet } = await supabase
          .from('customers_wallet')
          .insert({ customer_id: authUser.id, balance: 325.50 + totalDeposited })
          .select()
          .maybeSingle();
        if (newWallet) walletId = newWallet.id;
      }

      if (walletId) {
        // 2. Add Transactions
        await supabase.from('wallet_transactions').insert({
          wallet_id: walletId,
          amount: amount,
          transaction_type: 'credit',
          description: `Deposit: Wallet funded via Credit Card`
        });

        if (bonus > 0) {
          await supabase.from('wallet_transactions').insert({
            wallet_id: walletId,
            amount: bonus,
            transaction_type: 'credit',
            description: `Promo: Complimentary deposit top-up match`
          });
        }
      }

      // 3. Create Notification
      await supabase.from('notifications').insert({
        profile_id: authUser.id,
        title: 'Wallet Funded Successfully',
        message: `Deposited $${amount.toFixed(2)} with a $${bonus}.00 complimentary privilege reward match.`,
        is_read: false
      });
    } catch (err) {
      console.warn('Notice funding wallet in Supabase:', err);
    }
  };

  const handleClaimReward = (rewardId: string, pointsCost: number) => {
    // Deduct points locally
    setUser((prev) => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints - pointsCost
    }));

    // Register reward claim event
    setRewards((prev) =>
      prev.map((rw) =>
        rw.id === rewardId
          ? { ...rw, claimedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
          : rw
      )
    );

    // Push local notification
    const rewardItem = rewards.find((r) => r.id === rewardId);
    const newNotifId = `NTF-${Date.now()}`;
    const newNotif: DashboardNotification = {
      id: newNotifId,
      title: 'Loyalty Voucher Claimed',
      description: `Swapped ${pointsCost} loyalty points for "${rewardItem?.title}". Code: VIP-REWARDS-${rewardId}.`,
      timestamp: 'Just now',
      isRead: false,
      type: 'reward'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpgradePlan = async (newPlan: 'Silver' | 'Royal Elite' | 'Imperial Gold', price: number) => {
    // Deduct wallet balance locally
    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - price,
      membershipPlan: newPlan,
      membershipRenewalDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }));

    // Register Transaction
    const newTxId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTx: WalletTransaction = {
      id: newTxId,
      amount: price,
      type: 'debit',
      description: `Membership Purchase: ${newPlan} Tier`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'success'
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Push Notification
    const newNotifId = `NTF-${Date.now()}`;
    const newNotif: DashboardNotification = {
      id: newNotifId,
      title: 'Privilege Plan Activated',
      description: `Enrolled in the ${newPlan} Privilege Subscription. VIP same-day slots & concierge desk unlocked.`,
      timestamp: 'Just now',
      isRead: false,
      type: 'membership'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 1. Update wallet balance
      let walletId = '';
      const { data: walletData } = await supabase
        .from('customers_wallet')
        .select('*')
        .eq('customer_id', authUser.id)
        .maybeSingle();

      if (walletData) {
        walletId = walletData.id;
        const currentBalance = typeof walletData.balance === 'number' ? walletData.balance : parseFloat(walletData.balance) || 0;
        await supabase
          .from('customers_wallet')
          .update({ balance: Math.max(0, currentBalance - price) })
          .eq('id', walletId);
      }

      if (walletId) {
        // 2. Create Transaction
        await supabase.from('wallet_transactions').insert({
          wallet_id: walletId,
          amount: price,
          transaction_type: 'debit',
          description: `Membership Purchase: ${newPlan} Tier`
        });
      }

      // 3. Update or Insert Customer Memberships
      const { data: plans } = await supabase.from('membership_plans').select('*');
      const targetPlan = plans?.find(p => p.name === newPlan);
      if (targetPlan) {
        const { data: existingMemberships } = await supabase
          .from('customer_memberships')
          .select('*')
          .eq('customer_id', authUser.id);
        
        if (existingMemberships && existingMemberships.length > 0) {
          await supabase
            .from('customer_memberships')
            .update({
              membership_plan_id: targetPlan.id,
              status: 'active'
            })
            .eq('customer_id', authUser.id);
        } else {
          await supabase.from('customer_memberships').insert({
            customer_id: authUser.id,
            membership_plan_id: targetPlan.id,
            status: 'active'
          });
        }
      }

      // 4. Create Notification
      await supabase.from('notifications').insert({
        profile_id: authUser.id,
        title: 'Privilege Plan Activated',
        message: `Enrolled in the ${newPlan} Privilege Subscription. VIP same-day slots & concierge desk unlocked.`,
        is_read: false
      });

    } catch (err) {
      console.warn('Notice upgrading plan in Supabase:', err);
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );

    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    } catch (err) {
      console.warn('Notice marking notification as read in Supabase:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    if (!isSupabaseConfigured) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      await supabase.from('notifications').update({ is_read: true }).eq('profile_id', authUser.id);
    } catch (err) {
      console.warn('Notice marking all notifications as read in Supabase:', err);
    }
  };

  const handleClearNotification = async (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));

    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('notifications').delete().eq('id', notifId);
    } catch (err) {
      console.warn('Notice deleting notification from Supabase:', err);
    }
  };

  // Sidebar list of options
  const sidebarLinks = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'appointments' as const, label: 'Upcoming sessions', icon: Calendar },
    { id: 'wallet' as const, label: 'Wallet balance', icon: Wallet },
    { id: 'rewards' as const, label: 'Patron rewards', icon: Award },
    { id: 'membership' as const, label: 'Privilege lounge', icon: Crown },
    { id: 'addresses' as const, label: 'Saved locations', icon: MapPin },
    { id: 'notifications' as const, label: 'Alert Center', icon: Bell, badge: notifications.filter((n) => !n.isRead).length },
    { id: 'reviews' as const, label: 'Service Reviews', icon: Star },
    { id: 'profile' as const, label: 'Identity records', icon: User },
    { id: 'settings' as const, label: 'App preferences', icon: Settings },
  ];

  return (
    <div id={id} className="min-h-screen flex bg-brand-bg text-brand-text relative">
      
      {/* ==============================================
          1. DESKTOP VIEW SIDEBAR PANEL (Left Drawer)
          ============================================== */}
      <aside
        id="dashboard-desktop-sidebar"
        className="hidden lg:flex flex-col w-64 bg-brand-surface text-brand-text border-r border-brand-secondary/15 p-6 space-y-8 fixed top-0 bottom-0 left-0 z-30"
      >
        {/* Brand Header */}
        <div id="sidebar-header" className="flex flex-col select-none border-b border-brand-secondary/15 pb-5">
          <MushaEmpireLogo variant="horizontal" />
        </div>

        {/* Links Navigation */}
        <nav id="sidebar-links-nav" className="flex-grow space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const LinkIcon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                id={`sidebar-link-${link.id}`}
                onClick={() => {
                  setCurrentView(link.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 font-sans text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-brand-secondary text-brand-bg'
                    : 'text-brand-text-muted hover:text-brand-primary hover:bg-brand-secondary/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-4 w-4 stroke-1.5" />
                  <span>{link.label}</span>
                </div>
                {link.badge && link.badge > 0 ? (
                  <span className="h-4.5 min-w-[18px] px-1 bg-red-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                    {link.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Operations */}
        <div id="sidebar-footer-ops" className="border-t border-brand-secondary/15 pt-5">
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 font-sans text-xs uppercase tracking-widest font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 stroke-1.5" />
            <span>Close Portal</span>
          </button>
        </div>
      </aside>

      {/* ==============================================
          2. PORTAL AREA VIEWPORT WRAPPER (Right Panel)
          ============================================== */}
      <div id="dashboard-content-viewport" className="flex-grow flex flex-col lg:pl-64 pb-20 lg:pb-6">
        
        {/* Responsive top header bar */}
        <header
          id="dashboard-header-bar"
          className="sticky top-0 z-25 bg-brand-bg/95 backdrop-blur-md border-b border-brand-accent py-4 px-6 md:px-8 flex justify-between items-center"
        >
          {/* Left info */}
          <div className="flex items-center gap-3.5">
            {/* Mobile menu trigger */}
            <button
              id="dashboard-mobile-sidebar-toggle"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-brand-primary border border-brand-accent bg-brand-surface cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <div>
              <span className="font-mono text-[8px] uppercase tracking-wider text-brand-text-muted font-bold block">
                CONCIERGERIE DESK
              </span>
              <h2 className="font-serif text-lg font-bold text-brand-primary">
                {sidebarLinks.find((l) => l.id === currentView)?.label}
              </h2>
            </div>
          </div>

          {/* Right profile shortcuts */}
          <div className="flex items-center gap-4">
            
            {/* Notification bell badge shortcut */}
            <button
              id="header-notif-shortcut"
              onClick={() => setCurrentView('notifications')}
              className="relative p-2 text-brand-text-muted hover:text-brand-primary cursor-pointer border border-brand-accent bg-brand-surface"
              title="View system updates"
            >
              <Bell className="h-4 w-4" />
              {notifications.some((n) => !n.isRead) && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-secondary" />
              )}
            </button>

            {/* Profile Dropdown trigger */}
            <div className="relative">
              <button
                id="header-avatar-dropdown-trigger"
                onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8.5 w-8.5 border border-brand-accent rounded-none object-cover"
                />
                <ChevronDown className="h-3.5 w-3.5 text-brand-text-muted hidden sm:block" />
              </button>

              <AnimatePresence>
                {isAvatarDropdownOpen && (
                  <motion.div
                    id="header-avatar-dropdown"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-48 bg-brand-surface border border-brand-accent shadow-lg py-1.5 z-40 rounded-none"
                  >
                    <div className="px-4 py-2 border-b border-brand-surface-muted">
                      <span className="font-serif text-sm font-semibold text-brand-primary block truncate">
                        {user.name}
                      </span>
                      <span className="font-sans text-[10px] text-brand-text-muted block truncate">
                        {user.email}
                      </span>
                    </div>

                    <button
                      id="header-drop-profile"
                      onClick={() => {
                        setCurrentView('profile');
                        setIsAvatarDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-sans font-medium text-brand-text hover:bg-brand-bg/60 flex items-center gap-2"
                    >
                      <User className="h-3.5 w-3.5 text-brand-secondary" /> Identity records
                    </button>

                    <button
                      id="header-drop-settings"
                      onClick={() => {
                        setCurrentView('settings');
                        setIsAvatarDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-sans font-medium text-brand-text hover:bg-brand-bg/60 flex items-center gap-2"
                    >
                      <Settings className="h-3.5 w-3.5 text-brand-secondary" /> Preferences
                    </button>

                    <button
                      id="header-drop-logout"
                      onClick={() => {
                        setIsAvatarDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-sans font-semibold text-red-500 hover:bg-red-500/5 flex items-center gap-2 border-t border-brand-surface-muted mt-1"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Close Portal
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Master Subview render node */}
        <main id="portal-subview-panel" className="flex-grow p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {currentView === 'overview' && (
                <DashboardOverview
                  id="portal-overview"
                  user={user}
                  appointments={appointments}
                  onNavigateView={setCurrentView}
                  onOpenQuickBook={() => triggerToast('info', 'Routing to Reservations', 'Initiating bespoke stylist calendars...')}
                  onOpenAddMoney={() => setCurrentView('wallet')}
                  onOpenRedeemRewards={() => setCurrentView('rewards')}
                />
              )}

              {currentView === 'appointments' && (
                <DashboardAppointments
                  id="portal-appointments"
                  appointments={appointments}
                  onCancelAppointment={handleCancelAppointment}
                  onRescheduleAppointment={handleRescheduleAppointment}
                  triggerToast={triggerToast}
                />
              )}

              {currentView === 'wallet' && (
                <DashboardWallet
                  id="portal-wallet"
                  walletBalance={user.walletBalance}
                  transactions={transactions}
                  onAddFunds={handleAddFunds}
                  triggerToast={triggerToast}
                />
              )}

              {currentView === 'rewards' && (
                <DashboardLoyalty
                  id="portal-loyalty"
                  loyaltyPoints={user.loyaltyPoints}
                  availableRewards={rewards}
                  onClaimReward={handleClaimReward}
                  triggerToast={triggerToast}
                />
              )}

              {currentView === 'membership' && (
                <DashboardMembership
                  id="portal-membership"
                  activePlan={user.membershipPlan}
                  renewalDate={user.membershipRenewalDate}
                  walletBalance={user.walletBalance}
                  onUpgradePlan={handleUpgradePlan}
                  triggerToast={triggerToast}
                  startDate={user.membershipStartDate}
                  expiryDate={user.membershipExpiryDate}
                  remainingDays={user.membershipRemainingDays}
                  status={user.membershipStatus}
                />
              )}

              {currentView === 'addresses' && (
                <DashboardProfileAndSettings
                  id="portal-addresses"
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  onAddAddress={handleAddAddress}
                  onDeleteAddress={handleDeleteAddress}
                  triggerToast={triggerToast}
                />
              )}

              {currentView === 'notifications' && (
                <DashboardNotifications
                  id="portal-notifications"
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onClearNotification={handleClearNotification}
                  triggerToast={triggerToast}
                />
              )}

              {currentView === 'reviews' && (
                <DashboardReviews
                  id="portal-reviews"
                  triggerToast={triggerToast}
                />
              )}

              {currentView === 'profile' && (
                <DashboardProfileAndSettings
                  id="portal-profile"
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  onAddAddress={handleAddAddress}
                  onDeleteAddress={handleDeleteAddress}
                  triggerToast={triggerToast}
                />
              )}

              {currentView === 'settings' && (
                <DashboardProfileAndSettings
                  id="portal-settings"
                  user={user}
                  onUpdateUser={handleUpdateUser}
                  onAddAddress={handleAddAddress}
                  onDeleteAddress={handleDeleteAddress}
                  triggerToast={triggerToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* ==============================================
          3. MOBILE BOTTOM TAB NAVIGATION BAR
          ============================================== */}
      <nav
        id="dashboard-mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-brand-surface text-brand-text border-t border-brand-secondary/15 py-2.5 px-4 flex justify-around items-center shadow-lg"
      >
        {sidebarLinks.slice(0, 5).map((link) => {
          const LinkIcon = link.icon;
          const isActive = currentView === link.id;
          return (
            <button
              key={link.id}
              id={`mobile-tab-btn-${link.id}`}
              onClick={() => {
                setCurrentView(link.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                isActive ? 'text-brand-secondary' : 'text-brand-text-muted hover:text-brand-primary'
              }`}
            >
              <LinkIcon className="h-4.5 w-4.5" />
              <span className="font-sans text-[7.5px] uppercase tracking-wider font-semibold">
                {link.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ==============================================
          4. MOBILE EXPANDABLE SIDE DRAWER BAR
          ============================================== */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div id="mobile-sidebar-drawer-overlay" className="fixed inset-0 z-40 lg:hidden">
            {/* Tinted backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Sidebar element panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-brand-surface text-brand-text border-r border-brand-secondary/15 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-brand-secondary/15 pb-4">
                  <div className="flex items-center select-none">
                    <MushaEmpireLogo variant="horizontal" />
                  </div>
                  <button
                    id="mobile-sidebar-close"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 border border-brand-secondary/20 hover:border-brand-secondary text-brand-text-muted hover:text-brand-primary cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {sidebarLinks.map((link) => {
                    const LinkIcon = link.icon;
                    const isActive = currentView === link.id;
                    return (
                      <button
                        key={link.id}
                        id={`mob-sidebar-link-${link.id}`}
                        onClick={() => {
                          setCurrentView(link.id);
                          setIsMobileSidebarOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 font-sans text-[11px] uppercase tracking-wider font-semibold cursor-pointer ${
                          isActive
                            ? 'bg-brand-secondary text-brand-bg'
                            : 'text-brand-text-muted hover:text-brand-primary hover:bg-brand-secondary/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <LinkIcon className="h-4 w-4 stroke-1.5" />
                          <span>{link.label}</span>
                        </div>
                        {link.badge && link.badge > 0 ? (
                          <span className="h-4 min-w-[16px] px-1 bg-red-500 text-white font-mono text-[8px] font-bold rounded-full flex items-center justify-center">
                            {link.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-brand-secondary/15 pt-4">
                <button
                   id="mobile-sidebar-logout"
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 font-sans text-xs uppercase tracking-widest font-semibold text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Close Portal</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
