/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, X, ChevronLeft, ChevronRight, RefreshCw, ZoomIn, Info } from 'lucide-react';
import { galleryRepository } from '../../lib/firestoreService';
import Button from '../ui/Button';

interface GalleryItem {
  id: string;
  category: 'haircut' | 'color' | 'bridal' | 'makeup' | 'skin' | 'nails';
  title: string;
  description: string;
  artist: string;
  image: string;
}

interface BeforeAfterItem {
  id: string;
  category: string;
  title: string;
  beforeImg: string;
  afterImg: string;
  description: string;
}

export default function GalleryPage({
  onBookClick,
}: {
  onBookClick: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'haircut' | 'color' | 'bridal' | 'makeup' | 'skin' | 'nails'>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [firestoreGallery, setFirestoreGallery] = useState<GalleryItem[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    galleryRepository.getActiveGallery().then((records) => {
      if (isMounted && records && records.length > 0) {
        const mapped: GalleryItem[] = records.map((g) => ({
          id: g.id,
          category: (g.category?.toLowerCase() || 'haircut') as any,
          title: g.title,
          description: g.caption || '',
          artist: 'Master Stylist',
          image: g.image_url || g.imageUrl || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
        }));
        setFirestoreGallery(mapped);
      } else {
        setFirestoreGallery([]);
      }
    }).catch(err => {
      console.warn('Notice reading gallery from Firestore:', err);
      if (isMounted) setFirestoreGallery([]);
    });
    return () => { isMounted = false; };
  }, []);
  
  // Before/After slider control
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const categories = [
    { value: 'all', label: 'All Creations' },
    { value: 'haircut', label: 'Precision Haircuts' },
    { value: 'color', label: 'Avant-Garde Color' },
    { value: 'bridal', label: 'Royal Bridal Suites' },
    { value: 'makeup', label: 'Haute Makeup' },
    { value: 'skin', label: 'Botanical Skin' },
    { value: 'nails', label: 'Signature Nails' },
  ];

  const beforeAfterItem: BeforeAfterItem = {
    id: 'ba-1',
    category: 'Hair Coloring Treatment',
    title: 'Bespoke Blonde Metamorphosis',
    beforeImg: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80&sat=-60', // desaturated for 'before' effect
    afterImg: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    description: 'Nourishing botanical hair reconstructor followed by a warm-gilded caramel blonde balayage blend. Notice the recovery in texture elasticity and radiant shine.',
  };

  const allCreations = firestoreGallery || [];
  const filteredItems = selectedCategory === 'all'
    ? allCreations
    : allCreations.filter(item => item.category === selectedCategory);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        handleNextLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrevLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredItems]);

  const handleNextLightbox = () => {
    setActiveLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % filteredItems.length;
    });
  };

  const handlePrevLightbox = () => {
    setActiveLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? filteredItems.length - 1 : prev - 1;
    });
  };

  // Slider Mouse/Touch Drag controls
  const handleSliderMove = (clientX: number, boundingBox: DOMRect) => {
    const x = clientX - boundingBox.left;
    const percentage = Math.max(0, Math.min(100, (x / boundingBox.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleSliderMove(e.clientX, rect);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX, rect);
    }
  };

  return (
    <div id="gallery-page-container" className="pb-24 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <section id="gallery-header" className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-brand-secondary block mb-3">
          Our Curated Creations
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-primary font-bold tracking-tight">
          Visualizing <span className="font-serif-italic text-brand-gold-dark italic">Absolute Elegance</span>
        </h1>
        <div className="luxury-divider my-6" />
        <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
          Step into our high-resolution lookbook. Each capture reflects actual bespoke hair architecture, skincare glow, and nail geometry crafted live in our suites.
        </p>
      </section>

      {/* Interactive Before & After Slider Placeholders */}
      <section id="before-after-slider-section" className="mb-20 bg-brand-surface border border-brand-accent/25 p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" /> Real transformations
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-primary font-bold">
              Interactive Before & After
            </h2>
            <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
              Drag the champagne gold slider handles in the comparison panel to reveal how our custom restorative color treatments protect root elasticity while producing deep, shimmering highlights.
            </p>
            <div className="space-y-3 border-t border-brand-accent/15 pt-4 text-xs font-sans text-brand-text-muted">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 bg-brand-secondary rounded-full" />
                <strong className="text-brand-primary">Lefthand:</strong> Depleted fibers & faded dry undertones.
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 bg-brand-gold-dark rounded-full" />
                <strong className="text-brand-primary">Righthand:</strong> Re-structured cortex & silk botanical lacquer glow.
              </p>
            </div>
            <div className="pt-2">
              <Button id="ba-book-now" variant="primary" size="sm" onClick={onBookClick}>
                Book This Metamorphosis
              </Button>
            </div>
          </div>

          {/* Interactive Drag Handle Slider Container */}
          <div className="lg:col-span-7">
            <div
              id="before-after-drag-container"
              className="relative w-full h-[320px] sm:h-[400px] overflow-hidden select-none cursor-ew-resize border border-brand-secondary/35"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchEnd={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {/* After image - Background */}
              <img
                src={beforeAfterItem.afterImg}
                alt="After treatment"
                className="absolute inset-0 w-full h-full object-cover"
                draggable="false"
                referrerPolicy="no-referrer"
              />
              <div className="absolute right-4 bottom-4 bg-brand-primary/80 border border-brand-secondary/40 text-brand-bg text-[10px] uppercase tracking-wider px-3 py-1 font-sans font-semibold">
                After Look
              </div>

              {/* Before image - Sliding layer */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={beforeAfterItem.beforeImg}
                  alt="Before treatment"
                  className="absolute inset-y-0 left-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%' }}
                  draggable="false"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute left-4 bottom-4 bg-brand-bg/95 border border-brand-secondary/40 text-brand-primary text-[10px] uppercase tracking-wider px-3 py-1 font-sans font-semibold whitespace-nowrap">
                  Before state
                </div>
              </div>

              {/* Gold Divider Line */}
              <div
                className="absolute inset-y-0 w-[2px] bg-brand-secondary"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Gold Circle Drag handle */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 bg-brand-primary border border-brand-secondary text-brand-secondary flex items-center justify-center rounded-none shadow-xl cursor-grab active:cursor-grabbing hover:bg-brand-secondary hover:text-brand-primary transition-colors">
                  <span className="text-[11px] font-mono select-none font-bold">&larr;&rarr;</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-brand-text-muted font-sans text-center mt-3">
              {beforeAfterItem.description}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section id="gallery-filters" className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.value}
            id={`filter-btn-${cat.value}`}
            onClick={() => setSelectedCategory(cat.value as any)}
            className={`px-5 py-2.5 font-sans text-[10px] md:text-xs uppercase tracking-widest font-semibold border transition-all duration-300 rounded-none cursor-pointer ${
              selectedCategory === cat.value
                ? 'bg-brand-primary border-brand-primary text-brand-bg font-bold'
                : 'bg-brand-surface border-brand-accent/25 text-brand-text hover:border-brand-secondary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* Masonry Items Grid */}
      <section id="gallery-items-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/40 space-y-3 max-w-xl mx-auto">
            <Sparkles className="h-8 w-8 text-brand-secondary/60 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-primary">No gallery creations available yet</h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
              Our aesthetic transformation portfolio is currently being compiled with genuine salon session photography.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              id={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="group bg-brand-surface border border-brand-accent/20 overflow-hidden relative"
            >
              {/* Image Frame */}
              <div className="relative overflow-hidden aspect-4/3 sm:aspect-square">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                {/* Dark Hover overlay */}
                <div className="absolute inset-0 bg-brand-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-6">
                  {/* Zoom glass icon top-right */}
                  <div className="absolute top-4 right-4 bg-brand-secondary/15 border border-brand-secondary/40 text-brand-secondary p-2.5 rounded-none backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ZoomIn className="h-4.5 w-4.5" />
                  </div>
                  
                  {/* Meta Details */}
                  <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary block">
                      {item.category.toUpperCase()} &bull; By {item.artist}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-brand-bg leading-tight">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-brand-accent/65 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                    <button
                      id={`expand-lightbox-btn-${index}`}
                      onClick={() => setActiveLightboxIndex(index)}
                      className="font-sans text-[10px] uppercase tracking-widest font-bold text-brand-secondary hover:text-brand-bg flex items-center gap-1 mt-2 transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Masterpiece
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        )}
      </section>

      {/* Lightbox Modal Overlay */}
      <AnimatePresence>
        {activeLightboxIndex !== null && (
          <motion.div
            id="gallery-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-primary/95 z-50 flex items-center justify-center p-4"
          >
            {/* Close trigger button */}
            <button
              id="close-lightbox-btn"
              onClick={() => setActiveLightboxIndex(null)}
              className="absolute top-6 right-6 text-brand-bg hover:text-brand-secondary p-2.5 bg-brand-surface-muted/5 border border-brand-accent/15 rounded-none z-50 cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigators */}
            <button
              id="prev-lightbox-btn"
              onClick={handlePrevLightbox}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-bg hover:text-brand-secondary p-3 border border-brand-accent/15 rounded-none cursor-pointer z-40 hidden md:block bg-brand-primary"
              aria-label="Previous Look"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              id="next-lightbox-btn"
              onClick={handleNextLightbox}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-bg hover:text-brand-secondary p-3 border border-brand-accent/15 rounded-none cursor-pointer z-40 hidden md:block bg-brand-primary"
              aria-label="Next Look"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Card Content block */}
            <motion.div
              id="lightbox-card-wrapper"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-5xl bg-brand-bg border border-brand-secondary/30 grid grid-cols-1 md:grid-cols-12 overflow-hidden max-h-[90vh]"
            >
              {/* Image Frame */}
              <div className="md:col-span-8 bg-black flex items-center justify-center relative overflow-hidden h-[40vh] md:h-[75vh]">
                <img
                  src={filteredItems[activeLightboxIndex].image}
                  alt={filteredItems[activeLightboxIndex].title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Details Column */}
              <div className="md:col-span-4 p-6 sm:p-8 flex flex-col justify-between h-auto md:h-[75vh] overflow-y-auto bg-brand-surface">
                <div className="space-y-6">
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary block mb-1">
                      {filteredItems[activeLightboxIndex].category.toUpperCase()} Selection
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl text-brand-primary font-bold">
                      {filteredItems[activeLightboxIndex].title}
                    </h2>
                    <div className="luxury-divider my-3" />
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                    {filteredItems[activeLightboxIndex].description}
                  </p>

                  <div className="space-y-3 bg-brand-surface-muted/50 p-4 border border-brand-accent/20">
                    <p className="font-sans text-xs text-brand-text-muted flex items-center justify-between">
                      <span className="font-semibold text-brand-primary">Master Artisan:</span>
                      <span>{filteredItems[activeLightboxIndex].artist}</span>
                    </p>
                    <p className="font-sans text-xs text-brand-text-muted flex items-center justify-between">
                      <span className="font-semibold text-brand-primary">Atelier Status:</span>
                      <span className="text-brand-gold-dark font-medium uppercase tracking-wider text-[10px]">Royal Suite Approved</span>
                    </p>
                  </div>
                </div>

                {/* Bottom navigation selectors and triggers */}
                <div className="pt-6 border-t border-brand-accent/15 space-y-4">
                  <div className="flex items-center justify-between md:hidden">
                    <button
                      id="lightbox-mobile-prev"
                      onClick={handlePrevLightbox}
                      className="font-sans text-[11px] uppercase tracking-widest font-bold text-brand-text-muted hover:text-brand-primary flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </button>
                    <span className="font-sans text-xs text-brand-text-muted">
                      {activeLightboxIndex + 1} / {filteredItems.length}
                    </span>
                    <button
                      id="lightbox-mobile-next"
                      onClick={handleNextLightbox}
                      className="font-sans text-[11px] uppercase tracking-widest font-bold text-brand-text-muted hover:text-brand-primary flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <Button id="lightbox-book-now" variant="primary" size="md" className="w-full" onClick={onBookClick}>
                    Request Stylist Booking
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
