/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sparkles, Compass, ShieldCheck, Heart, Users, Star, Award, ChevronRight, Calendar } from 'lucide-react';
import Button from '../ui/Button';

interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  experience: string;
  bio: string;
  image: string;
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface EnvironmentItem {
  title: string;
  description: string;
  image: string;
}

export default function AboutPage({
  onBookClick,
  onNavigateHome,
}: {
  onBookClick: () => void;
  onNavigateHome: () => void;
}) {
  const team: TeamMember[] = [];

  const timeline: TimelineItem[] = [
    {
      year: '2018',
      title: 'The Alabaster Dream',
      description: 'Musha Empire was born in a quiet corner of London with three styling chairs, dedicated to toxin-free, ultra-premium hair restoration.',
    },
    {
      year: '2020',
      title: 'Pioneering Clean Luxury',
      description: 'We became the UK’s first carbon-neutral high-end salon suite, partner-launching with elite European eco-botanical labs.',
    },
    {
      year: '2023',
      title: 'The Royal Spa Launch',
      description: 'Expanded into dedicated couture styling and therapeutic wellness suites, incorporating steam saunas and relaxation chambers.',
    },
    {
      year: '2026',
      title: 'Bespoke Digital Concierge',
      description: 'Serving our esteemed patrons with customized consultations, personal styling profiles, and instant interactive reservation management.',
    },
  ];

  const environments: EnvironmentItem[] = [
    {
      title: 'The Whispering Basin Area',
      description: 'Ergonomic leather washbeds, starry night ambient fiber optics, and personalized binaural beats for absolute mental calm.',
      image: 'https://images.unsplash.com/photo-1600948836101-f9ffdb5965e5?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'The Golden Cabin Suite',
      description: 'Our private single-client VIP vault with isolated acoustic walls, tailored air purification, and rare organic single-estate tea service.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const trustFactors = [
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Master-Level Artistry',
      desc: 'Every artisan holds top-tier European academy credentials and undergoes continuous multi-year seasonal couture training.',
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: 'Toxin-Free Guarantee',
      desc: 'We strictly exclude parabens, sulfates, formaldehydes, and silicones. Pure botanical and bio-mimetic ingredients only.',
    },
    {
      icon: <Compass className="h-6 w-6" />,
      title: 'Acoustic Sanctuary',
      desc: 'A strict noise-controlled, cell-phone-silent environment ensures your treatment double-functions as a meditative escape.',
    },
  ];

  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <motion.div
      id="about-page-wrapper"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="pb-24 pt-8"
    >
      {/* Hero Header */}
      <section id="about-hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-24">
        <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-brand-secondary block mb-3">
          Our Philosophy & Heritage
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-primary font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          Redefining Aesthetic Craft as a <span className="font-serif-italic text-brand-gold-dark italic">Sacred Sanctuary</span>
        </h1>
        <div className="luxury-divider my-8" />
        <p className="font-sans text-sm sm:text-base text-brand-text-muted max-w-2xl mx-auto leading-relaxed">
          Musha Empire was founded to elevate the humble haircut into a meditative grooming ceremony.
          We synthesize timeless Scandinavian design clarity with the immaculate structural discipline of Japanese artistry.
        </p>
      </section>

      {/* Brand Story & Philosophy Grid */}
      <section id="about-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> The Genesis of Musha Empire
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold leading-tight">
              Where quiet minimalism meets absolute botanical luxury.
            </h2>
            <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
              In an industry dominated by noisy hair stations, rushed timers, and heavy chemical odors, the Musha Empire founders envisioned an antidote: a quiet, high-contrast, pure-air retreat. A space where hair and skin health are nurtured under surgical-grade clean standards using nature’s rarest organic resins and cold-pressed floral elixirs.
            </p>
            <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
              Every chair in our atelier sits inside its own architectural light bubble, calculated to eliminate shadows. Our team doesn’t just trim; they sculpt according to your skeletal symmetry, your natural hair crown-spin, and your unique lifestyle energy.
            </p>
            
            {/* Mission / Vision Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="p-5 bg-brand-surface border border-brand-accent/30 rounded-none">
                <h4 className="font-serif text-lg text-brand-primary font-bold mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary" /> Our Mission
                </h4>
                <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                  To heal, structure, and embellish the crown of every patron, preserving complete eco-biological integrity and physical serenity.
                </p>
              </div>
              <div className="p-5 bg-brand-surface border border-brand-accent/30 rounded-none">
                <h4 className="font-serif text-lg text-brand-primary font-bold mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary" /> Our Vision
                </h4>
                <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                  To set the worldwide standard for premium, carbon-neutral wellness hair-spa art, proving true luxury is fundamentally healthy.
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 border border-brand-secondary/20 pointer-events-none translate-x-3 translate-y-3 transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1" />
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
              alt="Atelier sculpting session"
              className="w-full h-[320px] sm:h-[450px] object-cover border border-brand-secondary/35 filter grayscale group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section id="about-timeline" className="bg-brand-surface-muted/50 border-y border-brand-accent/15 py-20 mb-24 sm:mb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary">
              Chronicles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold mt-2">
              Our Journey Timeline
            </h2>
            <div className="luxury-divider my-4 max-w-xs mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Horizontal Line connector */}
            <div className="hidden md:block absolute top-[28px] left-[50px] right-[50px] h-[1px] bg-gradient-to-r from-brand-secondary/10 via-brand-secondary/40 to-brand-secondary/10" />
            
            {timeline.map((item, index) => (
              <div key={item.year} id={`timeline-item-${index}`} className="relative space-y-4 text-center md:text-left group">
                <div className="mx-auto md:mx-0 h-14 w-14 rounded-full border border-brand-secondary bg-brand-bg flex items-center justify-center font-serif text-lg font-bold text-brand-gold-dark shadow-sm group-hover:bg-brand-primary group-hover:text-brand-bg transition-colors duration-300 relative z-10">
                  {item.year}
                </div>
                <div className="pt-2">
                  <h3 className="font-serif text-xl text-brand-primary font-bold group-hover:text-brand-gold-dark transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section id="about-team" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary">
            Artisans of the Crown
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold mt-2">
            Meet the Masters
          </h2>
          <div className="luxury-divider my-4 max-w-xs mx-auto" />
          <p className="font-sans text-xs sm:text-sm text-brand-text-muted">
            Each stylist and therapist is a vetted maestro with a minimum of ten years operating in top-tier global beauty corridors.
          </p>
        </div>

        {team.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/40 space-y-3 max-w-xl mx-auto">
            <Users className="h-8 w-8 text-brand-secondary/60 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-primary">Our Artisan Directory is Updating</h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
              Master artisan profiles and verified bios are currently being synchronized with our central registry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div
                key={member.name}
                id={`team-member-${idx}`}
                className="group bg-brand-surface border border-brand-accent/25 hover:border-brand-secondary/60 hover:shadow-2xl hover:shadow-brand-secondary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="overflow-hidden relative h-[280px]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="font-sans text-[11px] text-brand-bg uppercase tracking-widest font-semibold flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-brand-secondary" /> Vetted Artisan
                    </p>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="font-serif text-xl text-brand-primary font-bold group-hover:text-brand-gold-dark transition-colors">
                      {member.name}
                    </h3>
                    <p className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary">
                      {member.role}
                    </p>
                  </div>
                  <div className="border-t border-brand-accent/15 pt-3 space-y-1">
                    <p className="font-sans text-[11px] text-brand-text-muted">
                      <strong className="text-brand-primary">Specialty:</strong> {member.specialty}
                    </p>
                    <p className="font-sans text-[11px] text-brand-text-muted">
                      <strong className="text-brand-primary">Tenure:</strong> {member.experience}
                    </p>
                  </div>
                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Salon Environment */}
      <section id="about-environment" className="bg-brand-surface py-20 border-y border-brand-accent/10 mb-24 sm:mb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary">
                Atelier Aesthetics
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold leading-tight">
                An Environment Designed for Complete Neural Serenity
              </h2>
              <p className="font-sans text-sm text-brand-text-muted leading-relaxed">
                Step into an oasis sculpted in natural timber, hand-buffed raw stone, and micro-brushed golden frames. 
                Our air is active-filtered four times every hour to clear styling fumes, replaced with custom diffused cedarwood and green tea extracts.
              </p>
              <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                Enjoy complimentary single-estate ceremonial matcha, hand-brewed cold infusions, or organic Champagne. 
                Our environment is structured to ensure that your treatment doesn’t just fix your hair, but grounds your energy.
              </p>
              <div className="pt-2">
                <Button id="about-book-btn" variant="outline" size="sm" onClick={onBookClick}>
                  Tour & Consultation
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {environments.map((env, idx) => (
                <div key={env.title} id={`env-box-${idx}`} className="space-y-4 group">
                  <div className="overflow-hidden border border-brand-accent/20">
                    <img
                      src={env.image}
                      alt={env.title}
                      className="w-full h-[220px] object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="font-serif text-lg text-brand-primary font-bold group-hover:text-brand-gold-dark transition-colors">
                    {env.title}
                  </h3>
                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                    {env.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Clients Trust Us */}
      <section id="about-trust" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <div className="max-w-2xl mx-auto mb-16">
          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-secondary">
            Our Assurances
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold mt-2">
            Why Clients Trust Musha Empire
          </h2>
          <div className="luxury-divider my-4 max-w-xs mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {trustFactors.map((factor, index) => (
            <div
              key={factor.title}
              id={`trust-factor-${index}`}
              className="p-8 bg-brand-surface border border-brand-accent/20 hover:border-brand-secondary/40 transition-all duration-300 space-y-4 relative"
            >
              <div className="text-brand-secondary bg-brand-surface-muted/50 h-12 w-12 flex items-center justify-center border border-brand-accent/25">
                {factor.icon}
              </div>
              <h3 className="font-serif text-xl text-brand-primary font-bold">
                {factor.title}
              </h3>
              <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                {factor.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-brand-surface text-brand-text p-8 sm:p-12 border border-brand-secondary/15 text-center space-y-6">
          <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-brand-secondary font-semibold block">
            Royal Client Invitation
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto leading-snug">
            Ready to experience a premium standard of beauty care?
          </h2>
          <p className="font-sans text-xs text-brand-text-muted max-w-md mx-auto leading-relaxed">
            Schedule an appointment online with one of our master artisans.
            First-time guests enjoy complimentary scalp moisture detox treatments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Button id="about-bottom-book" variant="primary" size="md" onClick={onBookClick}>
              Reserve Appointment
            </Button>
            <Button id="about-back-home" variant="outline" size="md" onClick={onNavigateHome} className="border-brand-secondary/30 text-brand-secondary hover:border-brand-secondary hover:text-white hover:bg-brand-secondary/10">
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
