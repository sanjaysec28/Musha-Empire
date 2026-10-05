/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceItem {
  id: string;
  title: string;
  category: 'hair' | 'skin' | 'grooming' | 'exclusive';
  price: string;
  duration: string;
  description: string;
  image: string;
  features: string[];
}

export interface StylistItem {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialty: string;
  bio: string;
  image: string;
  instagram: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  image: string;
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'hair-1',
    title: 'Signature Sculpt & Styling',
    category: 'hair',
    price: '$95',
    duration: '60 Mins',
    description: 'Bespoke custom haircut matching your facial anatomy, including deep conditioning scalp massage, blow dry, and hot tool design.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    features: ['Facial geometry analysis', 'Nourishing oil blow dry', 'Elite hot stone neck release']
  },
  {
    id: 'hair-2',
    title: 'Balayage & Color Melange',
    category: 'hair',
    price: '$240',
    duration: '180 Mins',
    description: 'Expert hand-painted color melting tailored to enhance depth, utilizing organic keratin-infused botanical pigments for radiant luster.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    features: ['Zero-ammonia active color', 'Custom tone-lock glaze treatment', 'Intense botanical glossing']
  },
  {
    id: 'hair-3',
    title: 'Olaplex Caviar Hair Spa',
    category: 'hair',
    price: '$135',
    duration: '75 Mins',
    description: 'A structural repair ritual infusing bond-building Olaplex molecules and black caviar nutrients to reverse atmospheric and thermal strain.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    features: ['Structural bond restoration', 'Micro-mist warm steam activation', 'Bespoke scalp detox massage']
  },
  {
    id: 'skin-1',
    title: 'Ethereal Gold Glow Facial',
    category: 'skin',
    price: '$160',
    duration: '90 Mins',
    description: 'Anti-aging facial incorporating pure 24K gold leaf compressions, hydraulic micro-exfoliation, and a soothing jade roller massage.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
    features: ['24K Gold luxury leaf infusion', 'Double peptide dermal barrier recovery', 'Lymphatic fluid drainage']
  },
  {
    id: 'exclusive-1',
    title: 'Editorial HD Makeup',
    category: 'exclusive',
    price: '$180',
    duration: '75 Mins',
    description: 'Red-carpet camera ready makeup using high-definition airbrush techniques. Tailored perfectly for evening, high-fashion, or photography settings.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    features: ['Custom HD airbrush veil', 'Premium faux-silk lashes', 'Dermal hydration setting lock']
  },
  {
    id: 'exclusive-2',
    title: 'Crowning Imperial Bridal Ritual',
    category: 'exclusive',
    price: '$450',
    duration: '240 Mins',
    description: 'An immersive bridal masterpiece suite comprising trial sessions, veil adjustments, premium hair design, luxury HD cosmetics, and French champagne.',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=800&q=80',
    features: ['Valkyrie hair updo styling', 'Waterproof luxury cosmetics', 'Bridal assistant on-site support']
  },
  {
    id: 'grooming-1',
    title: 'Elite Shave & Beard Sculpting',
    category: 'grooming',
    price: '$75',
    duration: '45 Mins',
    description: 'Traditional hot towel straight razor shave. Includes facial mapping, organic sandalwood oil nourishment, and clean beard restructuring.',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    features: ['Traditional triple hot-towel steam', 'Artisanal cold-pressed beard oils', 'Precise neck clean & skin cooling']
  },
  {
    id: 'grooming-2',
    title: 'Velvet Champagne Manicure',
    category: 'grooming',
    price: '$65',
    duration: '50 Mins',
    description: 'Hand luxury ritual featuring safe non-toxic cuticle grooming, warm white tea exfoliation, dynamic massage, and high-shine organic lacquer.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    features: ['Non-toxic botanical active polishes', 'Exfoliating sea-salt scrub', 'Nourishing shea-butter massage']
  }
];

export const WHY_CHOOSE_US_DATA = [
  {
    id: 'why-1',
    title: 'Bespoke Master Stylists',
    description: 'Our award-winning stylists train globally in London, Paris, and Milan, ensuring your hair reflects absolute haute couture artistry.',
  },
  {
    id: 'why-2',
    title: 'Sovereign Luxury Ambience',
    description: 'A sanctuary of tranquility. Architected with high ceilings, private acoustic cabins, relaxing music, and complimentary premium tea.',
  },
  {
    id: 'why-3',
    title: 'Prestigious Organic Botanicals',
    description: 'We prioritize your well-being. Using premium, vegan, cruelty-free, organic elixirs from Oribe, Olaplex, and Kérastase.',
  },
  {
    id: 'why-4',
    title: 'Surgical Hygiene Protocols',
    description: 'Absolute pristine sanitation. Every metal utensil undergoes autoclave sterilization. Single-use linens are provided for each guest.',
  },
  {
    id: 'why-5',
    title: 'Facial Anatomy Consultations',
    description: 'No template styles. We provide a thorough 1-on-1 consultation mapping your facial angles, skin tones, and lifestyle requirements.',
  },
  {
    id: 'why-6',
    title: 'Seamless Digital Concierge',
    description: 'Effortlessly book, reschedule, or communicate with our elite staff 24/7 through our beautiful cloud appointment assistant.'
  }
];

