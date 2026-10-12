/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryItem } from '../../data/salonData';
import { galleryRepository } from '../../lib/firestoreService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Eye, X, ZoomIn, Heart, Share2, Sparkles } from 'lucide-react';

export interface GalleryProps {
  onViewAll?: () => void;
}

export default function Gallery({ onViewAll }: GalleryProps = {}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [firestoreGallery, setFirestoreGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    galleryRepository.getActiveGallery().then((records) => {
      if (!isMounted) return;
      if (records && records.length > 0) {
        const mapped: GalleryItem[] = records.map((g) => ({
          id: g.id,
          title: g.title,
          category: g.category,
          image: g.image_url || g.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        }));
        setFirestoreGallery(mapped);
      } else {
        setFirestoreGallery([]);
      }
    }).catch(err => {
      console.warn('Notice reading gallery from Firestore:', err);
      if (isMounted) setFirestoreGallery([]);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const galleryItems = firestoreGallery;

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-brand-bg relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary block">
            VISUAL PORTFOLIO OF MASTERPIECES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary">
            The Musha <span className="italic font-bold text-gold-gradient">Aesthetic Gallery</span>
          </h2>
          <div className="luxury-divider" />
          <p className="font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal">
            An unretouched chronicle of recent bespoke transformations and styling sessions conducted inside our salon suites. Click any artwork to view details and zoom.
          </p>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="h-8 w-8 border-2 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin mx-auto" />
            <p className="font-sans text-xs uppercase tracking-widest text-brand-secondary">Loading Aesthetic Portfolio...</p>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/40 space-y-3 max-w-xl mx-auto">
            <Sparkles className="h-8 w-8 text-brand-secondary/60 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-primary">No gallery items available yet</h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
              Our aesthetic transformation gallery is currently being curated with recent salon session photography.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item, index) => (
              <motion.div
                key={item.id}
                id={`gallery-wrapper-${item.id}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer relative"
                onClick={() => setLightboxIndex(index)}
              >
                {/* Image Frame */}
                <Card
                  id={`gallery-card-${item.id}`}
                  variant="bordered"
                  className="p-0 border-brand-secondary/15 bg-brand-surface overflow-hidden aspect-square flex flex-col justify-between"
                >
                  <div className="relative w-full h-full bg-[#121212] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-80"
                    />
                    
                    {/* Subtle hover overlay with controls */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary bg-brand-bg/80 border border-brand-secondary/35 px-2.5 py-1 backdrop-blur-sm">
                          {item.category}
                        </span>
                        <div className="flex gap-2">
                          <button
                            id={`gallery-like-btn-${item.id}`}
                            onClick={(e) => handleToggleLike(item.id, e)}
                            className={`h-8 w-8 rounded-none border flex items-center justify-center transition-all bg-brand-surface/30 ${
                              likes[item.id]
                                ? 'border-red-500/50 text-red-500 bg-red-500/10'
                                : 'border-brand-secondary/20 text-brand-primary hover:border-brand-secondary'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${likes[item.id] ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="font-serif text-lg text-brand-primary font-bold leading-tight">{item.title}</h4>
                        <p className="font-sans text-[10px] text-brand-secondary uppercase tracking-widest font-bold flex items-center gap-1.5">
                          <ZoomIn className="h-3.5 w-3.5" /> Tap To Zoom Frame
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All CTA Row */}
        <div className="text-center mt-12">
          <Button
            id="gallery-view-all-cta"
            variant="outline"
            size="md"
            onClick={() => {
              if (onViewAll) {
                onViewAll();
              }
            }}
          >
            Launch Royal Lookbook
          </Button>
        </div>

        {/* Lightbox Modal (Full Immersive Screen Portal) */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              id="gallery-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setLightboxIndex(null)}
            >
              {/* Close Button */}
              <button
                id="lightbox-close-btn"
                onClick={() => setLightboxIndex(null)}
                className="absolute top-6 right-6 text-brand-primary/60 hover:text-brand-secondary border border-brand-secondary/15 p-2.5 rounded-none cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Slider Wrapper */}
              <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col justify-center items-center" onClick={(e) => e.stopPropagation()}>
                
                {/* Previous Button */}
                <button
                  id="lightbox-prev-btn"
                  onClick={handlePrev}
                  className="absolute left-4 z-10 text-brand-primary/60 hover:text-brand-secondary border border-brand-secondary/15 p-2.5 bg-[#121212]/80 backdrop-blur-sm rounded-none cursor-pointer hidden md:block"
                >
                  <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Main Lightbox Content */}
                <motion.div
                  key={lightboxIndex}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full flex flex-col items-center"
                >
                  <div className="relative aspect-square md:aspect-[4/3] max-h-[65vh] w-full bg-[#121212]/30 border border-brand-secondary/15 p-2 flex items-center justify-center">
                    <img
                      src={galleryItems[lightboxIndex].image}
                      alt={galleryItems[lightboxIndex].title}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Footnote details */}
                  <div className="w-full text-center mt-4 space-y-1.5 max-w-lg">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 border border-brand-secondary/20 inline-block">
                      {galleryItems[lightboxIndex].category}
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl text-brand-primary font-bold">{galleryItems[lightboxIndex].title}</h3>
                    <p className="font-sans text-xs text-brand-text-muted/60">
                      Photography from the main suite — Artistry by Master Arthur and Team.
                    </p>
                  </div>
                </motion.div>

                {/* Next Button */}
                <button
                  id="lightbox-next-btn"
                  onClick={handleNext}
                  className="absolute right-4 z-10 text-brand-primary/60 hover:text-brand-secondary border border-brand-secondary/15 p-2.5 bg-[#121212]/80 backdrop-blur-sm rounded-none cursor-pointer hidden md:block"
                >
                  <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
