import React, { useState, useMemo } from 'react';
import { Search, Flame, Clock, ChefHat, Star, Heart, ArrowRight, ChevronLeft, ChevronRight, ArrowLeft, Sparkles, LayoutGrid, Cake, Cookie } from 'lucide-react';
import { Recipe } from '../types';
import { motion } from 'motion/react';

// Custom helper to render premium SVG icons for categories instead of emojis
const getCategoryIcon = (name: string, isActive: boolean) => {
  const iconClass = `w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110 shrink-0 ${
    isActive ? 'text-white' : 'text-brand-pink'
  }`;
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
    case 'New Additions':
      return <Sparkles className={iconClass} />;
    default:
      return <Sparkles className={iconClass} />;
  }
};

// Predefined extra images for each category to guarantee that every confection 
// has multiple gorgeous, high-resolution product photos.
export function getRecipeImages(recipe: { id: string; category: string; image: string }): string[] {
  const defaultImages = {
    'Signature Cakes': [
      'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586985289688-ca9cf499150a?auto=format&fit=crop&w=800&q=80',
    ],
    'Cupcakes': [
      'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?auto=format&fit=crop&w=800&q=80',
    ],
    'Brownies': [
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1624353365286-3f8d62dade37?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515003844-1098154e7f54?auto=format&fit=crop&w=800&q=80',
    ],
    'Cookies': [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558961309-dbdf03b33fc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    ],
    'Donuts': [
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&w=800&q=80',
    ],
    'Bombolonis': [
      'https://images.unsplash.com/photo-1557827983-012eb6ea8dc1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530631673369-bc20fdb3228d?auto=format&fit=crop&w=800&q=80',
    ],
    'New Additions': [
      'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
    ]
  };

  const cat = recipe.category || 'New Additions';
  const list = defaultImages[cat as keyof typeof defaultImages] || defaultImages['New Additions'];

  const result = [recipe.image];
  for (const img of list) {
    if (img !== recipe.image && result.length < 4) {
      result.push(img);
    }
  }

  while (result.length < 4 && list.length > 0) {
    result.push(list[result.length % list.length]);
  }

  return result;
}

const CATEGORY_INFOS = [
  {
    name: 'Signature Cakes',
    emoji: '🎂',
    description: 'Bespoke layered sponge cakes whipped with silky buttercreams, premium chocolates, and fresh organic fruits.',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=600&q=80',
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
    description: 'Warm, crispy on the outside, and incredibly soft-chewy on the inside, stuffed with premium chocolate chunks.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
    itemCountText: 'Artisanal Chewy Cookies',
    startingPrice: 90,
  },
  {
    name: 'Donuts',
    emoji: '🍩',
    description: 'Pillowy yeast-raised ring donuts coated with glossy vanilla, rich caramel, or white chocolate Oreo glazes.',
    image: 'https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?auto=format&fit=crop&w=600&q=80',
    itemCountText: 'Box of 6 Fluffy Ring Donuts',
    startingPrice: 420,
  },
  {
    name: 'Bombolonis',
    emoji: '🥯',
    description: 'Pillowy, soft Italian yeast donuts rolled in fine sugar and piping-stuffed with custard, strawberry, or Nutella.',
    image: 'https://images.unsplash.com/photo-1557827983-012eb6ea8dc1?auto=format&fit=crop&w=600&q=80',
    itemCountText: 'Box of 6 Filled Bombolonis',
    startingPrice: 420,
  },
  {
    name: 'New Additions',
    emoji: '✨',
    description: 'Warm, soft, pillowy rolls swirled with sweet cassia cinnamon butter and covered with gourmet glazes.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    itemCountText: 'Warm Cinnamon Rolls & Specials',
    startingPrice: 400,
  }
];

interface DashboardProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  logo: string;
  websiteName: string;
  websiteSlogan: string;
}

