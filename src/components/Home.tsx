import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  ArrowRight, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  MessageSquare, 
  Plus, 
  Award, 
  ShieldCheck, 
  Star,
  LayoutGrid,
  Cake,
  ChefHat,
  Flame,
  Cookie,
  Gift,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Recipe, CategoryInfo } from '../types';
import { imgBomboloniVanilla, imgPinkFrostedDonut, imgAssortedBoxes, imgOverloadedTubsCollection, INITIAL_CATEGORY_INFOS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY, hasValidMapsKey, BAKERY_LOCATIONS, MapsApiKeyBanner } from './BakeryMapModal';

interface HomeProps {
  recipes: Recipe[];
  categoryInfos?: CategoryInfo[];
  onNavigateToTab: (tab: string, category?: string) => void;
  logo: string;
  websiteName: string;
  websiteSlogan: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  date: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Eleanor Vance',
    role: 'Bride',
    rating: 5,
    comment: 'The Frosting Fairy crafted our three-tiered Wedding Cake. It was not just a dessert; it was a breathtaking work of art. The lavender honey frosting was pure magic!',
    date: 'Just recently'
  },
  {
    id: 't-2',
    name: 'Rohan Malhotra',
    role: 'Birthday Host',
    rating: 5,
    comment: 'The Butterscotch cake is incredible! The handmade butterscotch praline caramel chunks added the perfect crunch. Guests are still asking where I bought it.',
    date: '2 days ago'
  },
  {
    id: 't-3',
    name: 'Sienna Brooks',
    role: 'Gourmet Enthusiast',
    rating: 5,
    comment: 'Their cream cheese glazed cinnamon rolls are out of this world. Piped fresh and delivered warm. Absolutely stellar customer service!',
    date: '1 week ago'
  }
];

const CATEGORY_INFOS = [
  {
    name: 'Signature Cakes',
    emoji: '🎂',
    description: 'Bespoke layered sponge cakes whipped with silky buttercreams, premium chocolates, and fresh organic fruits.',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80',
    itemCountText: 'Premium Tiered Cakes',
    startingPrice: 500,
  },
  {
    name: 'Cupcakes',
    emoji: '🧁',
    description: 'Perfect, beautifully frosted individual treats topped with elegant piping and sprinkles of fairy dust.',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=600&q=80',
    itemCountText: 'Fluffy Personal Swirls',
    startingPrice: 120,
  },
  {
    name: 'Brownies',
    emoji: '🍫',
    description: 'Deep, rich, fudgy squares featuring chocolate-crackle crusts and premium imported Belgian cocoa.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    itemCountText: 'Belgian Chocolate Fudge',
    startingPrice: 150,
  },
  {
    name: 'Cookies',
    emoji: '🍪',
    description: 'Freshly baked artisanal cookies — available in flavour-wise boxes of 6, as well as 6, 12, 18 & 24 cookie assorted boxes.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
    itemCountText: '6 Cookies Box (Flavour-Wise Pricing)',
    startingPrice: 250,
  },
  {
    name: 'Donuts',
    emoji: '🍩',
    description: 'Pillowy yeast-raised ring donuts coated with glossy vanilla, rich caramel, or white chocolate Oreo glazes.',
    image: imgPinkFrostedDonut,
    itemCountText: 'Box of 6 Fluffy Ring Donuts',
    startingPrice: 420,
  },
  {
    name: 'Bombolonis',
    emoji: '🥯',
    description: 'Pillowy, soft Italian yeast donuts rolled in fine sugar and piping-stuffed with custard, strawberry, or Nutella.',
    image: imgBomboloniVanilla,
    itemCountText: 'Box of 6 Filled Bombolonis',
    startingPrice: 420,
  },
  {
    name: 'Overloaded Tubs',
    emoji: '🥣',
    description: 'Decadent layered dessert tubs piled high with rich mousses, crumbles, and toppings — an indulgent treat in every spoonful.',
    image: imgOverloadedTubsCollection,
    itemCountText: '4 Flavours in 250ml & 500ml Tubs',
    startingPrice: 220,
  },
  {
    name: 'New Additions',
    emoji: '✨',
    description: 'Warm, soft, pillowy rolls swirled with sweet cassia cinnamon butter and covered with gourmet glazes.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    itemCountText: 'Warm Cinnamon Rolls & Specials',
    startingPrice: 400,
  },
  {
    name: 'Assorted Boxes',
    emoji: '🎁',
    description: 'Custom artisan gift boxes! Mix and match any confections from our entire menu with live price calculation.',
    image: imgAssortedBoxes,
    itemCountText: 'Custom Assorted Confectionery Box',
    startingPrice: 0,
  }
];

