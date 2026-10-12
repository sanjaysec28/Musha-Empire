/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  User,
  Clock,
  Sparkles,
  CheckCircle,
  Tag,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Compass,
  Check,
  Lock,
  Phone,
  Mail,
  QrCode,
  AlertTriangle,
  CalendarX,
  WifiOff,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { EXTENDED_SERVICES_DATA, ExtendedService } from '../../data/servicesExtendedData';
import { StylistItem } from '../../data/salonData';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  servicesRepository,
  slotsRepository,
  bookingsRepository,
  settingsRepository
} from '../../lib/firestoreService';
import { FirestoreSalonSettings } from '../../types/firestore';
import { callCreateBooking, mapBookingError } from '../../lib/firebaseFunctions';
import AuthModule from '../dashboard/AuthModule';

// Deterministic UUID generator to adapt string IDs to standard UUID format
const getStableUuid = (str: string): string => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const rest1 = str.length.toString(16).padStart(4, '0');
  const rest2 = (str.charCodeAt(0) || 0).toString(16).padStart(4, '0');
  const rest3 = (str.charCodeAt(str.length - 1) || 0).toString(16).padStart(4, '0');
  const rest4 = Math.abs(hash * 31).toString(16).padStart(12, '0').slice(-12);
  return `${hex}-${rest1}-${rest2}-${rest3}-${rest4}`;
};

// Shape of a completed booking record for display & drawer sync
export interface BookingRecord {
  id: string;
  service: ExtendedService;
  gender?: string;
  date: string;
  timeSlot: string;
  endTime?: string;
  totalAmount: number;
  discountApplied: number;
  promoApplied: string;
  createdAt: string;
  ticketCode?: string;
  customerName?: string;
  stylist?: StylistItem | null;
}

interface BookingFlowProps {
  initialServiceId: string | null;
  initialRecipientCategory?: string | null;
  onBookingComplete: (record: BookingRecord) => void;
  onNavigateHome: () => void;
  onViewAppointments: () => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

interface TimeSlot {
  time: string;
  status: 'available' | 'limited' | 'booked';
  period: 'morning' | 'afternoon' | 'evening';
}

// Standalone helper to detect gender category based on service ID/metadata
function getCategoryForServiceId(serviceId: string): string {
  if (!serviceId) return 'Other';
  const svc = EXTENDED_SERVICES_DATA.find(s => s.id === serviceId);
  if (svc) {
    const nameLower = svc.name.toLowerCase();
    const catLower = svc.category.toLowerCase();
    if (nameLower.includes('gentlemen') || nameLower.includes('shave') || nameLower.includes('beard') || catLower.includes('beard') || catLower.includes('grooming')) {
      return 'Men';
    }
    if (catLower.includes('bridal') || catLower.includes('makeup') || catLower.includes('nail') || nameLower.includes('waxing') || nameLower.includes('threading')) {
      return 'Women';
    }
  }
  return 'Other';
}

// Helper to get authoritative current operational date and time in salon timezone
function getSalonNow(timezone?: string): { todayIso: string; currentMinutes: number; currentDayName: string } {
  const now = new Date();
  if (!timezone) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      todayIso: `${y}-${m}-${d}`,
      currentMinutes: now.getHours() * 60 + now.getMinutes(),
      currentDayName: dayNames[now.getDay()]
    };
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const y = parts.find(p => p.type === 'year')?.value || '';
    const m = parts.find(p => p.type === 'month')?.value || '';
    const d = parts.find(p => p.type === 'day')?.value || '';
    const hr = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const min = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const dayName = parts.find(p => p.type === 'weekday')?.value || '';
    return {
      todayIso: `${y}-${m}-${d}`,
      currentMinutes: hr * 60 + min,
      currentDayName: dayName
    };
  } catch {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      todayIso: `${y}-${m}-${d}`,
      currentMinutes: now.getHours() * 60 + now.getMinutes(),
      currentDayName: dayNames[now.getDay()]
    };
  }
}