export default function Dashboard({
  recipes,
  onSelectRecipe,
  onToggleFavorite,
  activeCategory,
  setActiveCategory,
  logo,
  websiteName,
  websiteSlogan,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeImageIndexes, setRecipeImageIndexes] = useState<Record<string, number>>({});

  // Choose a recipe of the day (e.g., Cream Cheese Glaze Cinnamon Rolls as featured item)
  const heroRecipe = useMemo(() => {
    return recipes.find((r) => r.id === 'add-roll-cream-cheese') || recipes[0];
  }, [recipes]);

  // Categories matching the image categories
  const categories = [
    { name: 'All', emoji: '✨' },
    { name: 'Signature Cakes', emoji: '🎂' },
    { name: 'Cupcakes', emoji: '🧁' },
    { name: 'Brownies', emoji: '🍫' },
    { name: 'Cookies', emoji: '🍪' },
    { name: 'Donuts', emoji: '🍩' },
    { name: 'Bombolonis', emoji: '🥯' },
    { name: 'New Additions', emoji: '✨' },
  ];

  // Filter recipes based on category and search query
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory;
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [recipes, activeCategory, searchQuery]);

  return (
    <div id="dashboard-root" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-brand-cream">
      {/* Top Header */}
      <header id="dashboard-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div id="header-greetings" className="flex items-center gap-4 text-left">
          <div className="w-16 h-16 rounded-full border border-brand-cocoa-border overflow-hidden bg-white shadow-xs shrink-0 p-0.5">
            <img src={logo} alt="The Frosting Fairy Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h2 id="welcome-title" className="font-display font-black text-3xl text-brand-cocoa tracking-tight uppercase">
              {websiteName}
            </h2>
            <p id="welcome-subtitle" className="text-xs font-mono uppercase tracking-widest text-brand-pink-dark mt-1 font-bold">
              {websiteSlogan}
            </p>
          </div>
        </div>

        {/* Modern Search Bar */}
        <div id="search-bar-container" className="relative w-full md:w-80">
          <Search id="search-icon" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cocoa-light/60" />
          <input
            id="input-search-recipes"
            type="text"
            placeholder="Search ingredients, names, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-brand-cocoa-border rounded-xl text-sm text-brand-cocoa placeholder-brand-cocoa-light/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-brand-cocoa-light hover:text-brand-cocoa px-1.5 py-0.5 rounded hover:bg-brand-pink-light"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Hero Recipe of the Day Banner - Hide if search is active or non-All category is selected to focus on filtered list */}
      {searchQuery === '' && activeCategory === 'All' && heroRecipe && (
        <motion.div
          id="hero-recipe-banner"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white rounded-2xl border border-brand-cocoa-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Image Left Side */}
          <div id="hero-image-wrapper" className="lg:col-span-7 h-64 lg:h-96 relative overflow-hidden">
            <img
              id="hero-recipe-image"
              src={heroRecipe.image}
              alt={heroRecipe.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Badges on Hero Image */}
            <div id="hero-badges" className="absolute top-4 left-4 flex gap-2">
              <span id="hero-badge-today" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider font-mono text-white bg-brand-pink rounded-full shadow-sm animate-bounce">
                ★ Fairy Bestseller
              </span>
              <span id="hero-badge-difficulty" className="px-3 py-1 text-xs font-semibold font-sans bg-white/95 text-brand-cocoa backdrop-blur-sm rounded-full shadow-sm border border-brand-cocoa-border/40">
                Fresh Daily
              </span>
            </div>
          </div>

          {/* Details Right Side */}
          <div id="hero-details-wrapper" className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between bg-white">
            <div id="hero-text-content">
              <div id="hero-rating-row" className="flex items-center gap-1.5 mb-3 text-xs text-amber-500 font-semibold font-sans">
                <Star id="hero-star-icon" className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span id="hero-rating-score">{heroRecipe.rating}</span>
                <span id="hero-votes-count" className="text-brand-cocoa-light">({heroRecipe.votes} reviews)</span>
              </div>
              <h3 id="hero-recipe-title" className="font-display font-bold text-2xl lg:text-3xl text-brand-cocoa tracking-tight leading-snug">
                {heroRecipe.name}
              </h3>
              <p id="hero-recipe-desc" className="text-sm text-brand-cocoa-light mt-3 line-clamp-3 leading-relaxed">
                {heroRecipe.description}
              </p>

              {/* Cooking Quick Stats */}
              <div id="hero-quick-stats" className="flex items-center gap-4 mt-6 border-y border-dashed border-brand-cocoa-border py-3.5">
                <div id="hero-stat-time" className="flex flex-col justify-center">
                  <span className="text-[10px] font-mono text-brand-cocoa-light uppercase tracking-wider">Starting at</span>
                  <span id="hero-time-value" className="text-base font-sans font-semibold text-brand-pink">
                    ₹{heroRecipe.priceOptions?.[0]?.price || 0}
                  </span>
                </div>
                <div id="hero-stat-calories" className="flex flex-col justify-center border-l border-brand-cocoa-border/40 pl-4">
                  <span className="text-[10px] font-mono text-brand-cocoa-light uppercase tracking-wider">Portion / Sizes</span>
                  <span id="hero-calories-value" className="text-xs font-sans font-semibold text-brand-cocoa mt-0.5">
                    {heroRecipe.priceOptions?.map(p => p.label).join(' / ') || 'Standard'}
                  </span>
                </div>
                <div id="hero-stat-servings" className="flex flex-col justify-center border-l border-brand-cocoa-border/40 pl-4">
                  <span className="text-[10px] font-mono text-brand-cocoa-light uppercase tracking-wider">Fairy Rating</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span id="hero-servings-value" className="text-xs font-sans font-bold text-brand-cocoa">
                      {heroRecipe.rating} ★
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div id="hero-actions-container" className="flex items-center justify-between gap-4 mt-6 lg:mt-0">
              <button
                id="btn-view-hero-recipe"
                onClick={() => onSelectRecipe(heroRecipe)}
                className="flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white text-sm font-semibold font-sans px-6 py-3 rounded-xl transition-all shadow-md shadow-brand-pink/15 group cursor-pointer"
              >
                <span>Order Now</span>
                <ArrowRight id="hero-arrow-icon" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="btn-fav-hero-recipe"
                onClick={() => onToggleFavorite(heroRecipe.id)}
                className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  heroRecipe.isFavorite
                    ? 'border-brand-pink-accent bg-brand-pink-light text-brand-pink'
                    : 'border-brand-cocoa-border hover:bg-brand-pink-light/30 text-brand-cocoa-light hover:text-brand-cocoa'
                }`}
              >
                <Heart id="hero-heart-icon" className={`w-5 h-5 ${heroRecipe.isFavorite ? 'fill-brand-pink' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Tabs Selection */}
      <section id="categories-section" className="mb-8">
        <h4 id="categories-title" className="text-xs font-bold font-mono uppercase tracking-widest text-brand-cocoa-light mb-4">
          Quick Category Filter
        </h4>
        <div id="categories-tabs-wrapper" className="flex flex-col sm:flex-row gap-3 pb-3 pt-1 w-full max-w-sm sm:max-w-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                id={`category-tab-${cat.name}`}
                onClick={() => setActiveCategory(cat.name)}
                className={`group flex items-center justify-center sm:justify-start gap-2.5 px-6 py-3.5 rounded-2xl text-sm md:text-base font-sans font-extrabold border-2 transition-all duration-300 w-full sm:w-auto cursor-pointer ${
                  isActive
                    ? 'bg-brand-pink border-brand-pink text-white shadow-md shadow-brand-pink/20 scale-[1.03]'
                    : 'bg-white border-brand-cocoa-border text-brand-cocoa-light hover:border-brand-pink hover:text-brand-cocoa hover:shadow-sm'
                }`}
              >
                {getCategoryIcon(cat.name, isActive)}
                <span id={`category-label-${cat.name}`}>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Category Cover Page Grid - Display only when activeCategory is 'All' and no search query is active */}
      {searchQuery === '' && activeCategory === 'All' ? (
        <section id="category-cover-section" className="mt-4 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-pink font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-brand-pink animate-pulse" />
              <span>the magic oven</span>
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-brand-cocoa uppercase tracking-tight">
              Our Fairy Confections
            </h3>
            <p className="text-xs sm:text-sm text-brand-cocoa-light/90 leading-relaxed font-sans">
              Choose a category below to explore our specialised recipes. Within each collection, you can browse specific cake styles, check their multiple attractive product pictures, and find exact custom sizing and pricing details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORY_INFOS.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => setActiveCategory(cat.name)}
                className="bg-white rounded-2xl border border-brand-cocoa-border overflow-hidden shadow-xs hover:shadow-md hover:border-brand-pink-accent/40 transition-all duration-350 cursor-pointer group flex flex-col"
              >
                {/* Visual Category Photo Overlay */}
                <div className="h-56 overflow-hidden relative bg-brand-cream-light">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-left">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-pink-light/90 flex items-center gap-1.5 mb-1">
                      {getCategoryIcon(cat.name, false)}
                      <span>{cat.itemCountText}</span>
                    </span>
                    <h4 className="font-display font-black text-xl text-white uppercase tracking-tight">
                      {cat.name}
                    </h4>
                  </div>
                  {/* Hover Floating action indicator */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs w-9 h-9 rounded-full border border-brand-cocoa-border/40 flex items-center justify-center text-brand-cocoa opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Info details */}
                <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
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
            ))}
          </div>
        </section>
      ) : (
        /* Specific Category Showcase Screen */
        <section id="recipe-list-section" className="space-y-6">
          {/* Breadcrumb / Back Navigation to Categories Cover Page */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-brand-cocoa-light hover:text-brand-pink transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Collections</span>
            </button>
            <span className="text-[10px] font-mono text-brand-cocoa-light uppercase bg-white px-2.5 py-1 rounded-md border border-brand-cocoa-border/40">
              Active View: {activeCategory}
            </span>
          </div>

          {/* Gorgeous Category Billboard Spotlight */}
          {activeCategory !== 'All' && (
            (() => {
              const currentCatInfo = CATEGORY_INFOS.find(c => c.name === activeCategory);
              if (!currentCatInfo) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-brand-cocoa-border overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm text-left"
                >
                  <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl">{currentCatInfo.emoji}</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-brand-pink font-black">Featured Collection</span>
                    </div>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-brand-cocoa uppercase tracking-tight">
                      The {currentCatInfo.name} Collection
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-cocoa-light/95 leading-relaxed max-w-xl">
                      {currentCatInfo.description}
                    </p>
                    <p className="text-[10px] font-mono text-brand-pink-dark font-bold uppercase tracking-wider pt-1">
                      🎁 Standard size & bespoke weights starting from ₹{currentCatInfo.startingPrice} onwards
                    </p>
                  </div>
                  <div className="md:col-span-4 h-48 md:h-auto min-h-[140px] relative overflow-hidden">
                    <img
                      src={currentCatInfo.image}
                      alt={currentCatInfo.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent hidden md:block" />
                  </div>
                </motion.div>
              );
            })()
          )}

          <div id="grid-header" className="flex items-center justify-between border-b border-brand-cocoa-border/40 pb-3 mt-8">
            <h4 id="grid-title" className="text-xs font-semibold font-mono uppercase tracking-wider text-brand-cocoa-light flex items-center gap-1.5 text-left">
              <span>🥞</span>
              <span>Available {activeCategory} Varieties</span>
              <span id="filtered-count-badge" className="ml-2 font-mono font-normal text-brand-cocoa-light/80 lowercase">
                ({filteredRecipes.length} styles)
              </span>
            </h4>
          </div>

          {/* Recipes Grid containing multiple attractive pictures */}
          {filteredRecipes.length > 0 ? (
            <div id="recipes-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe, index) => {
                // Get multi images for this recipe
                const images = getRecipeImages(recipe);
                const currentImgIdx = recipeImageIndexes[recipe.id] || 0;
                const activeImage = images[currentImgIdx] || recipe.image;

                return (
                  <motion.div
                    key={recipe.id}
                    id={`recipe-card-${recipe.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-brand-cocoa-border overflow-hidden shadow-xs hover:shadow-md hover:border-brand-pink-accent/50 transition-all duration-300 flex flex-col group relative"
                  >
                    {/* Interactive Image Carousel Area */}
                    <div id={`recipe-card-img-wrapper-${recipe.id}`} className="relative h-56 overflow-hidden bg-brand-cream-light shrink-0">
                      <img
                        id={`recipe-card-image-${recipe.id}`}
                        src={activeImage}
                        alt={recipe.name}
                        className="w-full h-full object-cover transition-all duration-500 cursor-pointer"
                        onClick={() => onSelectRecipe(recipe)}
                      />

                      {/* Left and Right hover slider control overlays */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const prevIdx = (currentImgIdx - 1 + images.length) % images.length;
                          setRecipeImageIndexes(prev => ({ ...prev, [recipe.id]: prevIdx }));
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-brand-cocoa-border/30 flex items-center justify-center text-brand-cocoa shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer z-10"
                        title="Previous Image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextIdx = (currentImgIdx + 1) % images.length;
                          setRecipeImageIndexes(prev => ({ ...prev, [recipe.id]: nextIdx }));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-brand-cocoa-border/30 flex items-center justify-center text-brand-cocoa shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer z-10"
                        title="Next Image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Slider Indicator Dots overlay */}
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1 z-10">
                        {images.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecipeImageIndexes(prev => ({ ...prev, [recipe.id]: dotIdx }));
                            }}
                            className={`w-2 h-2 rounded-full border border-white transition-all cursor-pointer ${
                              currentImgIdx === dotIdx ? 'bg-brand-pink w-4' : 'bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Category Badge overlay */}
                      <div id={`recipe-card-badges-${recipe.id}`} className="absolute top-3 left-3 flex flex-col gap-1.5 z-1">
                        <span id={`recipe-card-badge-cat-${recipe.id}`} className="px-2.5 py-0.5 text-[9px] font-bold font-mono bg-brand-cocoa/90 text-brand-pink-light backdrop-blur-xs rounded-full uppercase tracking-wider border border-brand-pink/15">
                          {recipe.category}
                        </span>
                      </div>

                      {/* Favourite toggler overlay */}
                      <button
                        id={`btn-fav-recipe-card-${recipe.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(recipe.id);
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full border flex items-center justify-center backdrop-blur-md shadow-sm transition-all z-1 cursor-pointer ${
                          recipe.isFavorite
                            ? 'bg-brand-pink border-brand-pink text-white'
                            : 'bg-white/85 border-brand-cocoa-border text-brand-cocoa-light hover:bg-white hover:text-brand-pink'
                        }`}
                      >
                        <Heart id={`recipe-card-heart-${recipe.id}`} className={`w-4 h-4 ${recipe.isFavorite ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Content details and Price Options information */}
                    <div id={`recipe-card-info-${recipe.id}`} className="p-5 flex-1 flex flex-col justify-between">
                      <div id={`recipe-card-texts-${recipe.id}`}>
                        <div id={`recipe-card-rating-row-${recipe.id}`} className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mb-1.5 font-sans text-left">
                          <Star id={`recipe-card-star-${recipe.id}`} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span id={`recipe-card-rating-${recipe.id}`}>{recipe.rating}</span>
                          <span id={`recipe-card-votes-${recipe.id}`} className="text-brand-cocoa-light/60 font-normal font-sans">({recipe.votes} reviews)</span>
                        </div>

                        <h5
                          id={`recipe-card-name-${recipe.id}`}
                          onClick={() => onSelectRecipe(recipe)}
                          className="font-display font-bold text-brand-cocoa group-hover:text-brand-pink transition-colors line-clamp-1 text-base text-left cursor-pointer"
                        >
                          {recipe.name}
                        </h5>
                        
                        <p id={`recipe-card-desc-${recipe.id}`} className="text-xs text-brand-cocoa-light mt-1.5 line-clamp-2 leading-relaxed text-left">
                          {recipe.description}
                        </p>

                        {/* Interactive Thumbnails previews line (Multiple attractive pictures of that item!) */}
                        <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
                          {images.map((thumbUrl, thumbIdx) => (
                            <button
                              key={thumbIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecipeImageIndexes(prev => ({ ...prev, [recipe.id]: thumbIdx }));
                              }}
                              className={`w-9 h-7 rounded border overflow-hidden transition-all shrink-0 cursor-pointer ${
                                currentImgIdx === thumbIdx ? 'border-brand-pink ring-1 ring-brand-pink' : 'border-brand-cocoa-border/50 hover:border-brand-pink/50'
                              }`}
                            >
                              <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Prices display and action button */}
                      <div id={`recipe-card-bottom-${recipe.id}`} className="mt-4 pt-4 border-t border-brand-cocoa-border/60 flex items-center justify-between">
                        <div id={`recipe-card-stats-${recipe.id}`} className="flex flex-col text-left">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-brand-cocoa-light/70">starting price</span>
                          <span id={`recipe-card-price-${recipe.id}`} className="text-base font-sans font-semibold text-brand-pink">
                            ₹{recipe.priceOptions?.[0]?.price || 0}
                          </span>
                        </div>

                        <button
                          id={`btn-cook-recipe-card-${recipe.id}`}
                          onClick={() => onSelectRecipe(recipe)}
                          className="bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all flex items-center gap-1 group/btn cursor-pointer shadow-3xs"
                        >
                          <span>Order</span>
                          <ArrowRight id={`recipe-card-arrow-${recipe.id}`} className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div id="no-recipes-fallback" className="text-center py-16 bg-white rounded-2xl border border-brand-cocoa-border px-4">
              <ChefHat id="fallback-chef-icon" className="w-12 h-12 text-brand-cocoa-light/40 mx-auto mb-4" />
              <h5 id="fallback-title" className="font-display font-bold text-brand-cocoa text-lg">No Confections Found</h5>
              <p id="fallback-desc" className="text-sm text-brand-cocoa-light mt-1 max-w-sm mx-auto">
                We couldn't find any cakes or treats matching your current filter or search criteria. Try a different search!
              </p>
              <button
                id="btn-reset-filters"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="mt-5 inline-flex items-center justify-center bg-brand-cocoa hover:bg-brand-cocoa/90 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