const getCategoryIcon = (name: string) => {
  const iconClass = "w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110 shrink-0 text-brand-pink group-hover:text-white";
  switch (name) {
    case 'All':
      return <LayoutGrid className={iconClass} />;
    case 'Signature Cakes':
      return <Cake className={iconClass} />;
    case 'Cupcakes':
      return <ChefHat className={iconClass} />;
    case 'Brownies':
      return <Flame className={iconClass} />;
    case 'Cookies':
      return <Cookie className={iconClass} />;
    case 'Donuts':
      return <Sparkles className={iconClass} />;
    case 'Bombolonis':
      return <ChefHat className={iconClass} />;
    case 'Overloaded Tubs':
      return <Sparkles className={iconClass} />;
    case 'New Additions':
      return <Sparkles className={iconClass} />;
    case 'Assorted Boxes':
      return <Gift className={iconClass} />;
    default:
      return <Sparkles className={iconClass} />;
  }
};

export default function Home({
  recipes,
  categoryInfos: passedCategoryInfos,
  onNavigateToTab,
  logo,
  websiteName,
  websiteSlogan,
}: HomeProps) {
  const categoryInfos = passedCategoryInfos && passedCategoryInfos.length > 0
    ? passedCategoryInfos
    : INITIAL_CATEGORY_INFOS;
  // --- TESTIMONIAL SYSTEM STATE ---
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('gusto_testimonials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TESTIMONIALS;
      }
    }
    return DEFAULT_TESTIMONIALS;
  });

  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewRole, setReviewRole] = useState('Happy Customer');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('gusto_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  // Handle Review Submission
  // NOTE: Testimonials are saved locally to this browser's localStorage.
  // Until a real backend database is connected, reviews are local-only and not shared with other users.
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newReview: Testimonial = {
      id: `rev-${Date.now()}`,
      name: reviewName.trim(),
      role: reviewRole.trim() || 'Happy Customer',
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: 'Just now'
    };

    setTestimonials((prev) => [newReview, ...prev]);
    setReviewName('');
    setReviewRole('Happy Customer');
    setReviewRating(5);
    setReviewComment('');
    setShowReviewForm(false);
    setSuccessMsg("✨ Thank you for your magical words! Your review is saved locally on this device.");
    setTimeout(() => setSuccessMsg(''), 5000);
    setActiveTestimonialIdx(0); // View the newly added review
  };

  // Auto-scroll testimonials carousel
  useEffect(() => {
    if (showReviewForm) return;
    const interval = setInterval(() => {
      setActiveTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length, showReviewForm]);

  // Pick high resolution hero image
  const heroImage = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1600&q=80";

  return (
    <div id="home-view-container" className="flex-1 flex flex-col bg-brand-cream">
      
      {/* 1. LUXURIOUS HERO SECTION */}
      <section id="home-hero" className="relative min-h-[550px] lg:min-h-[650px] py-16 lg:py-20 overflow-hidden bg-brand-cocoa flex flex-col items-center justify-center text-center px-4 border-b-4 border-brand-pink">
        {/* Absolute Background Image with parallax overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Artisanal Cake Showcase" 
            fetchPriority="high"
            className="w-full h-full object-cover opacity-25 scale-105 transition-all duration-10000"
          />
          <div className="absolute inset-0 bg-brand-cocoa/70" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-6xl w-full mx-auto space-y-8 text-white px-2 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="w-16 h-16 rounded-full border-2 border-brand-pink/60 p-0.5 bg-white/10 backdrop-blur-xs">
              <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-brand-pink-light block">
              {websiteSlogan}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-none text-center"
          >
            Handcrafted <span className="text-brand-pink animate-pulse">Magic</span>,<br />
            Baked For Life's Milestones
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm sm:text-base text-brand-cream-light/90 max-w-2xl mx-auto leading-relaxed font-sans text-center"
          >
            Welcome to <span className="font-bold text-white uppercase">{websiteName}</span>. We translate sweet dreams into luxury confectionery—using fine organic ingredients, bespoke recipes, and custom hand-piped decorations.
          </motion.p>
        </div>
      </section>

      {/* 4. PREMIUM QUICK CATEGORY FILTERS & PORTAL COVERS */}
      <section id="home-collections-portal" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-brand-cocoa-border/20">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-pink font-bold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-brand-pink animate-pulse" />
            <span>the magic oven collections</span>
          </span>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-brand-cocoa uppercase tracking-tight">
            Our Fairy Confections
          </h3>
          <p className="text-xs sm:text-sm text-brand-cocoa-light/90 leading-relaxed font-sans">
            Filter and explore our specialised confections. Select a category below to sift through specific recipes, multiple attractive product pictures, and exact custom sizing and pricing details.
          </p>
        </div>

        {/* Premium quick category filters: vertical stack on mobile, horizontal row on larger screens */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 mb-10 w-full max-w-sm sm:max-w-none mx-auto px-4 sm:px-0">
          {['All', ...categoryInfos.map(c => c.name)].map((catName, cIdx) => {
            return (
              <button
                key={`home-cat-filter-${catName}-${cIdx}`}
                onClick={() => onNavigateToTab('discover', catName)}
                className="group w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-full border border-brand-cocoa-border/60 hover:border-brand-pink bg-white hover:bg-brand-pink text-brand-cocoa hover:text-white transition-all cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-center sm:justify-start gap-2.5 text-xs font-semibold"
              >
                {getCategoryIcon(catName)}
                <span className="font-sans tracking-tight">{catName}</span>
              </button>
            );
          })}
        </div>

        {/* Highlighted Product Category Cover Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {categoryInfos.map((cat, idx) => {
            const displayImg = cat.imageUrl || cat.image;
            const hasImg = Boolean(displayImg && displayImg.trim() !== '');

            return (
              <motion.div
                key={`home-cat-cover-${cat.name}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => onNavigateToTab('discover', cat.name)}
                className="bg-white rounded-2xl border border-brand-cocoa-border overflow-hidden shadow-xs hover:shadow-md hover:border-brand-pink/40 transition-all duration-350 cursor-pointer group flex flex-col"
              >
                {/* Visual Category Photo Overlay or Clean Soft Placeholder */}
                <div className="h-56 overflow-hidden relative bg-gradient-to-br from-brand-cream-light via-brand-pink-light/20 to-brand-cream">
                  {hasImg ? (
                    <>
                      <img
                        src={displayImg}
                        alt={cat.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            const placeholder = parent.querySelector('.category-fallback-ph');
                            if (placeholder) (placeholder as HTMLElement).classList.remove('hidden');
                          }
                        }}
                        className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                      />
                      <div className="category-fallback-ph hidden absolute inset-0 bg-gradient-to-br from-brand-cream via-brand-pink-light/40 to-brand-cream-light flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-white/95 border border-brand-pink/30 flex items-center justify-center text-2xl shadow-sm mb-2">
                          {cat.emoji || '✨'}
                        </div>
                        <span className="font-display font-bold text-sm text-brand-cocoa uppercase tracking-wide">
                          {cat.name}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-cream via-brand-pink-light/35 to-brand-cream-light flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/95 border border-brand-pink/30 flex items-center justify-center text-3xl shadow-sm mb-3 transition-transform group-hover:scale-110">
                        {cat.emoji || '✨'}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-pink mb-1">
                        ✨ {cat.itemCountText}
                      </span>
                      <h4 className="font-display font-black text-lg text-brand-cocoa uppercase tracking-tight">
                        {cat.name}
                      </h4>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-pink-light/95 flex items-center gap-1.5 mb-1">
                      <span>✨ {cat.itemCountText}</span>
                    </span>
                    <h4 className="font-display font-black text-xl text-white uppercase tracking-tight">
                      {cat.name}
                    </h4>
                  </div>
                  {/* Hover Floating action indicator */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs w-9 h-9 rounded-full border border-brand-cocoa-border/40 flex items-center justify-center text-brand-cocoa opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-brand-pink" />
                  </div>
                </div>

                {/* Info details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-brand-cocoa-light leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-brand-cocoa-border/30">
                    <span className="text-[9px] font-mono text-brand-cocoa-light/70 uppercase">Starting From</span>
                    <span className="text-sm font-sans font-semibold text-brand-pink">
                      ₹{cat.startingPrice}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 2. CALL-TO-ACTION PORTALS SECTION */}
      <section id="home-cta-portals" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
          {/* PORTAL 1: EXPLORE OUR MENU */}
          <div 
            onClick={() => onNavigateToTab('discover', 'All')}
            className="group relative overflow-hidden rounded-3xl border-2 border-brand-pink/30 hover:border-brand-pink bg-brand-cocoa/85 backdrop-blur-md p-8 sm:p-10 text-left transition-all duration-300 hover:shadow-[0_20px_50px_rgba(236,72,153,0.15)] cursor-pointer flex flex-col justify-between min-h-[300px] sm:min-h-[340px] transform hover:-translate-y-2"
          >
            {/* Background decorative image with hover zoom */}
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80" 
                alt="Pastry Menu background" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-cocoa via-brand-cocoa/40 to-transparent opacity-80 z-0" />
            
            <div className="relative z-10 space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-full bg-brand-pink/25 text-brand-pink-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Fresh Baked Daily
              </span>
              <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight leading-none group-hover:text-brand-pink transition-colors">
                Explore <br />Our Menu
              </h3>
              <p className="text-xs sm:text-sm text-brand-cream-light/90 leading-relaxed font-sans max-w-md">
                Delve into our freshly-baked cupcakes, dense cocoa brownies, custom cinnamon rolls, and gourmet additions. Customize flavors, portion sizes, and frostings dynamically.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <button className="inline-flex items-center gap-2.5 px-8 py-4 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-pink/20 cursor-pointer group-hover:scale-[1.05]">
                <span>See What's Baking</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </button>
            </div>
          </div>

          {/* PORTAL 2: ORDER CUSTOM CAKES */}
          <div 
            onClick={() => onNavigateToTab('discover', 'Signature Cakes')}
            className="group relative overflow-hidden rounded-3xl border-2 border-brand-pink/30 hover:border-brand-pink bg-brand-cocoa/85 backdrop-blur-md p-8 sm:p-10 text-left transition-all duration-300 hover:shadow-[0_20px_50px_rgba(236,72,153,0.15)] cursor-pointer flex flex-col justify-between min-h-[300px] sm:min-h-[340px] transform hover:-translate-y-2"
          >
            {/* Background decorative image with hover zoom */}
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80" 
                alt="Custom Cake background" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-cocoa via-brand-cocoa/40 to-transparent opacity-80 z-0" />

            <div className="relative z-10 space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-full bg-brand-pink/25 text-brand-pink-light font-mono text-[10px] font-bold uppercase tracking-wider">
                Bespoke Artistry
              </span>
              <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight leading-none group-hover:text-brand-pink transition-colors">
                Order <br />Custom Cakes
              </h3>
              <p className="text-xs sm:text-sm text-brand-cream-light/90 leading-relaxed font-sans max-w-md">
                Collaborate directly with our master pastry architects. Design luxurious tiered wedding cakes, milestone birthday layers, themed centerpieces, and custom sugar plaques.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <button className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/10 group-hover:bg-brand-pink group-hover:text-white border border-white/30 group-hover:border-brand-pink text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer group-hover:scale-[1.05]">
                <span>Consult & Order Custom Cake</span>
                <Sparkles className="w-4 h-4 text-brand-pink group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* 2. THE BRAND VISION STORY */}
      <section id="home-story-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border-t border-brand-cocoa-border/20">
        
        {/* Left Column: Visual Grid of Baking Mastery */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-brand-pink/10 rounded-full blur-xl" />
          <div className="space-y-4">
            <div className="h-64 rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=400&q=80" 
                alt="Finely decorated cake" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-44 rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=400&q=80" 
                alt="Fluffy cupcakes" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="h-44 rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80" 
                alt="Gourmet bakes" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-64 rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80" 
                alt="Chocolate brownies" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Narrative of the Fairy Kitchen */}
        <div className="lg:col-span-6 text-left space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-pink font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-brand-pink" />
              <span>Our Secret Philosophy</span>
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-cocoa uppercase tracking-tight leading-tight">
              Deep Inside The Fairy Kitchen
            </h2>
          </div>

          <p className="text-sm text-brand-cocoa-light leading-relaxed font-sans">
            Every celebration deserves an extraordinary masterpiece. For years, <strong>{websiteName}</strong> has redefined artisanal confectionery. We are not a factory; we are an boutique studio where master pastry architects design and decorate bakes custom-tailored to your heart's desires.
          </p>

          <p className="text-sm text-brand-cocoa-light leading-relaxed font-sans">
            Whether it is an organic, sugar-reduced chocolate truffle birthday cake or melt-in-the-mouth, double-chocolate Oreo fudge brownies, our oven remains warm, whipping and piping with absolute devotion.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-dashed border-brand-cocoa-border/60">
            <div>
              <span className="font-display font-black text-2xl text-brand-pink block">100%</span>
              <span className="text-[9px] font-mono uppercase text-brand-cocoa-light tracking-wider">Organic Dairy</span>
            </div>
            <div className="border-l border-brand-cocoa-border/40 pl-4">
              <span className="font-display font-black text-2xl text-brand-pink block">5,000+</span>
              <span className="text-[9px] font-mono uppercase text-brand-cocoa-light tracking-wider">Happy Events</span>
            </div>
            <div className="border-l border-brand-cocoa-border/40 pl-4">
              <span className="font-display font-black text-2xl text-brand-pink block">0 Preservatives</span>
              <span className="text-[9px] font-mono uppercase text-brand-cocoa-light tracking-wider">Always Baked Fresh</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab('discover', 'All')}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-extrabold text-brand-pink hover:text-brand-pink-dark transition-colors cursor-pointer"
            >
              <span>See Our Entire Creation Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>


      {/* 3. THE THREE PILLARS OF CULINARY EXCELLENCE */}
      <section id="home-pillars-section" className="bg-white border-y border-brand-cocoa-border py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-pink font-bold">Uncompromising Standard</span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-brand-cocoa uppercase tracking-tight">How We Orchestrate Delight</h3>
            <p className="text-xs sm:text-sm text-brand-cocoa-light/90 font-sans">
              We stand firm on three key quality principles that ensure every package you carry home is a delicious masterwork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-brand-cream-light/35 p-6 rounded-2xl border border-brand-cocoa-border text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-pink/15 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-brand-cocoa">1. Superlative Ingredients</h4>
              <p className="text-xs text-brand-cocoa-light leading-relaxed font-sans">
                We strictly ban synthetic shortcuts, margarine, or artificial flavors. Our pantry features fine Madagascar vanilla pods, premium Belgian Callebaut cocoa, and grass-fed butter.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-brand-cream-light/35 p-6 rounded-2xl border border-brand-cocoa-border text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-pink/15 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-brand-cocoa">2. Tailored Artistry</h4>
              <p className="text-xs text-brand-cocoa-light leading-relaxed font-sans">
                No cookie-cutter designs. We consult with you to coordinate colors, write customized luxury messages, and craft beautiful hand-piped finishes matching your party aesthetics.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-brand-cream-light/35 p-6 rounded-2xl border border-brand-cocoa-border text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-pink/15 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-brand-cocoa">3. Fresh Ingress Tracking</h4>
              <p className="text-xs text-brand-cocoa-light leading-relaxed font-sans">
                With our live checkout dashboard and custom Order Tracker, you monitor your order status in real time from confirmation, through the baking oven, to final hand-delivery.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 5. INTERACTIVE CLIENT REVIEWS & LOVE NOTES */}
      <section id="home-reviews-section" className="bg-brand-cream-light/60 border-t border-brand-cocoa-border/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-pink font-bold">Guest Book</span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-brand-cocoa uppercase tracking-tight">Love Notes From The Table</h3>
          </div>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-xs font-sans max-w-lg mx-auto shadow-xs text-left animate-in fade-in">
              {successMsg}
            </div>
          )}

          {/* Testimonial Active Slider Display */}
          <div className="bg-white border border-brand-cocoa-border rounded-2xl p-6 sm:p-10 shadow-xs relative overflow-hidden text-left">
            <div className="absolute right-6 top-6 text-brand-pink/15 font-serif font-black text-7xl select-none leading-none">
              “
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonialIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: testimonials[activeTestimonialIdx].rating }).map((_, i) => (
                    <Star key={`testimonial-star-${activeTestimonialIdx}-${i}`} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-brand-cocoa italic leading-relaxed font-sans">
                  "{testimonials[activeTestimonialIdx].comment}"
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="font-display font-bold text-xs text-brand-cocoa block uppercase tracking-wider">
                      {testimonials[activeTestimonialIdx].name}
                    </span>
                    <span className="text-[10px] font-mono text-brand-cocoa-light/80 uppercase block">
                      {testimonials[activeTestimonialIdx].role}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-brand-cocoa-light/60">
                    {testimonials[activeTestimonialIdx].date}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="flex justify-center gap-1.5 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={`testimonial-dot-${idx}`}
                  onClick={() => setActiveTestimonialIdx(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeTestimonialIdx === idx 
                      ? 'bg-brand-pink w-6' 
                      : 'bg-brand-cocoa-border/60 hover:bg-brand-cocoa-light'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Expandable Write A Review Widget */}
          <div className="pt-2 max-w-lg mx-auto">
            {!showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-cocoa text-brand-cream hover:bg-brand-cocoa-light text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-brand-pink" />
                <span>Write Your Own Love Note</span>
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleAddReview}
                className="bg-white border border-brand-cocoa-border rounded-2xl p-6 text-left space-y-4 shadow-md"
              >
                <h4 className="font-display font-bold text-sm text-brand-cocoa uppercase tracking-wider border-b border-brand-cocoa-border/20 pb-2 flex items-center justify-between">
                  <span>Draft Your Review</span>
                  <button 
                    type="button" 
                    onClick={() => setShowReviewForm(false)} 
                    className="text-xs text-brand-cocoa-light hover:text-brand-cocoa font-mono uppercase font-bold"
                  >
                    Cancel
                  </button>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-brand-cocoa-light block">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Alice Carter" 
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-brand-cream-light/30 border border-brand-cocoa-border rounded-lg text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-brand-cocoa-light block">Your Occasion / Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Anniversary host, Customer" 
                      value={reviewRole}
                      onChange={(e) => setReviewRole(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-brand-cream-light/30 border border-brand-cocoa-border rounded-lg text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-brand-cocoa-light block">Rating</label>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={`review-rating-star-${val}`}
                        onClick={() => setReviewRating(val)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${val <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="text-[10px] text-brand-cocoa-light font-mono font-bold ml-2">({reviewRating}/5 stars)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-brand-cocoa-light block">Your Love Note / Experience</label>
                  <textarea 
                    rows={3} 
                    required
                    placeholder="Describe how the confectionery tasted, the visual design, or the delivery..." 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-3 text-xs bg-brand-cream-light/30 border border-brand-cocoa-border rounded-lg text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Cast Fairy Review Spells
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </section>

      {/* --- GOOGLE MAPS BOUTIQUE & STUDIO LOCATOR SECTION --- */}
      <section id="home-bakery-maps-section" className="py-16 bg-white border-t border-brand-cocoa-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-pink/10 border border-brand-pink/20 rounded-full text-brand-pink text-xs font-bold font-mono uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Interactive Google Maps</span>
            </div>
            <h2 className="font-serif font-black text-3xl md:text-4xl text-brand-cocoa tracking-tight">
              Visit Our Patisserie Boutiques
            </h2>
            <p className="mt-3 text-sm md:text-base text-brand-cocoa/80">
              Experience the aroma of freshly baked confections, sample cake layers, and pick up your artisanal orders directly.
            </p>
          </div>

          <div className="bg-brand-cream/60 rounded-3xl border border-brand-cocoa-border overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12">
            {/* Left Locations Directory */}
            <div className="lg:col-span-4 p-6 md:p-8 space-y-4 border-b lg:border-b-0 lg:border-r border-brand-cocoa-border flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-lg text-brand-cocoa">
                  Bakery Kitchens & Studios
                </h3>
                {BAKERY_LOCATIONS.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-4 rounded-2xl bg-white border border-brand-cocoa-border/70 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-brand-cocoa">{loc.name}</span>
                      {loc.isMain && (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-brand-pink text-white rounded-full">
                          Main Studio
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-cocoa/80 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5" />
                      {loc.address}
                    </p>
                    <div className="text-[11px] text-brand-cocoa/70 space-y-1 font-mono pt-1">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-brand-pink" />
                        {loc.hours}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-brand-pink" />
                        {loc.phone}
                      </p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${loc.position.lat},${loc.position.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-pink hover:text-brand-pink-dark hover:underline"
                    >
                      <Navigation className="w-3 h-3" />
                      Get Directions on Google Maps
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-brand-pink/10 border border-brand-pink/20 text-xs text-brand-cocoa space-y-1 mt-4">
                <p className="font-bold text-brand-pink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Citywide Express Delivery
                </p>
                <p className="text-[11px] text-brand-cocoa/80 leading-relaxed">
                  All cakes and custom boxes are transported in temperature-shielded delivery vehicles with real-time GPS tracking.
                </p>
              </div>
            </div>

            {/* Right Map Canvas Container */}
            <div className="lg:col-span-8 min-h-[420px] relative bg-brand-cream flex flex-col justify-center">
              {hasValidMapsKey ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
                  <Map
                    defaultCenter={BAKERY_LOCATIONS[0].position}
                    defaultZoom={12}
                    mapId="FROSTING_FAIRY_HOME_MAP"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%', minHeight: '420px' }}
                  >
                    {BAKERY_LOCATIONS.map((loc) => (
                      <AdvancedMarker
                        key={loc.id}
                        position={loc.position}
                        title={loc.name}
                      >
                        <Pin
                          background={loc.isMain ? '#D45B7A' : '#6B3E26'}
                          glyphColor="#FFFFFF"
                          borderColor="#FFFFFF"
                          scale={1.1}
                        />
                      </AdvancedMarker>
                    ))}
                  </Map>
                </APIProvider>
              ) : (
                <div className="p-8">
                  <MapsApiKeyBanner />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
