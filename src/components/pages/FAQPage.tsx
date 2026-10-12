/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Search, Plus, Minus, HelpCircle, ArrowRight, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';

interface FAQItem {
  id: string;
  category: 'styling' | 'spa' | 'booking' | 'membership' | 'safety';
  question: string;
  answer: string;
}

export default function FAQPage({
  onBookClick,
  onContactClick,
}: {
  onBookClick: () => void;
  onContactClick: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'styling' | 'spa' | 'booking' | 'membership' | 'safety'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-item-1']); // First one open by default

  const categories = [
    { value: 'all', label: 'All Queries' },
    { value: 'styling', label: 'Hair Styling' },
    { value: 'spa', label: 'Spa Treatments' },
    { value: 'booking', label: 'Reservations' },
    { value: 'membership', label: 'Royal Club' },
    { value: 'safety', label: 'Safety & Bio-Clean' },
  ];

  const faqs: FAQItem[] = [
    {
      id: 'faq-item-1',
      category: 'styling',
      question: 'What is the "Musha Razor sculpting technique" and how does it differ from a standard haircut?',
      answer: 'Standard haircuts often employ heavy shears that chop dryly through the hair shaft, creating flat blunt weights or microscopic splits. The Musha sculpting technique employs French master-shears and Japanese hand-forged steel razors on wet, botanical-hydrated fibers. This allows our artisans to sculpt according to your skeletal symmetry, creating customized texture slides that naturally swing back into shape without heavy blowouts.',
    },
    {
      id: 'faq-item-2',
      category: 'styling',
      question: 'Are your hair coloring dyes completely vegan and chemical-free?',
      answer: 'Yes, we are committed to premium clean luxury. We use high-performance, low-ammonia, or entirely ammonia-free French botanical glosses and European organic hybrid clay lighteners. Our coloring systems are enriched with organic argan lipids, meadowfoam extracts, and pure calendula oils, protecting root scalp follicles and preserving fiber elasticity.',
    },
    {
      id: 'faq-item-3',
      category: 'spa',
      question: 'What is the "Whispering Basin" experience?',
      answer: 'The Whispering Basin is our noise-isolated hair restoration spa chamber. Instead of generic salon washing rows, our basins are isolated in sound-proof oak partitions under fiber-optic starry night light rigs. You will rest on ergonomic leather lying beds while our therapist conducts a multi-step cranial micro-circulation massage, using warm botanical steam and customized binaural acoustic tracks.',
    },
    {
      id: 'faq-item-4',
      category: 'spa',
      question: 'Do I need to undergo scalp health diagnostics before booking a spa treatment?',
      answer: 'While not mandatory, we strongly recommend our premium diagnostic fiber camera check for first-time guests. This 10-minute non-invasive assessment captures root density, skin moisture levels, and chemical residue blockages, allowing our master therapists to custom-mix your aromatherapy steam masques with micro-precision.',
    },
    {
      id: 'faq-item-5',
      category: 'booking',
      question: 'What is your appointment cancellation guarantee policy?',
      answer: 'We understand schedules change. Because we block out dedicated 1-on-1 slots of up to 3 hours with master artisans, we require at least 24 hours notice for any cancellations or major adjustments. Cancellations within 24 hours are subject to a 50% reservation fee, while no-shows are billed at the full treatment value. You can reschedule easily online from your portal.',
    },
    {
      id: 'faq-item-6',
      category: 'booking',
      question: 'Do you support walk-in services or emergency appointments?',
      answer: 'Musha Empire operates primarily on a pre-reserved basis. However, we do reserve daily standby slots for last-minute emergencies. These slots are allocated on a first-come, first-served basis with strict priority given to our Gold Crown and Platinum Sovereign members. We recommend checking wait-times via WhatsApp.',
    },
    {
      id: 'faq-item-7',
      category: 'membership',
      question: 'How do the Silver, Gold, and Platinum Royal Club points work?',
      answer: 'As a club member, every pound spent on treatments or home botanical retail accrues Privilege Points. Points can be redeemed for private suite cabin upgrades, complimentary seasonal hair saunas, or curated master stylist masterclasses. Active tiers receive automatic discounts on additional items directly applied during check-out.',
    },
    {
      id: 'faq-item-8',
      category: 'membership',
      question: 'Can I share my Platinum Sovereign benefits with my partner or family?',
      answer: 'Absolutely. The Platinum Sovereign plan is a premium, multi-user shared family account. You can register up to two additional proxy members under your subscription from your customer portal. They will enjoy full priority access, master styling, and your matching 20% privilege check-out discounts.',
    },
    {
      id: 'faq-item-9',
      category: 'safety',
      question: 'What are your health, sanitation, and carbon-neutral standards?',
      answer: 'Musha Empire is certified 100% carbon-neutral. All single-use salon wraps are fully biodegradable. Our tools undergo a rigorous 3-step medical-grade chemical sterilization and dry heat autoclave cabinet protocol after every single treatment. Our ambient air is continuously filtered to extract any airborne styling micro-particles.',
    },
  ];

  const handleToggle = (id: string) => {
    if (openIds.includes(id)) {
      setOpenIds(prev => prev.filter(item => item !== id));
    } else {
      setOpenIds(prev => [...prev, id]);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="faq-page-wrapper" className="pb-24 pt-8 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <section id="faq-header" className="text-center mb-16">
        <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-brand-secondary block mb-3">
          Atelier Knowledge Base
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-primary font-bold tracking-tight">
          Frequently Asked <span className="font-serif-italic text-brand-gold-dark italic">Inquiries</span>
        </h1>
        <div className="luxury-divider my-6" />
        <p className="font-sans text-sm text-brand-text-muted leading-relaxed max-w-2xl mx-auto">
          Explore our detailed archive addressing our master styling methods, clean biological ingredients, reservation guarantees, and exclusive luxury membership rules.
        </p>
      </section>

      {/* Search Input Bar */}
      <div id="faq-search-container" className="relative mb-12 max-w-lg mx-auto">
        <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-text-muted/40">
          <Search className="h-4 w-4" />
        </span>
        <input
          id="faq-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions (e.g. razor, cancellation, organic)..."
          className="w-full bg-brand-surface border border-brand-accent text-brand-primary font-sans text-xs uppercase tracking-wider placeholder-brand-text-muted/45 py-4 pl-11 pr-4 rounded-none outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all shadow-sm"
        />
      </div>

      {/* Category filters */}
      <section id="faq-categories" className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.value}
            id={`faq-cat-${cat.value}`}
            onClick={() => setSelectedCategory(cat.value as any)}
            className={`px-4 py-2 font-sans text-[10px] sm:text-xs uppercase tracking-widest font-semibold border transition-all duration-300 rounded-none cursor-pointer ${
              selectedCategory === cat.value
                ? 'bg-brand-primary border-brand-primary text-brand-bg font-bold'
                : 'bg-brand-surface border-brand-accent/25 text-brand-text hover:border-brand-secondary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* Animated Accordion List */}
      <section id="faq-accordion-list" className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                id={faq.id}
                className="bg-brand-surface border border-brand-accent/25 hover:border-brand-secondary/35 transition-all duration-300"
              >
                {/* Trigger Question Row */}
                <button
                  id={`faq-trigger-${faq.id}`}
                  onClick={() => handleToggle(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <h3 className="font-serif text-lg sm:text-xl text-brand-primary font-bold pr-4 leading-tight">
                    {faq.question}
                  </h3>
                  <span className="text-brand-secondary shrink-0 mt-1 bg-brand-surface-muted/50 p-1 border border-brand-accent/10">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>

                {/* Animated Reveal Answer Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm font-sans text-brand-text-muted leading-relaxed border-t border-brand-surface-muted/80">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center p-12 bg-brand-surface border border-brand-accent/25">
            <HelpCircle className="h-10 w-10 text-brand-secondary mx-auto mb-4" />
            <p className="font-serif text-xl text-brand-primary font-bold">No queries matched your search</p>
            <p className="font-sans text-xs text-brand-text-muted mt-2">Try searching using simpler keywords or select another tab category above.</p>
          </div>
        )}
      </section>

      {/* Further Help Section */}
      <section id="faq-cta" className="mt-20 p-8 bg-brand-surface-muted/40 border border-brand-accent/20 text-center space-y-4">
        <h3 className="font-serif text-xl text-brand-primary font-bold flex items-center justify-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-secondary" /> Still Have Unanswered Questions?
        </h3>
        <p className="font-sans text-xs text-brand-text-muted leading-relaxed max-w-md mx-auto">
          Our lounge assistants are available via instant chat to outline bespoke details or guide you through multi-session treatment booking requirements.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button id="faq-direct-contact" variant="outline" size="sm" onClick={onContactClick} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Contact Concierge
          </Button>
          <Button id="faq-direct-book" variant="primary" size="sm" onClick={onBookClick}>
            Book Treatment Now
          </Button>
        </div>
      </section>
    </div>
  );
}
