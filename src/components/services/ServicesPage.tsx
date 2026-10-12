/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Clock, ArrowUpDown, ChevronRight, Sparkles, Star, Tag, Award, Shield, Gem, Compass, Heart, Check } from 'lucide-react';
import { EXTENDED_SERVICES_DATA, CATEGORIES_LIST, ExtendedService } from '../../data/servicesExtendedData';
import { servicesRepository } from '../../lib/firestoreService';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';

interface ServicesPageProps {
  onSelectService: (id: string) => void;
  onBookService: (id: string) => void;
  recentlyViewedIds: string[];
  onNavigate?: (view: 'home' | 'services' | 'service-detail' | 'booking' | 'portal' | 'about' | 'gallery' | 'offers' | 'membership' | 'contact' | 'faq' | 'privacy' | 'terms' | 'refund' | '404') => void;
  selectedRecipientCategory: string | null;
  onSelectRecipientCategory: (category: string | null) => void;
}

export default function ServicesPage({
  onSelectService,
  onBookService,
  recentlyViewedIds,
  onNavigate,
  selectedRecipientCategory,
  onSelectRecipientCategory,
}: ServicesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [dbServices, setDbServices] = useState<ExtendedService[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    servicesRepository.getActiveServices().then((records) => {
      if (isMounted && records && records.length > 0) {
        const mapped: ExtendedService[] = records.map((s) => {
          const durationVal = s.duration_minutes || s.durationMinutes || 45;
          const priceNum = typeof s.price === 'number' ? s.price : Number(String(s.price).replace(/[^\d.]/g, '')) || 65;
          return {
            id: s.id,
            name: s.name,
            category: s.category,
            price: `$${priceNum}`,
            priceValue: priceNum,
            duration: `${durationVal} mins`,
            durationValue: durationVal,
            shortDescription: s.shortDescription || s.description?.slice(0, 120) || '',
            longDescription: s.description || '',
            benefits: s.benefits || [],
            includedServices: s.includedServices || [],
            image: s.image_url || s.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
            popular: s.popular || false,
            rating: s.rating || 4.9,
            reviewsCount: s.reviewsCount || 120,
            faqs: [],
          };
        });
        setDbServices(mapped);
      } else {
        setDbServices([]);
      }
    }).catch(err => {
      console.warn('Notice reading services repository in ServicesPage:', err);
      if (isMounted) setDbServices([]);
    });
    return () => { isMounted = false; };
  }, []);

  const allServices = dbServices !== null ? dbServices : EXTENDED_SERVICES_DATA;

  // Find recently viewed services
  const recentlyViewedServices = useMemo(() => {
    return allServices.filter((s) => recentlyViewedIds.includes(s.id));
  }, [allServices, recentlyViewedIds]);

  // Recommended services (popular services)
  const recommendedServices = useMemo(() => {
    return allServices.filter((s) => s.popular).slice(0, 3);
  }, [allServices]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let result = [...allServices];

    // 1. Recipient category filter
    if (selectedRecipientCategory) {
      if (selectedRecipientCategory === 'Men') {
        const menCategories = ['haircuts', 'hair spa', 'hair coloring', 'beard grooming', 'facial', 'cleanup'];
        result = result.filter(s => {
          const catLower = s.category.toLowerCase();
          const nameLower = s.name.toLowerCase();
          if (nameLower.includes('bridal') || nameLower.includes('princess') || s.id.includes('kids')) {
            return false;
          }
          return menCategories.includes(catLower) || nameLower.includes('gentlemen') || nameLower.includes('beard') || nameLower.includes('shave');
        });
      } else if (selectedRecipientCategory === 'Women') {
        const womenCategories = ['haircuts', 'hair styling', 'hair coloring', 'hair spa', 'facial', 'cleanup', 'makeup', 'bridal', 'nail care', 'waxing', 'threading'];
        result = result.filter(s => {
          const catLower = s.category.toLowerCase();
          const nameLower = s.name.toLowerCase();
          if (nameLower.includes('gentlemen') || nameLower.includes('beard') || s.id.includes('kids') || s.id.includes('boy')) {
            return false;
          }
          return womenCategories.includes(catLower);
        });
      } else if (selectedRecipientCategory === 'Boy') {
        result = result.filter(s => s.id.includes('boy') || s.id === 'kids-haircut-boy' || s.id === 'kids-wash-boy' || s.id === 'kids-styling-boy');
      } else if (selectedRecipientCategory === 'Girl') {
        result = result.filter(s => s.id.includes('girl') || s.id === 'kids-haircut-girl' || s.id === 'kids-wash-girl' || s.id === 'kids-styling-girl' || s.id === 'kids-spa-girl');
      }
      // 'Other' displays all available services
    } else {
      // If no category is selected, return empty array to enforce category selection
      return [];
    }

    // 2. Department category filter
    if (selectedCategory !== 'All') {
      result = result.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.longDescription.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    // Sort options
    if (sortBy === 'price-low-high') {
      result.sort((a, b) => a.priceValue - b.priceValue);
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => b.priceValue - a.priceValue);
    } else if (sortBy === 'duration-low-high') {
      result.sort((a, b) => a.durationValue - b.durationValue);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedRecipientCategory, selectedCategory, searchQuery, sortBy]);

  return (
    <div id="services-page-root" className="pb-24">
      {/* 1. Header Hero Area */}
      <section id="services-hero-section" className="relative bg-brand-bg text-brand-primary py-16 md:py-24 overflow-hidden">
        {/* Abstract luxury lines */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary text-[10px] uppercase tracking-[0.25em] font-sans font-semibold"
          >
            <Sparkles className="h-3 w-3" /> The Royal Catalog
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-brand-primary leading-none"
          >
            Bespoke <span className="font-serif-italic text-brand-secondary">Aesthetic</span> Experiences
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal"
          >
            Explore our curated selection of fine grooming, coloring, and therapeutic skin wellness treatments. Each ritual begins with an individual scalp-mapping or dermal-diagnostic consultation.
          </motion.p>
        </div>
      </section>

      {/* 2. Special Offers Banner */}
      <section id="special-offers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-[#121212] border border-brand-secondary/20 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 bg-brand-secondary/10 border border-brand-secondary/30 text-brand-secondary shrink-0">
              <Tag className="h-6 w-6 stroke-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[9px] uppercase tracking-widest font-semibold text-brand-secondary bg-brand-secondary/15 px-2 py-0.5">Special Offer</span>
                <span className="font-mono text-[9px] text-brand-text-muted">Limited Time</span>
              </div>
              <h3 className="font-serif text-lg text-brand-primary font-bold">The Sovereign Welcome Gift</h3>
              <p className="font-sans text-xs text-brand-text-muted leading-relaxed max-w-xl">
                Indulge in any service above $80 and enjoy a complimentary **Signature Scalp Wash & Blowout** with premium Oribe oils. Apply code <span className="font-mono font-semibold text-brand-secondary">ROYAL15</span> during checkout.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="border border-dashed border-brand-secondary/30 px-4 py-3 bg-[#0A0A0A] text-center flex flex-col justify-center">
              <span className="font-sans text-[8px] uppercase tracking-widest text-brand-text-muted">Dispatch Code</span>
              <span className="font-mono text-xs font-bold text-brand-secondary tracking-wider">ROYAL15</span>
            </div>
            <Button
              id="redeem-offer-btn"
              variant="primary"
              size="sm"
              onClick={() => onBookService('hair-cut-1')}
              className="px-6 py-3"
            >
              Book Signature Treatment
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 2.5 Premium Recipient Selection Section */}
      <section id="recipient-selection-section" className="border-y border-brand-secondary/15 bg-[#121212] py-16 md:py-20 relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3 mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-[0.2em] text-brand-primary uppercase">
              WHO IS THE SERVICE FOR?
            </h2>
            <div className="h-[1px] w-12 bg-brand-secondary mx-auto" />
            <p className="max-w-2xl mx-auto font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal">
              Choose your category to discover a personalized collection of premium salon experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                id: 'Men',
                emoji: '👨',
                icon: Shield,
                title: 'MEN',
                desc: 'Precision scissor cuts, hot-shaves, and advanced grooming rituals.',
              },
              {
                id: 'Women',
                emoji: '👩',
                icon: Gem,
                title: 'WOMEN',
                desc: 'Couture blowouts, celestial color melts, and dermal-diagnostic wellness.',
              },
              {
                id: 'Boy',
                emoji: '👦',
                icon: Compass,
                title: 'BOY',
                desc: 'Gentle patient scissor trims and refreshing organic hair washes.',
              },
              {
                id: 'Girl',
                emoji: '👧',
                icon: Heart,
                title: 'GIRL',
                desc: 'Delicate split-end detailing, braids, and botanical scalp care.',
              },
              {
                id: 'Other',
                emoji: '⚧',
                icon: Sparkles,
                title: 'OTHER',
                desc: 'Universal luxury experiences designed for every individual.',
              }
            ].map((rec) => {
              const IconComponent = rec.icon;
              const isSelected = selectedRecipientCategory === rec.id;
              return (
                <motion.button
                  key={rec.id}
                  id={`recipient-card-${rec.id.toLowerCase()}`}
                  onClick={() => {
                    onSelectRecipientCategory(rec.id);
                    setSelectedCategory('All');
                  }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex flex-col items-center justify-between p-6 h-64 text-center cursor-pointer transition-all duration-500 border rounded-none ${
                    isSelected
                      ? 'bg-brand-surface border-brand-secondary shadow-[0_12px_40px_rgba(197,168,128,0.15)] ring-1 ring-brand-secondary/30'
                      : 'bg-brand-bg border-brand-secondary/15 hover:border-brand-secondary/40 shadow-xl shadow-black/30'
                  }`}
                >
                  {/* Glow highlight for selected state */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/[0.04] to-transparent pointer-events-none" />
                  )}

                  {/* Selected Indicator - top right */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-3 right-3 bg-brand-secondary text-brand-bg p-1 rounded-full shadow-md"
                    >
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    </motion.div>
                  )}

                  {/* Premium Outlined Icon with hover animation */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`p-4 rounded-full border transition-all duration-500 ${
                      isSelected
                        ? 'bg-brand-secondary/10 border-brand-secondary/35 text-brand-secondary'
                        : 'bg-[#121212] border-brand-secondary/15 text-brand-primary group-hover:border-brand-secondary/40 group-hover:text-brand-secondary'
                    }`}>
                      <IconComponent className="h-6 w-6 stroke-[1.25]" />
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-brand-text-muted">
                        {rec.emoji} Recipient
                      </span>
                      <h3 className={`font-serif text-sm tracking-widest transition-colors duration-300 ${
                        isSelected ? 'text-brand-secondary font-medium' : 'text-brand-primary'
                      }`}>
                        {rec.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-sans text-[11px] text-brand-text-muted leading-relaxed font-normal mt-3">
                    {rec.desc}
                  </p>

                  {/* Luxury gold highlight lines on the bottom for selected card */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-secondary to-transparent" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Search, Filters, and Catalog Container */}
      <section id="catalog-controls-and-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 min-h-[300px]">
        <AnimatePresence mode="wait">
          {!selectedRecipientCategory ? (
            /* Elegant empty state when no recipient selected */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="py-20 text-center border border-dashed border-brand-secondary/25 bg-brand-surface p-12 max-w-3xl mx-auto flex flex-col items-center space-y-6 shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#C5A880_1px,transparent_1px)] bg-[size:16px_16px]" />
              <div className="relative">
                <div className="absolute inset-0 bg-brand-secondary/15 rounded-full blur-xl scale-125 animate-pulse" />
                <div className="relative p-6 rounded-full border border-brand-secondary/30 bg-[#0A0A0A] text-brand-secondary">
                  <Sparkles className="h-8 w-8 stroke-[1.25]" />
                </div>
              </div>
              
              <div className="space-y-2 relative z-10 text-center flex flex-col items-center">
                <h3 className="font-serif text-xl font-bold tracking-widest text-brand-primary uppercase">
                  Discover Your Personalized Ritual
                </h3>
                <p className="font-sans text-xs text-brand-text-muted max-w-md mx-auto leading-relaxed font-normal">
                  Please select a recipient category above to unlock our bespoke collection of luxury salon experiences, tailored specifically for you.
                </p>
              </div>
            </motion.div>
          ) : (
            /* Curated Catalog view when recipient IS selected */
            <motion.div
              key={selectedRecipientCategory}
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(3px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10 text-left"
            >
              {/* Dynamic luxury title replace */}
              <div className="text-center md:text-left border-b border-brand-secondary/15 pb-6">
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary block mb-1">
                  Bespoke Selection
                </span>
                <h2 className="text-2xl md:text-3.5xl font-serif text-brand-primary font-bold tracking-wide uppercase">
                  {selectedRecipientCategory === 'Men' && 'Premium Care For Men'}
                  {selectedRecipientCategory === 'Women' && 'Luxury Experiences For Women'}
                  {(selectedRecipientCategory === 'Boy' || selectedRecipientCategory === 'Girl') && 'Royal Kids Collection'}
                  {selectedRecipientCategory === 'Other' && 'Universal Wellness Collection'}
                </h2>
              </div>

              {/* Controls Panel */}
              <div className="bg-brand-surface border border-brand-secondary/15 p-4 md:p-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 h-4 w-4 text-brand-text-muted pointer-events-none" />
                  <input
                    id="catalog-search"
                    type="text"
                    placeholder={`Search within ${selectedRecipientCategory === 'Other' ? 'wellness' : selectedRecipientCategory.toLowerCase()} services...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-surface text-brand-text font-sans text-xs pl-11 pr-4 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none transition-all duration-300"
                  />
                </div>

                {/* Sorter and Category Info */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none flex items-center">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                    <select
                      id="catalog-sorter"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-brand-surface text-brand-text font-sans text-xs pl-10 pr-10 py-3.5 border border-brand-secondary/15 focus:border-brand-secondary outline-none appearance-none cursor-pointer"
                    >
                      <option value="recommended">Sort: Recommended</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                      <option value="duration-low-high">Duration: Short to Long</option>
                      <option value="rating">Rating: Highest Rated</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none">
                      <svg className="h-3.5 w-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="text-right font-mono text-[10px] text-brand-text-muted border-l border-brand-secondary/15 pl-4 py-2 hidden sm:block">
                    {filteredAndSortedServices.length} AVAILABLE RITUALS
                  </div>
                </div>
              </div>

              {/* 12-Category Scrollable Filter */}
              <div id="category-filter-rail" className="overflow-hidden">
                <div className="flex items-center gap-2 mb-3 border-b border-brand-secondary/15 pb-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-brand-secondary" />
                  <h3 className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-primary">Select Department</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                  <button
                    id="cat-filter-all"
                    onClick={() => setSelectedCategory('All')}
                    className={`px-4 py-2 text-left font-sans text-[10px] uppercase tracking-wider font-semibold transition-all border shrink-0 cursor-pointer ${
                      selectedCategory === 'All'
                        ? 'bg-brand-secondary border-brand-secondary text-[#121212] font-semibold'
                        : 'bg-brand-surface border-brand-secondary/15 text-brand-text-muted hover:text-brand-primary hover:border-brand-secondary'
                    }`}
                  >
                    All Services ({
                      // Show count matching recipient category
                      EXTENDED_SERVICES_DATA.filter(s => {
                        if (selectedRecipientCategory === 'Men') {
                          const menCategories = ['haircuts', 'hair spa', 'hair coloring', 'beard grooming', 'facial', 'cleanup'];
                          const catLower = s.category.toLowerCase();
                          const nameLower = s.name.toLowerCase();
                          if (nameLower.includes('bridal') || nameLower.includes('princess') || s.id.includes('kids')) return false;
                          return menCategories.includes(catLower) || nameLower.includes('gentlemen') || nameLower.includes('beard') || nameLower.includes('shave');
                        } else if (selectedRecipientCategory === 'Women') {
                          const womenCategories = ['haircuts', 'hair styling', 'hair coloring', 'hair spa', 'facial', 'cleanup', 'makeup', 'bridal', 'nail care', 'waxing', 'threading'];
                          const catLower = s.category.toLowerCase();
                          const nameLower = s.name.toLowerCase();
                          if (nameLower.includes('gentlemen') || nameLower.includes('beard') || s.id.includes('kids') || s.id.includes('boy')) return false;
                          return womenCategories.includes(catLower);
                        } else if (selectedRecipientCategory === 'Boy') {
                          return s.id.includes('boy') || s.id === 'kids-haircut-boy' || s.id === 'kids-wash-boy' || s.id === 'kids-styling-boy';
                        } else if (selectedRecipientCategory === 'Girl') {
                          return s.id.includes('girl') || s.id === 'kids-haircut-girl' || s.id === 'kids-wash-girl' || s.id === 'kids-styling-girl' || s.id === 'kids-spa-girl';
                        }
                        return true;
                      }).length
                    })
                  </button>
                  {CATEGORIES_LIST.map((cat) => {
                    const count = EXTENDED_SERVICES_DATA.filter((s) => {
                      if (s.category !== cat) return false;
                      if (selectedRecipientCategory === 'Men') {
                        const menCategories = ['haircuts', 'hair spa', 'hair coloring', 'beard grooming', 'facial', 'cleanup'];
                        const catLower = s.category.toLowerCase();
                        const nameLower = s.name.toLowerCase();
                        if (nameLower.includes('bridal') || nameLower.includes('princess') || s.id.includes('kids')) return false;
                        return menCategories.includes(catLower) || nameLower.includes('gentlemen') || nameLower.includes('beard') || nameLower.includes('shave');
                      } else if (selectedRecipientCategory === 'Women') {
                        const womenCategories = ['haircuts', 'hair styling', 'hair coloring', 'hair spa', 'facial', 'cleanup', 'makeup', 'bridal', 'nail care', 'waxing', 'threading'];
                        const catLower = s.category.toLowerCase();
                        const nameLower = s.name.toLowerCase();
                        if (nameLower.includes('gentlemen') || nameLower.includes('beard') || s.id.includes('kids') || s.id.includes('boy')) return false;
                        return womenCategories.includes(catLower);
                      } else if (selectedRecipientCategory === 'Boy') {
                        return s.id.includes('boy') || s.id === 'kids-haircut-boy' || s.id === 'kids-wash-boy' || s.id === 'kids-styling-boy';
                      } else if (selectedRecipientCategory === 'Girl') {
                        return s.id.includes('girl') || s.id === 'kids-haircut-girl' || s.id === 'kids-wash-girl' || s.id === 'kids-styling-girl' || s.id === 'kids-spa-girl';
                      }
                      return true;
                    }).length;

                    // Only show category chip if there are matching services in this recipient category to keep UX premium
                    if (count === 0) return null;

                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 text-left font-sans text-[10px] uppercase tracking-wider font-semibold transition-all border shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-brand-secondary border-brand-secondary text-[#121212] font-semibold'
                            : 'bg-brand-surface border-brand-secondary/15 text-brand-text-muted hover:text-brand-primary hover:border-brand-secondary'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Service List Grid */}
              {filteredAndSortedServices.length > 0 ? (
                <div id="services-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                  <AnimatePresence mode="popLayout">
                    {filteredAndSortedServices.map((service, index) => (
                      <motion.div
                        key={service.id}
                        id={`service-card-wrapper-${service.id}`}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="group"
                      >
                        <Card
                          id={`service-card-${service.id}`}
                          variant="bordered"
                          className="h-full flex flex-col bg-brand-surface overflow-hidden border-brand-secondary/15 transition-all duration-500 group-hover:border-brand-secondary/50 group-hover:shadow-[0_8px_30px_rgba(197,168,128,0.1)] relative"
                        >
                          {/* Image Area */}
                          <div className="relative aspect-video overflow-hidden bg-brand-surface-muted">
                            <img
                              id={`service-card-img-${service.id}`}
                              src={service.image}
                              alt={service.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale-[15%] transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/50 via-transparent to-transparent pointer-events-none" />
                            
                            {/* Popular Badge */}
                            {service.popular && (
                              <div className="absolute top-4 left-4 z-10">
                                <Badge id={`badge-popular-${service.id}`} variant="gold" size="sm" className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current" /> Popular
                                </Badge>
                              </div>
                            )}

                            {/* Floating Category Tag */}
                            <span className="absolute bottom-4 left-4 text-[9px] uppercase tracking-widest font-semibold font-sans text-white/90 bg-black/40 backdrop-blur-md px-2 py-0.5 border border-white/10">
                              {service.category}
                            </span>
                          </div>

                          {/* Content Details */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-serif text-lg text-brand-primary leading-tight font-medium group-hover:text-brand-gold-dark transition-colors duration-300">
                                  {service.name}
                                </h3>
                                <span className="font-serif text-lg font-semibold text-brand-gold-dark">
                                  {service.price}
                                </span>
                              </div>

                              {/* Rating and Reviews */}
                              <div className="flex items-center gap-1.5 font-sans text-[10px] text-brand-text-muted">
                                <div className="flex text-brand-secondary">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(service.rating) ? 'fill-current' : 'opacity-30'}`} />
                                  ))}
                                </div>
                                <span>{service.rating} ({service.reviewsCount} reviews)</span>
                              </div>

                              <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal line-clamp-2">
                                {service.shortDescription}
                              </p>

                              {/* Meta info */}
                              <div className="flex items-center gap-4 text-brand-text-muted font-mono text-[9px] pt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {service.duration}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <Button
                                id={`service-details-btn-${service.id}`}
                                variant="outline"
                                size="sm"
                                onClick={() => onSelectService(service.id)}
                                className="w-full text-[9px] uppercase tracking-widest font-bold border-brand-accent py-2.5 h-auto hover:bg-brand-surface-muted"
                              >
                                View Details
                              </Button>
                              <Button
                                id={`service-book-btn-${service.id}`}
                                variant="primary"
                                size="sm"
                                onClick={() => onBookService(service.id)}
                                className="w-full text-[9px] uppercase tracking-widest font-bold py-2.5 h-auto"
                              >
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div id="no-services-found-box" className="py-16 text-center border border-dashed border-brand-secondary/20 bg-brand-surface p-8">
                  {allServices.length === 0 ? (
                    <>
                      <Sparkles className="h-10 w-10 text-brand-secondary/60 mx-auto mb-3" />
                      <h4 className="font-serif text-lg text-brand-primary font-bold">No services available yet</h4>
                      <p className="font-sans text-xs text-brand-text-muted mt-1 max-w-sm mx-auto">
                        Our service catalog is currently being synchronized with salon records. Please check back shortly or consult our concierge desk.
                      </p>
                    </>
                  ) : (
                    <>
                      <Search className="h-10 w-10 text-brand-text-muted mx-auto mb-3" />
                      <h4 className="font-serif text-lg text-brand-primary font-bold">No Matching Rituals</h4>
                      <p className="font-sans text-xs text-brand-text-muted mt-1 max-w-sm mx-auto">
                        We couldn't find any services matching "{searchQuery}". Try selecting a different department or using different keywords.
                      </p>
                      <Button
                        id="clear-filters-btn"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                        }}
                        className="mt-4"
                      >
                        Reset Search & Filters
                      </Button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. Recently Viewed Services (Hidden if empty) */}
      {recentlyViewedServices.length > 0 && (
        <section id="recently-viewed-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-brand-secondary/15 pt-16 text-left">
          <div className="mb-8">
            <span className="font-sans text-[10px] uppercase tracking-widest text-brand-secondary block mb-1">Your Journey</span>
            <h2 className="text-2xl md:text-3xl font-serif text-brand-primary font-bold">Recently Viewed Rituals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewedServices.map((service) => (
              <Card
                key={service.id}
                id={`recently-viewed-card-${service.id}`}
                variant="bordered"
                className="bg-brand-surface overflow-hidden border-brand-secondary/15 hover:border-brand-secondary/40 flex flex-col justify-between"
              >
                <div className="relative aspect-video">
                  <img src={service.image} alt={service.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-brand-secondary">{service.category}</span>
                    <h4 className="font-serif text-sm font-semibold text-brand-primary line-clamp-1">{service.name}</h4>
                    <div className="flex justify-between items-center text-xs font-mono text-brand-text-muted">
                      <span>{service.price}</span>
                      <span>{service.duration}</span>
                    </div>
                  </div>
                  <Button
                    id={`recent-view-detail-btn-${service.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectService(service.id)}
                    className="w-full text-[9px] py-2 h-auto"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 5. Recommended Services */}
      <section id="recommended-services-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-brand-secondary/15 pt-16 text-left">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-widest text-brand-secondary block mb-1">Our Recommendations</span>
            <h2 className="text-2xl md:text-3xl font-serif text-brand-primary font-bold">Highly Curated Masterpieces</h2>
          </div>
          <Button
            id="view-all-recommended-btn"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory('All')}
            className="text-brand-gold-dark hover:text-brand-primary flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold"
          >
            All Departments <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendedServices.map((service) => (
            <Card
              key={service.id}
              id={`recommended-card-${service.id}`}
              variant="bordered"
              className="bg-brand-surface border-brand-secondary/15 hover:border-brand-secondary/40 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10]">
                <img src={service.image} alt={service.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-brand-secondary/90 text-brand-primary font-sans font-bold uppercase tracking-widest text-[8px] px-2 py-0.5">
                  Top Rated
                </span>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-semibold text-brand-primary">{service.name}</h4>
                  <p className="font-sans text-xs text-brand-text-muted font-normal line-clamp-2">{service.shortDescription}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-brand-secondary/15">
                  <span className="font-serif text-base text-brand-gold-dark font-bold">{service.price}</span>
                  <Button
                    id={`recommended-book-btn-${service.id}`}
                    variant="primary"
                    size="sm"
                    onClick={() => onBookService(service.id)}
                    className="text-[9px] py-2 h-auto px-4"
                  >
                    Reserve Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. Membership Upsell */}
      <section id="services-membership-upsell" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#121212] text-brand-primary p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8 border border-brand-secondary/15">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#FFF_1px,transparent_1px),linear-gradient(to_bottom,#FFF_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          <div className="text-left space-y-4 max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-secondary/15 border border-brand-secondary/30 text-brand-secondary text-[9px] uppercase tracking-widest font-semibold">
              <Award className="h-3.5 w-3.5" /> Royal Club Privilege
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight leading-tight">
              Unlock Priority VIP Access & <br />
              <span className="font-serif-italic text-brand-secondary">Bespoke Complimentary Treatments</span>
            </h2>
            <p className="font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal">
              Become a privileged member of Musha Empire’s Royal Club. Enjoy a stable 15% discount across all services, same-day scheduling priority, and dedicated luxury lounge amenities.
            </p>
          </div>
          <div className="shrink-0 relative z-10 w-full lg:w-auto">
            <Button
              id="upsell-membership-btn"
              variant="primary"
              size="lg"
              onClick={() => {
                const el = document.getElementById('royal-club');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else if (onNavigate) {
                  onNavigate('membership');
                }
              }}
              className="w-full lg:w-auto font-sans text-xs uppercase tracking-widest px-8 py-4"
            >
              Explore Club Privileges
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
