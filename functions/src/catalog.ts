/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire Unisex Salon — Authoritative Canonical Services Catalog
 */

export interface CanonicalService {
  id: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  gender?: string;
  is_active: boolean;
  description: string;
}

export const CANONICAL_SERVICES: Record<string, CanonicalService> = {
  // Haircuts
  'hair-cut-1': {
    id: 'hair-cut-1',
    name: 'Sovereign Precision Haircut',
    category: 'Haircuts',
    price: 95,
    duration_minutes: 60,
    is_active: true,
    description: 'Couture design mapped precisely to your facial angles. Includes standard deep conditioning and hot stone neck release.'
  },
  'hair-cut-2': {
    id: 'hair-cut-2',
    name: 'Royal Signature Gentlemen Cut',
    category: 'Haircuts',
    price: 75,
    duration_minutes: 45,
    is_active: true,
    gender: 'Men',
    description: 'Tailored classic or modern scissor-over-comb cut, completed with a soothing hot-towel shoulder massage.'
  },
  'hair-cut-3': {
    id: 'hair-cut-3',
    name: 'Celestial Restyle & Blowout',
    category: 'Haircuts',
    price: 110,
    duration_minutes: 75,
    is_active: true,
    gender: 'Women',
    description: 'Complete transformation haircut with bespoke texturizing and high-volume bouncy thermal styling.'
  },
  'hair-cut-boy': {
    id: 'hair-cut-boy',
    name: "Young Master Scissor & Fade",
    category: 'Haircuts',
    price: 55,
    duration_minutes: 30,
    is_active: true,
    gender: 'Boy',
    description: 'Gentle, modern precision cut and styling tailored for boys and young gentlemen.'
  },
  'hair-cut-girl': {
    id: 'hair-cut-girl',
    name: "Young Lady Botanical Trim & Style",
    category: 'Haircuts',
    price: 65,
    duration_minutes: 45,
    is_active: true,
    gender: 'Girl',
    description: 'Delicate split-end trimming, gentle botanical wash, and soft natural blowout for young ladies.'
  },

  // Hair Styling
  'style-1': {
    id: 'style-1',
    name: 'Imperial Glamour Blowout',
    category: 'Hair Styling',
    price: 65,
    duration_minutes: 45,
    is_active: true,
    description: 'Silk-press smoothing or red-carpet voluminous waves with 72-hour anti-humidity botanical seal.'
  },
  'style-2': {
    id: 'style-2',
    name: 'Avant-Garde Architectural Updo',
    category: 'Hair Styling',
    price: 140,
    duration_minutes: 90,
    is_active: true,
    description: 'High-fashion editorial knotting, bridal gala chignon, or textured French braids.'
  },

  // Hair Coloring
  'color-1': {
    id: 'color-1',
    name: 'Artisanal French Balayage',
    category: 'Hair Coloring',
    price: 245,
    duration_minutes: 180,
    is_active: true,
    description: 'Hand-painted dimensional contour illumination using ammonia-free organic Parisian pigments.'
  },
  'color-2': {
    id: 'color-2',
    name: 'Monarch Full Spectrum Tint',
    category: 'Hair Coloring',
    price: 135,
    duration_minutes: 90,
    is_active: true,
    description: 'Seamless root-to-tip high-gloss enrichment with Bond-Builder keratin infusion.'
  },

  // Hair Spa
  'hair-spa-1': {
    id: 'hair-spa-1',
    name: 'Olaplex Botanical Reconstruction',
    category: 'Hair Spa',
    price: 115,
    duration_minutes: 60,
    is_active: true,
    description: 'Molecular bond multiplying therapy for bleached, thermal-damaged, or fragile hair structures.'
  },
  'hair-spa-2': {
    id: 'hair-spa-2',
    name: 'Ayurvedic Scalp Shirodhara Infusion',
    category: 'Hair Spa',
    price: 130,
    duration_minutes: 75,
    is_active: true,
    description: 'Warm herb-infused continuous oil drip across the forehead and deep pressure point scalp therapy.'
  },

  // Facial & Cleanup
  'facial-1': {
    id: 'facial-1',
    name: '24K Gold Cellular Renewal Facial',
    category: 'Facial',
    price: 195,
    duration_minutes: 90,
    is_active: true,
    description: 'Pure bio-active gold leaf sheets massaged into dermis for radical collagen synthesis.'
  },
  'facial-2': {
    id: 'facial-2',
    name: 'Hydra-Infusion Vortex Deep Cleanse',
    category: 'Facial',
    price: 160,
    duration_minutes: 60,
    is_active: true,
    description: 'Medical-grade vortex extraction paired with hyaluronic acid cocktail infusion.'
  },
  'cleanup-1': {
    id: 'cleanup-1',
    name: 'Express Detoxifying Botanical Cleanup',
    category: 'Cleanup',
    price: 70,
    duration_minutes: 40,
    is_active: true,
    description: 'Enzyme fruit peel exfoliation, gentle vacuum pore extraction, and tea-tree clay purifying mask.'
  },

  // Beard Grooming
  'beard-1': {
    id: 'beard-1',
    name: 'Artisan Razor Shave & Beard Sculpture',
    category: 'Beard Grooming',
    price: 55,
    duration_minutes: 40,
    is_active: true,
    gender: 'Men',
    description: 'Traditional straight razor hot lather shave with argan conditioning treatment.'
  },

  // Nail Care
  'nail-1': {
    id: 'nail-1',
    name: 'Diamond Gel Couture Manicure',
    category: 'Nail Care',
    price: 70,
    duration_minutes: 60,
    is_active: true,
    description: 'Precision cuticle remediation, diamond buffer prep, chip-resistant vegan gel polish.'
  },

  // Waxing & Threading
  'wax-1': {
    id: 'wax-1',
    name: 'Gentle Chocolate Strip Waxing (Full Body)',
    category: 'Waxing',
    price: 120,
    duration_minutes: 75,
    is_active: true,
    description: 'Ultra-gentle chocolate & chamomile strip wax that leaves zero post-treatment erythema.'
  },
  'thread-1': {
    id: 'thread-1',
    name: 'Royal Arch Threading & Brow Tint',
    category: 'Threading',
    price: 35,
    duration_minutes: 25,
    is_active: true,
    description: 'High-precision organic cotton thread eyebrow architecture with vegetable henna tint.'
  }
};
