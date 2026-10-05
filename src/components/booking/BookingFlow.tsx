/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  User,
  Clock,
  Sparkles,
  CreditCard,
  CheckCircle,
  Tag,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Heart,
  ChevronRight,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Wallet,
  Crown,
  Gem,
  Compass
} from 'lucide-react';
import { EXTENDED_SERVICES_DATA, ExtendedService, CATEGORIES_LIST } from '../../data/servicesExtendedData';
import { STYLISTS_DATA, StylistItem } from '../../data/salonData';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/InputFields';
import Avatar from '../ui/Avatar';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { parseStaffBio, isStaffOnLeave, isStaffWorking } from '../../lib/staffHelpers';
import AuthModule from '../dashboard/AuthModule';

// Deterministic UUID generator to adapt any mock/string IDs to UUID format
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

// Define the shape of a completed booking
export interface BookingRecord {
  id: string;
  service: ExtendedService;
  stylist: StylistItem;
  date: string;
  timeSlot: string;
  totalAmount: number;
  discountApplied: number;
  promoApplied: string;
  createdAt: string;
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

// Standalone helper to auto-detect category based on selected service
function getCategoryForServiceId(serviceId: string): string {
  if (!serviceId) return 'Other';
  if (serviceId.includes('boy') || serviceId.includes('kids-haircut-boy') || serviceId === 'kids-wash-boy' || serviceId === 'kids-styling-boy') {
    return 'Boy';
  }
  if (serviceId.includes('girl') || serviceId.includes('kids-haircut-girl') || serviceId === 'kids-wash-girl' || serviceId === 'kids-styling-girl' || serviceId === 'kids-spa-girl') {
    return 'Girl';
  }
  if (serviceId === 'hair-cut-2' || serviceId.includes('grooming') || serviceId.includes('beard') || serviceId.includes('shave')) {
    return 'Men';
  }
  const svc = EXTENDED_SERVICES_DATA.find(s => s.id === serviceId);
  if (svc) {
    const nameLower = svc.name.toLowerCase();
    const catLower = svc.category.toLowerCase();
    if (nameLower.includes('gentlemen') || nameLower.includes('shave') || nameLower.includes('beard')) {
      return 'Men';
    }
    if (catLower.includes('bridal') || catLower.includes('makeup') || catLower.includes('nail') || nameLower.includes('waxing') || nameLower.includes('threading')) {
      return 'Women';
    }
  }
  return 'Other';
}

export default function BookingFlow({
  initialServiceId,
  initialRecipientCategory,
  onBookingComplete,
  onNavigateHome,
  onViewAppointments,
  triggerToast
}: BookingFlowProps) {
  // Booking Form State
  const [currentStep, setCurrentStep] = useState<number>(() => {
    return initialServiceId ? 3 : 1;
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
  const [selectedStylistId, setSelectedStylistId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [promoSuccessMessage, setPromoSuccessMessage] = useState<string>('');
  const [promoErrorMessage, setPromoErrorMessage] = useState<string>('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');

  // Finished booking record cache
  const [completedRecord, setCompletedRecord] = useState<BookingRecord | null>(null);

  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  // Fetch Supabase catalog
  useEffect(() => {
    let isMounted = true;
    const loadDbCatalog = async () => {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setDbServices([]);
          setStylists(STYLISTS_DATA as any);
          setIsLoadingDb(false);
        }
        return;
      }

      try {
        setIsLoadingDb(true);
        const { data: sData, error: sErr } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true);
        if (sErr) throw sErr;

        const { data: stData, error: stErr } = await supabase
          .from('staff')
          .select('*')
          .eq('is_available', true)
          .eq('is_active', true)
          .eq('role', 'stylist');
        
        if (stErr) throw stErr;

        if (isMounted) {
          setDbServices(sData || []);
          setStylists(stData || []);
        }
      } catch (err: any) {
        console.warn('Notice loading database catalog:', err);
        if (isMounted) {
          setDbServices([]);
          setStylists(STYLISTS_DATA as any);
        }
      } finally {
        if (isMounted) {
          setIsLoadingDb(false);
        }
      }
    };
    loadDbCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map database entries to match rich client layout details
  const services = useMemo(() => {
    if (!dbServices || dbServices.length === 0) {
      return EXTENDED_SERVICES_DATA;
    }
    return dbServices.map(item => {
      const localService = EXTENDED_SERVICES_DATA.find(s => s.id === item.id || s.name.toLowerCase() === item.name.toLowerCase());
      return {
        id: item.id,
        name: item.name,
        category: localService?.category || 'Exclusive',
        price: typeof item.price === 'number' ? `$${item.price}` : item.price,
        priceValue: typeof item.price === 'number' ? item.price : parseFloat(item.price?.replace(/[^0-9.]/g, '') || '0'),
        duration: `${item.duration_minutes} Mins`,
        durationValue: item.duration_minutes,
        shortDescription: item.description || localService?.shortDescription || '',
        longDescription: item.description || localService?.longDescription || '',
        image: item.image_url || localService?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        benefits: localService?.benefits || [],
        includedServices: localService?.includedServices || [],
        popular: localService?.popular || false,
        rating: localService?.rating || 4.9,
        reviewsCount: localService?.reviewsCount || 12,
        faqs: localService?.faqs || []
      };
    });
  }, [dbServices]);

  const staff = useMemo(() => {
    if (!stylists || stylists.length === 0) {
      return [];
    }
    const mapped = stylists.map(item => {
      const localStylist = STYLISTS_DATA.find(s => s.id === item.id || s.name.toLowerCase() === item.full_name.toLowerCase());
      const meta = parseStaffBio(item.bio || '');
      return {
        id: item.id,
        name: item.full_name,
        role: item.role === 'stylist' ? 'Master Stylist' : (item.role || localStylist?.role || 'Master Artisan'),
        experience: localStylist?.experience || '7+ Years Experience',
        specialty: item.specialty || localStylist?.specialty || 'Luxury Artistry',
        bio: meta.bioText || item.bio || localStylist?.bio || 'Elite hair care artisan specializing in custom bespoke looks.',
        image: item.image_url || localStylist?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        instagram: localStylist?.instagram || '@musha_empire',
        meta
      };
    });

    return mapped.filter(s => {
      if (selectedDate && isStaffOnLeave(s.meta.leaves, selectedDate)) {
        return false;
      }
      if (selectedDate && selectedTimeSlot) {
        if (!isStaffWorking(s.meta, selectedDate, selectedTimeSlot)) {
          return false;
        }
      }
      return true;
    });
  }, [stylists, selectedDate, selectedTimeSlot]);

  // Derive filtered services based on selected category (Step 1)
  const filteredServices = useMemo(() => {
    if (!selectedCategory) return services;
    
    if (selectedCategory === 'Men') {
      // Men: Haircut, Hair Spa, Hair Color, Beard, Facial
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
      // Women: Haircut, Hair Spa, Hair Color, Facial, Bridal, Makeup, Nails
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
    
    if (selectedCategory === 'Boy') {
      // Boy: Kids Haircut, Hair Wash
      return [
        {
          id: 'kids-haircut-boy',
          name: 'Young Sovereign Kids Haircut',
          category: 'Kids Haircut',
          price: '$45',
          priceValue: 45,
          duration: '35 Mins',
          durationValue: 35,
          shortDescription: 'Gentle precision styling designed for young gentlemen, complete with organic detangler.',
          longDescription: 'A premium, ultra-patient haircutting experience for boys. Our kid-friendly master artisans style locks with modern contouring. Includes a refreshing organic rinse and styled finish.',
          image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
          benefits: ['Patient styling', 'Organic non-irritating wash', 'Complimentary VIP juice'],
          includedServices: ['Gentle cleanse', 'Custom precision cut', 'Styling clay finish'],
          popular: true,
          rating: 4.9,
          reviewsCount: 42,
          faqs: []
        },
        {
          id: 'kids-wash-boy',
          name: 'Botanical Hair Wash & Nourishing Blow',
          category: 'Hair Wash',
          price: '$30',
          priceValue: 30,
          duration: '25 Mins',
          durationValue: 25,
          shortDescription: 'Refreshing scalp wash using organic tear-free formulas and light, warm styling.',
          longDescription: 'A deeply hydrating, tear-free hair wash designed for young scalps. We utilize premium botanical extracts to cleanse, followed by a gentle warm styling blow dry.',
          image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
          benefits: ['Tear-free botanical wash', 'Gentle warm blow dry', 'Calming scalp therapy'],
          includedServices: ['Warm water massage', 'Frizz-free blow out'],
          rating: 4.8,
          reviewsCount: 19,
          faqs: []
        }
      ];
    }
    
    if (selectedCategory === 'Girl') {
      // Girl: Kids Haircut, Hair Wash, Kids Styling
      return [
        {
          id: 'kids-haircut-girl',
          name: 'Little Princess Kids Haircut',
          category: 'Kids Haircut',
          price: '$45',
          priceValue: 45,
          duration: '40 Mins',
          durationValue: 40,
          shortDescription: 'Delicate split-end trimming and cute geometric shaping with organic protective sprays.',
          longDescription: 'A premium, ultra-careful haircutting experience for girls. Our expert stylist crafts cute locks, trimming split ends and creating high-volume styles that grow out beautifully.',
          image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
          benefits: ['Extremely gentle detangling', 'Tear-free botanical rinse', 'Sparkle spray finish'],
          includedServices: ['Mild shampooing', 'Princess precision styling', 'Airy soft blow dry'],
          popular: true,
          rating: 4.9,
          reviewsCount: 38,
          faqs: []
        },
        {
          id: 'kids-wash-girl',
          name: 'Botanical Hair Wash & Nourishing Blow',
          category: 'Hair Wash',
          price: '$30',
          priceValue: 30,
          duration: '25 Mins',
          durationValue: 25,
          shortDescription: 'Refreshing scalp wash using organic tear-free formulas and light, warm styling.',
          longDescription: 'A deeply hydrating, tear-free hair wash designed for young scalps. We utilize premium botanical extracts to cleanse, followed by a gentle warm styling blow dry.',
          image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
          benefits: ['Tear-free botanical wash', 'Gentle warm blow dry', 'Calming scalp therapy'],
          includedServices: ['Warm water massage', 'Frizz-free blow out'],
          rating: 4.8,
          reviewsCount: 19,
          faqs: []
        },
        {
          id: 'kids-styling-girl',
          name: 'Princess Sparkle Kids Styling',
          category: 'Kids Styling',
          price: '$50',
          priceValue: 50,
          duration: '35 Mins',
          durationValue: 35,
          shortDescription: 'Braids, twists, or delicate cascading curls completed with hair-safe glitter accents.',
          longDescription: 'Bespoke kids styling session featuring braids, cute buns, or luxury cascading thermal curls using heat-safe settings. Completed with premium hair sparkles.',
          image: 'https://images.unsplash.com/photo-1595959183075-c1d945103d34?auto=format&fit=crop&w=800&q=80',
          benefits: ['Glamorous premium styling', '100% hair-safe products', 'Perfect for special celebrations'],
          includedServices: ['Thermal shield application', 'Bespoke braid or curl set', 'Glitter spray overlay'],
          rating: 5.0,
          reviewsCount: 29,
          faqs: []
        }
      ];
    }
    
    return services; // Other
  }, [selectedCategory, services]);

  // Sync initialServiceId if provided, and handle promo-prefilling from Offers Page
  useEffect(() => {
    if (initialServiceId) {
      let targetServiceId = '';
      if (initialServiceId === 'promo-1') {
        setPromoCode('SOLSTICE95');
        // "Summer Solstice Hair & Scalp Nourish" is under hair spa / treatments.
        const defaultService = services.find(s => s.id === 'hair-spa-1') || services[0];
        targetServiceId = defaultService?.id || '';
      } else if (initialServiceId === 'promo-2') {
        setPromoCode('SOVEREIGN195');
        const defaultService = services.find(s => s.id === 'hair-cut-1') || services[0];
        targetServiceId = defaultService?.id || '';
      } else if (initialServiceId === 'promo-3') {
        setPromoCode('GOLDENGALA');
        const defaultService = services.find(s => s.id === 'makeup-1') || services[0];
        targetServiceId = defaultService?.id || '';
      } else if (initialServiceId === 'promo-4') {
        setPromoCode('WELCOMEEMPIRE');
        targetServiceId = services[0]?.id || '';
      } else if (initialServiceId === 'promo-5') {
        setPromoCode('MEMBERSUITE');
        targetServiceId = services[0]?.id || '';
      } else {
        targetServiceId = initialServiceId;
      }
      
      if (targetServiceId) {
        setSelectedServiceId(targetServiceId);
        const autoCat = getCategoryForServiceId(targetServiceId);
        setSelectedCategory(autoCat);
      }
    }
  }, [initialServiceId, services]);

  // Sync recipient category when it changes and initialServiceId is not provided
  useEffect(() => {
    if (initialRecipientCategory && !initialServiceId) {
      setSelectedCategory(initialRecipientCategory);
    }
  }, [initialRecipientCategory, initialServiceId]);

  // Adjust selection when category changes to keep selectedServiceId always valid
  useEffect(() => {
    if (filteredServices.length > 0) {
      const isStillValid = filteredServices.some(s => s.id === selectedServiceId);
      if (!isStillValid) {
        setSelectedServiceId(filteredServices[0].id);
      }
    } else {
      setSelectedServiceId('');
    }
  }, [filteredServices, selectedServiceId]);

  // Derive active items
  const activeService = useMemo(() => {
    return filteredServices.find((s) => s.id === selectedServiceId) || filteredServices[0] || services[0];
  }, [filteredServices, services, selectedServiceId]);

  const activeStylist = useMemo(() => {
    return staff.find((st) => st.id === selectedStylistId) || staff[0];
  }, [staff, selectedStylistId]);

  // Generate Date Choices (Next 14 days starting tomorrow)
  const dateChoices = useMemo(() => {
    const choices = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Start tomorrow
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const dayName = days[d.getDay()];
      const dateNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      
      const fullDateStr = `${dayName}, ${monthName} ${dateNum}, ${year}`;
      const isoStr = d.toISOString().split('T')[0]; // YYYY-MM-DD for comparison

      choices.push({
        label: fullDateStr,
        value: isoStr,
        dayName,
        dateNum,
        monthName
      });
    }
    return choices;
  }, []);

  // Set default date tomorrow on render
  useEffect(() => {
    if (dateChoices.length > 0 && !selectedDate) {
      setSelectedDate(dateChoices[0].value);
    }
  }, [dateChoices]);

  // Standard static slots representing morning, afternoon, evening
  const timeSlots: TimeSlot[] = useMemo(() => {
    const rawSlots: TimeSlot[] = [
      // Morning slots
      { time: '09:00 AM', status: 'available', period: 'morning' },
      { time: '10:00 AM', status: 'limited', period: 'morning' },
      { time: '11:00 AM', status: 'booked', period: 'morning' },
      { time: '11:30 AM', status: 'available', period: 'morning' },
      
      // Afternoon slots
      { time: '01:00 PM', status: 'available', period: 'afternoon' },
      { time: '02:00 PM', status: 'booked', period: 'afternoon' },
      { time: '03:00 PM', status: 'limited', period: 'afternoon' },
      { time: '04:30 PM', status: 'available', period: 'afternoon' },
      
      // Evening slots
      { time: '05:30 PM', status: 'available', period: 'evening' },
      { time: '06:30 PM', status: 'limited', period: 'evening' },
      { time: '07:30 PM', status: 'booked', period: 'evening' },
      { time: '08:00 PM', status: 'available', period: 'evening' },
    ];

    if (!selectedStylistId) return rawSlots;

    const rawStylist = stylists.find(rs => rs.id === selectedStylistId);
    if (!rawStylist) return rawSlots;

    const meta = parseStaffBio(rawStylist.bio);

    return rawSlots.map(slot => {
      const onLeave = selectedDate ? isStaffOnLeave(meta.leaves, selectedDate) : false;
      const working = selectedDate ? isStaffWorking(meta, selectedDate, slot.time) : true;

      if (onLeave || !working) {
        return { ...slot, status: 'booked' };
      }
      return slot;
    });
  }, [selectedDate, selectedStylistId, stylists]);

  // Set default time slot
  useEffect(() => {
    const firstAvail = timeSlots.find(s => s.status !== 'booked');
    if (firstAvail && !selectedTimeSlot) {
      setSelectedTimeSlot(firstAvail.time);
    }
  }, [timeSlots]);

  // Financial calculations
  const priceFloat = useMemo(() => {
    if (!activeService) return 0;
    return parseFloat(activeService.price.replace(/[^0-9.]/g, ''));
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

  // Apply promo codes dynamically or on button click
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
    } else if (code === 'MEMBERSUITE') {
      setDiscountValue(0);
      setPromoSuccessMessage(`Member Suite promo accepted! Free Golden Cabin upgrade unlocked (Value: $50).`);
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

  // Sync auto-application on coupon matching
  useEffect(() => {
    const code = promoCode.trim().toUpperCase();
    const validCodes = ['ROYAL15', 'EMPIRE15', 'WELCOMEEMPIRE', 'SOLSTICE95', 'SOVEREIGN195', 'GOLDENGALA', 'MEMBERSUITE'];
    if (validCodes.includes(code) && priceFloat > 0) {
      applyPromoCode(code, priceFloat);
    }
  }, [promoCode, priceFloat]);

  // Apply promo codes on button trigger
  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoErrorMessage('Please enter a valid code');
      setPromoSuccessMessage('');
      setDiscountValue(0);
      return;
    }
    applyPromoCode(promoCode, priceFloat);
  };

  // Move Next & Previous Steps with Validation
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
      // Default to first stylist if available
      if (!selectedStylistId && staff.length > 0) {
        setSelectedStylistId(staff[0].id);
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (staff.length === 0) {
        triggerToast('error', 'Booking Blocked', 'No stylists available. Booking cannot be attempted.');
        return;
      }
      if (!selectedStylistId) {
        triggerToast('warning', 'Selection Required', 'Please select a master stylist before proceeding.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!selectedDate) {
        triggerToast('warning', 'Selection Required', 'Please select an appointment date before proceeding.');
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!selectedTimeSlot) {
        triggerToast('warning', 'Selection Required', 'Please choose an available time slot before proceeding.');
        return;
      }
      setCurrentStep(6);
    } else if (currentStep === 6) {
      setCurrentStep(7);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      if (initialServiceId && currentStep === 3) {
        return; // Don't let them go back to step 1 or 2
      }
      setCurrentStep(currentStep - 1);
    }
  };

  // Card validation check before going to success
  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (paymentMethod === 'card') {
      if (cardNumber.length < 12 || !cardName || !cardExpiry || cardCvv.length < 3) {
        setCardError('Please complete all premium credit card details securely.');
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      const realBookingId = crypto.randomUUID();
      const formattedDate = dateChoices.find(d => d.value === selectedDate)?.label || selectedDate;
      
      // Calculate end time
      const durationMin = activeService?.durationValue || 60;
      const calculateEndTime = (startTimeStr: string, durationMinutes: number) => {
        try {
          const match = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return startTimeStr;
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          
          const totalMin = hours * 60 + minutes + durationMinutes;
          let endHours = Math.floor(totalMin / 60) % 24;
          const endMinutes = totalMin % 60;
          const endAmPm = endHours >= 12 ? 'PM' : 'AM';
          if (endHours > 12) endHours -= 12;
          if (endHours === 0) endHours = 12;
          
          return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${endAmPm}`;
        } catch {
          return startTimeStr;
        }
      };

      const endTime = calculateEndTime(selectedTimeSlot, durationMin);

      if (!user) {
        throw new Error("Authentication required. Please sign in or register to complete your reservation.");
      }

      if (isSupabaseConfigured) {
        // --- 1. Create/Find Customer profile ---
        let customerId = user.id;
        let existingProfile = null;

        try {
          const { data: profileList, error: getProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id);

          if (getProfileError) {
            console.warn('Error fetching profile in pipeline:', getProfileError);
          } else if (profileList && profileList.length > 0) {
            existingProfile = profileList[0];
          }
        } catch (err) {
          console.warn('Exception fetching profile in pipeline:', err);
        }

        if (!existingProfile) {
          const profilePayload = {
            id: user.id,
            full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Exclusive Guest',
            phone: user.user_metadata?.phone || '',
            email: user.email,
            role: 'customer'
          };
          try {
            const { error: insertProfileError, data: insertProfileData } = await supabase
              .from('profiles')
              .insert(profilePayload)
              .select();

            if (insertProfileError) {
              console.warn("Profile insertion returned a notice (might already exist or handled by trigger):", {
                error: insertProfileError,
                payload: profilePayload,
                response: insertProfileData
              });
            } else if (insertProfileData && insertProfileData.length > 0) {
              existingProfile = insertProfileData[0];
            }
          } catch (insertCatchErr) {
            console.warn("Exception during profile insert (will proceed with user.id):", insertCatchErr);
          }
        }

        if (existingProfile) {
          customerId = existingProfile.id;
        } else {
          customerId = user.id;
        }

        // --- 2. Insert booking ---
        const bookingPayload = {
          id: realBookingId,
          customer_id: customerId,
          staff_id: activeStylist?.id || '',
          booking_date: selectedDate, // ISO Date format
          start_time: selectedTimeSlot,
          end_time: endTime,
          total_amount: finalTotalAmount,
          status: 'pending',
          notes: `Promo code used: ${promoCode || 'None'}`
        };

        const { error: bookingErr, data: bookingResponse } = await supabase
          .from('bookings')
          .insert(bookingPayload)
          .select();

        if (bookingErr) {
          console.warn("Booking insertion note:", {
            error: bookingErr,
            payload: bookingPayload,
            response: bookingResponse
          });
        }

        // --- 3. Insert booking_services ---
        const bsPayload = {
          id: crypto.randomUUID(),
          booking_id: realBookingId,
          service_id: getStableUuid(activeService?.id || 'hair-cut-1')
        };

        const { error: bsErr, data: bsResponse } = await supabase
          .from('booking_services')
          .insert(bsPayload)
          .select();

        if (bsErr) {
          console.warn("Booking services insertion note:", {
            error: bsErr,
            payload: bsPayload,
            response: bsResponse
          });
        }

        // --- 4. Insert payment ---
        const realPaymentId = crypto.randomUUID();
        const paymentPayload = {
          id: realPaymentId,
          booking_id: realBookingId,
          customer_id: customerId,
          amount: finalTotalAmount,
          payment_method: paymentMethod || 'card',
          transaction_id: paymentMethod === 'card' ? `tx_card_${Math.floor(Math.random() * 100000000)}` : `tx_upi_${Math.floor(Math.random() * 100000000)}`
        };

        const { error: paymentErr, data: paymentResponse } = await supabase
          .from('payments')
          .insert(paymentPayload)
          .select();

        if (paymentErr) {
          console.warn("Payment insertion note:", {
            error: paymentErr,
            payload: paymentPayload,
            response: paymentResponse
          });
        }

        // --- 5. Insert invoice ---
        const invoicePayload = {
          id: crypto.randomUUID(),
          booking_id: realBookingId,
          customer_id: customerId,
          invoice_number: `ME-INV-${Date.now()}`,
          payment_id: realPaymentId
        };

        const { error: invoiceErr, data: invoiceResponse } = await supabase
          .from('invoices')
          .insert(invoicePayload)
          .select();

        if (invoiceErr) {
          console.warn("Invoice insertion note:", {
            error: invoiceErr,
            payload: invoicePayload,
            response: invoiceResponse
          });
        }

        // --- 6. Insert notification ---
        const notificationPayload = {
          id: crypto.randomUUID(),
          profile_id: customerId,
          title: 'Reservation Confirmed',
          message: `Your booking for ${activeService?.name || 'Exclusive Treatment'} with ${activeStylist?.name || 'Stylist'} is confirmed for ${formattedDate} at ${selectedTimeSlot}.`,
          is_read: false
        };

        const { error: notifErr, data: notifResponse } = await supabase
          .from('notifications')
          .insert(notificationPayload)
          .select();

        if (notifErr) {
          console.warn("Notification insertion note:", {
            error: notifErr,
            payload: notificationPayload,
            response: notifResponse
          });
        }
      }

      // Create completed booking record
      const record: BookingRecord = {
        id: realBookingId,
        service: activeService,
        stylist: activeStylist,
        date: formattedDate,
        timeSlot: selectedTimeSlot,
        totalAmount: finalTotalAmount,
        discountApplied: discountValue,
        promoApplied: discountValue > 0 ? promoCode.toUpperCase() : '',
        createdAt: new Date().toLocaleDateString()
      };

      setCompletedRecord(record);
      onBookingComplete(record);
      setCurrentStep(8);
    } catch (err: any) {
      console.warn('Notice in handleCompletePayment:', err);
      triggerToast('error', 'Booking Submission Notice', err.message || 'Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="booking-flow-container" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 text-left">
      
      {/* Dynamic Title area */}
      {currentStep < 8 && (
        <div className="mb-8 border-b border-brand-secondary/15 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-brand-secondary font-bold block mb-1">RESERVATIONS DESK</span>
              <h1 className="text-3xl font-serif font-light text-brand-primary">Schedule Your Sanctuary Experience</h1>
            </div>
            
            {/* Steps Progress Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => {
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
                    {stepNum < 7 && <ChevronRight className="h-3 w-3 text-brand-accent shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Core Form Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Interactive Flow (col-span-8) */}
        <div className={`${currentStep === 8 ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
          
          {/* Premium Booking Summary Card */}
          {currentStep >= 3 && currentStep < 8 && activeService && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-surface border border-brand-secondary/35 p-5 relative overflow-hidden"
            >
              {/* Visual subtle luxury backdrop gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/[0.03] to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1 text-left">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-brand-secondary font-semibold">Pre-selected Experience</span>
                  <h4 className="font-serif text-lg font-light text-brand-primary uppercase tracking-wide">
                    {activeService.name}
                  </h4>
                  <p className="font-sans text-[11px] text-brand-text-muted font-light leading-relaxed">
                    {activeService.shortDescription}
                  </p>
                </div>
                
                {/* Grid details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 border-t md:border-t-0 md:border-l border-brand-secondary/15 pt-4 md:pt-0 md:pl-6 shrink-0 text-left">
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Recipient</span>
                    <span className="font-serif text-xs font-semibold text-brand-primary block mt-0.5">
                      {selectedCategory === 'Men' && "Gentlemen's Grooming"}
                      {selectedCategory === 'Women' && "Women's Sanctuary"}
                      {selectedCategory === 'Boy' && 'Young Prince Care'}
                      {selectedCategory === 'Girl' && 'Little Princess Salon'}
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
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Base Price</span>
                    <span className="font-serif text-sm font-bold text-brand-gold-dark block mt-0.5">
                      {activeService.price}
                    </span>
                  </div>
                  <div>
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Status</span>
                    <span className="bg-brand-secondary/10 text-brand-secondary font-sans text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 mt-1 inline-block border border-brand-secondary/20">
                      Pre-Filled
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: CHOOSE RECIPIENT */}
            {currentStep === 1 && (
              <motion.div
                key="step-category"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 1 of 7</span>
                  <h3 className="font-serif text-xl text-brand-primary font-medium">Select Service Recipient</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-light leading-relaxed">
                    Choose who the luxury experience is for. We dynamically customize and filter our bespoke catalog options below.
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
                      id: 'Boy',
                      label: 'Boy',
                      icon: Crown,
                      title: 'Young Prince Care',
                      description: 'Gentle patient haircuts and scalp washes using 100% organic, tear-free formulas.',
                      tagline: 'Young Gents Grooming',
                    },
                    {
                      id: 'Girl',
                      label: 'Girl',
                      icon: Gem,
                      title: 'Little Princess Salon',
                      description: 'Princess braid styles, split-ends trimming, and organic hair-safe glitter sprays.',
                      tagline: 'Young Ladies Styling',
                    },
                    {
                      id: 'Other',
                      label: 'Other',
                      icon: Compass,
                      title: 'Universal Experience',
                      description: 'Explore our complete catalog of luxury salon treatments, from hair spa to threading.',
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
                        {/* Decorative background subtle glow */}
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
                            <h4 className="font-serif text-xl font-normal text-brand-primary group-hover:text-brand-secondary transition-colors duration-300">
                              {cat.title}
                            </h4>
                            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-light">
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

            {/* STEP 2: CHOOSE SERVICE */}
            {currentStep === 2 && (
              <motion.div
                key="step-service-selection"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 2 of 7</span>
                  <h3 className="font-serif text-xl text-brand-primary font-medium">Select Your Desired Treatment</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredServices.map((service) => {
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

            {/* STEP 3: CHOOSE STYLIST */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 3 of 7</span>
                  <h3 className="font-serif text-xl text-brand-primary font-medium">Select An Elite Master Stylist</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-light leading-relaxed">
                    Our artists hold credentials from elite European academies. Choose an artisan matching your treatment goals.
                  </p>
                </div>

                {staff.length === 0 ? (
                  <div className="col-span-full py-12 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/50">
                    <p className="font-serif text-lg text-brand-primary mb-2">No Stylists Available</p>
                    <p className="font-sans text-xs text-brand-text-muted leading-relaxed max-w-md mx-auto">
                      We currently don't have any master stylists available in our database. Please make sure the database is seeded or contact salon administration.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {staff.map((stylist) => {
                      const isSelected = selectedStylistId === stylist.id;
                      return (
                        <div
                          key={stylist.id}
                          id={`select-stylist-${stylist.id}`}
                          onClick={() => setSelectedStylistId(stylist.id)}
                          className={`p-5 border transition-all duration-300 cursor-pointer flex flex-col space-y-4 text-left relative ${
                            isSelected
                              ? 'border-brand-secondary bg-brand-secondary/5 shadow-sm'
                              : 'border-brand-secondary/15 bg-brand-surface hover:border-brand-secondary/50'
                          }`}
                        >
                          <div className="flex gap-4 items-center">
                            <Avatar
                              id={`stylist-avatar-${stylist.id}`}
                              fallback={stylist.name.split(' ').map(n=>n[0]).join('')}
                              size="lg"
                              src={stylist.image}
                              alt={stylist.name}
                            />
                            <div className="space-y-0.5">
                              <h4 className="font-serif text-base font-semibold text-brand-primary leading-tight">{stylist.name}</h4>
                              <span className="text-[10px] text-brand-secondary font-sans uppercase tracking-widest font-semibold block">{stylist.role}</span>
                              <span className="font-mono text-[9px] text-brand-text-muted block">{stylist.experience}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 border-t border-brand-secondary/15 pt-3">
                            <p className="font-sans text-[11px] text-brand-text-muted font-light leading-relaxed line-clamp-3">
                              {stylist.bio}
                            </p>
                            <div className="text-[10px] font-mono text-brand-gold-dark font-medium">
                              Specialty: {stylist.specialty}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-brand-secondary text-brand-primary font-sans text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">Selected</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: CHOOSE DATE */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 4 of 7</span>
                  <h3 className="font-serif text-xl text-brand-primary font-medium">Select An Appointment Date</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-light leading-relaxed">
                    Select a preferred date in the next two weeks. We accommodate limited VIP slots daily.
                  </p>
                </div>

                {/* Calendar grid view */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {dateChoices.map((dateChoice) => {
                    const isSelected = selectedDate === dateChoice.value;
                    let isAvailableDate = true;
                    let unavailableReason = '';
                    if (selectedStylistId) {
                      const rawStylist = stylists.find(rs => rs.id === selectedStylistId);
                      if (rawStylist) {
                        const meta = parseStaffBio(rawStylist.bio);
                        const onLeave = isStaffOnLeave(meta.leaves, dateChoice.value);
                        const working = isStaffWorking(meta, dateChoice.value);
                        if (onLeave) {
                          isAvailableDate = false;
                          unavailableReason = 'Leave';
                        } else if (!working) {
                          isAvailableDate = false;
                          unavailableReason = 'Off';
                        }
                      }
                    }

                    return (
                      <div
                        key={dateChoice.value}
                        id={`select-date-${dateChoice.value}`}
                        onClick={() => isAvailableDate && setSelectedDate(dateChoice.value)}
                        className={`p-4 border text-center transition-all duration-300 flex flex-col justify-center items-center gap-1 relative ${
                          !isAvailableDate
                            ? 'opacity-30 cursor-not-allowed bg-brand-bg/10 border-brand-accent/5'
                            : isSelected
                              ? 'border-brand-secondary bg-brand-secondary/5 shadow-sm cursor-pointer'
                              : 'border-brand-secondary/15 bg-brand-surface hover:border-brand-secondary/50 cursor-pointer'
                        }`}
                      >
                        <span className="font-sans text-[9px] uppercase tracking-widest text-brand-text-muted">{dateChoice.dayName}</span>
                        <span className="font-serif text-3xl font-light text-brand-primary">{dateChoice.dateNum}</span>
                        <span className="font-sans text-[10px] font-semibold text-brand-gold-dark uppercase tracking-wider">{dateChoice.monthName}</span>
                        {!isAvailableDate && (
                          <span className="absolute bottom-1 right-1 font-mono text-[8px] uppercase text-red-400 font-bold bg-red-950/40 px-1 py-0.5 border border-red-900/30">
                            {unavailableReason}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: CHOOSE TIME SLOT */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 5 of 7</span>
                  <h3 className="font-serif text-xl text-brand-primary font-medium">Choose Available Time Slot</h3>
                  <p className="font-sans text-xs text-brand-text-muted font-light leading-relaxed">
                    We divide our luxury slots into morning, afternoon, and evening phases for a calm environment.
                  </p>
                </div>

                {/* Slot groups */}
                {['morning', 'afternoon', 'evening'].map((period) => {
                  const periodSlots = timeSlots.filter(s => s.period === period);
                  return (
                    <div key={period} className="space-y-3">
                      <h4 className="font-serif text-base text-brand-primary capitalize border-b border-brand-secondary/15 pb-1.5 font-medium">
                        {period} Experience Slots
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {periodSlots.map((slot) => {
                          const isBooked = slot.status === 'booked';
                          const isLimited = slot.status === 'limited';
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
                                  <Badge id={`badge-slot-booked-${slot.time}`} variant="charcoal" size="sm" className="text-[7px]">Booked</Badge>
                                ) : isLimited ? (
                                  <Badge id={`badge-slot-limited-${slot.time}`} variant="warning" size="sm" className="text-[7px]">Limited</Badge>
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
                })}
              </motion.div>
            )}

            {/* STEP 6: BOOKING SUMMARY */}
            {currentStep === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 6 of 7</span>
                  <h3 className="font-serif text-xl text-brand-primary font-medium">Verify Booking Summary Details</h3>
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

                  {/* Stylist row */}
                  <div className="p-4 sm:p-5 flex items-center gap-4">
                    <Avatar
                      id="summary-stylist-avatar"
                      fallback={activeStylist?.name.split(' ').map(n=>n[0]).join('')}
                      size="md"
                      src={activeStylist?.image}
                      alt={activeStylist?.name}
                    />
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Assigned Master Artisan</span>
                      <h4 className="font-serif text-sm font-semibold text-brand-primary leading-tight mt-0.5">{activeStylist?.name}</h4>
                      <span className="font-sans text-[10px] text-brand-secondary uppercase tracking-wider font-medium">{activeStylist?.role}</span>
                    </div>
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
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Appointment Hour</span>
                      <span className="font-sans text-xs font-semibold text-brand-primary block mt-1">{selectedTimeSlot}</span>
                    </div>
                  </div>
                </div>

                {/* Promo application block */}
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
              </motion.div>
            )}

            {/* STEP 7: PAYMENT SCREEN */}
            {currentStep === 7 && (
              <motion.div
                key="step-7"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {!user ? (
                  <div className="max-w-md mx-auto py-8 text-center space-y-6 border border-brand-secondary/15 p-6 bg-brand-surface">
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary font-bold">AUTHENTICATION REQUIRED</span>
                      <h3 className="text-xl font-serif font-light text-brand-primary">Priority Circle Sign In</h3>
                      <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-light">
                        To secure your luxury reservation and synchronize details with your profile, please sign in or register a priority member account.
                      </p>
                    </div>
                    <AuthModule
                      id="booking-auth-prompt"
                      onAuthSuccess={() => {}}
                      triggerToast={triggerToast}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary">Step 7 of 7</span>
                      <h3 className="font-serif text-xl text-brand-primary font-medium">Bespoke Checkout & Billing</h3>
                      <p className="font-sans text-xs text-brand-text-muted font-light leading-relaxed">
                        Select a secure payment gateway to guarantee your booking slot. All credit cards processed securely.
                      </p>
                    </div>

                    {/* Payment Methods Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'card', name: 'Credit Card', icon: <CreditCard className="h-4 w-4" /> },
                        { id: 'upi', name: 'UPI Gateway', icon: <Smartphone className="h-4 w-4" /> },
                        { id: 'razorpay', name: 'Razorpay Instant', icon: <ExternalLink className="h-4 w-4" /> },
                        { id: 'wallet', name: 'Wallet Credits', icon: <Wallet className="h-4 w-4" /> }
                      ].map((method) => {
                        const isSelected = paymentMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            id={`payment-method-${method.id}`}
                            onClick={() => {
                              setPaymentMethod(method.id as any);
                              setCardError('');
                            }}
                            className={`p-4 border text-center transition-all duration-300 flex flex-col justify-center items-center gap-2 rounded-none cursor-pointer focus:outline-none ${
                              isSelected
                                ? 'border-brand-secondary bg-brand-secondary/5 font-semibold text-brand-primary'
                                : 'border-brand-secondary/15 bg-brand-surface text-brand-text-muted hover:border-brand-secondary/40'
                            }`}
                          >
                            {method.icon}
                            <span className="font-sans text-[10px] uppercase tracking-wider">{method.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Card input screen */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-4 pt-2">
                        {/* Visual Card skin */}
                        <div className="bg-[#121212] text-brand-primary p-6 border border-brand-secondary/20 shadow-xl max-w-sm mx-auto flex flex-col justify-between aspect-[1.586/1] w-full text-left relative overflow-hidden">
                          {/* background mesh */}
                          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#FFF_1px,transparent_1px)] bg-[size:16px_16px]" />
                          
                          <div className="flex justify-between items-start">
                            <span className="font-sans text-[8px] uppercase tracking-widest font-bold text-brand-secondary">MUSHA EXCLUSIVE MAPPING</span>
                            <div className="flex gap-1">
                              <div className="h-4 w-6 bg-brand-secondary/20 rounded-sm" />
                              <div className="h-4 w-6 bg-brand-secondary/40 rounded-sm" />
                            </div>
                          </div>
                          <div className="font-mono text-base md:text-lg tracking-widest text-brand-primary py-2">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <span className="font-sans text-[7px] uppercase tracking-widest text-brand-text-muted block">Card Holder</span>
                              <span className="font-serif text-sm font-medium uppercase truncate max-w-[150px] block">{cardName || 'YOUR EXCELLENCY'}</span>
                            </div>
                            <div className="flex gap-4">
                              <div>
                                <span className="font-sans text-[7px] uppercase tracking-widest text-brand-text-muted block">Expires</span>
                                <span className="font-mono text-xs">{cardExpiry || 'MM/YY'}</span>
                              </div>
                              <div>
                                <span className="font-sans text-[7px] uppercase tracking-widest text-brand-text-muted block">CVV</span>
                                <span className="font-mono text-xs">{cardCvv || '•••'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Input form */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto bg-brand-surface border border-brand-secondary/15 p-6 text-left">
                          <div className="sm:col-span-2">
                            <label className="font-sans text-[10px] uppercase tracking-widest text-brand-primary font-semibold block mb-2">Card Number</label>
                            <input
                              id="card-number-input"
                              type="text"
                              maxLength={19}
                              placeholder="4111 2222 3333 4444"
                              value={cardNumber}
                              onChange={(e) => {
                                // formatting space every 4 digits
                                const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                const matches = v.match(/\d{4,16}/g);
                                const match = (matches && matches[0]) || '';
                                const parts = [];

                                for (let i = 0, len = match.length; i < len; i += 4) {
                                  parts.push(match.substring(i, i + 4));
                                }

                                if (parts.length > 0) {
                                  setCardNumber(parts.join(' '));
                                } else {
                                  setCardNumber(v);
                                }
                              }}
                              className="bg-[#121212] text-brand-primary font-mono text-xs px-4 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none w-full"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="font-sans text-[10px] uppercase tracking-widest text-brand-primary font-semibold block mb-2">Card Holder Name</label>
                            <input
                              id="card-name-input"
                              type="text"
                              placeholder="Arthur Musha"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="bg-[#121212] text-brand-primary font-serif text-xs px-4 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none w-full"
                              required
                            />
                          </div>
                          <div>
                            <label className="font-sans text-[10px] uppercase tracking-widest text-brand-primary font-semibold block mb-2">Expiration Date</label>
                            <input
                              id="card-expiry-input"
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/[^0-9]/gi, '');
                                if (v.length >= 2) {
                                  v = `${v.substring(0, 2)}/${v.substring(2, 4)}`;
                                }
                                setCardExpiry(v);
                              }}
                              className="bg-[#121212] text-brand-primary font-mono text-xs px-4 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none w-full"
                              required
                            />
                          </div>
                          <div>
                            <label className="font-sans text-[10px] uppercase tracking-widest text-brand-primary font-semibold block mb-2">Secure CVV</label>
                            <input
                              id="card-cvv-input"
                              type="password"
                              maxLength={3}
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/gi, ''))}
                              className="bg-[#121212] text-brand-primary font-mono text-xs px-4 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none w-full"
                              required
                            />
                          </div>
                          {cardError && <p className="sm:col-span-2 text-red-500 text-xs font-sans font-medium mt-1">{cardError}</p>}
                        </div>
                      </div>
                    )}

                    {/* Razorpay Placeholder */}
                    {paymentMethod === 'razorpay' && (
                      <div className="p-6 border border-brand-secondary/15 bg-[#121212] text-center max-w-md mx-auto space-y-4">
                        <Smartphone className="h-10 w-10 text-brand-secondary mx-auto" />
                        <h4 className="font-serif text-base text-brand-primary">Razorpay Secured Check</h4>
                        <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-light">
                          Upon clicking "Pay Now", you will be redirected to the secure Razorpay payment window to complete the transaction seamlessly.
                        </p>
                      </div>
                    )}

                    {/* UPI Placeholder */}
                    {paymentMethod === 'upi' && (
                      <div className="p-6 border border-brand-secondary/15 bg-[#121212] text-center max-w-md mx-auto space-y-4">
                        <Smartphone className="h-10 w-10 text-brand-secondary mx-auto" />
                        <h4 className="font-serif text-base text-brand-primary">Unified Payments Interface (UPI)</h4>
                        <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-light">
                          Simply authorize payments instantly using GPay, PhonePe, or BHIM apps. Enter your UPI ID below.
                        </p>
                        <input
                          id="upi-id-input"
                          type="text"
                          placeholder="e.g., arthur@okaxis"
                          className="bg-[#121212] text-brand-primary font-sans text-xs px-4 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none w-full max-w-xs text-center mx-auto"
                        />
                      </div>
                    )}

                    {/* Wallet Credits */}
                    {paymentMethod === 'wallet' && (
                      <div className="p-6 border border-brand-secondary/15 bg-[#121212] text-center max-w-md mx-auto space-y-4">
                        <Wallet className="h-10 w-10 text-brand-secondary mx-auto" />
                        <h4 className="font-serif text-base text-brand-primary">Royal Club Wallet balance</h4>
                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-semibold font-mono text-sm">
                          <ShieldCheck className="h-4 w-4" /> Available Credits: $350.00
                        </div>
                        <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-light">
                          Payment of <span className="font-semibold text-brand-primary">${finalTotalAmount}</span> will be instantly deducted from your privilege balance.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 8: BOOKING SUCCESS */}
            {currentStep === 8 && completedRecord && (
              <motion.div
                key="step-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-8 max-w-xl mx-auto"
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
                  <h2 className="text-3xl md:text-4xl font-serif font-light text-brand-primary leading-tight">Your Royal Slot is Secured</h2>
                  <p className="font-sans text-xs md:text-sm text-brand-text-muted font-light leading-relaxed">
                    A luxurious invitation card with arrival guidelines has been dispatched to your registered contact email address. We look forward to welcoming you.
                  </p>
                </div>

                {/* Reciept Details */}
                <div className="bg-[#121212] border border-brand-secondary/15 p-6 divide-y divide-brand-secondary/15 text-left">
                  <div className="flex justify-between items-center pb-3 mb-3">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-primary">Booking Credentials</span>
                    <span className="font-mono text-xs font-bold text-brand-gold-dark">{completedRecord.id}</span>
                  </div>

                  <div className="py-3 space-y-1">
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Reserved Experience</span>
                    <h4 className="font-serif text-base font-semibold text-brand-primary">{completedRecord.service.name}</h4>
                  </div>

                  <div className="py-3 space-y-1">
                    <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Artisan Guide</span>
                    <h4 className="font-serif text-sm font-semibold text-brand-primary">{completedRecord.stylist.name}</h4>
                  </div>

                  <div className="py-3 grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Date</span>
                      <span className="font-sans text-xs font-semibold text-brand-primary block mt-0.5">{completedRecord.date}</span>
                    </div>
                    <div>
                      <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted block">Hour</span>
                      <span className="font-sans text-xs font-semibold text-brand-primary block mt-0.5">{completedRecord.timeSlot}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between items-center">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-primary">Settled Amount</span>
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
          {currentStep < 8 && (
            <div className="flex justify-between items-center pt-8 border-t border-brand-secondary/15">
              <Button
                id="booking-prev-step-btn"
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
                disabled={currentStep === 1 || (!!initialServiceId && currentStep === 3)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                className="font-sans text-[10px] uppercase tracking-widest font-bold disabled:opacity-30 disabled:pointer-events-none"
              >
                Back
              </Button>

              {currentStep < 7 ? (
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
              ) : user ? (
                <Button
                  id="booking-complete-pay-btn"
                  variant="primary"
                  size="sm"
                  onClick={handleCompletePayment}
                  disabled={isSubmitting}
                  leftIcon={isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-brand-secondary" />
                  )}
                  className="font-sans text-[10px] uppercase tracking-widest font-bold px-8 bg-brand-gold-dark text-white hover:bg-brand-primary"
                >
                  {isSubmitting ? 'Securing Slot...' : 'Complete Payment'}
                </Button>
              ) : null}
            </div>
          )}

        </div>

        {/* Right Bill Summary Panel (col-span-4) - Hidden in success step 8 */}
        {currentStep < 8 && (
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
                   selectedCategory === 'Boy' ? "Young Prince Care" : 
                   selectedCategory === 'Girl' ? "Little Princess Salon" : 
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

            {/* Stylist summary */}
            {selectedStylistId && (
              <div className="space-y-1 pt-3 border-t border-brand-secondary/15">
                <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Master Stylist</span>
                <div className="flex items-center gap-2.5">
                  <img src={activeStylist?.image} alt={activeStylist?.name} referrerPolicy="no-referrer" className="h-6 w-6 object-cover rounded-full" />
                  <span className="font-serif text-xs font-semibold text-brand-primary">{activeStylist?.name}</span>
                </div>
              </div>
            )}

            {/* Date Time summary */}
            {selectedDate && (
              <div className="space-y-1 pt-3 border-t border-brand-secondary/15">
                <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Scheduled For</span>
                <div className="flex flex-col gap-0.5 font-sans text-[10px] font-semibold text-brand-primary">
                  <span>Date: {dateChoices.find(d => d.value === selectedDate)?.label || selectedDate}</span>
                  {selectedTimeSlot && <span>Hour: {selectedTimeSlot}</span>}
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

            {/* Small guarantee text */}
            <p className="font-sans text-[9px] text-brand-text-muted leading-relaxed font-light text-center border-t border-brand-secondary/15 pt-4">
              All tools sanitized under autoclave protocols (134°C). Zero chemical compounds utilized. 24-hour cancellation flexibility.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
