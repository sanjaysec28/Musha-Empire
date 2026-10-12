/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { StylistItem } from '../../data/salonData';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Drawer } from '../ui/Overlay';
import { Instagram, Star, Award, Sparkles, Check, Send, Users } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { parseStaffBio, isStaffOnLeave } from '../../lib/staffHelpers';

export default function Stylists() {
  const [selectedStylist, setSelectedStylist] = useState<any | null>(null);
  const [conciergeSent, setConciergeSent] = useState(false);
  const [stylists, setStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStylists = async () => {
      if (!isSupabaseConfigured) {
        setStylists([]);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('is_available', true)
          .eq('is_active', true)
          .eq('role', 'stylist');

        if (error) throw error;

        const todayStr = new Date().toISOString().split('T')[0];

        const mappedAndFiltered = (data || []).map(item => {
          const meta = parseStaffBio(item.bio || '');
          return {
            id: item.id,
            name: item.full_name,
            role: item.role === 'stylist' ? 'Master Stylist' : (item.role || 'Master Artisan'),
            experience: 'Certified Professional',
            specialty: item.specialty || 'Luxury Artistry',
            bio: meta.bioText || item.bio || 'Elite hair care artisan specializing in custom bespoke looks.',
            image: item.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            instagram: '@musha_empire',
            leaves: meta.leaves
          };
        }).filter(s => {
          return !isStaffOnLeave(s.leaves, todayStr);
        });

        setStylists(mappedAndFiltered);
      } catch (err) {
        console.warn('Notice reading staff directory:', err);
        setStylists([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStylists();
  }, []);

  const handleOpenProfile = (stylist: any) => {
    setSelectedStylist(stylist);
    setConciergeSent(false);
  };

  const handleConciergeRequest = () => {
    setConciergeSent(true);
    setTimeout(() => {
      setSelectedStylist(null);
      setConciergeSent(false);
    }, 2500);
  };

  return (
    <section id="stylists" className="py-24 bg-brand-bg relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-semibold text-brand-secondary block">
            THE ARTISTS & VISIONARIES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-primary">
            Meet Our <span className="italic font-bold text-gold-gradient">Master Stylists</span>
          </h2>
          <div className="luxury-divider" />
          <p className="font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed font-normal">
            Globally trained, passionate, and dedicated to haute couture aesthetics. Our stylists do not follow trends—they orchestrate visual harmony matching your essence.
          </p>
        </div>

        {/* Stylists Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="h-8 w-8 border-2 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin mx-auto" />
            <p className="font-sans text-xs uppercase tracking-widest text-brand-secondary">Consulting Master Artisan Directory...</p>
          </div>
        ) : stylists.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-brand-secondary/20 p-8 bg-brand-surface/40 space-y-3 max-w-xl mx-auto">
            <Users className="h-8 w-8 text-brand-secondary/60 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-primary">Stylist directory being curated</h3>
            <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
              Our resident master stylists and grooming artisans are allocated per treatment ritual at attendance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stylists.map((stylist, idx) => (
            <motion.div
              key={stylist.id}
              id={`stylist-card-wrapper-${stylist.id}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card
                id={`stylist-card-${stylist.id}`}
                variant="bordered"
                hoverable
                className="h-full bg-brand-surface border-brand-accent/40 p-0 flex flex-col justify-between overflow-hidden group"
              >
                {/* Scaled picture window */}
                <div className="relative w-full aspect-[4/5] bg-brand-primary overflow-hidden">
                  <img
                    src={stylist.image}
                    alt={stylist.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-transparent to-transparent opacity-60" />
                  
                  {/* Decorative gold tag on hover */}
                  <div className="absolute bottom-4 left-4 font-mono text-[9px] text-brand-secondary uppercase tracking-widest font-semibold bg-brand-bg/80 px-2.5 py-1 border border-brand-secondary/30 backdrop-blur-sm">
                    {stylist.experience}
                  </div>
                </div>

                {/* Stylist Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-brand-primary leading-tight group-hover:text-brand-secondary transition-colors">
                      {stylist.name}
                    </h3>
                    <p className="font-sans text-[11px] text-brand-secondary uppercase tracking-wider font-semibold">
                      {stylist.role}
                    </p>
                  </div>

                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal">
                    <span className="font-medium text-brand-primary block mb-0.5">Specialty:</span>
                    {stylist.specialty}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-brand-accent/30">
                    <a
                      id={`stylist-ig-${stylist.id}`}
                      href="#instagram"
                      className="font-sans text-[10px] text-brand-text-muted hover:text-brand-secondary flex items-center gap-1 uppercase font-medium tracking-wider"
                    >
                      <Instagram className="h-3.5 w-3.5" /> Instagram
                    </a>
                    <Button
                      id={`stylist-profile-btn-${stylist.id}`}
                      variant="link"
                      size="sm"
                      onClick={() => handleOpenProfile(stylist)}
                      className="text-brand-gold-dark font-sans text-[10px] uppercase font-bold tracking-wider"
                    >
                      View Profile &rarr;
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          </div>
        )}

        {/* Detailed Profile Drawer */}
        <Drawer
          id="stylist-profile-drawer"
          isOpen={selectedStylist !== null}
          onClose={() => setSelectedStylist(null)}
          title="Master Stylist Registry"
          position="right"
          footer={
            selectedStylist && (
              <div id="drawer-stylist-footer" className="space-y-3 pt-2">
                {conciergeSent ? (
                  <div className="p-4 bg-green-950/20 border border-green-800/30 text-green-400 text-center rounded-none font-sans text-xs">
                    <Check className="h-4 w-4 inline-block mr-1" />
                    Concierge alert logged. Arthur will prioritize your request.
                  </div>
                ) : (
                  <Button
                    id="request-artist-btn"
                    variant="primary"
                    size="md"
                    className="w-full uppercase text-xs"
                    leftIcon={<Send className="h-4 w-4" />}
                    onClick={handleConciergeRequest}
                  >
                    Request Session With {selectedStylist.name.split(' ')[1]}
                  </Button>
                )}
                <p className="text-[10px] text-brand-text-muted text-center font-sans">
                  *A standard $50 artisan styling supplement applies to appointments under Master Arthur.
                </p>
              </div>
            )
          }
        >
          {selectedStylist && (
            <div className="space-y-6">
              {/* Picture banner */}
              <div className="relative w-full aspect-square border border-brand-accent bg-brand-surface overflow-hidden">
                <img
                  src={selectedStylist.image}
                  alt={selectedStylist.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute top-4 right-4 bg-brand-bg/85 backdrop-blur-sm px-3 py-1 border border-brand-secondary/35 text-brand-secondary text-[10px] font-mono uppercase tracking-widest font-semibold">
                  {selectedStylist.experience}
                </div>
              </div>

              {/* Title group */}
              <div className="space-y-1.5">
                <h3 className="font-serif text-2xl text-brand-primary leading-tight font-bold">{selectedStylist.name}</h3>
                <p className="font-sans text-xs text-brand-secondary uppercase tracking-widest font-semibold">{selectedStylist.role}</p>
                <div className="h-[1px] bg-brand-accent w-full mt-2" />
              </div>

              {/* Bio block */}
              <div className="space-y-2">
                <p className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-gold-dark">SOCIETY PROFILE</p>
                <p className="font-sans text-xs text-brand-text-muted leading-relaxed font-normal italic">
                  {selectedStylist.bio}
                </p>
              </div>

              {/* Credentials list */}
              <div className="space-y-3 pt-2">
                <p className="font-sans text-[10px] uppercase tracking-widest font-semibold text-brand-gold-dark">ELITE CREDENTIALS</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 font-sans text-xs text-brand-text">
                    <Award className="h-4.5 w-4.5 text-brand-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-brand-primary">Specialty Focus</p>
                      <p className="text-brand-text-muted text-[11px] font-normal">{selectedStylist.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 font-sans text-xs text-brand-text">
                    <Sparkles className="h-4.5 w-4.5 text-brand-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-brand-primary">Concierge Care</p>
                      <p className="text-brand-text-muted text-[11px] font-normal">Custom anatomy profiling, organic luxury hair treatments, post-styling advice</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Drawer>

      </div>
    </section>
  );
}
