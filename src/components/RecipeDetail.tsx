import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Info, Sparkles, Check, Flame, MessageSquare, Plus, Minus, Star, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { Recipe, PriceOption } from '../types';
import { motion } from 'motion/react';
import { getRecipeImages } from './Dashboard';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onToggleFavorite: (recipeId: string) => void;
  onAddToCart: (item: {
    productId: string;
    name: string;
    category: string;
    selectedOption: string;
    price: number;
    amount: number; // repurposed for Quantity
    unit: string;
    image: string;
    customMessage: string;
    recipeName: string; // repurposed for selected frosting flavor/flavor
  }) => void;
  onGoToCart: () => void;
}

export default function RecipeDetail({
  recipe,
  onBack,
  onToggleFavorite,
  onAddToCart,
  onGoToCart,
}: RecipeDetailProps) {
  // E-commerce state
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [frostingFlavor, setFrostingFlavor] = useState(() => {
    // default flavor guess
    if (recipe.category === 'Signature Cakes') {
      return 'Signature Vanilla Cream';
    } else if (recipe.category === 'Cupcakes') {
      return 'Cream Cheese Frosting';
    }
    return 'Standard Master Recipe';
  });
  const [customMessage, setCustomMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addFeedback, setAddFeedback] = useState(false);

  // Gallery state for multiple attractive product pictures
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  // AI Live Image Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [generationStep, setGenerationStep] = useState('Mixing ingredients...');

  const images = React.useMemo(() => {
    const list = getRecipeImages(recipe);
    if (customImageUrl) {
      return [customImageUrl, ...list];
    }
    return list;
  }, [recipe, customImageUrl]);

  const activeImageUrl = images[activeImgIdx] || recipe.image;

  useEffect(() => {
    setActiveImgIdx(0);
    setCustomImageUrl('');
    setAiPrompt('');
    setAiError('');
  }, [recipe.id]);

  const steps = [
    'Mixing organic flour & sugar...',
    'Preheating premium bakery oven...',
    'Piping custom frostings...',
    'Sprinkling with magic fairy dust...',
    'Gemini AI rendering final masterpiece...'
  ];

  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    setAiError('');
    
    let stepIndex = 0;
    setGenerationStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setGenerationStep(steps[stepIndex]);
    }, 1500);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: `${recipe.name}: ${aiPrompt}` }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (response.ok && data.imageUrl) {
        setCustomImageUrl(data.imageUrl);
        setActiveImgIdx(0); // Automatically view the generated image
      } else {
        setAiError(data.error || 'Failed to craft your customized cake mock-up.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setAiError('Network interruption. Please verify your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const priceOption = recipe.priceOptions?.[selectedOptionIndex] || recipe.priceOptions?.[0] || { label: 'Standard', price: 500 };
  const unitPrice = priceOption.price;
  const totalPrice = unitPrice * quantity;

  const handleAddToCartClick = () => {
    onAddToCart({
      productId: recipe.id,
      name: recipe.name,
      category: recipe.category,
      selectedOption: priceOption.label,
      price: priceOption.price,
      amount: quantity,
      unit: 'Qty',
      image: customImageUrl || recipe.image,
      customMessage: recipe.category === 'Signature Cakes' ? customMessage : '',
      recipeName: frostingFlavor,
    });
    
    setAddFeedback(true);
    setTimeout(() => {
      setAddFeedback(false);
    }, 2000);
  };

  return (
    <div id="product-root" className="flex-1 bg-brand-cream flex flex-col">
      {/* Editorial Navigation Header */}
      <header id="product-header" className="px-8 py-5 flex items-center justify-between border-b border-brand-cocoa-border/60 shrink-0 bg-brand-cream/80 backdrop-blur-md sticky top-0 z-20">
        <button
          id="btn-product-back"
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-brand-cocoa-light hover:text-brand-cocoa transition-colors cursor-pointer"
        >
          <ArrowLeft id="icon-back" className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Menu</span>
        </button>

        <span className="text-xs font-mono uppercase tracking-widest text-brand-cocoa-light">
          The Frosting Fairy Confectionery
        </span>

        <button
          id="btn-product-cart-nav"
          onClick={onGoToCart}
          className="p-2 border border-brand-cocoa-border/60 rounded-xl hover:bg-brand-pink-light/30 transition-all text-brand-cocoa cursor-pointer"
          title="Go to Cart"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </header>

      {/* Main product columns */}
      <div id="product-content" className="max-w-6xl mx-auto w-full px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        {/* Left Column: Media & Story */}
        <div id="product-left" className="lg:col-span-6 space-y-6">
          {/* Main Display Image */}
          <div className="relative rounded-2xl border border-brand-cocoa-border overflow-hidden h-[340px] md:h-[420px] shadow-sm bg-brand-cream-light">
            <img
              src={activeImageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
            />
            
            {/* Left and Right navigation buttons */}
            <button
              onClick={() => {
                const prevIdx = (activeImgIdx - 1 + images.length) % images.length;
                setActiveImgIdx(prevIdx);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border border-brand-cocoa-border/40 flex items-center justify-center text-brand-cocoa hover:bg-white shadow-sm cursor-pointer z-10"
              title="Previous Image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                const nextIdx = (activeImgIdx + 1) % images.length;
                setActiveImgIdx(nextIdx);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border border-brand-cocoa-border/40 flex items-center justify-center text-brand-cocoa hover:bg-white shadow-sm cursor-pointer z-10"
              title="Next Image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Category tag */}
            <span className="absolute top-4 left-4 bg-brand-pink text-white text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full shadow-sm z-10">
              {recipe.category}
            </span>

            {/* Favorite circle action */}
            <button
              onClick={() => onToggleFavorite(recipe.id)}
              className="absolute top-4 right-4 w-10 h-10 bg-white hover:bg-brand-pink-light/30 text-brand-cocoa rounded-full border border-brand-cocoa-border flex items-center justify-center transition-all shadow-xs cursor-pointer z-10"
            >
              <Heart
                className={`w-5 h-5 ${
                  recipe.isFavorite ? 'fill-brand-pink text-brand-pink' : 'text-brand-cocoa-light'
                }`}
              />
            </button>
          </div>

          {/* Interactive Thumbnails List (Multiple attractive pictures!) */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none justify-start">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIdx(idx)}
                className={`w-20 h-16 rounded-xl border-2 overflow-hidden transition-all shrink-0 cursor-pointer ${
                  activeImgIdx === idx
                    ? 'border-brand-pink ring-2 ring-brand-pink-light/50 scale-102 shadow-xs'
                    : 'border-brand-cocoa-border hover:border-brand-pink-accent/50 hover:scale-101'
                }`}
              >
                <img src={imgUrl} alt={`${recipe.name} view ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Product Story & Description */}
          <div className="bg-white border border-brand-cocoa-border rounded-2xl p-6 text-left space-y-4">
            <div>
              <h1 className="font-display font-bold text-brand-cocoa text-2xl tracking-tight">
                {recipe.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-mono text-brand-cocoa-light">
                  {recipe.rating} ({recipe.votes} gourmet votes)
                </span>
              </div>
            </div>

            <p className="text-sm font-sans text-brand-cocoa-light leading-relaxed">
              {recipe.description}
            </p>

            {/* Nutritional & Prep details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="bg-brand-cream-light/30 border border-brand-cocoa-border/40 p-2.5 rounded-xl text-center">
                <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light block">Kcal / Serving</span>
                <span className="text-xs font-sans font-bold text-brand-cocoa block mt-0.5">{recipe.nutrients?.calories || 240} cal</span>
              </div>
              <div className="bg-brand-cream-light/30 border border-brand-cocoa-border/40 p-2.5 rounded-xl text-center">
                <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light block">Baking Prep</span>
                <span className="text-xs font-sans font-bold text-brand-cocoa block mt-0.5">{recipe.prepTime + recipe.cookTime} mins</span>
              </div>
              <div className="bg-brand-cream-light/30 border border-brand-cocoa-border/40 p-2.5 rounded-xl text-center">
                <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light block">Allergens</span>
                <span className="text-xs font-sans font-bold text-brand-pink block mt-0.5 truncate">Gluten, Dairy</span>
              </div>
              <div className="bg-brand-cream-light/30 border border-brand-cocoa-border/40 p-2.5 rounded-xl text-center">
                <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light block">Baker Craft</span>
                <span className="text-xs font-sans font-bold text-brand-cocoa block mt-0.5">{recipe.difficulty}</span>
              </div>
            </div>

            {/* Editorial Ingredients */}
            <div className="border-t border-brand-cocoa-border/50 pt-4">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-brand-cocoa mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-brand-pink" />
                <span>Our Premium Ingredients</span>
              </h4>
              <p className="text-xs text-brand-cocoa-light leading-relaxed">
                {recipe.ingredients.map(i => i.name).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Box & Purchase Panel */}
        <div id="product-right" className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-brand-cocoa-border rounded-2xl p-6 shadow-md text-left space-y-5">
            <h3 className="font-display font-bold text-brand-cocoa text-lg flex items-center gap-2 border-b border-brand-cocoa-border pb-3">
              <Sparkles className="w-5 h-5 text-brand-pink fill-brand-pink animate-pulse" />
              <span>Customise & Order</span>
            </h3>

            {/* Price Option Selection pills */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light">
                1. Select Size / Portion
              </label>
              <div className="grid grid-cols-2 gap-3">
                {recipe.priceOptions?.map((opt, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand-pink bg-brand-pink-light/30 shadow-2xs'
                          : 'border-brand-cocoa-border hover:border-brand-pink-accent/50 bg-white'
                      }`}
                    >
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light">
                        {opt.label}
                      </span>
                      <span className="text-base font-display font-bold text-brand-cocoa mt-1">
                        ₹{opt.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flavor selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-brand-pink" />
                <span>2. Customize Frosting Flavour</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Lavender frosting, Madagascar Vanilla, Eggless base"
                value={frostingFlavor}
                onChange={(e) => setFrostingFlavor(e.target.value)}
                className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2.5 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
              />
            </div>

            {/* Custom piping message (Show ONLY for cakes) */}
            {recipe.category === 'Signature Cakes' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light flex items-center gap-1">
                  <Gift className="w-3 h-3 text-brand-pink" />
                  <span>3. Text to pipe on cake (Max 30 chars)</span>
                </label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. Happy Birthday Sarah!"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2.5 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>
            )}

            {/* Live AI Design Visualizer */}
            <div className="space-y-3 bg-brand-pink-light/10 border border-brand-pink/20 rounded-2xl p-4.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-pink-dark flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-pink fill-brand-pink animate-pulse" />
                  <span>Live AI Design Generator</span>
                </label>
                <span className="bg-brand-pink/15 text-brand-pink-dark font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Live Preview
                </span>
              </div>
              <p className="text-xs text-brand-cocoa-light leading-normal">
                Describe your custom decorations, tiers, colors, or theme, and watch Gemini AI generate a live photographic mock-up of your dream confectionery!
              </p>
              
              <div className="flex flex-col gap-2">
                <textarea
                  rows={2}
                  placeholder="e.g. Two-tier pastel lilac cake decorated with edible butterflies, sugar pearls, and fresh lavender sprigs..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2 text-xs text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink resize-none"
                />
                
                {aiError && (
                  <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    ⚠️ {aiError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={isGenerating || !aiPrompt.trim()}
                  onClick={handleGenerateAiImage}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                    isGenerating
                      ? 'bg-brand-cream border-brand-cocoa-border text-brand-cocoa-light'
                      : !aiPrompt.trim()
                      ? 'bg-white border-brand-cocoa-border/60 text-brand-cocoa-light/60 hover:border-brand-cocoa-border'
                      : 'bg-white hover:bg-brand-pink-light/20 border-brand-pink/40 hover:border-brand-pink text-brand-pink-dark shadow-3xs hover:shadow-2xs'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
                      <span>{generationStep}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
                      <span>Generate Live Mock-up 🪄</span>
                    </>
                  )}
                </button>
              </div>

              {customImageUrl && (
                <div className="mt-3.5 p-3 bg-white border border-brand-pink/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-brand-cocoa-border shrink-0">
                    <img src={customImageUrl} alt="Generated design preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono font-bold text-brand-pink uppercase tracking-wider block">Mock-up Applied!</span>
                    <span className="text-[11px] font-sans font-medium text-brand-cocoa-light block truncate mt-0.5">Your description is bound to your cart order.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImageUrl('');
                        setAiPrompt('');
                      }}
                      className="text-[10px] font-bold font-mono text-brand-cocoa-light hover:text-red-500 mt-1 cursor-pointer block"
                    >
                      ✕ Reset Custom Design
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2 border-t border-brand-cocoa-border/40 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light block">
                  Select Quantity
                </span>
                <span className="text-xs text-brand-cocoa-light font-sans mt-0.5 block">
                  How many batches/cakes?
                </span>
              </div>

              <div className="flex items-center gap-3 bg-brand-cream-light/40 border border-brand-cocoa-border px-3 py-1.5 rounded-xl shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 rounded bg-white border border-brand-cocoa-border hover:bg-brand-pink-light/35 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-brand-cocoa" />
                </button>
                <span className="font-sans font-bold text-sm text-brand-cocoa min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 rounded bg-white border border-brand-cocoa-border hover:bg-brand-pink-light/35 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-cocoa" />
                </button>
              </div>
            </div>

            {/* Add to cart / Order Button */}
            <div className="border-t border-brand-cocoa-border/50 pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-brand-cocoa-light font-bold">
                  Total Order Price
                </span>
                <span className="text-2xl font-display font-extrabold text-brand-pink">
                  ₹{totalPrice}
                </span>
              </div>

              <button
                onClick={handleAddToCartClick}
                className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-sans font-bold py-4 rounded-xl transition-all shadow-md shadow-brand-pink/15 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
                <span>Add to Shopping Cart 🛒</span>
              </button>

              <div className="text-center pt-3 border-t border-brand-cocoa-border/20 mt-1">
                <p className="text-xs text-brand-cocoa-light">
                  Have special delivery requests or allergen concerns?{' '}
                  <a
                    href="mailto:hellofrostingfairy@gmail.com"
                    className="text-brand-pink hover:text-brand-pink-dark transition-colors font-bold underline underline-offset-2"
                  >
                    Contact the Fairy ✉️
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
