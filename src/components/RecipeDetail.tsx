import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Info, Sparkles, Check, Flame, MessageSquare, Plus, Minus, Star, Gift, ChevronLeft, ChevronRight, ArrowUpDown, TrendingUp, Search, Trash2, CheckCircle2, Layers, ShoppingBag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Recipe, PriceOption } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getRecipeImages } from './Dashboard';
import { auth } from '../lib/firebase';

interface RecipeDetailProps {
  recipe: Recipe;
  allRecipes?: Recipe[];
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
    boxContents?: { name: string; quantity: number; price: number }[];
  }) => void;
  onGoToCart: () => void;
}

export default function RecipeDetail({
  recipe,
  allRecipes = [],
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

  // Box Builder state
  const isBox = Boolean(recipe.isBuildYourBox);
  const boxMinItems = recipe.boxMinItems !== undefined && recipe.boxMinItems !== null ? recipe.boxMinItems : 3;
  const [boxSelections, setBoxSelections] = useState<Record<string, number>>({});
  const [boxActiveCategory, setBoxActiveCategory] = useState('All');
  const [boxSearchQuery, setBoxSearchQuery] = useState('');
  const [showSelectedTray, setShowSelectedTray] = useState(true);
  type BoxSortOption = 'featured' | 'price-asc' | 'price-desc' | 'alphabetical' | 'popularity' | 'rating';
  const [boxSortBy, setBoxSortBy] = useState<BoxSortOption>('featured');

  // Eligible products for box building (ALL products from the entire menu, excluding this box)
  const eligibleProducts = React.useMemo(() => {
    if (!isBox) return [];
    return allRecipes.filter((r) => r.id !== recipe.id && !r.isBuildYourBox);
  }, [allRecipes, isBox, recipe.id, recipe.isBuildYourBox]);

  // Unique categories for filtering inside the box builder
  const boxCategories = React.useMemo(() => {
    const list = ['All'];
    eligibleProducts.forEach((p) => {
      if (p.category && !list.includes(p.category)) {
        list.push(p.category);
      }
    });
    return list;
  }, [eligibleProducts]);

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const map: Record<string, number> = { All: eligibleProducts.length };
    eligibleProducts.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [eligibleProducts]);

  // Filtered and sorted products inside the box builder
  const displayedEligibleProducts = React.useMemo(() => {
    let list = boxActiveCategory === 'All'
      ? [...eligibleProducts]
      : eligibleProducts.filter((p) => p.category.toLowerCase() === boxActiveCategory.toLowerCase());

    if (boxSearchQuery.trim() !== '') {
      const q = boxSearchQuery.toLowerCase();
      list = list.filter((p) => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (boxSortBy === 'price-asc') {
      list.sort((a, b) => {
        const priceA = a.priceOptions?.[0]?.price || 0;
        const priceB = b.priceOptions?.[0]?.price || 0;
        return priceA - priceB;
      });
    } else if (boxSortBy === 'price-desc') {
      list.sort((a, b) => {
        const priceA = a.priceOptions?.[0]?.price || 0;
        const priceB = b.priceOptions?.[0]?.price || 0;
        return priceB - priceA;
      });
    } else if (boxSortBy === 'alphabetical') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (boxSortBy === 'popularity') {
      list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else if (boxSortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [eligibleProducts, boxActiveCategory, boxSearchQuery, boxSortBy]);

  const totalBoxItemsSelected = React.useMemo(() => {
    return (Object.values(boxSelections) as number[]).reduce((sum: number, qty: number) => sum + qty, 0);
  }, [boxSelections]);

  const liveBoxTotal = React.useMemo(() => {
    if (!isBox) return 0;
    return (Object.entries(boxSelections) as [string, number][]).reduce((sum: number, [name, qty]) => {
      const product = allRecipes.find((r) => r.name === name);
      return sum + (product ? (product.priceOptions?.[0]?.price || 0) * qty : 0);
    }, 0);
  }, [isBox, boxSelections, allRecipes]);

  const handleBoxItemChange = (productName: string, delta: number) => {
    setBoxSelections((prev) => {
      const current = prev[productName] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productName];
        return copy;
      }
      return { ...prev, [productName]: next };
    });
  };

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
    setBoxSelections({});
    setBoxActiveCategory('All');
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
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
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
  const unitPrice = isBox ? liveBoxTotal : priceOption.price;
  const totalPrice = unitPrice * quantity;

  const handleAddToCartClick = () => {
    if (isBox && totalBoxItemsSelected < boxMinItems) {
      return;
    }

    const boxContents = isBox
      ? (Object.entries(boxSelections) as [string, number][])
          .filter(([_, qty]) => qty > 0)
          .map(([name, quantity]) => {
            const product = allRecipes.find((r) => r.name === name);
            return { name, quantity, price: product?.priceOptions?.[0]?.price || 0 };
          })
      : undefined;

    onAddToCart({
      productId: recipe.id,
      name: recipe.name,
      category: recipe.category,
      selectedOption: isBox ? `Assorted Box (${totalBoxItemsSelected} Items)` : priceOption.label,
      price: isBox ? liveBoxTotal : priceOption.price,
      amount: quantity,
      unit: isBox ? 'Box' : 'Qty',
      image: customImageUrl || recipe.image,
      customMessage: recipe.category === 'Signature Cakes' ? customMessage : isBox ? customMessage : '',
      recipeName: isBox ? `${totalBoxItemsSelected}-Item Custom Assortment` : frostingFlavor,
      boxContents,
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
                key={`recipe-thumb-${recipe.id}-${idx}`}
                onClick={() => setActiveImgIdx(idx)}
                className={`w-20 h-16 rounded-xl border-2 overflow-hidden transition-all shrink-0 cursor-pointer ${
                  activeImgIdx === idx
                    ? 'border-brand-pink ring-2 ring-brand-pink-light/50 scale-102 shadow-xs'
                    : 'border-brand-cocoa-border hover:border-brand-pink-accent/50 hover:scale-101'
                }`}
              >
                <img src={imgUrl} alt={`${recipe.name} view ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
              <span>{isBox ? 'Build Your Assorted Box' : 'Customise & Order'}</span>
            </h3>

            {isBox ? (
              /* --- ASSORTED BOX BUILDER INTERFACE --- */
              <div className="space-y-5">
                {/* Live Running Total & Box Status Card (LIVE PRICE TRACKER) */}
                <div className="bg-gradient-to-br from-brand-pink-light/30 via-white to-brand-pink-light/20 border-2 border-brand-pink/40 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cocoa-light flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-brand-pink" />
                        <span>Live Running Box Price</span>
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-display font-black text-brand-pink tracking-tight">
                          ₹{liveBoxTotal}
                        </span>
                        <span className="text-xs font-mono text-brand-cocoa-light">
                          ({totalBoxItemsSelected} {totalBoxItemsSelected === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cocoa-light">
                        Box Minimum: {boxMinItems} Treats
                      </span>
                      <span className={`text-xs font-mono font-extrabold px-3 py-1 rounded-full border shadow-3xs flex items-center gap-1.5 ${
                        totalBoxItemsSelected >= boxMinItems
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {totalBoxItemsSelected >= boxMinItems ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Box Ready ({totalBoxItemsSelected})</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                            <span>{totalBoxItemsSelected}/{boxMinItems} Selected</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-brand-cream border border-brand-cocoa-border/40 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full transition-all duration-300 ${
                          totalBoxItemsSelected >= boxMinItems ? 'bg-emerald-500' : 'bg-brand-pink'
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (totalBoxItemsSelected / boxMinItems) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-brand-cocoa-light">
                      <span>0 treats</span>
                      <span>
                        {totalBoxItemsSelected < boxMinItems
                          ? `Add ${boxMinItems - totalBoxItemsSelected} more to unlock box checkout`
                          : 'Minimum reached! You can keep adding more treats'}
                      </span>
                      <span>{boxMinItems}+</span>
                    </div>
                  </div>

                  {/* Selected Treats Tray Toggle */}
                  {totalBoxItemsSelected > 0 && (
                    <div className="border-t border-brand-pink/20 pt-2.5">
                      <button
                        type="button"
                        onClick={() => setShowSelectedTray(!showSelectedTray)}
                        className="w-full flex items-center justify-between text-xs font-mono font-bold text-brand-cocoa hover:text-brand-pink transition-colors cursor-pointer py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-brand-pink" />
                          <span>View Box Contents ({totalBoxItemsSelected} items · ₹{liveBoxTotal})</span>
                        </span>
                        {showSelectedTray ? (
                          <ChevronUp className="w-4 h-4 text-brand-cocoa-light" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-brand-cocoa-light" />
                        )}
                      </button>

                      {showSelectedTray && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1"
                        >
                          {(Object.entries(boxSelections) as [string, number][]).map(([itemName, count]) => {
                            if (count <= 0) return null;
                            const itemProduct = allRecipes.find((r) => r.name === itemName);
                            const itemPrice = itemProduct?.priceOptions?.[0]?.price || 0;
                            const subtotal = itemPrice * count;

                            return (
                              <div
                                key={`box-tray-${itemName}`}
                                className="flex items-center justify-between bg-white border border-brand-cocoa-border/60 rounded-xl p-2 text-xs shadow-3xs"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {itemProduct?.image && (
                                    <img
                                      src={itemProduct.image}
                                      alt={itemName}
                                      className="w-8 h-8 rounded-lg object-cover border border-brand-cocoa-border shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1 text-left">
                                    <span className="font-sans font-bold text-brand-cocoa truncate block">
                                      {itemName}
                                    </span>
                                    <span className="text-[10px] font-mono text-brand-cocoa-light">
                                      ₹{itemPrice} × {count} = <strong className="text-brand-pink">₹{subtotal}</strong>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleBoxItemChange(itemName, -1)}
                                    className="w-6 h-6 rounded-md bg-brand-cream border border-brand-cocoa-border/60 flex items-center justify-center text-brand-cocoa hover:bg-brand-pink-light hover:text-brand-pink cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono font-bold text-xs min-w-[16px] text-center">
                                    {count}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleBoxItemChange(itemName, 1)}
                                    className="w-6 h-6 rounded-md bg-brand-pink text-white flex items-center justify-center hover:bg-brand-pink-dark cursor-pointer shadow-3xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleBoxItemChange(itemName, -count)}
                                    className="w-6 h-6 ml-1 rounded-md text-brand-cocoa-light/60 hover:text-red-500 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors"
                                    title="Remove from box"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setBoxSelections({})}
                              className="text-[10px] font-mono font-semibold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Clear All Treats</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Branded Section Heading & Intro */}
                <div className="pt-1">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-cocoa text-center mb-1">
                    🎁 Menu Treat Chooser
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-cocoa/70 text-center mb-4">
                    Choose from {eligibleProducts.length} artisanal bakery items across any category. Mix & match cupcakes, brownies, cookies, donuts, and rolls!
                  </p>
                </div>

                {/* Search Bar for Box Items */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cocoa-light/60" />
                  <input
                    type="text"
                    placeholder="Search menu treats (e.g. Nutella, Oreo, Glazed, Cinnamon)..."
                    value={boxSearchQuery}
                    onChange={(e) => setBoxSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 bg-white border border-brand-cocoa-border rounded-xl text-xs text-brand-cocoa placeholder-brand-cocoa-light/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all"
                  />
                  {boxSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBoxSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-cocoa-light hover:text-brand-cocoa p-1 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills & Sorting */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light block">
                      Filter by Menu Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {boxCategories.map((cat) => {
                        const isActive = boxActiveCategory === cat;
                        const count = categoryCounts[cat] || 0;
                        return (
                          <button
                            key={`box-cat-${cat}`}
                            type="button"
                            onClick={() => setBoxActiveCategory(cat)}
                            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-brand-pink text-white shadow-3xs scale-[1.02]'
                                : 'bg-white text-brand-cocoa border border-brand-cocoa-border/60 hover:border-brand-pink/50 hover:bg-brand-pink-light/10'
                            }`}
                          >
                            <span>{cat}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              isActive ? 'bg-white/25 text-white' : 'bg-brand-cream text-brand-cocoa-light'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort Options Bar */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ArrowUpDown className="w-3.5 h-3.5 text-brand-cocoa-light" />
                        <label htmlFor="box-sort-select" className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light">
                          Sort Treats
                        </label>
                      </div>

                      <select
                        id="box-sort-select"
                        value={boxSortBy}
                        onChange={(e) => setBoxSortBy(e.target.value as BoxSortOption)}
                        className="text-xs font-mono font-medium text-brand-cocoa bg-white border border-brand-cocoa-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-pink cursor-pointer"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                        <option value="alphabetical">Alphabetical (A–Z)</option>
                        <option value="popularity">🔥 Popularity</option>
                        <option value="rating">⭐ Top Rated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Confectionery items stepper list (MENU CHOOSING OPTION) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light">
                      Choose Treats for Your Box ({displayedEligibleProducts.length} options)
                    </label>
                    <span className="text-[10px] font-mono text-brand-pink-dark font-bold">
                      {totalBoxItemsSelected} Selected
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {displayedEligibleProducts.length === 0 ? (
                      <div className="p-6 text-center bg-brand-cream/40 rounded-xl border border-dashed border-brand-cocoa-border/60">
                        <p className="text-xs text-brand-cocoa-light italic">
                          No treats match your current search or category filter.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setBoxSearchQuery('');
                            setBoxActiveCategory('All');
                          }}
                          className="mt-2 text-xs font-mono text-brand-pink font-bold hover:underline cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      displayedEligibleProducts.map((item) => {
                        const count = boxSelections[item.name] || 0;
                        const isSelected = count > 0;
                        const itemPrice = item.priceOptions?.[0]?.price || 0;

                        return (
                          <div
                            key={`box-item-select-${item.id}`}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-brand-pink-light/25 border-brand-pink shadow-3xs ring-1 ring-brand-pink/30'
                                : 'bg-white border-brand-cocoa-border hover:border-brand-pink-accent/50 hover:bg-brand-cream-light/20'
                            }`}
                          >
                            {/* Item thumbnail & details */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-brand-cocoa-border shrink-0 bg-brand-cream">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="font-sans font-bold text-xs text-brand-cocoa truncate">
                                    {item.name}
                                  </h5>
                                  <span className="text-[9px] font-mono font-semibold text-brand-cocoa-light bg-brand-cream px-1.5 py-0.2 rounded border border-brand-cocoa-border/30">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs font-mono font-bold text-brand-pink">
                                    ₹{itemPrice} <span className="text-[9px] text-brand-cocoa-light font-normal">/ piece</span>
                                  </span>
                                  {item.rating && (
                                    <span className="text-[10px] font-mono text-brand-cocoa/70 flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                      {item.rating}
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                      {count} in box (= ₹{itemPrice * count})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Button & Stepper controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {count === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleBoxItemChange(item.name, 1)}
                                  className="bg-white hover:bg-brand-pink text-brand-cocoa hover:text-white border border-brand-cocoa-border hover:border-brand-pink text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                                >
                                  <Plus className="w-3.5 h-3.5 text-brand-pink group-hover:text-white" />
                                  <span>Add</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5 bg-white border border-brand-pink/50 rounded-lg p-1 shadow-3xs">
                                  <button
                                    type="button"
                                    onClick={() => handleBoxItemChange(item.name, -1)}
                                    className="w-6 h-6 rounded bg-brand-cream hover:bg-brand-pink-light text-brand-cocoa flex items-center justify-center transition-all cursor-pointer"
                                    title="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>

                                  <span className="font-mono font-bold text-xs text-brand-cocoa min-w-[20px] text-center">
                                    {count}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleBoxItemChange(item.name, 1)}
                                    className="w-6 h-6 rounded bg-brand-pink hover:bg-brand-pink-dark text-white flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                                    title="Add one more"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Gift card or special note */}
                <div className="space-y-2 pt-2 border-t border-brand-cocoa-border/40">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light flex items-center gap-1">
                    <Gift className="w-3 h-3 text-brand-pink" />
                    <span>Special Packing Note / Gift Card Message (Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="e.g. For my favorite sweet tooth! Happy Birthday"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2.5 text-xs text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                  />
                </div>
              </div>
            ) : (
              /* --- STANDARD PRODUCT CUSTOMIZATION INTERFACE --- */
              <>
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
                          key={`recipe-opt-${opt.label}-${idx}`}
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
                        <img src={customImageUrl} alt="Generated design preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
              </>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 border-t border-brand-cocoa-border/40 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light block">
                  Select Quantity
                </span>
                <span className="text-xs text-brand-cocoa-light font-sans mt-0.5 block">
                  {isBox ? 'How many assorted boxes?' : 'How many batches/cakes?'}
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
                type="button"
                disabled={isBox && totalBoxItemsSelected < boxMinItems}
                onClick={handleAddToCartClick}
                className={`w-full font-sans font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer ${
                  isBox && totalBoxItemsSelected < boxMinItems
                    ? 'bg-brand-cocoa-border text-brand-cocoa-light cursor-not-allowed opacity-75'
                    : 'bg-brand-pink hover:bg-brand-pink-dark text-white shadow-brand-pink/15'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {isBox
                    ? totalBoxItemsSelected < boxMinItems
                      ? `Add ${boxMinItems - totalBoxItemsSelected} more to start your box (${totalBoxItemsSelected}/${boxMinItems})`
                      : `Add Assorted Box to Cart (₹${totalPrice}) 🛒`
                    : 'Add to Shopping Cart 🛒'}
                </span>
              </button>

              {/* Added Feedback Toast */}
              <AnimatePresence>
                {addFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 flex items-center justify-between shadow-sm text-xs font-sans"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Added to cart!</strong> Your custom selection is ready.</span>
                    </div>
                    <button
                      type="button"
                      onClick={onGoToCart}
                      className="text-emerald-700 font-bold underline font-mono text-[11px] hover:text-emerald-900 cursor-pointer shrink-0 ml-2"
                    >
                      View Cart →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

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

      {/* Floating Sticky Bottom Bar for Assorted Box */}
      {isBox && (
        <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-brand-cocoa-border/70 py-3 px-4 sm:px-8 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-brand-pink-light/40 border border-brand-pink/30 items-center justify-center text-brand-pink shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-brand-cocoa-light">
                    Box Total:
                  </span>
                  <span className="text-lg font-display font-black text-brand-pink">
                    ₹{totalPrice}
                  </span>
                  {quantity > 1 && (
                    <span className="text-[10px] font-mono text-brand-cocoa-light">
                      (₹{liveBoxTotal} × {quantity})
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-sans text-brand-cocoa flex items-center gap-1.5">
                  <span className="font-semibold">{totalBoxItemsSelected} treats chosen</span>
                  <span className="text-brand-cocoa-light">·</span>
                  <span className={totalBoxItemsSelected >= boxMinItems ? 'text-emerald-700 font-bold' : 'text-amber-700 font-medium'}>
                    {totalBoxItemsSelected >= boxMinItems
                      ? 'Ready to order'
                      : `Needs ${boxMinItems - totalBoxItemsSelected} more`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={totalBoxItemsSelected < boxMinItems}
                onClick={handleAddToCartClick}
                className={`px-4 sm:px-6 py-2.5 rounded-xl font-sans font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  totalBoxItemsSelected < boxMinItems
                    ? 'bg-brand-cocoa-border text-brand-cocoa-light cursor-not-allowed opacity-75'
                    : 'bg-brand-pink hover:bg-brand-pink-dark text-white shadow-brand-pink/20'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {totalBoxItemsSelected < boxMinItems
                    ? `Add ${boxMinItems - totalBoxItemsSelected} more`
                    : `Add Box to Cart (₹${totalPrice})`}
                </span>
                <span className="sm:hidden">
                  {totalBoxItemsSelected < boxMinItems
                    ? `+${boxMinItems - totalBoxItemsSelected}`
                    : `Add (₹${totalPrice})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
