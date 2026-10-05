/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExtendedService {
  id: string;
  name: string;
  category: string;
  price: string;
  priceValue: number; // for sorting
  duration: string;
  durationValue: number; // in minutes for sorting
  shortDescription: string;
  longDescription: string;
  image: string;
  benefits: string[];
  includedServices: string[];
  popular?: boolean;
  rating: number;
  reviewsCount: number;
  faqs: { question: string; answer: string }[];
}

export const CATEGORIES_LIST = [
  'Haircuts',
  'Hair Styling',
  'Hair Coloring',
  'Hair Spa',
  'Facial',
  'Cleanup',
  'Makeup',
  'Bridal',
  'Beard Grooming',
  'Nail Care',
  'Waxing',
  'Threading'
];

export const EXTENDED_SERVICES_DATA: ExtendedService[] = [
  // 1. Haircuts
  {
    id: 'hair-cut-1',
    name: 'Sovereign Precision Haircut',
    category: 'Haircuts',
    price: '$95',
    priceValue: 95,
    duration: '60 Mins',
    durationValue: 60,
    shortDescription: 'Couture design mapped precisely to your facial angles. Includes standard deep conditioning and hot stone neck release.',
    longDescription: 'Our signature haircutting experience begins with a deep facial architecture analysis by our master stylist. We analyze hair density, texture, growth patterns, and bone structures to design a look that elevates your profile. Includes a botanical detoxifying hair wash, luxury scalp massage, and bespoke finishing design.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Individually structured cutting geometry that preserves your hair health',
      'Botanical deep conditioning scalp wash and cold-pressed oil seal',
      'Incredibly long-lasting style memory that is easy to manage at home'
    ],
    includedServices: [
      'Facial structure and hair health consultation',
      'Thermal-activated botanical scalp cleanse',
      'Signature hair sculpting session',
      'Deluxe blowout and hot tool design finish'
    ],
    popular: true,
    rating: 4.9,
    reviewsCount: 124,
    faqs: [
      { question: 'How long does this style typically last?', answer: 'Due to our couture precision-cut techniques, the structure of the cut stays perfectly balanced for 6 to 8 weeks as it grows out.' },
      { question: 'Is a wash included in the service?', answer: 'Yes, every haircutting experience includes a premium botanical wash, scalp conditioning treatment, and blow dry finish.' }
    ]
  },
  {
    id: 'hair-cut-2',
    name: 'Royal Signature Gentlemen Cut',
    category: 'Haircuts',
    price: '$75',
    priceValue: 75,
    duration: '45 Mins',
    durationValue: 45,
    shortDescription: 'Tailored classic or modern scissor-over-comb cut, completed with a soothing hot-towel shoulder massage.',
    longDescription: 'A premium grooming cut designed exclusively for gentlemen. Tailored with meticulous scissor-over-comb and clipper blending. It includes a refreshing mint wash, scalp tonic treatment, and a traditional warm steam towel neck massage with luxury cologne notes.',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Impeccable scissor-over-comb fade or classic contour blending',
      'Stimulating mint scalp wash that clears grease and environmental residue',
      'Relaxing hot-towel neck and shoulder release'
    ],
    includedServices: [
      'Grooming contour and sideburn consultation',
      'Peppermint and tea tree active wash',
      'Scissor-over-comb precision contouring',
      'Blow dry, matte clay pomade styling, and hot-towel neck shave'
    ],
    rating: 4.8,
    reviewsCount: 88,
    faqs: [
      { question: 'Do you use clippers or scissors?', answer: 'We specialize in classic scissor-over-comb techniques for the most natural, hand-crafted look, but use ultra-premium quiet clippers for tight fades upon request.' }
    ]
  },

  // 2. Hair Styling
  {
    id: 'hair-style-1',
    name: 'Couture Editorial Blowout & Waves',
    category: 'Hair Styling',
    price: '$80',
    priceValue: 80,
    duration: '50 Mins',
    durationValue: 50,
    shortDescription: 'Haute couture volume styling utilizing premium round-brush techniques and Oribe royal seal heat protection.',
    longDescription: 'Get a red-carpet ready look. Our luxury blowout treatment cleanses your hair with silk-infused proteins and uses advanced aerodynamic styling. We create soft cascading curls, glass-straight sheets, or high-volume bounces that stay flawless all weekend.',
    image: 'https://images.unsplash.com/photo-1595959183075-c1d945103d34?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Frizz-free, light-reflecting glass finish',
      'Enriched with high-end thermal active protein barriers',
      'Signature volume and bouncy hold that lasts up to 3-4 days'
    ],
    includedServices: [
      'Volumizing amino-acid wash and rinse',
      'Pre-blowout keratin protective primer',
      'Round-brush sculpting and styling',
      'Frizz-seal styling spray overlay'
    ],
    popular: true,
    rating: 4.7,
    reviewsCount: 95,
    faqs: [
      { question: 'Will my blowout hold in humid weather?', answer: 'We apply a luxury polymer anti-humidity shield from Oribe that locks out moisture, ensuring your styling stays smooth and bouncy.' }
    ]
  },

  // 3. Hair Coloring
  {
    id: 'hair-color-1',
    name: 'Celestial Balayage & Melt',
    category: 'Hair Coloring',
    price: '$240',
    priceValue: 240,
    duration: '180 Mins',
    durationValue: 180,
    shortDescription: 'Artistic hand-painted dimensional highlights using organic, ammonia-free botanical color pigments.',
    longDescription: 'A bespoke coloring masterpiece. Our master colorists hand-paint individual sections to create a seamless transition of color. By blending tones in absolute harmony with your natural roots, we guarantee a soft, multi-dimensional, low-maintenance grow-out.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Seamless multi-dimensional depth with zero harsh demarcation lines',
      'Active organic glossing that strengthens your cuticles',
      'Extremely easy to grow out—only requires touching up twice a year'
    ],
    includedServices: [
      'Comprehensive skin tone and color palette alignment',
      'Hand-painted bond-protective balayage application',
      'Custom luxury toner/glaze glossing',
      'Deep post-color moisture locking mask'
    ],
    popular: true,
    rating: 5.0,
    reviewsCount: 142,
    faqs: [
      { question: 'Does balayage damage my hair?', answer: 'We mix a proprietary Bond-Building complex into all lighteners and color formulas, shielding your hair bonds and leaving it stronger than before.' },
      { question: 'How long does the service take?', answer: 'Balayage is an artistic, detailed process that requires 2.5 to 3.5 hours depending on your hair length and density.' }
    ]
  },

  // 4. Hair Spa
  {
    id: 'hair-spa-1',
    name: 'Olaplex Caviar Restoration Spa',
    category: 'Hair Spa',
    price: '$135',
    priceValue: 135,
    duration: '75 Mins',
    durationValue: 75,
    shortDescription: 'Premium molecular bond-repair combined with rich black caviar nutrients under structural warm micro-mist.',
    longDescription: 'Our signature curative therapy for highly stressed or chemically processed locks. This intensive treatment infuses pure disulfide-bond repairing chemistry alongside nourishing deep caviar seed extracts. A state-of-the-art warm micro-mist vapor chamber opens the hair cuticles for maximum product absorption, followed by an ice-cold botanical rinse to lock in nutrients.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Rebuilds broken hair structures and seals fractured split ends',
      'Restores elastic bounce, supreme shine, and natural moisture balance',
      'Calms dry, irritated scalps and promotes healthier root growth'
    ],
    includedServices: [
      'Elasticity and scalp wellness test',
      'Clarifying prebiotic hair wash',
      'Double molecular bond-repair and caviar butter wrap',
      'Acoustic micro-mist moisture chamber session',
      'Vibrational acupressure scalp massage'
    ],
    rating: 4.9,
    reviewsCount: 76,
    faqs: [
      { question: 'How often should I get a Hair Spa?', answer: 'We recommend this deep restoration treatment once a month to counteract environmental pollution and heat styling damage.' }
    ]
  },

  // 5. Facial
  {
    id: 'facial-1',
    name: '24K Imperial Gold Glow Facial',
    category: 'Facial',
    price: '$160',
    priceValue: 160,
    duration: '90 Mins',
    durationValue: 90,
    shortDescription: 'Pure 24K gold leaf compression, hyaluronic micro-infusion, and luxury jade roller massage.',
    longDescription: 'Our crown-jewel anti-aging skin therapy. This facial incorporates pure 24K gold leaf sheets, which stimulate cellular metabolism and blood circulation. Using deep hydraulic skin exfoliation and dual-peptide serums, we plump skin lines, eliminate dullness, and leave an exquisite glowing reflection.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Boosts natural collagen synthesis and minimizes fine lines',
      'Deeply detoxifies dermal tissue and locks in heavy hydration',
      'Improves skin elasticity and leaves a glowing champagne shimmer'
    ],
    includedServices: [
      'Dermal diagnostic mapping',
      'Enzymatic resurfacing peel',
      'Pure 24K gold compressions',
      'Peptide-enriched micro-current lift',
      'Cooling lymphatic jade roller massage'
    ],
    popular: true,
    rating: 4.9,
    reviewsCount: 110,
    faqs: [
      { question: 'Is this facial safe for sensitive skin?', answer: 'Yes, gold has natural anti-inflammatory and cooling properties. We customize all enzymes and peels to match your skin sensitivity.' }
    ]
  },

  // 6. Cleanup
  {
    id: 'cleanup-1',
    name: 'Botanical Charcoal Detox Cleanup',
    category: 'Cleanup',
    price: '$65',
    priceValue: 65,
    duration: '45 Mins',
    durationValue: 45,
    shortDescription: 'Deep pore vacuum extraction and active charcoal volcanic scrub for absolute skin clarification.',
    longDescription: 'An essential rapid clarifying facial. We steam the skin with healing lavender mist to relax the pores, then apply an activated organic charcoal mask that binds to blackheads, dirt, and oil. Finished with deep ultrasonic pore extractions and a cooling organic cucumber hydration veil.',
    image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Clears out blackheads, sebum plugs, and dead skin build-up',
      'Refines large pores and controls excessive oil production',
      'Instant matte, clean, energized complexion'
    ],
    includedServices: [
      'Warm lavender-infused steam wrap',
      'Activated charcoal volcanic exfoliation scrub',
      'Ultrasonic skin extraction therapy',
      'Astringent tea tree toner and cold hydration lock'
    ],
    rating: 4.6,
    reviewsCount: 54,
    faqs: [
      { question: 'Does pore extraction hurt?', answer: 'We use premium ultrasonic spatulas and light steam, making the extraction process highly comfortable and completely skin-safe.' }
    ]
  },

  // 7. Makeup
  {
    id: 'makeup-1',
    name: 'Red-Carpet HD Airbrush Makeup',
    category: 'Makeup',
    price: '$180',
    priceValue: 180,
    duration: '75 Mins',
    durationValue: 75,
    shortDescription: 'High-definition airbrush cosmetics and premium faux-silk lashes for flawless camera and evening display.',
    longDescription: 'A masterful cosmetic service using micro-fine airbrushing. We atomize light fluid pigments to create a thin, waterproof, transfer-resistant silk finish that mimics perfect skin. It feels weightless, avoids caking under intense venue lights, and is designed for photography or red-carpet appearances.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Flawless HD poreless look under all lighting arrays',
      'Waterproof and sweat-resistant formula with 16-hour lock',
      'Lightweight, breathable feel that does not block skin pores'
    ],
    includedServices: [
      'Skin priming and customized tone matching',
      'Flawless HD airbrush cosmetic veil',
      'Expert contour sculpting and highlighting',
      'Hand-crafted premium faux-silk eyelash fitting'
    ],
    rating: 4.9,
    reviewsCount: 82,
    faqs: [
      { question: 'How long does the makeup hold?', answer: 'Our HD Airbrush makeup holds up to 16 hours without moving, slipping, or oxidizing.' }
    ]
  },

  // 8. Bridal
  {
    id: 'bridal-1',
    name: 'Imperial Bridal Masterpiece',
    category: 'Bridal',
    price: '$450',
    priceValue: 450,
    duration: '240 Mins',
    durationValue: 240,
    shortDescription: 'All-inclusive premium bridal styling, luxury HD airbrush makeup, veil styling, and premium champagne.',
    longDescription: 'Our ultimate luxury bridal package. Our lead artist and founding stylist dedicate their undivided attention to crafting your vision. Includes high-fashion hair updo or cascading couture waves, luxury HD airbrush cosmetics, complete body highlighting, veil draping, and private suite access with refreshments.',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Two master stylists dedicated to your hair and makeup simultaneously',
      'Private VIP Bridal Suite with organic champagne, berries, and custom tunes',
      'Includes a complimentary 60-minute styling trial and consultation session'
    ],
    includedServices: [
      'Pre-wedding styling and mood-board consultation',
      'VIP suite experience on the wedding morning',
      'Signature bridal hair structure (updo or waves)',
      'Waterproof luxury HD airbrush makeup with body glow',
      'Draping and secure fastening of veil and accessories'
    ],
    popular: true,
    rating: 5.0,
    reviewsCount: 64,
    faqs: [
      { question: 'Does this package include a trial session?', answer: 'Yes, we include a full 60-minute trial styling and consultation session 2-4 weeks before your wedding day.' },
      { question: 'Can my bridesmaids book with me?', answer: 'Absolutely. We offer customized bridesmaid group rates. Let us know during booking and we will accommodate them in adjacent suites.' }
    ]
  },

  // 9. Beard Grooming
  {
    id: 'grooming-beard-1',
    name: 'The Sovereign Hot-Razor Shave & Sculpt',
    category: 'Beard Grooming',
    price: '$60',
    priceValue: 60,
    duration: '40 Mins',
    durationValue: 40,
    shortDescription: 'Traditional straight-razor shave with triple hot-towel steam, sandalwood oils, and beard contouring.',
    longDescription: 'Revitalize your beard with our classic hot-towel straight-razor shave. We map your beard angles to harmonize with your cheekbones and jaw structure. Includes triple warm steam towel hydration, nourishing pre-shave sandalwood essential oils, and an ice-cold face wrap to tighten pores.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Surgically precise blade lines and clean cheek fades',
      'Prevents ingrown hairs and razor irritation with luxury pre-oils',
      'Dermal hydration and soothing massage that reduces fatigue'
    ],
    includedServices: [
      'Beard shape design and facial mapping consultation',
      'Triple hot towel herbal steam prep',
      'Straight-razor grooming with premium warm lather',
      'Organic sandalwood beard oil treatment and cold face wrap'
    ],
    rating: 4.8,
    reviewsCount: 93,
    faqs: [
      { question: 'What blades do you use?', answer: 'We use surgically sharp, single-use disposable straight razor blades for maximum precision and 100% hygiene.' }
    ]
  },

  // 10. Nail Care
  {
    id: 'nail-1',
    name: 'Velvet Champagne Spa Manicure & Pedicure',
    category: 'Nail Care',
    price: '$110',
    priceValue: 110,
    duration: '80 Mins',
    durationValue: 80,
    shortDescription: 'Hand & foot luxury ritual with organic white tea sea-salt exfoliation, cuticle care, and gel polish.',
    longDescription: 'Treat your hands and feet to our velvet spa ritual. Features organic non-toxic cuticle trimming, white tea exfoliating scrubs, warm paraffin wax wraps for intense hydration, and a light massage. Finished with high-shine, long-lasting non-toxic organic gel lacquer.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Deeply moisturizing paraffin wax treatment that softens skin cracks',
      'Stimulates micro-circulation in hands and feet, reducing swelling',
      'Skins are hydrated and protected with botanical essential oil barriers'
    ],
    includedServices: [
      'Mineral salt foot bath and hand cleanse',
      'Cuticle trimming, filing, and buffing',
      'Paraffin wax thermal pack',
      'Exfoliating organic salt polish and reflexology massage',
      'Premium organic gel lacquer coat application'
    ],
    rating: 4.7,
    reviewsCount: 71,
    faqs: [
      { question: 'Do you use non-toxic polishes?', answer: 'Yes, we use certified 9-free non-toxic organic gel lacquers that protect and strengthen your nails without harsh chemicals.' }
    ]
  },

  // 11. Waxing
  {
    id: 'waxing-1',
    name: 'Silk Organic Argan-Oil Full Waxing',
    category: 'Waxing',
    price: '$90',
    priceValue: 90,
    duration: '60 Mins',
    durationValue: 60,
    shortDescription: 'Ultra-gentle peel wax infused with Moroccan argan-oil to prevent dermal strain and irritation.',
    longDescription: 'Experience near-painless hair removal. We use a proprietary warm elastic wax enriched with soothing Moroccan argan oil. The wax binds to individual hair roots rather than pulling on the skin barrier, minimizing pain, redness, and irritation.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Extremely gentle on skin, preventing redness or heat burns',
      'Inhibits rapid hair regrowth, keeping skin silk-smooth for weeks',
      'Nourishing argan oil leaves skin supple, soft, and deeply hydrated'
    ],
    includedServices: [
      'Pre-waxing aloe sanitizing cleanse',
      'Peel-wax application with argan-oil base',
      'Soothing post-wax cold chamomile compress',
      'Calming tea tree lotion overlay'
    ],
    rating: 4.5,
    reviewsCount: 42,
    faqs: [
      { question: 'Is this suitable for sensitive skin?', answer: 'Yes, our organic argan oil wax is formulated specifically for highly reactive or sensitive skin to prevent rash and heavy redness.' }
    ]
  },

  // 12. Threading
  {
    id: 'threading-1',
    name: 'Sovereign Eyebrow & Face Threading',
    category: 'Threading',
    price: '$40',
    priceValue: 40,
    duration: '30 Mins',
    durationValue: 30,
    shortDescription: 'Organic cotton threading and alignment of brows, finished with a cooling aloe ice massage.',
    longDescription: 'Sculpt your brows to perfection using the traditional art of organic cotton threading. We map your brow architecture to balance your eye shapes and facial symmetry. Includes full face cleanup, forehead alignment, and a soothing fresh aloe vera ice compress.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'High accuracy brow shape styling without chemical irritation',
      'Removes the finest peach fuzz hairs, leaving skin smooth for makeup',
      'Gentle cold aloe massage that instantly eliminates local redness'
    ],
    includedServices: [
      'Brow geometry and thickness consultation',
      'Organic cotton thread hair removal',
      'Trimming and brushing of thick sections',
      'Fresh cold aloe ice roll treatment'
    ],
    rating: 4.8,
    reviewsCount: 103,
    faqs: [
      { question: 'How long does threading take?', answer: 'Our standard brow and full-face contouring takes approximately 20 to 30 minutes.' }
    ]
  },
  // 13. Kids Services for Boy and Girl
  {
    id: 'kids-haircut-boy',
    name: 'Young Sovereign Kids Haircut',
    category: 'Haircuts',
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
    name: 'Botanical Hair Wash & Nourishing Blow (Boy)',
    category: 'Hair Spa',
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
    id: 'kids-styling-boy',
    name: 'Young Prince Styling & Gel',
    category: 'Hair Styling',
    price: '$35',
    priceValue: 35,
    duration: '20 Mins',
    durationValue: 20,
    shortDescription: 'Fun hair sculpting, spikes, or classic styles using safe organic hair clays.',
    longDescription: 'A quick and playful styling session for boys. We use 100% organic, kid-safe styling clays to sculpt hair into fun spikes, clean pompadours, or modern textures.',
    image: 'https://images.unsplash.com/photo-1595959183075-c1d945103d34?auto=format&fit=crop&w=800&q=80',
    benefits: ['100% hair-safe products', 'Creative styling options', 'Includes organic hair mist'],
    includedServices: ['Gentle brush & mist', 'Styling gel/clay sculpting'],
    rating: 4.7,
    reviewsCount: 15,
    faqs: []
  },
  {
    id: 'kids-haircut-girl',
    name: 'Little Princess Kids Haircut',
    category: 'Haircuts',
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
    name: 'Botanical Hair Wash & Nourishing Blow (Girl)',
    category: 'Hair Spa',
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
    category: 'Hair Styling',
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
  },
  {
    id: 'kids-spa-girl',
    name: 'Little Princess Botanical Spa',
    category: 'Hair Spa',
    price: '$60',
    priceValue: 60,
    duration: '45 Mins',
    durationValue: 45,
    shortDescription: 'Extremely gentle, hydrating face mist and calming scalp rub.',
    longDescription: 'A soothing mini-facial and botanical scalp treatment for girls. Completely hypoallergenic, organic, and non-irritating.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
    benefits: ['Tear-free botanical massage', 'Soothing fresh aloe treatment', 'Calming quiet-room atmosphere'],
    includedServices: ['Gentle scalp reflexology', 'Hydrating organic mask', 'Fresh fruit refreshment'],
    rating: 4.8,
    reviewsCount: 20,
    faqs: []
  }
];
