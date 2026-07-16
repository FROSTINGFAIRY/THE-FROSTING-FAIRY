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
  Star 
} from 'lucide-react';
import { Recipe } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HomeProps {
  recipes: Recipe[];
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

export default function Home({
  recipes,
  onNavigateToTab,
  logo,
  websiteName,
  websiteSlogan,
}: HomeProps) {
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
    setSuccessMsg('✨ Thank you for your magical words! Your review is published instantly.');
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
      <section id="home-hero" className="relative h-[550px] lg:h-[620px] overflow-hidden bg-brand-cocoa flex items-center justify-center text-center px-4">
        {/* Absolute Background Image with parallax overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Artisanal Cake Showcase" 
            className="w-full h-full object-cover opacity-35 scale-105 transition-all duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-brand-cocoa/50 to-brand-cream" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-white px-2">
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
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-none"
          >
            Handcrafted <span className="text-brand-pink">Magic</span>,<br />
            Baked For Life's Milestones
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm sm:text-base text-brand-cream-light/90 max-w-2xl mx-auto leading-relaxed font-sans"
          >
            Welcome to <span className="font-bold text-white uppercase">{websiteName}</span>. We translate sweet dreams into luxury confectionery—using fine organic ingredients, bespoke recipes, and custom hand-piped decorations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => onNavigateToTab('discover', 'All')}
              className="px-8 py-3.5 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-extrabold uppercase tracking-widest rounded-full transition-all shadow-lg hover:shadow-brand-pink/20 flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigateToTab('discover', 'Signature Cakes')}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-extrabold uppercase tracking-widest rounded-full transition-all backdrop-blur-xs cursor-pointer"
            >
              Order Custom Cakes
            </button>
          </motion.div>
        </div>

        {/* Curved Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-brand-cream" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />
      </section>


      {/* 2. THE BRAND VISION STORY */}
      <section id="home-story-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Visual Grid of Baking Mastery */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
          <div className="absolute -left-4 -top-4 w-12 h-12 bg-brand-pink/10 rounded-full blur-xl" />
          <div className="space-y-4">
            <div className="h-64 rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=400&q=80" 
                alt="Finely decorated cake" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-44 rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=400&q=80" 
                alt="Fluffy cupcakes" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="h-44 rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80" 
                alt="Gourmet bakes" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-64 rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80" 
                alt="Chocolate brownies" 
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


      {/* 4. CURATED COLLECTIONS OVERVIEW */}
      <section id="home-collections-portal" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-pink font-bold">Chef's Signature Selections</span>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-brand-cocoa uppercase tracking-tight">Our Curated Portals</h3>
          <p className="text-xs sm:text-sm text-brand-cocoa-light/90 font-sans">
            Choose a specialized collection and begin custom tailoring your order size, flavor profiles, and frostings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              name: 'Signature Cakes',
              image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=400&q=80',
              tagline: 'Stately celebrations',
              btnText: 'Sift Layered Cakes'
            },
            {
              name: 'Cupcakes',
              image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=400&q=80',
              tagline: 'Artful single servings',
              btnText: 'Sift Cupcakes'
            },
            {
              name: 'Brownies',
              image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',
              tagline: 'Decadent fudge bites',
              btnText: 'Sift Brownies'
            },
            {
              name: 'New Additions',
              image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=400&q=80',
              tagline: 'Fresh daily donuts',
              btnText: 'Sift Bakery Specials'
            }
          ].map((col) => (
            <div 
              key={col.name} 
              className="bg-white border border-brand-cocoa-border rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-brand-pink/30 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="h-44 overflow-hidden bg-brand-cream-light">
                <img 
                  src={col.image} 
                  alt={col.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-brand-pink block">{col.tagline}</span>
                  <h4 className="font-display font-bold text-base text-brand-cocoa mt-0.5">{col.name}</h4>
                </div>
                <button
                  onClick={() => onNavigateToTab('discover', col.name)}
                  className="w-full py-2 bg-brand-cream-light/60 hover:bg-brand-pink hover:text-white text-[10px] font-mono uppercase tracking-wider font-extrabold text-brand-cocoa rounded-lg transition-all border border-brand-cocoa-border/40 hover:border-brand-pink flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{col.btnText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
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
                    <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
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
                  key={idx}
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
                        key={val}
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


      {/* 6. INTERACTIVE BOUTIQUE STORE LOCATOR */}
      <section id="home-locator-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-brand-cocoa-border/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Contact and Boutique Hours details */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-pink font-bold">Come Say Hello</span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-brand-cocoa uppercase tracking-tight">Our Boutique Confectionery</h3>
              <p className="text-xs sm:text-sm text-brand-cocoa-light/90 leading-relaxed font-sans">
                Visit our magical physical parlor to consult on bespoke tiered designs, taste fresh frosting combinations, or collect pre-ordered customized bakes.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0 mt-0.5 border border-brand-pink/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-cocoa">Boutique Address</h4>
                  <p className="text-xs text-brand-cocoa-light mt-0.5 leading-relaxed font-sans">
                    12, Seraphina Gardens, Lane 3-A,<br />
                    Royal Pastry Boulevard, Mumbai, MH - 400012
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0 mt-0.5 border border-brand-pink/20">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-cocoa">Collection & Store Hours</h4>
                  <p className="text-xs text-brand-cocoa-light mt-0.5 font-sans">
                    Mon - Sat: 10:00 AM – 08:00 PM <br />
                    Sunday: 11:00 AM – 05:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0 mt-0.5 border border-brand-pink/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-cocoa">Gourmet Hotline</h4>
                  <p className="text-xs text-brand-cocoa-light mt-0.5 font-sans">
                    Inquiries: <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink font-bold hover:underline">hellofrostingfairy@gmail.com</a><br />
                    Phone: <span className="font-mono text-brand-pink font-bold">+91 98765 43210</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Mumbai+Boutique+Bakery"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cocoa text-brand-cream hover:bg-brand-cocoa-light text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <MapPin className="w-4 h-4 text-brand-pink" />
                <span>Get Interactive Directions</span>
              </a>
            </div>
          </div>

          {/* Right: Immersive interactive mockup of Google Maps */}
          <div className="lg:col-span-7 h-[300px] sm:h-[350px] bg-white rounded-2xl border border-brand-cocoa-border overflow-hidden relative shadow-xs p-1">
            <div className="w-full h-full rounded-xl bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center text-center p-6 border border-dashed border-brand-cocoa-border/60">
              {/* Fake grid map visualization using stylish SVG map lines */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect width="40" height="40" fill="none" />
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                {/* Simulated streets */}
                <div className="absolute top-[35%] left-0 right-0 h-4 bg-slate-600/30" />
                <div className="absolute top-0 bottom-0 left-[45%] w-4 bg-slate-600/30" />
                <div className="absolute top-0 bottom-0 left-[15%] w-2 bg-slate-600/30 rotate-12" />
                <div className="absolute top-[70%] left-0 right-0 h-3 bg-slate-600/30 -rotate-6" />
              </div>

              {/* Floating Map Pin info block */}
              <div className="relative z-10 bg-white border border-brand-cocoa-border p-4 rounded-xl shadow-md max-w-xs space-y-2 text-left">
                <div className="flex items-center gap-1.5 text-brand-pink font-bold text-xs uppercase font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-pink animate-ping shrink-0" />
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>The Frosting Fairy</span>
                </div>
                <p className="text-[10px] text-brand-cocoa-light leading-relaxed font-sans">
                  Suite 12, Seraphina Gardens, Lane 3-A, Royal Pastry Boulevard, Mumbai.
                </p>
                <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase border-t border-brand-cream/80 pt-2 text-brand-pink-dark">
                  <span>★ 4.9 Rating</span>
                  <span>Open Now</span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-brand-cocoa/90 backdrop-blur-xs text-white px-3 py-2 rounded-xl text-[9px] font-mono uppercase tracking-wider shadow-md">
                <span>Satellite View Connected</span>
                <span className="text-emerald-400 font-bold">● Active GPS</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