export const STYLISTS_DATA: StylistItem[] = [
  {
    id: 'stylist-1',
    name: 'Master Arthur Musha',
    role: 'Creative Director & Founder',
    experience: '16+ Years Experience',
    specialty: 'Couture Precision Cuts & Balayage',
    bio: 'Arthur trained under the legendary Vidal Sassoon academies in London. He specializes in high-fashion transformations that harmonize perfectly with facial structure.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    instagram: '@arthurmusha'
  },
  {
    id: 'stylist-2',
    name: 'Elena Rostova',
    role: 'Principal Hair Stylist & Educator',
    experience: '12 Years Experience',
    specialty: 'Aesthetic Color Chemistry & Highlights',
    bio: 'Elena is a certified L’Oréal Professionnel Color Specialist. She is renowned for creating multi-dimensional color melting, buttery blondes, and vibrant auburns.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    instagram: '@elenarostova'
  },
  {
    id: 'stylist-3',
    name: 'Marcus Sterling',
    role: 'Chief Gentlemen’s Barber & Grooming Expert',
    experience: '9 Years Experience',
    specialty: 'Classic Straight Razor Shaves & Beard Artistry',
    bio: 'Marcus has sculpted beards for high-profile executives, media figures, and artists. His straight-razor hot towels and beard fading techniques are unparalleled.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    instagram: '@marcusbarber'
  },
  {
    id: 'stylist-4',
    name: 'Sophia Vance',
    role: 'Senior Aesthetic Therapist',
    experience: '10 Years Experience',
    specialty: 'HD Cosmetic Artistry & Dermal Recovery Facials',
    bio: 'Sophia is the skin whisperer behind many red carpet appearances. Her non-invasive dermal therapies and signature high-definition makeup sessions are deeply revitalizing.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    instagram: '@sophiavance_skin'
  }
];

export const BENEFITS_DATA: BenefitItem[] = [
  { id: 'ben-1', title: '15% Off All Services', description: 'Enjoy exclusive pricing across our entire catalog of haircuts, colors, and treatments.' },
  { id: 'ben-2', title: 'Priority Scheduling VIP', description: 'Skip any waiting line. Gain access to same-day bookings and elite morning slots reserved for members.' },
  { id: 'ben-3', title: 'Complimentary Styling Hour', description: 'A monthly complimentary wash, blowout, and essential oil conditioning scalp treatment.' },
  { id: 'ben-4', title: 'Signature Birthday Treatment', description: 'Receive an exquisite complimentary 90-minute 24K Gold Dermal Facial and organic champagne during your birth week.' }
];

export const GALLERY_DATA: GalleryItem[] = [
  { id: 'gal-1', title: 'Champagne Blonde Balayage', category: 'Color Artistry', image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80' },
  { id: 'gal-2', title: 'Couture Editorial Braid', category: 'Styling', image: 'https://images.unsplash.com/photo-1595959183075-c1d945103d34?auto=format&fit=crop&w=800&q=80' },
  { id: 'gal-3', title: 'Elite Grooming Beard Blend', category: 'Barbering', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80' },
  { id: 'gal-4', title: 'The Royal Treatment Suite', category: 'Ambience', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { id: 'gal-5', title: 'Satin Smooth French Manicure', category: 'Nails', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80' },
  { id: 'gal-6', title: 'Celestial HD Bridal Look', category: 'Makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80' }
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Alexandra Davenport',
    role: 'Vogue Contributor',
    text: '“Musha Empire is not a standard hair salon—it is a spiritual sanctuary. Arthur understands hair movement and weight on a level that is truly masterclass. The balayage color Elena designed grows out with natural, flawless beauty. Unmatched craftsmanship.”',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    date: 'June 2026'
  },
  {
    id: 'test-2',
    name: 'Lord Sterling Vance',
    role: 'Luxury Hotelier',
    text: '“The VIP grooming suite at Musha has redefined luxury barbering. Marcus straight razor shave with white sandalwood oils is incredibly relaxing. It is a quiet, highly professional, acoustic lounge environment where I can read, work, and revitalize safely.”',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    date: 'May 2026'
  },
  {
    id: 'test-3',
    name: 'Dr. Evelyn Fontaine',
    role: 'Dermatologist',
    text: '“As a dermatologist, I am exceptionally cautious about facial serums. The 24K Gold Glow Facial Sophia performs is medically pristine, using single-use tools, bio-active peptides, and safe, highly potent organic ingredients. My skin barrier has never looked healthier.”',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    date: 'April 2026'
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I schedule a high-priority salon booking?',
    answer: 'You can easily secure an appointment using our digital concierge booking system above. Members of our Royal Club can also call our dedicated reservations desk directly to access same-day VIP reservations and off-hours styling.'
  },
  {
    id: 'faq-2',
    question: 'What is your cancellation and arrival policy?',
    answer: 'To maintain a sovereign, unhurried experience for all guests, we require at least 24 hours notice for any rescheduling or cancellation. Guests are welcomed into our quiet lounge 10 minutes prior to their appointment for white tea service.'
  },
  {
    id: 'faq-3',
    question: 'Are the products used in the salon completely safe and non-toxic?',
    answer: 'Yes, absolutely. We work exclusively with prestigious, clean-beauty brands including Olaplex, Oribe, and Kérastase. All hair colors are free from aggressive ammonia compounds, and our nail lacquers are certified non-toxic.'
  },
  {
    id: 'faq-4',
    question: 'Do you offer custom consultations for wedding services?',
    answer: 'Indeed. Our Crowning Imperial Bridal Ritual begins with a detailed 1-on-1 consultation and hair/skin mapping session. Arthur and Sophia will work closely with you to orchestrate the styling, makeup, and timing to absolute perfection.'
  },
  {
    id: 'faq-5',
    question: 'Can I request a private styling cabin during my visit?',
    answer: 'Yes. We feature an exclusive, acoustically sealed Executive Styling Cabin for high-profile clients or anyone desiring complete privacy. Please select "VIP Suite" or mention it to our concierge during your booking.'
  }
];