export default function BookingFlow({
  initialServiceId,
  initialRecipientCategory,
  onBookingComplete,
  onNavigateHome,
  onViewAppointments,
  triggerToast
}: BookingFlowProps) {
  // Stepper State: 1 = Gender, 2 = Service, 3 = Date, 4 = Time Slot, 5 = Customer Details, 6 = Summary & Terms, 7 = Success / Ticket
  const [currentStep, setCurrentStep] = useState<number>(() => {
    return initialServiceId ? 2 : 1;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialRecipientCategory) return initialRecipientCategory;
    if (initialServiceId) {
      let svcId = initialServiceId;
      if (initialServiceId === 'promo-1') svcId = 'hair-spa-1';
      else if (initialServiceId === 'promo-2') svcId = 'hair-cut-1';
      else if (initialServiceId === 'promo-3') svcId = 'makeup-1';
      else if (initialServiceId === 'promo-4' || initialServiceId === 'promo-5') svcId = EXTENDED_SERVICES_DATA[0]?.id || '';
      return getCategoryForServiceId(svcId);
    }
    return '';
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    if (initialServiceId) {
      if (initialServiceId === 'promo-1') return 'hair-spa-1';
      if (initialServiceId === 'promo-2') return 'hair-cut-1';
      if (initialServiceId === 'promo-3') return 'makeup-1';
      if (initialServiceId === 'promo-4' || initialServiceId === 'promo-5') return EXTENDED_SERVICES_DATA[0]?.id || '';
      return initialServiceId;
    }
    return '';
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [promoSuccessMessage, setPromoSuccessMessage] = useState<string>('');
  const [promoErrorMessage, setPromoErrorMessage] = useState<string>('');

  // Finished booking record cache
  const [completedRecord, setCompletedRecord] = useState<BookingRecord | null>(null);

  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [salonSettings, setSalonSettings] = useState<FirestoreSalonSettings | null>(null);
  const [bookedSlotTimes, setBookedSlotTimes] = useState<string[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsLoadingError, setSlotsLoadingError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch Firestore salon settings
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSettings(true);
    settingsRepository.getSalonSettings().then(s => {
      if (isMounted && s) setSalonSettings(s);
    }).catch(err => {
      console.warn('Notice reading salon settings in BookingFlow:', err);
    }).finally(() => {
      if (isMounted) setIsLoadingSettings(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Fetch catalog with Firestore services as future authoritative source of truth
  useEffect(() => {
    let isMounted = true;
    const loadServicesCatalog = async () => {
      try {
        const firestoreServices = await servicesRepository.getActiveServices();
        if (isMounted && firestoreServices && firestoreServices.length > 0) {
          setDbServices(firestoreServices);
          return;
        }
      } catch (err) {
        console.warn('Notice reading services from Firestore:', err);
      }

      // Fallback: Supabase or local catalog
      if (isSupabaseConfigured) {
        try {
          const { data: sData } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true);
          if (isMounted && sData && sData.length > 0) {
            setDbServices(sData);
            return;
          }
        } catch (sErr) {
          console.warn('Notice reading services from Supabase:', sErr);
        }
      }

      if (isMounted) {
        setDbServices([]);
      }
    };

    loadServicesCatalog();
    return () => { isMounted = false; };
  }, []);

  // Map services to match rich client layout details
  const services = useMemo(() => {
    if (!dbServices || dbServices.length === 0) {
      return EXTENDED_SERVICES_DATA;
    }
    return dbServices.map(item => {
      const localService = EXTENDED_SERVICES_DATA.find(
        s => s.id === item.id || s.name.toLowerCase() === item.name.toLowerCase()
      );
      const durationMin = item.duration_minutes || item.durationMinutes || localService?.durationValue || 60;
      const rawPrice = item.price;
      const priceNum = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || '0').replace(/[^0-9.]/g, '') || '0');

      return {
        id: item.id,
        name: item.name,
        category: item.category || localService?.category || 'Exclusive',
        price: typeof rawPrice === 'number' ? `$${rawPrice}` : (rawPrice || `$${priceNum}`),
        priceValue: priceNum,
        duration: `${durationMin} Mins`,
        durationValue: durationMin,
        shortDescription: item.description || localService?.shortDescription || '',
        longDescription: item.description || localService?.longDescription || '',
        image: item.image_url || item.imageUrl || localService?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        benefits: localService?.benefits || [],
        includedServices: localService?.includedServices || [],
        popular: localService?.popular || false,
        rating: localService?.rating || 4.9,
        reviewsCount: localService?.reviewsCount || 12,
        faqs: localService?.faqs || []
      };
    });
  }, [dbServices]);

  // Filter services by gender
  const genderFilteredServices = useMemo(() => {
    if (!selectedCategory) return services;

    if (selectedCategory === 'Men') {
      return services.filter(s => {
        const cat = s.category.toLowerCase();
        const name = s.name.toLowerCase();
        return (
          cat.includes('haircut') ||
          cat.includes('spa') ||
          cat.includes('color') ||
          cat.includes('beard') ||
          cat.includes('grooming') ||
          cat.includes('facial') ||
          cat.includes('cleanup') ||
          name.includes('gentlemen') ||
          name.includes('shave') ||
          name.includes('beard')
        );
      });
    }

    if (selectedCategory === 'Women') {
      return services.filter(s => {
        const cat = s.category.toLowerCase();
        const name = s.name.toLowerCase();
        if (name.includes('gentlemen')) return false;
        return (
          cat.includes('haircut') ||
          cat.includes('spa') ||
          cat.includes('color') ||
          cat.includes('facial') ||
          cat.includes('cleanup') ||
          cat.includes('bridal') ||
          cat.includes('makeup') ||
          cat.includes('nail') ||
          cat.includes('threading') ||
          cat.includes('waxing')
        );
      });
    }

    return services; // 'Other'
  }, [selectedCategory, services]);

  // Sub-category filters for Step 2
  const subCategoryFilters = useMemo(() => {
    const rawCategories = Array.from(new Set(genderFilteredServices.map(s => s.category)));
    return ['All', ...rawCategories];
  }, [genderFilteredServices]);

  // Final filtered services in Step 2 based on chosen subcategory tab
  const displayedServices = useMemo(() => {
    if (selectedSubCategory === 'All') return genderFilteredServices;
    return genderFilteredServices.filter(s => s.category.toLowerCase() === selectedSubCategory.toLowerCase());
  }, [genderFilteredServices, selectedSubCategory]);

  // Auto-select first service if none selected or current service not in list
  useEffect(() => {
    if (displayedServices.length > 0) {
      const exists = displayedServices.some(s => s.id === selectedServiceId);
      if (!exists && !initialServiceId) {
        setSelectedServiceId(displayedServices[0].id);
      }
    }
  }, [displayedServices, selectedServiceId, initialServiceId]);

  // Currently active service
  const activeService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId) || displayedServices[0] || services[0];
  }, [services, selectedServiceId, displayedServices]);

  // Dynamic Date choices starting from today in salon timezone (Past dates disabled)
  const dateChoices = useMemo(() => {
    const choices = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayFullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const salonTz = salonSettings?.timezone || salonSettings?.time_zone;
    const salonNow = getSalonNow(salonTz);

    const [tY, tM, tD] = salonNow.todayIso.split('-').map(Number);
    const baseDate = new Date(Date.UTC(tY, tM - 1, tD, 12, 0, 0));

    const hoursList = (salonSettings?.opening_hours && Array.isArray(salonSettings.opening_hours))
      ? salonSettings.opening_hours
      : (salonSettings?.openingHours && Array.isArray(salonSettings.openingHours))
      ? salonSettings.openingHours
      : null;

    for (let i = 0; i < 21; i++) {
      const d = new Date(baseDate);
      d.setUTCDate(baseDate.getUTCDate() + i);

      const dayName = days[d.getUTCDay()];
      const dayFullName = dayFullNames[d.getUTCDay()];
      const dateNum = d.getUTCDate();
      const monthName = months[d.getUTCMonth()];
      const year = d.getUTCFullYear();

      const yyyy = year;
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(dateNum).padStart(2, '0');
      const isoStr = `${yyyy}-${mm}-${dd}`;

      const fullDateStr = `${dayName}, ${monthName} ${dateNum}, ${year}`;

      let isClosed = false;
      if (hoursList) {
        const found = hoursList.find(h => h.day && h.day.toLowerCase() === dayFullName.toLowerCase());
        if (!found || found.isClosed || !found.open || !found.close) isClosed = true;
      }

      // Check holidays if configured
      if (salonSettings?.holidays && Array.isArray(salonSettings.holidays)) {
        if (salonSettings.holidays.includes(isoStr)) isClosed = true;
      }

      choices.push({
        label: fullDateStr,
        value: isoStr,
        dayName,
        dayFullName,
        dateNum,
        monthName,
        isToday: isoStr === salonNow.todayIso,
        isClosed
      });
    }
    return choices;
  }, [salonSettings]);

  // Set default date to first available date
  useEffect(() => {
    if (dateChoices.length > 0 && !selectedDate) {
      const firstOpen = dateChoices.find(d => !d.isClosed) || dateChoices[0];
      setSelectedDate(firstOpen.value);
    }
  }, [dateChoices, selectedDate]);

  // Helpers for time manipulation
  const formatMinutesToTime = (min: number) => {
    const h24 = Math.floor(min / 60);
    const m = min % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return null;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const calculateEndTime = (startTimeStr: string, durationMinutes: number) => {
    try {
      const startMin = parseTimeToMinutes(startTimeStr);
      if (startMin === null) return startTimeStr;
      const totalMin = startMin + durationMinutes;
      return formatMinutesToTime(totalMin);
    } catch {
      return startTimeStr;
    }
  };

  // Dedicated function to fetch public customer slot availability
  const loadDateAvailability = async (targetDate: string) => {
    if (!targetDate) return;
    setIsLoadingSlots(true);
    setSlotsLoadingError(null);

    try {
      const publicSlots = await slotsRepository.getPublicAvailabilityForDate(targetDate);
      const bookedSet = new Set<string>();
      publicSlots.forEach(s => {
        if (s.status !== 'available' && s.start_time) {
          bookedSet.add(s.start_time);
        }
      });
      setBookedSlotTimes(Array.from(bookedSet));
    } catch (err: any) {
      console.warn('Notice loading public slot availability:', err);
      setSlotsLoadingError(err?.message || 'Failed to connect to availability service');
      setBookedSlotTimes([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Fetch public customer slot availability for selectedDate
  useEffect(() => {
    if (!selectedDate) return;
    loadDateAvailability(selectedDate);
  }, [selectedDate]);

  // 30-Minute Dynamic Slot Generation with Duration-Aware Consecutive Slot Validation
  // Strictly requires valid Firestore operating hours. If unconfigured/missing, does NOT invent operating hours.
  const timeSlots: TimeSlot[] = useMemo(() => {
    if (!selectedDate || !salonSettings) {
      return [];
    }

    const hoursList = (salonSettings.opening_hours && Array.isArray(salonSettings.opening_hours))
      ? salonSettings.opening_hours
      : (salonSettings.openingHours && Array.isArray(salonSettings.openingHours))
      ? salonSettings.openingHours
      : null;

    if (!hoursList || hoursList.length === 0) {
      return [];
    }

    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const selectedDayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: salonSettings?.timezone || salonSettings?.time_zone || undefined
    }).format(dateObj);

    const found = hoursList.find(h => h.day && h.day.toLowerCase() === selectedDayName.toLowerCase());

    if (!found || found.isClosed || !found.open || !found.close) {
      return [];
    }

    const openMin = parseTimeToMinutes(found.open);
    const closeMin = parseTimeToMinutes(found.close);

    if (openMin === null || closeMin === null || closeMin <= openMin) {
      return [];
    }

    const salonTz = salonSettings?.timezone || salonSettings?.time_zone;
    const salonNow = getSalonNow(salonTz);
    const isToday = selectedDate === salonNow.todayIso;
    const currentMin = salonNow.currentMinutes + 15; // 15-minute lead preparation buffer

    // Parse booked minutes from bookedSlotTimes for robust normalization
    const bookedMinutesSet = new Set<number>();
    bookedSlotTimes.forEach(t => {
      const min = parseTimeToMinutes(t);
      if (min !== null) bookedMinutesSet.add(min);
    });

    // Generate standard 30-minute intervals from real Firestore operating hours
    const baseSlots: { time: string; minutes: number; period: 'morning' | 'afternoon' | 'evening'; isBooked: boolean }[] = [];
    for (let mMin = openMin; mMin < closeMin; mMin += 30) {
      const timeStr = formatMinutesToTime(mMin);
      const period: 'morning' | 'afternoon' | 'evening' =
        mMin < 12 * 60 ? 'morning' : (mMin < 17 * 60 ? 'afternoon' : 'evening');

      const isBooked = bookedMinutesSet.has(mMin);
      baseSlots.push({ time: timeStr, minutes: mMin, period, isBooked });
    }

    if (baseSlots.length === 0) return [];

    // Duration requirement: each service requires Math.ceil(duration / 30) slots
    const serviceDuration = activeService?.durationValue || 60;
    const requiredSlots = Math.max(1, Math.ceil(serviceDuration / 30));

    // Verify consecutive slot availability
    return baseSlots.map((slot, idx) => {
      // 1) Past check if today in salon timezone
      if (isToday && slot.minutes < currentMin) {
        return { time: slot.time, status: 'booked', period: slot.period };
      }

      // 2) Can consecutive slots fit before salon closing?
      if (idx + requiredSlots > baseSlots.length) {
        return { time: slot.time, status: 'booked', period: slot.period };
      }

      // 3) Are all consecutive slots available without conflict?
      for (let k = 0; k < requiredSlots; k++) {
        const checkSlot = baseSlots[idx + k];
        if (!checkSlot || checkSlot.isBooked) {
          return { time: slot.time, status: 'booked', period: slot.period };
        }
        if (isToday && checkSlot.minutes < currentMin) {
          return { time: slot.time, status: 'booked', period: slot.period };
        }
      }

      // Available
      return { time: slot.time, status: 'available', period: slot.period };
    });
  }, [selectedDate, salonSettings, bookedSlotTimes, activeService]);

  // Distinct Availability State helper
  const availabilityState: 'loading' | 'configuration_missing' | 'salon_closed' | 'loading_failed' | 'no_slots' | 'available' = useMemo(() => {
    if (isLoadingSettings || isLoadingSlots) {
      return 'loading';
    }
    if (slotsLoadingError) {
      return 'loading_failed';
    }
    if (!salonSettings) {
      return 'configuration_missing';
    }
    const hoursList = (salonSettings.opening_hours && Array.isArray(salonSettings.opening_hours))
      ? salonSettings.opening_hours
      : (salonSettings.openingHours && Array.isArray(salonSettings.openingHours))
      ? salonSettings.openingHours
      : null;
    if (!hoursList || hoursList.length === 0) {
      return 'configuration_missing';
    }

    if (!selectedDate) {
      return 'loading';
    }

    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const selectedDayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: salonSettings?.timezone || salonSettings?.time_zone || undefined
    }).format(dateObj);

    const found = hoursList.find(h => h.day && h.day.toLowerCase() === selectedDayName.toLowerCase());
    if (!found || found.isClosed || !found.open || !found.close) {
      return 'salon_closed';
    }

    if (timeSlots.length > 0 && timeSlots.every(s => s.status === 'booked')) {
      return 'no_slots';
    }

    return 'available';
  }, [isLoadingSettings, isLoadingSlots, slotsLoadingError, salonSettings, selectedDate, timeSlots]);

  // Set default available time slot
  useEffect(() => {
    const firstAvail = timeSlots.find(s => s.status !== 'booked');
    if (firstAvail && !selectedTimeSlot) {
      setSelectedTimeSlot(firstAvail.time);
    } else if (selectedTimeSlot) {
      // If currently selected slot is not available in the new list, pick first available
      const currentSlotAvail = timeSlots.find(s => s.time === selectedTimeSlot && s.status !== 'booked');
      if (!currentSlotAvail) {
        setSelectedTimeSlot(firstAvail ? firstAvail.time : '');
      }
    }
  }, [timeSlots, selectedTimeSlot]);

  // Financial calculations
  const priceFloat = useMemo(() => {
    if (!activeService) return 0;
    return typeof activeService.priceValue === 'number'
      ? activeService.priceValue
      : parseFloat(String(activeService.price || '0').replace(/[^0-9.]/g, '') || '0');
  }, [activeService]);

  const taxValue = useMemo(() => {
    return parseFloat((priceFloat * 0.18).toFixed(2)); // 18% standard luxury tax
  }, [priceFloat]);

  const subTotal = useMemo(() => {
    return priceFloat + taxValue;
  }, [priceFloat, taxValue]);

  const finalTotalAmount = useMemo(() => {
    const total = subTotal - discountValue;
    return parseFloat(Math.max(0, total).toFixed(2));
  }, [subTotal, discountValue]);

  // Promo code validation
  const applyPromoCode = (codeToApply: string, currentPrice: number) => {
    const code = codeToApply.trim().toUpperCase();
    if (code === 'ROYAL15' || code === 'EMPIRE15' || code === 'WELCOMEEMPIRE') {
      const discount = parseFloat((currentPrice * 0.15).toFixed(2));
      setDiscountValue(discount);
      setPromoSuccessMessage(`Privilege code accepted! 15% discount applied (-$${discount})`);
      setPromoErrorMessage('');
    } else if (code === 'SOLSTICE95') {
      const discount = Math.max(0, currentPrice - 95);
      setDiscountValue(discount);
      setPromoSuccessMessage(`Solstice promo applied! Special price of $95 activated (-$${discount})`);
      setPromoErrorMessage('');
    } else if (code === 'SOVEREIGN195') {
      const discount = Math.max(0, currentPrice - 195);
      setDiscountValue(discount);
      setPromoSuccessMessage(`Sovereign package promo applied! Special price of $195 activated (-$${discount})`);
      setPromoErrorMessage('');
    } else if (code === 'GOLDENGALA') {
      const discount = parseFloat(Math.min(80, currentPrice).toFixed(2));
      setDiscountValue(discount);
      setPromoSuccessMessage(`Golden Gala promo applied! Complimentary credit of $${discount} activated.`);
      setPromoErrorMessage('');
    } else if (code !== '') {
      setPromoErrorMessage('This promotional code is not active or has expired');
      setDiscountValue(0);
      setPromoSuccessMessage('');
    } else {
      setDiscountValue(0);
      setPromoSuccessMessage('');
      setPromoErrorMessage('');
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoErrorMessage('Please enter a valid code');
      setPromoSuccessMessage('');
      setDiscountValue(0);
      return;
    }
    applyPromoCode(promoCode, priceFloat);
  };

  // Stepper navigation logic
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedCategory) {
        triggerToast('warning', 'Selection Required', 'Please select who the service is for before proceeding.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedServiceId) {
        triggerToast('warning', 'Selection Required', 'Please choose a service treatment before proceeding.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedDate) {
        triggerToast('warning', 'Selection Required', 'Please select an appointment date before proceeding.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (timeSlots.length === 0) {
        triggerToast('warning', 'Availability Unavailable', 'Operating hours are not configured for this date. Please select another date.');
        return;
      }
      if (!selectedTimeSlot) {
        triggerToast('warning', 'Selection Required', 'Please choose an available time slot before proceeding.');
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!user) {
        triggerToast('warning', 'Authentication Required', 'Please sign in or register to verify your reservation profile.');
        return;
      }
      setCurrentStep(6);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      if (initialServiceId && currentStep === 2) {
        return;
      }
      setCurrentStep(currentStep - 1);
    }
  };

  // Final Reservation Confirmation
  const handleConfirmReservation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!user) {
      triggerToast('warning', 'Authentication Required', 'Please sign in or register to confirm your reservation.');
      setCurrentStep(5);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!activeService) {
        throw new Error('INVALID_SERVICE');
      }

      // Call authoritative booking engine
      const bookingResult = await callCreateBooking(
        {
          serviceId: activeService.id,
          gender: selectedCategory,
          bookingDate: selectedDate,
          startTime: selectedTimeSlot,
          notes: specialNotes || '',
          idempotencyKey: `idemp_${user.id}_${activeService.id}_${selectedDate}_${selectedTimeSlot.replace(/[^a-zA-Z0-9]/g, '')}`
        },
        user
      );

      const bookingData = bookingResult.booking;
      const ticketData = bookingResult.ticket;
      const formattedDate = dateChoices.find(d => d.value === selectedDate)?.label || selectedDate;

      // Maintain legacy Supabase mirror for dual-database compatibility if configured
      if (isSupabaseConfigured) {
        try {
          const { data: dbStaff } = await supabase.from('staff').select('id').limit(1);
          const internalStaffId = dbStaff?.[0]?.id || null;

          await supabase.from('bookings').insert({
            id: bookingData.id,
            customer_id: user.id,
            staff_id: internalStaffId,
            booking_date: selectedDate,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
            total_amount: bookingData.price,
            status: 'confirmed',
            notes: `Recipient: ${selectedCategory}. Promo: ${promoCode || 'None'}. Special requests: ${specialNotes || 'None'}`
          });
        } catch (sbErr) {
          console.warn('Supabase mirror note:', sbErr);
        }
      }

      // Build completed reservation record with authoritative values
      const record: BookingRecord = {
        id: bookingData.id,
        service: activeService,
        gender: selectedCategory,
        date: formattedDate,
        timeSlot: bookingData.start_time,
        endTime: bookingData.end_time,
        totalAmount: bookingData.price,
        discountApplied: discountValue,
        promoApplied: discountValue > 0 ? promoCode.toUpperCase() : '',
        createdAt: new Date().toLocaleDateString(),
        ticketCode: ticketData?.ticket_code || bookingData.ticket_code,
        customerName: ticketData?.customer_name || user.displayName || 'Valued Patron'
      };

      setCompletedRecord(record);
      onBookingComplete(record);
      setCurrentStep(7);
      triggerToast('success', 'Reservation Confirmed', 'Your sanctuary appointment is secured.');
    } catch (err: any) {
      console.warn('Notice in handleConfirmReservation:', err);
      const errMsg = String(err?.message || '');
      if (errMsg.includes('SLOT_UNAVAILABLE')) {
        // Refresh availability on slot collision and notify patron
        try {
          const publicSlots = await slotsRepository.getPublicAvailabilityForDate(selectedDate);
          const bookedSet = new Set<string>();
          publicSlots.forEach(s => {
            if (s.status !== 'available' && s.start_time) bookedSet.add(s.start_time);
          });
          setBookedSlotTimes(Array.from(bookedSet));
        } catch {
          // ignore
        }
        triggerToast('warning', 'Slot Unavailable', 'This time slot is no longer available. Please choose another time.');
        setCurrentStep(4);
      } else {
        triggerToast('error', 'Booking Notice', mapBookingError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="booking-flow-container" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 text-left">
      
      {/* Dynamic Title area */}
      {currentStep < 7 && (
        <div className="mb-8 border-b border-brand-secondary/15 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-brand-secondary font-bold block mb-1">RESERVATIONS DESK</span>
              <h1 className="text-3xl font-serif font-bold text-brand-primary">Schedule Your Sanctuary Experience</h1>
            </div>
            
            {/* Steps Progress Pills (6 Steps) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[1, 2, 3, 4, 5, 6].map((stepNum) => {
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                return (
                  <div key={stepNum} className="flex items-center gap-1 shrink-0">
                    <span
                      className={`h-6 w-6 rounded-none flex items-center justify-center font-mono text-[10px] border transition-all duration-300 ${
                        isActive
                           ? 'bg-brand-primary text-brand-bg border-brand-primary'
                           : isCompleted
                           ? 'bg-brand-secondary text-brand-primary border-brand-secondary'
                           : 'bg-brand-surface text-brand-text-muted border-brand-secondary/15'
                      }`}
                    >
                      {isCompleted ? '✓' : stepNum}
                    </span>
                    {stepNum < 6 && <ChevronRight className="h-3 w-3 text-brand-accent shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Core Form Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Interactive Flow (col-span-8 or 12 on success) */}
        <div className={`${currentStep === 7 ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
          
          {/* Pre-selected Experience Banner (visible on step 2+) */}
          {currentStep >= 3 && currentStep < 7 && activeService && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-surface border border-brand-secondary/35 p-5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/[0.03] to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1 text-left">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-brand-secondary font-semibold">Selected Experience</span>
                  <h4 className="font-serif text-lg font-bold text-brand-primary uppercase tracking-wide">
                    {activeService.name}
                  </h4>
                  <p className="font-sans text-[11px] text-brand-text-muted font-normal leading-relaxed">
                    {activeService.shortDescription}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 border-t md:border-t-0 md:border-l border-brand-secondary/15 pt-4 md:pt-0 md:pl-6 shrink-0 text-left">
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Recipient</span>
                    <span className="font-serif text-xs font-semibold text-brand-primary block mt-0.5">
                      {selectedCategory === 'Men' && "Gentlemen's Grooming"}
                      {selectedCategory === 'Women' && "Women's Sanctuary"}
                      {selectedCategory === 'Other' && 'Universal Experience'}
                    </span>
                  </div>
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Duration</span>
                    <span className="font-sans text-xs font-semibold text-brand-primary block mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-brand-secondary shrink-0" /> {activeService.duration}
                    </span>
                  </div>
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Base Rate</span>
                    <span className="font-serif text-sm font-bold text-brand-gold-dark block mt-0.5">
                      {activeService.price}
                    </span>
                  </div>
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Status</span>
                    <span className="bg-brand-secondary/10 text-brand-secondary font-sans text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 mt-1 inline-block border border-brand-secondary/20">
                      Confirmed Choice
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stepper Views */}
          <AnimatePresence mode="wait">
            
            {/* STEP 1: GENDER OPTIONS (Men, Women, Other) */}
            {currentStep === 1 && (
              <motion.div
                key="step-category"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 1 of 6</span>
                  <h3 className="font-serif text-xl text-brand-primary font-bold">Select Service Recipient</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-normal leading-relaxed">
                    Choose who the luxury experience is for. We customize and filter our bespoke catalog options accordingly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      id: 'Men',
                      label: 'Men',
                      icon: User,
                      title: "Gentlemen's Grooming",
                      description: 'Precision scissor cuts, hot-shaves, beard sculpting, and facial clay detox.',
                      tagline: 'Refined Masculine Style',
                    },
                    {
                      id: 'Women',
                      label: 'Women',
                      icon: Sparkles,
                      title: "Women's Sanctuary",
                      description: 'Celestial color balayage, botanical spa therapy, bridal updos, and custom nail care.',
                      tagline: 'High-Artistry Feminine Rituals',
                    },
                    {
                      id: 'Other',
                      label: 'Other',
                      icon: Compass,
                      title: 'Universal Experience',
                      description: 'Explore our complete catalog of luxury salon treatments, from hair spa to wellness.',
                      tagline: 'All Sanctuary Rituals',
                    }
                  ].map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <motion.div
                        key={cat.id}
                        id={`select-category-${cat.id.toLowerCase()}`}
                        onClick={() => setSelectedCategory(cat.id)}
                        whileHover={{ y: -6, scale: 1.015 }}
                        animate={
                          isSelected
                            ? { scale: 1.02, y: -2 }
                            : { scale: 1, y: 0 }
                        }
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between text-left group rounded-none h-full relative overflow-hidden ${
                          isSelected
                            ? 'border-brand-secondary bg-[#13110E] shadow-[0_15px_45px_rgba(197,168,128,0.22)] ring-1 ring-brand-secondary/35'
                            : 'border-brand-secondary/15 bg-[#0D0D0D] hover:border-brand-secondary/40 hover:shadow-[0_12px_30px_rgba(197,168,128,0.12)]'
                        } ${cat.id === 'Other' ? 'sm:col-span-2' : ''}`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-brand-secondary/5 via-transparent to-transparent pointer-events-none" />
                        )}

                        <div className="space-y-5">
                          <div className="flex justify-between items-center">
                            <div className={`p-3 rounded-full border transition-all duration-300 ${
                              isSelected 
                                ? 'border-brand-secondary/40 bg-brand-secondary/10' 
                                : 'border-brand-secondary/10 bg-brand-surface group-hover:border-brand-secondary/30 group-hover:bg-brand-secondary/5'
                            }`}>
                              <Icon className={`h-5 w-5 transition-colors duration-300 ${
                                isSelected ? 'text-brand-secondary' : 'text-brand-text-muted group-hover:text-brand-secondary'
                              }`} />
                            </div>

                            {isSelected ? (
                              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-brand-secondary border border-brand-secondary/35 px-3 py-1 bg-brand-secondary/10">
                                SELECTED
                              </span>
                            ) : (
                              <span className="font-mono text-[8px] text-brand-text-muted uppercase tracking-[0.25em] group-hover:text-brand-secondary transition-colors">
                                SELECT
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-brand-gold-dark font-medium block">
                              {cat.tagline}
                            </span>
                            <h4 className="font-serif text-xl font-bold text-brand-primary group-hover:text-brand-secondary transition-colors duration-300">
                              {cat.title}
                            </h4>
                            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-brand-secondary/15 mt-6 pt-4 flex justify-between items-center text-brand-text-muted font-mono text-[8px] uppercase tracking-[0.2em] group-hover:text-brand-primary transition-all duration-300">
                          <span className="group-hover:text-brand-secondary transition-colors">SECURE SELECTION</span>
                          <span className="flex items-center gap-1.5 text-brand-gold-dark group-hover:text-brand-primary transition-colors">
                            CONTINUE <ArrowRight className="h-3 w-3 group-hover:translate-x-1.5 transition-transform duration-300" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: SERVICE CATEGORY & SERVICE SELECTION */}
            {currentStep === 2 && (
              <motion.div
                key="step-service-selection"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 2 of 6</span>
                  <h3 className="font-serif text-xl text-brand-primary font-bold">Select Your Desired Treatment</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-normal leading-relaxed">
                    Filter by treatment discipline or select directly from our curated sanctuary menu.
                  </p>
                </div>

                {/* Subcategory Filter Pills */}
                {subCategoryFilters.length > 2 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-secondary/15">
                    {subCategoryFilters.map(cat => {
                      const isActive = selectedSubCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedSubCategory(cat)}
                          className={`px-3 py-1.5 font-sans text-[10px] uppercase tracking-wider font-semibold rounded-none border transition-all duration-200 shrink-0 ${
                            isActive
                              ? 'bg-brand-secondary text-brand-primary border-brand-secondary'
                              : 'bg-brand-surface border-brand-secondary/15 text-brand-text-muted hover:border-brand-secondary/40'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {displayedServices.map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <div
                        key={service.id}
                        id={`select-service-${service.id}`}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-4 border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-left rounded-none ${
                          isSelected
                            ? 'border-brand-secondary bg-brand-secondary/5 shadow-sm'
                            : 'border-brand-secondary/15 bg-brand-surface hover:border-brand-secondary/50'
                        }`}
                      >
                        <div className="flex gap-4 items-center">
                          <img
                            src={service.image}
                            alt={service.name}
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 object-cover shrink-0 rounded-none"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-[8px] uppercase tracking-widest font-semibold text-brand-secondary bg-brand-secondary/15 px-1.5 py-0.5">
                                {service.category}
                              </span>
                              {service.popular && <span className="font-sans text-[8px] uppercase tracking-widest text-brand-gold-dark font-bold">&#9733; Popular</span>}
                            </div>
                            <h4 className="font-serif text-base font-semibold text-brand-primary leading-tight">{service.name}</h4>
                            <p className="font-sans text-[11px] text-brand-text-muted leading-relaxed line-clamp-1">{service.shortDescription}</p>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-brand-secondary/15 pt-2.5 sm:pt-0 shrink-0">
                          <span className="font-serif text-base font-bold text-brand-gold-dark">{service.price}</span>
                          <span className="font-mono text-[9px] text-brand-text-muted flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> {service.duration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: DYNAMIC DATE SELECTION */}
            {currentStep === 3 && (
              <motion.div
                key="step-date"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 3 of 6</span>
                  <h3 className="font-serif text-xl text-brand-primary font-bold">Select An Appointment Date</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-normal leading-relaxed">
                    Choose from available dates dynamically updated from our operating calendar. Past dates are disabled.
                  </p>
                </div>

                {/* Calendar grid view */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {dateChoices.map((dateChoice) => {
                    const isSelected = selectedDate === dateChoice.value;
                    const isSelectable = !dateChoice.isClosed;

                    return (
                      <div
                        key={dateChoice.value}
                        id={`select-date-${dateChoice.value}`}
                        onClick={() => isSelectable && setSelectedDate(dateChoice.value)}
                        className={`p-4 border text-center transition-all duration-300 flex flex-col justify-center items-center gap-1 relative ${
                          !isSelectable
                            ? 'opacity-30 cursor-not-allowed bg-brand-bg/10 border-brand-accent/5'
                            : isSelected
                              ? 'border-brand-secondary bg-brand-secondary/5 shadow-sm cursor-pointer'
                              : 'border-brand-secondary/15 bg-brand-surface hover:border-brand-secondary/50 cursor-pointer'
                        }`}
                      >
                        <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted">{dateChoice.dayName}</span>
                        <span className="font-serif text-3xl font-bold text-brand-primary">{dateChoice.dateNum}</span>
                        <span className="font-sans text-[10px] font-semibold text-brand-gold-dark uppercase tracking-wider">{dateChoice.monthName}</span>
                        {dateChoice.isToday && (
                          <span className="font-mono text-[7px] uppercase tracking-widest text-brand-secondary font-bold border border-brand-secondary/30 px-1 py-0.2 mt-0.5">
                            Today
                          </span>
                        )}
                        {!isSelectable && (
                          <span className="absolute bottom-1 right-1 font-mono text-[8px] uppercase text-red-400 font-bold bg-red-950/40 px-1 py-0.5 border border-red-900/30">
                            Closed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: 30-MINUTE DURATION-AWARE AVAILABLE TIME SLOTS */}
            {currentStep === 4 && (
              <motion.div
                key="step-time-slot"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 4 of 6</span>
                  <h3 className="font-serif text-xl text-brand-primary font-bold">Choose Available Time Slot</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-normal leading-relaxed">
                    Slots operate in 30-minute increments. Required reservation duration ({activeService?.duration}) requires continuous available slot coverage.
                  </p>
                </div>

                {/* Slot groups or honest unavailable state */}
                {timeSlots.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/50 space-y-2">
                    <p className="font-serif text-lg text-brand-primary font-bold">Availability unavailable</p>
                    <p className="font-sans text-xs text-brand-text-muted leading-relaxed max-w-md mx-auto font-normal">
                      Operating hours for this date are not currently configured in salon records or the sanctuary is closed. Please select another date or contact our concierge.
                    </p>
                  </div>
                ) : (
                  ['morning', 'afternoon', 'evening'].map((period) => {
                    const periodSlots = timeSlots.filter(s => s.period === period);
                    if (periodSlots.length === 0) return null;

                    return (
                      <div key={period} className="space-y-3">
                        <h4 className="font-serif text-base text-brand-primary capitalize border-b border-brand-secondary/15 pb-1.5 font-medium">
                          {period} Experience Slots
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {periodSlots.map((slot) => {
                            const isBooked = slot.status === 'booked';
                            const isSelected = selectedTimeSlot === slot.time;
                            
                            return (
                              <button
                                key={slot.time}
                                disabled={isBooked}
                                id={`select-time-${slot.time.replace(/[:\s]/g, '-')}`}
                                onClick={() => setSelectedTimeSlot(slot.time)}
                                className={`p-4 border transition-all duration-300 flex flex-col justify-center items-center text-center rounded-none relative ${
                                  isBooked
                                    ? 'border-brand-surface-muted bg-brand-surface-muted/60 text-brand-text-muted/40 cursor-not-allowed'
                                    : isSelected
                                    ? 'border-brand-secondary bg-brand-secondary/5 shadow-sm cursor-pointer'
                                    : 'border-brand-secondary/15 bg-brand-surface hover:border-brand-secondary/50 cursor-pointer'
                                }`}
                              >
                                <span className={`font-sans text-sm font-semibold ${isBooked ? 'text-brand-text-muted/40' : 'text-brand-primary'}`}>
                                  {slot.time}
                                </span>
                                
                                <span className="mt-1.5 block">
                                  {isBooked ? (
                                    <Badge id={`badge-slot-booked-${slot.time}`} variant="charcoal" size="sm" className="text-[7px]">Unavailable</Badge>
                                  ) : (
                                    <Badge id={`badge-slot-avail-${slot.time}`} variant="success" size="sm" className="text-[7px]">Available</Badge>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* STEP 5: CUSTOMER DETAILS (Firebase Authenticated Profile) */}
            {currentStep === 5 && (
              <motion.div
                key="step-customer-details"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {!user ? (
                  <div className="max-w-md mx-auto py-8 text-center space-y-6 border border-brand-secondary/15 p-6 bg-brand-surface">
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary font-bold">AUTHENTICATION REQUIRED</span>
                      <h3 className="text-xl font-serif font-bold text-brand-primary">Priority Circle Sign In</h3>
                      <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
                        To synchronize your reservation with your private patron records, please authenticate with your mobile phone or member email.
                      </p>
                    </div>
                    <AuthModule
                      id="booking-auth-prompt"
                      onAuthSuccess={() => {}}
                      triggerToast={triggerToast}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 5 of 6</span>
                      <h3 className="font-serif text-xl text-brand-primary font-bold">Verify Patron Details</h3>
                      <p className="font-sans text-xs text-brand-text-muted font-normal leading-relaxed">
                        Reservation information is synchronized directly with your authenticated Firebase patron identity.
                      </p>
                    </div>

                    <div className="bg-brand-surface border border-brand-secondary/15 p-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-sans text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold block mb-1">
                            Patron Name
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-[#121212] border border-brand-secondary/15 text-sm text-brand-primary font-serif">
                            <User className="h-4 w-4 text-brand-secondary shrink-0" />
                            <span>{user.displayName || user.user_metadata?.name || user.email?.split('@')[0] || 'Noble Guest'}</span>
                          </div>
                        </div>

                        <div>
                          <label className="font-sans text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold block mb-1">
                            Contact Email
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-[#121212] border border-brand-secondary/15 text-sm text-brand-primary font-mono text-xs">
                            <Mail className="h-4 w-4 text-brand-secondary shrink-0" />
                            <span>{user.email || 'Email unavailable'}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-sans text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold block mb-1">
                            Authenticated Phone (Firebase Auth Verified)
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-[#121212] border border-brand-secondary/15 text-sm text-brand-primary font-mono text-xs">
                            <Phone className="h-4 w-4 text-brand-secondary shrink-0" />
                            <span>{user.phoneNumber || user.phone || 'Phone verified with session'}</span>
                            <span className="ml-auto text-[8px] font-mono uppercase tracking-widest text-emerald-500 font-bold bg-emerald-950/40 px-2 py-0.5 border border-emerald-800/30">
                              Immutable Auth
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Special Notes & Requests */}
                      <div className="pt-2">
                        <label className="font-sans text-[10px] uppercase tracking-widest text-brand-text-muted font-semibold block mb-1">
                          Special Sanctuary Requests (Optional)
                        </label>
                        <textarea
                          id="booking-special-requests"
                          rows={3}
                          value={specialNotes}
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          placeholder="e.g. Preferred ambient temperature, rare tea selections, or specific skin sensitivities."
                          className="w-full bg-[#121212] border border-brand-secondary/15 p-3 text-xs text-brand-primary font-sans focus:outline-none focus:border-brand-secondary resize-none"
                        />
                      </div>

                      <div className="pt-2 border-t border-brand-secondary/15 text-left flex items-start gap-2 text-brand-text-muted text-[11px] font-normal">
                        <ShieldCheck className="h-4 w-4 text-brand-secondary shrink-0 mt-0.5" />
                        <span>Master artisans are assigned internally by the salon management to preserve optimal treatment balance.</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 6: BOOKING SUMMARY & TERMS */}
            {currentStep === 6 && (
              <motion.div
                key="step-summary-terms"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 6 of 6</span>
                  <h3 className="font-serif text-xl text-brand-primary font-bold">Verify Booking Summary & Terms</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-normal leading-relaxed">
                    Review your appointment specifics before final reservation confirmation.
                  </p>
                </div>

                <div className="border border-brand-secondary/15 bg-brand-surface divide-y divide-brand-secondary/15 text-left">
                  {/* Service item row */}
                  <div className="p-4 sm:p-5 flex justify-between items-center gap-4">
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Selected Treatment</span>
                      <h4 className="font-serif text-base font-semibold text-brand-primary leading-tight mt-0.5">{activeService?.name}</h4>
                      <p className="font-mono text-[10px] text-brand-text-muted flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> {activeService?.duration}</p>
                    </div>
                    <span className="font-serif text-base font-bold text-brand-gold-dark">{activeService?.price}</span>
                  </div>

                  {/* Recipient category row */}
                  <div className="p-4 sm:p-5 flex justify-between items-center gap-4">
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Recipient Discipline</span>
                      <h4 className="font-serif text-sm font-semibold text-brand-primary leading-tight mt-0.5">
                        {selectedCategory === 'Men' ? "Gentlemen's Grooming" : 
                         selectedCategory === 'Women' ? "Women's Sanctuary" : 
                         'Universal Experience'}
                      </h4>
                    </div>
                    <span className="font-mono text-[10px] text-brand-secondary uppercase tracking-widest">Internal Staff Assignment</span>
                  </div>

                  {/* Date & Time row */}
                  <div className="p-4 sm:p-5 grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Scheduled Date</span>
                      <span className="font-sans text-xs font-semibold text-brand-primary block mt-1">
                        {dateChoices.find(d => d.value === selectedDate)?.label || selectedDate}
                      </span>
                    </div>
                    <div className="border-l border-brand-secondary/15 pl-4">
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Appointment Hours</span>
                      <span className="font-sans text-xs font-semibold text-brand-primary block mt-1">
                        {selectedTimeSlot} – {calculateEndTime(selectedTimeSlot, activeService?.durationValue || 60)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privilege Promo Code */}
                <div className="bg-brand-surface border border-brand-secondary/15 p-4 space-y-3">
                  <h4 className="font-serif text-sm text-brand-primary font-medium flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-brand-secondary" /> Add Privilege Promo Code
                  </h4>
                  <div className="flex gap-2">
                    <input
                      id="discount-code-input"
                      type="text"
                      placeholder="e.g., ROYAL15"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-[#121212] text-brand-primary uppercase font-mono text-xs px-3 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none w-full"
                    />
                    <Button id="apply-promo-btn" variant="outline" size="sm" onClick={handleApplyPromo} className="px-6 shrink-0 text-[10px] font-sans font-bold uppercase tracking-wider">
                      Apply Code
                    </Button>
                  </div>
                  {promoSuccessMessage && <p className="text-emerald-600 text-xs font-sans font-medium">{promoSuccessMessage}</p>}
                  {promoErrorMessage && <p className="text-red-500 text-xs font-sans font-medium">{promoErrorMessage}</p>}
                </div>

                {/* Terms of Attendance */}
                <div className="bg-brand-surface border border-brand-secondary/15 p-5 space-y-2 text-left text-xs text-brand-text-muted">
                  <h5 className="font-serif text-sm text-brand-primary font-medium flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-brand-secondary" /> Terms of Sanctuary Attendance
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 font-sans text-[11px] leading-relaxed font-normal">
                    <li>Please arrive 10 minutes prior to your scheduled hour for complimentary herbal tea service.</li>
                    <li>Medical-grade autoclave sterilization protocols applied between all sessions.</li>
                    <li>Rescheduling is accommodated up to 24 hours prior to attendance.</li>
                    <li>Master artisans are assigned internally by our concierge to guarantee treatment excellence.</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* STEP 7: BOOKING SUCCESS & DIGITAL TICKET */}
            {currentStep === 7 && completedRecord && (
              <motion.div
                key="step-ticket"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-4 max-w-xl mx-auto"
              >
                {/* Visual success illustration */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="h-16 w-16 bg-brand-secondary/15 text-brand-gold-dark rounded-full flex items-center justify-center mx-auto border border-brand-secondary/30"
                  >
                    <CheckCircle className="h-10 w-10 stroke-1.5" />
                  </motion.div>
                  <span className="font-mono text-[10px] tracking-widest text-brand-gold-dark uppercase font-semibold block">RESERVATION CONFIRMED</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary leading-tight">Your Royal Slot is Secured</h2>
                  <p className="font-sans text-xs md:text-sm text-brand-text-muted font-normal leading-relaxed">
                    A digital luxury ticket pass has been generated. We look forward to welcoming you to the sanctuary.
                  </p>
                </div>

                {/* Digital Ticket Pass Card */}
                <div className="bg-[#121212] border border-brand-secondary/35 p-6 divide-y divide-brand-secondary/15 text-left relative overflow-hidden shadow-2xl">
                  {/* Subtle watermarking */}
                  <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                    <QrCode className="h-24 w-24 text-brand-secondary" />
                  </div>

                  <div className="flex justify-between items-center pb-3 mb-3">
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-secondary font-bold block">MUSHA EMPIRE SANCTUARY PASS</span>
                      <span className="font-serif text-sm font-semibold text-brand-primary">{completedRecord.customerName || 'Noble Guest'}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-brand-gold-dark bg-brand-secondary/10 px-2 py-1 border border-brand-secondary/30">
                      {completedRecord.ticketCode || completedRecord.id}
                    </span>
                  </div>

                  <div className="py-3 space-y-1">
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Reserved Ritual</span>
                    <h4 className="font-serif text-base font-semibold text-brand-primary">{completedRecord.service.name}</h4>
                    <span className="font-mono text-[10px] text-brand-text-muted block">{completedRecord.service.duration} Session</span>
                  </div>

                  <div className="py-3 space-y-1">
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Service Recipient</span>
                    <h4 className="font-serif text-sm font-semibold text-brand-primary">
                      {completedRecord.gender === 'Men' ? "Gentlemen's Grooming" : 
                       completedRecord.gender === 'Women' ? "Women's Sanctuary" : 
                       'Universal Experience'}
                    </h4>
                  </div>

                  <div className="py-3 grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Date</span>
                      <span className="font-sans text-xs font-semibold text-brand-primary block mt-0.5">{completedRecord.date}</span>
                    </div>
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Hours Window</span>
                      <span className="font-sans text-xs font-semibold text-brand-primary block mt-0.5">
                        {completedRecord.timeSlot} {completedRecord.endTime ? `– ${completedRecord.endTime}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between items-center">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-primary">Settled Treatment Total</span>
                    <span className="font-serif text-base font-bold text-brand-gold-dark">${completedRecord.totalAmount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    id="success-view-app-btn"
                    variant="outline"
                    size="md"
                    onClick={onViewAppointments}
                    className="w-full sm:w-auto font-sans text-xs uppercase tracking-widest px-6"
                  >
                    View My Appointments
                  </Button>
                  <Button
                    id="success-home-btn"
                    variant="primary"
                    size="md"
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto font-sans text-xs uppercase tracking-widest px-6"
                  >
                    Back to Home
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Footer Controls */}
          {currentStep < 7 && (
            <div className="flex justify-between items-center pt-8 border-t border-brand-secondary/15">
              <Button
                id="booking-prev-step-btn"
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
                disabled={currentStep === 1 || (!!initialServiceId && currentStep === 2)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                className="font-sans text-[10px] uppercase tracking-widest font-bold disabled:opacity-30 disabled:pointer-events-none"
              >
                Back
              </Button>

              {currentStep < 6 ? (
                <Button
                  id="booking-next-step-btn"
                  variant="primary"
                  size="sm"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="font-sans text-[10px] uppercase tracking-widest font-bold px-6"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  id="booking-confirm-btn"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmReservation}
                  disabled={isSubmitting}
                  leftIcon={isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-brand-secondary" />
                  )}
                  className="font-sans text-[10px] uppercase tracking-widest font-bold px-8 bg-brand-gold-dark text-white hover:bg-brand-primary"
                >
                  {isSubmitting ? 'Securing Slot...' : 'Confirm Reservation'}
                </Button>
              )}
            </div>
          )}

        </div>

        {/* Right Bill Summary Panel (col-span-4) - Hidden in success step 7 */}
        {currentStep < 7 && (
          <div className="lg:col-span-4 bg-brand-surface border border-brand-secondary/15 p-5 space-y-6 text-left sticky top-28">
            <h4 className="font-serif text-lg text-brand-primary border-b border-brand-secondary/15 pb-3 font-medium flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-brand-secondary" /> Reservation Invoice
            </h4>

            {/* Recipient Category brief */}
            {selectedCategory && (
              <div className="space-y-1">
                <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Service Recipient</span>
                <h5 className="font-serif text-sm font-semibold text-brand-primary leading-tight">
                  {selectedCategory === 'Men' ? "Gentlemen's Grooming" : 
                   selectedCategory === 'Women' ? "Women's Sanctuary" : 
                   'Universal Experience'}
                </h5>
              </div>
            )}

            {/* Service brief */}
            <div className="space-y-1 pt-3 border-t border-brand-secondary/15">
              <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Ritual Selected</span>
              <h5 className="font-serif text-sm font-semibold text-brand-primary leading-tight">{activeService?.name}</h5>
              <div className="flex justify-between font-sans text-[10px] text-brand-text-muted mt-0.5">
                <span>Duration: {activeService?.duration}</span>
                <span>Base: {activeService?.price}</span>
              </div>
            </div>

            {/* Date Time summary */}
            {selectedDate && (
              <div className="space-y-1 pt-3 border-t border-brand-secondary/15">
                <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Scheduled For</span>
                <div className="flex flex-col gap-0.5 font-sans text-[10px] font-semibold text-brand-primary">
                  <span>Date: {dateChoices.find(d => d.value === selectedDate)?.label || selectedDate}</span>
                  {selectedTimeSlot && (
                    <span>Hours: {selectedTimeSlot} – {calculateEndTime(selectedTimeSlot, activeService?.durationValue || 60)}</span>
                  )}
                </div>
              </div>
            )}

            {/* Financial table */}
            <div className="pt-4 border-t border-brand-secondary/15 space-y-2 font-sans text-xs">
              <div className="flex justify-between text-brand-text-muted">
                <span>Base Treatment Rate</span>
                <span className="font-mono">${priceFloat}</span>
              </div>
              <div className="flex justify-between text-brand-text-muted">
                <span>Luxury Service Tax (18%)</span>
                <span className="font-mono">${taxValue}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Privilege Discount</span>
                  <span className="font-mono">-${discountValue}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-primary font-bold font-serif text-base pt-3 border-t border-dashed border-brand-secondary/15">
                <span>Total Amount</span>
                <span className="text-brand-gold-dark font-mono">${finalTotalAmount}</span>
              </div>
            </div>

            {/* Notice */}
            <p className="font-sans text-[9px] text-brand-text-muted leading-relaxed font-normal text-center border-t border-brand-secondary/15 pt-4">
              All tools sanitized under autoclave protocols (134°C). Master staff assigned internally by salon concierge. 24-hour cancellation flexibility.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
