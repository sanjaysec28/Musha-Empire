/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceItem } from '../../data/salonData';
import { servicesRepository } from '../../lib/firestoreService';
import Card from '../ui/Card';
import { Chip } from '../ui/Badge';
import Button from '../ui/Button';
import { Modal } from '../ui/Overlay';
import { Clock, Tag, Sparkles, AlertCircle, ArrowRight, Check } from 'lucide-react';

export interface ServicesProps {
  onBookService?: (id: string) => void;
  onExploreAll?: () => void;
}

export default function Services({ onBookService, onExploreAll }: ServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [firestoreServices, setFirestoreServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    servicesRepository.getActiveServices().then((dbServices) => {
      if (!isMounted) return;
      if (dbServices && dbServices.length > 0) {
        const mapped: ServiceItem[] = dbServices.map((s) => ({
          id: s.id,
          title: s.name,
          category: (s.category?.toLowerCase().includes('skin') ? 'skin' :
                     s.category?.toLowerCase().includes('groom') ? 'grooming' :
                     s.category?.toLowerCase().includes('exclus') ? 'exclusive' : 'hair') as any,
          price: typeof s.price === 'number' ? `$${s.price}` : String(s.price),
          duration: `${s.duration_minutes || s.durationMinutes || 45} mins`,
          description: s.description || '',
          image: s.image_url || s.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
          features: s.benefits || s.includedServices || [],
        }));
        setFirestoreServices(mapped);
      } else {
        setFirestoreServices([]);
      }
    }).catch(err => {
      console.warn('Notice reading services from Firestore repository:', err);
      if (isMounted) setFirestoreServices([]);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'hair', label: 'Hair Artistry' },
    { id: 'skin', label: 'Dermal Facials' },
    { id: 'grooming', label: 'Elite Grooming' },
    { id: 'exclusive', label: 'Signature Suites' }
  ];

  const currentSource = firestoreServices;
  const filteredServices = selectedCategory === 'all'
    ? currentSource
    : currentSource.filter(service => service.category === selectedCategory);

  const handleBookService = (service: ServiceItem) => {
    if (onBookService) {
      // Map basic id (e.g. 'hair-cut', 'glowing-skin') to extended data id
      let targetId = service.id;
      if (service.id === 'hair-cut') targetId = 'hair-cut-1';
      else if (service.id === 'color') targetId = 'hair-color-1';
      else if (service.id === 'styling') targetId = 'hair-styling-1';
      else if (service.id === 'glowing-skin') targetId = 'skin-facial-1';
      else if (service.id === 'beard') targetId = 'grooming-beard-1';
      else if (service.id === 'spa') targetId = 'hair-spa-1';
      else if (service.id === 'makeup') targetId = 'makeup-bridal-1';
      else if (service.id === 'nail-care') targetId = 'nail-care-1';

      onBookService(targetId);
    } else {
      setActiveService(service);
      setBookingSuccess(false);
    }
  };

  const confirmQuickBooking = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setActiveService(null);
      setBookingSuccess(false);
    }, 2500);
  };

  return (
    <section id="services" className="py-24 bg-brand-bg relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary block">
            THE CATALOG OF MASTERWORKS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary">
            Our Premium <span className="italic font-bold text-gold-gradient">Bespoke Offerings</span>
          </h2>
          <div className="luxury-divider" />
          <p className="font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal">
            Every ritual is conducted by certified master stylists. We consult deeply, using only elite organic botanical elixirs, in a private space curated for you.
          </p>
        </div>

        {/* Categories Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              id={`service-cat-chip-${cat.id}`}
              isSelected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Chip>
          ))}
        </div>

        {/* Services Grid with Framer Motion AnimatePresence */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="h-8 w-8 border-2 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin mx-auto" />
            <p className="font-sans text-xs uppercase tracking-widest text-brand-secondary">Curating Salon Services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/40 space-y-3 max-w-xl mx-auto">
            <Sparkles className="h-8 w-8 text-brand-secondary/60 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-primary">No services available yet</h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
              Our active masterwork catalog for this category is currently being updated in salon records. Please select another category or check back shortly.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, idx) => (
                <motion.div
                  layout
                  key={service.id}
                  id={`service-card-wrapper-${service.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col h-full"
                >
                  <Card
                    id={`service-card-${service.id}`}
                    variant="bordered"
                    hoverable
                    className="flex flex-col h-full p-0 overflow-hidden bg-brand-surface border-brand-accent/40"
                  >
                    {/* Service Image banner */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-brand-primary">
                      <img
                        src={service.image}
                        alt={service.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-4 right-4 bg-brand-bg/85 backdrop-blur-md border border-brand-secondary/35 text-brand-secondary text-xs uppercase font-sans tracking-widest px-3 py-1 font-semibold">
                        {service.price}
                      </div>
                    </div>

                    {/* Service Contents */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-[10px] font-sans text-brand-secondary uppercase tracking-widest font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {service.duration}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {service.category === 'hair' ? 'Hair' : service.category === 'skin' ? 'Skin' : service.category === 'grooming' ? 'Grooming' : 'Exclusive'}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg md:text-xl font-bold text-brand-primary leading-snug group-hover:text-brand-secondary transition-colors">
                          {service.title}
                        </h3>
                        <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal line-clamp-3">
                          {service.description}
                        </p>
                      </div>

                      <div className="pt-2">
                        <Button
                          id={`service-book-btn-${service.id}`}
                          variant="link"
                          size="sm"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                          onClick={() => handleBookService(service)}
                          className="w-full flex justify-between items-center group/btn text-[10px] tracking-widest font-bold font-sans uppercase text-brand-gold-dark"
                        >
                          Book Ritual
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Full Catalog Button */}
        {onExploreAll && (
          <div className="text-center mt-14 flex justify-center">
            <button
              id="home-view-all-services-btn"
              onClick={onExploreAll}
              className="w-full max-w-xs sm:max-w-md h-[56px] md:h-[60px] px-8 bg-[#E7D2B4] text-[#1A1A1A] border-none rounded-[16px] font-sans font-semibold text-sm tracking-[0.5px] uppercase inline-flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:bg-[#DDC39D] hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#E7D2B4] opacity-100 cursor-pointer"
            >
              <span>EXPLORE FULL 12-DEPARTMENT CATALOG</span>
              <ArrowRight className="h-4 w-4 text-[#1A1A1A] shrink-0" />
            </button>
          </div>
        )}

        {/* Quick Booking Confirmation Modal */}
        <Modal
          id="service-booking-modal"
          isOpen={activeService !== null}
          onClose={() => setActiveService(null)}
          title="Bespoke Experience Reservation"
          description={activeService?.title}
          size="md"
        >
          {activeService && (
            <div className="space-y-6 py-2">
              {bookingSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="h-14 w-14 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <h3 className="font-serif text-xl text-brand-primary">Ritual Preliminarily Blocked</h3>
                  <p className="font-sans text-xs text-brand-text-muted max-w-sm mx-auto leading-relaxed">
                    We have temporarily reserved <span className="font-semibold text-brand-primary">{activeService.title}</span>. Our concierge will contact you by telephone within 15 minutes to finalize your attendance date and master stylist allocation.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-brand-surface-muted/60 border border-brand-accent flex items-start gap-3.5">
                    <img
                      src={activeService.image}
                      alt={activeService.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover border border-brand-accent shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-serif text-base text-brand-primary leading-tight font-medium">{activeService.title}</h4>
                      <p className="font-sans text-[11px] text-brand-text-muted flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand-secondary" /> Duration: {activeService.duration}
                      </p>
                      <p className="font-sans text-[11px] text-brand-gold-dark font-semibold">
                        Starting Price: {activeService.price}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary">Included Sanctuary Privileges:</h5>
                    <ul className="space-y-2">
                      {activeService.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 font-sans text-xs text-brand-text-muted">
                          <span className="h-1.5 w-1.5 bg-brand-secondary rounded-full" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 border-t border-brand-accent/30 pt-4 text-[10px] font-sans text-brand-text-muted flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-brand-secondary shrink-0" />
                    <span>No deposit required. Cancellations must be made at least 24 hours in advance.</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      id="modal-cancel-booking"
                      variant="ghost"
                      onClick={() => setActiveService(null)}
                      className="flex-1"
                    >
                      Dismiss
                    </Button>
                    <Button
                      id="modal-confirm-booking"
                      variant="primary"
                      onClick={confirmQuickBooking}
                      className="flex-1"
                    >
                      Request Session
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>

      </div>
    </section>
  );
}
