export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tag: string;
  themeColor: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-interior',
    title: 'The Salon Space',
    category: 'Interior & Atmosphere',
    description: 'Orderly styling stations, calm ambient lighting, and comfortable seating.',
    tag: 'Clean Environment',
    themeColor: 'from-[#1e2025] to-[#121417]',
  },
  {
    id: 'gal-haircut',
    title: 'Haircut & Scissor Work',
    category: 'Hair Grooming',
    description: 'Personal styling and scissor trimming for a natural, clean drape.',
    tag: 'Classic Cut',
    themeColor: 'from-[#25221d] to-[#141312]',
  },
  {
    id: 'gal-beard',
    title: 'Straight Razor & Shave',
    category: 'Beard Grooming',
    description: 'Clean foam lather, single-blade razor shaving, and neat beard line contouring.',
    tag: 'Traditional Shave',
    themeColor: 'from-[#1f2322] to-[#111413]',
  },
  {
    id: 'gal-massage',
    title: 'Head Massage (Champi)',
    category: 'Scalp Care',
    description: 'Rhythmic finger pressure and hair oil massage to help relax after a long day.',
    tag: 'Scalp Relaxation',
    themeColor: 'from-[#27211d] to-[#161210]',
  },
  {
    id: 'gal-tools',
    title: 'Barbering Equipment',
    category: 'Equipment & Cleanliness',
    description: 'Clean steel shears, fresh combs, and dedicated clippers arranged for each client.',
    tag: 'Orderly Setup',
    themeColor: 'from-[#202128] to-[#121318]',
  },
  {
    id: 'gal-home',
    title: 'Home Service Visit',
    category: 'Doorstep Service',
    description: 'Mobile grooming equipment brought to your residence upon prior booking.',
    tag: 'Doorstep Grooming',
    themeColor: 'from-[#251f22] to-[#141113]',
  },
];
