/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import logoImg from './assets/images/frosting_fairy_logo_1784129178255.jpg';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import MealPlanner from './components/MealPlanner';
import ShoppingList from './components/ShoppingList';
import RecipeDetail from './components/RecipeDetail';
import AdminDashboard from './components/AdminDashboard';
import { INITIAL_RECIPES, INITIAL_CATEGORY_INFOS } from './data';
import { Recipe, ShoppingItem, MealPlanEntry, MealType, CategoryInfo } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { X, Instagram, ArrowLeft } from 'lucide-react';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Local storage key names for fallback preferences
const SHOPPING_STORAGE_KEY = 'gusto_shopping_list';

export default function App() {
  // --- CORE STATE DRIVEN BY FIRESTORE ---
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>([]);
  const [categoryInfos, setCategoryInfos] = useState<CategoryInfo[]>(INITIAL_CATEGORY_INFOS);

  // Store & Branding State
  const [logo, setLogo] = useState<string>(logoImg);
  const [websiteName, setWebsiteName] = useState<string>('THE FROSTING FAIRY');
  const [websiteSlogan, setWebsiteSlogan] = useState<string>('CREATING EDIBLE MAGIC');
  const [upiId, setUpiId] = useState<string>('thefrostingfairy@okaxis');
  const [upiQrCode, setUpiQrCode] = useState<string>('');
  const [cashOnDeliveryEnabled, setCashOnDeliveryEnabled] = useState<boolean>(true);

  // 1. LIVE PRODUCTS DATA FROM FIRESTORE
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      if (snapshot.empty) {
        setRecipes(INITIAL_RECIPES);
      } else {
        const loadedRecipes: Recipe[] = [];
        snapshot.forEach((docSnap) => {
          loadedRecipes.push({ id: docSnap.id, ...docSnap.data() } as Recipe);
        });
        setRecipes(loadedRecipes);
      }
    }, (err) => {
      if (err.message?.includes('CANCELLED') || err.code === 'cancelled') {
        console.debug('Firestore products stream re-establishing connection...');
      } else {
        console.warn('Firestore products listener notice:', err.message);
      }
      setRecipes(INITIAL_RECIPES);
    });

    return () => unsubscribe();
  }, []);

  // 2. LIVE ORDERS DATA FROM FIRESTORE
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const loadedOrders: MealPlanEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedOrders.push({
          id: docSnap.id,
          cakeType: data.cakeType || 'Custom Cake',
          flavor: data.flavor || 'Standard',
          weight: data.weight || 'Standard',
          message: data.message || '',
          instructions: data.instructions || '',
          pickupDate: data.pickupDate || '',
          pickupTime: data.pickupTime || '',
          contactName: data.contactName || data.customerName || 'Customer',
          contactPhone: data.contactPhone || data.customerPhone || '',
          estimatedPrice: data.estimatedPrice || 0,
          status: data.status || 'Pending',
          recipe: data.recipe,
          customerName: data.customerName || data.contactName || 'Customer',
          customerPhone: data.customerPhone || data.contactPhone || '',
          specialInstructions: data.specialInstructions || '',
          deliveryType: data.deliveryType || 'Pickup',
          deliveryAddress: data.deliveryAddress || '',
          gpsCoordinates: data.gpsCoordinates || '',
          paymentMethod: data.paymentMethod || 'COD',
          paymentDetails: data.paymentDetails || {},
          adminNotes: data.adminNotes || [],
        });
      });
      setMealPlan(loadedOrders);
    }, (err) => {
      if (err.message?.includes('CANCELLED') || err.code === 'cancelled') {
        console.debug('Firestore orders stream re-establishing connection...');
      } else {
        console.warn('Firestore orders listener notice:', err.message);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. LIVE BRANDING & STORE SETTINGS FROM FIRESTORE
  useEffect(() => {
    const brandingRef = doc(db, 'settings', 'branding');
    const unsubscribe = onSnapshot(brandingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.logo) setLogo(data.logo);
        if (data.websiteName) setWebsiteName(data.websiteName);
        if (data.websiteSlogan) setWebsiteSlogan(data.websiteSlogan);
        if (data.upiId) setUpiId(data.upiId);
        if (data.upiQrCode !== undefined) setUpiQrCode(data.upiQrCode);
        if (data.cashOnDeliveryEnabled !== undefined) setCashOnDeliveryEnabled(data.cashOnDeliveryEnabled);
      }
    }, (err) => {
      if (err.message?.includes('CANCELLED') || err.code === 'cancelled') {
        console.debug('Firestore settings stream re-establishing connection...');
      } else {
        console.warn('Firestore settings listener notice:', err.message);
      }
    });

    return () => unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [preselectedRecipeId, setPreselectedRecipeId] = useState<string>('');
  const [tabHistory, setTabHistory] = useState<string[]>([]);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('gusto_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gusto_theme', theme);
  }, [theme]);

  // Shopping Cart State
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(SHOPPING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && !parsed.some((e: any) => e.category === 'Produce' || e.category === 'Dairy & Eggs')) {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(shoppingList));
  }, [shoppingList]);

  // --- GLOBAL TOAST SYSTEM & STATUS CHANGE DETECTOR ---
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: 'success' | 'info' | 'warning' }[]>([]);
  const [prevStatuses, setPrevStatuses] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const saved = localStorage.getItem('gusto_meal_plan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MealPlanEntry[];
        parsed.forEach((order) => {
          initial[order.id] = order.status || 'Pending';
        });
      } catch (e) {
        // Ignore
      }
    }
    return initial;
  });

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000); // 6 seconds visibility
  };

  useEffect(() => {
    // Detect order status updates to 'Ready for Pickup' or 'Out for Delivery'
    mealPlan.forEach((order) => {
      const prevStatus = prevStatuses[order.id];
      const currentStatus = order.status || 'Pending';

      if (prevStatus && prevStatus !== currentStatus) {
        if (currentStatus === 'Ready for Pickup') {
          addToast(
            '🏪 Order Ready for Pickup!',
            `Excellent news! Your order for "${order.cakeType}" is baked, decorated, and ready for pickup at our boutique storefront.`,
            'success'
          );
        } else if (currentStatus === 'Out for Delivery') {
          addToast(
            '🛵 Out for Delivery!',
            `Delight is on the way! Your order for "${order.cakeType}" is out for delivery and will arrive shortly.`,
            'info'
          );
        }
      }
    });

    // Keep prevStatuses reference aligned
    const currentStatuses: Record<string, string> = {};
    mealPlan.forEach((order) => {
      currentStatuses[order.id] = order.status || 'Pending';
    });
    setPrevStatuses(currentStatuses);
  }, [mealPlan]);

  // --- STATE MUTATION HANDLERS ---

  // Toggle favorite status on recipes
  const handleToggleFavorite = (recipeId: string) => {
    setRecipes((prevRecipes) => {
      const updated = prevRecipes.map((r) =>
        r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r
      );
      // Update selected recipe if currently viewing it
      if (selectedRecipe && selectedRecipe.id === recipeId) {
        setSelectedRecipe((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
      }
      return updated;
    });
  };

  // Select recipe to view in detail
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  // Close detail view
  const handleBackToDiscover = () => {
    setSelectedRecipe(null);
  };

  // Enhanced Back option
  const handleGoBack = () => {
    if (selectedRecipe) {
      setSelectedRecipe(null);
      return;
    }
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, -1));
      setActiveTab(prevTab);
    } else {
      setActiveTab('home');
    }
  };

  // --- CUSTOM ORDER HANDLERS ---
  const handleAddMeal = (entry: MealPlanEntry) => {
    setMealPlan((prev) => [...prev, entry]);
  };

  const handleRemoveMeal = (id: string) => {
    setMealPlan((prev) => prev.filter((item) => item.id !== id));
  };

  // --- SHOPPING CART & E-COMMERCE HANDLERS ---

  // Add customized cake/confection to e-commerce cart
  const handleAddToCart = (item: {
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
  }) => {
    const newItem: ShoppingItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: item.productId,
      name: item.name,
      category: item.category,
      selectedOption: item.selectedOption,
      price: item.price,
      amount: item.amount,
      unit: item.unit,
      image: item.image,
      customMessage: item.customMessage,
      isBought: false,
      recipeName: item.recipeName,
    };

    setShoppingList((prev) => {
      // If exact matching item is already in cart, increment quantity
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.selectedOption === item.selectedOption &&
          i.customMessage === item.customMessage &&
          i.recipeName === item.recipeName
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          amount: updated[existingIdx].amount + item.amount,
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  // Checkout and place custom orders securely server-side
  const handleCheckout = async (checkoutData: {
    customerName: string;
    customerPhone: string;
    pickupDate: string;
    pickupTime: string;
    specialInstructions: string;
    deliveryType: 'Pickup' | 'Delivery';
    deliveryAddress: string;
    gpsCoordinates: string;
    paymentMethod: 'Card' | 'UPI' | 'COD';
    paymentDetails: {
      cardHolder?: string;
      cardNumber?: string;
      upiId?: string;
    };
  }) => {
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: shoppingList.map(item => ({
            productId: item.productId,
            name: item.name,
            recipeName: item.recipeName,
            selectedOption: item.selectedOption,
            amount: item.amount,
            unit: item.unit,
            customMessage: item.customMessage
          })),
          checkoutData
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process order checkout.');
      }

      console.log('Order created successfully with validated pricing:', data);
      setShoppingList([]); // Clear the cart
      setActiveTab('planner'); // Redirect to track orders tab
    } catch (err: any) {
      console.error('Error during order creation checkout:', err);
      alert('Order checkout notice: ' + (err.message || 'Please try again.'));
    }
  };

  // Toggle bought/checked state
  const handleToggleBought = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isBought: !item.isBought } : item))
    );
  };

  // Delete item from cart
  const handleRemoveShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear checked items
  const handleClearCompleted = () => {
    setShoppingList((prev) => prev.filter((item) => !item.isBought));
  };

  // Clear cart
  const handleClearAllShopping = () => {
    setShoppingList([]);
  };

  // Legacy sync function kept for type safety or fallback
  const handleAddIngredientsToShoppingList = (recipe: Recipe, scaledServings?: number) => {
    if (!recipe) return;
    const priceOption = recipe.priceOptions?.[0] || { label: 'Standard', price: 500 };
    handleAddToCart({
      productId: recipe.id,
      name: recipe.name,
      category: recipe.category,
      selectedOption: priceOption.label,
      price: priceOption.price,
      amount: 1,
      unit: 'Qty',
      image: recipe.image,
      customMessage: '',
      recipeName: 'Standard Flavor',
    });
  };

  // Render correct tab view
  const renderContent = () => {
    // If a recipe is currently selected, show the immersive detail view
    if (selectedRecipe) {
      return (
        <RecipeDetail
          recipe={selectedRecipe}
          onBack={handleBackToDiscover}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={(item) => {
            handleAddToCart(item);
            setActiveTab('shopping'); // Auto redirect to cart on add
            setSelectedRecipe(null);
          }}
          onGoToCart={() => {
            setSelectedRecipe(null);
            setActiveTab('shopping');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Home
            recipes={recipes}
            categoryInfos={categoryInfos}
            onNavigateToTab={(tab, category) => {
              setTabHistory((prev) => {
                if (prev.length > 0 && prev[prev.length - 1] === activeTab) return prev;
                return [...prev, activeTab];
              });
              setActiveTab(tab);
              if (category) {
                setActiveCategory(category);
              }
            }}
            logo={logo}
            websiteName={websiteName}
            websiteSlogan={websiteSlogan}
          />
        );
      case 'discover':
        return (
          <Dashboard
            recipes={recipes}
            categoryInfos={categoryInfos}
            onSelectRecipe={handleSelectRecipe}
            onToggleFavorite={handleToggleFavorite}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            logo={logo}
            websiteName={websiteName}
            websiteSlogan={websiteSlogan}
          />
        );
      case 'planner':
        return (
          <MealPlanner
            recipes={recipes}
            mealPlan={mealPlan}
            onAddMeal={handleAddMeal}
            onRemoveMeal={handleRemoveMeal}
            onAddIngredientsToShoppingList={(recipe) => recipe && handleAddIngredientsToShoppingList(recipe, recipe.servings)}
            onSelectRecipe={handleSelectRecipe}
            preselectedRecipeId={preselectedRecipeId}
            clearPreselectedRecipeId={() => setPreselectedRecipeId('')}
          />
        );
      case 'shopping':
        return (
          <ShoppingList
            shoppingList={shoppingList}
            onToggleBought={handleToggleBought}
            onAddItem={() => {}} // legacy, not needed
            onRemoveItem={handleRemoveShoppingItem}
            onClearCompleted={handleClearCompleted}
            onClearAll={handleClearAllShopping}
            onCheckout={handleCheckout}
            upiId={upiId}
            upiQrCode={upiQrCode}
            cashOnDeliveryEnabled={cashOnDeliveryEnabled}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            recipes={recipes}
            setRecipes={setRecipes}
            categoryInfos={categoryInfos}
            setCategoryInfos={setCategoryInfos}
            logo={logo}
            setLogo={setLogo}
            websiteName={websiteName}
            setWebsiteName={setWebsiteName}
            websiteSlogan={websiteSlogan}
            setWebsiteSlogan={setWebsiteSlogan}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
            addToast={addToast}
            upiId={upiId}
            setUpiId={setUpiId}
            upiQrCode={upiQrCode}
            setUpiQrCode={setUpiQrCode}
            cashOnDeliveryEnabled={cashOnDeliveryEnabled}
            setCashOnDeliveryEnabled={setCashOnDeliveryEnabled}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-brand-cream text-brand-cocoa font-sans antialiased flex flex-col">
      {/* Website Top Header Navbar */}
      <Navbar
        activeTab={selectedRecipe ? 'discover' : activeTab}
        setActiveTab={(tab) => {
          setSelectedRecipe(null); // Close active recipe detail when changing tabs
          setTabHistory((prev) => {
            if (prev.length > 0 && prev[prev.length - 1] === activeTab) return prev;
            return [...prev, activeTab];
          });
          setActiveTab(tab);
        }}
        shoppingItemsCount={shoppingList.reduce((acc, item) => acc + item.amount, 0)}
        mealPlanCount={mealPlan.length}
        logo={logo}
        websiteName={websiteName}
        websiteSlogan={websiteSlogan}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      />

      {/* Main Screen Layout with AnimatePresence */}
      <main id="app-main-content" className="flex-1 w-full flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRecipe ? `detail-${selectedRecipe.id}` : activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 flex flex-col w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Global Floating Back Button */}
        {(tabHistory.length > 0 || selectedRecipe) && activeTab !== 'home' && (
          <div className="fixed bottom-6 left-6 z-40 animate-fadeIn">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-5 py-3 bg-brand-cocoa text-white hover:bg-brand-cocoa-light text-xs font-semibold rounded-full shadow-xl border border-brand-cocoa border-brand-cocoa-border cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 text-brand-pink" />
              <span>Back</span>
            </button>
          </div>
        )}
      </main>

      {/* Dynamic Global Toast Notifications System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-4 rounded-2xl border shadow-xl flex gap-3 text-left items-start justify-between backdrop-blur-md pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-emerald-50/95 text-emerald-900 border-emerald-200'
                  : toast.type === 'warning'
                  ? 'bg-amber-50/95 text-amber-900 border-amber-200'
                  : 'bg-brand-cocoa/95 text-brand-cream border-brand-cocoa-border'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="font-sans font-bold text-xs block mb-0.5">
                  {toast.title}
                </span>
                <span className="font-sans text-[11px] leading-relaxed block">
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className={`p-1 rounded-lg hover:bg-black/5 transition-all shrink-0 cursor-pointer ${
                  toast.type === 'success' ? 'text-emerald-700' : toast.type === 'warning' ? 'text-amber-700' : 'text-brand-cream-light/60'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Luxury Brand Store Footer */}
      <footer className="bg-brand-cocoa text-brand-cream border-t border-brand-cocoa-border py-12 px-6 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-brand-cream/25 overflow-hidden bg-white/10 p-0.5 shrink-0">
                <img src={logo} alt={`${websiteName} Logo`} className="w-full h-full object-cover rounded-full" />
              </div>
              <h4 className="font-display font-black text-lg text-white uppercase tracking-wider">{websiteName}</h4>
            </div>
            <p className="text-brand-cream-light/70 text-xs leading-relaxed">
              We specialize in artisanal pastries, custom milestone cakes, and organic hand-piped treats. Handcrafted with love in our signature fairy kitchen.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-brand-pink">gourmet assistance</h4>
            <p className="text-brand-cream-light/70 text-xs leading-relaxed">
              Got a custom design in mind? Drop us an inquiry or visit our kitchen for a personal cake-tasting session.
            </p>
            <p className="text-brand-cream-light/70 text-xs mt-1.5 flex flex-col sm:flex-row sm:items-center gap-1.5">
              <span>Contact Email:</span>
              <a 
                href="mailto:hellofrostingfairy@gmail.com" 
                className="text-brand-pink hover:text-white font-bold transition-all underline decoration-brand-pink/40 decoration-1"
              >
                hellofrostingfairy@gmail.com
              </a>
            </p>
            <p className="text-brand-cream-light/70 text-xs mt-1.5 flex items-center gap-1.5">
              <span>Instagram:</span>
              <a 
                href="https://www.instagram.com/the._frosting._fairy._?igsh=MWk0dWM4ZWN0a2RrNQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-pink hover:text-white font-bold transition-all underline decoration-brand-pink/40 decoration-1 inline-flex items-center gap-1"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@the._frosting._fairy._</span>
              </a>
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-brand-cream-light/40 font-mono uppercase tracking-widest">
          <span>© 2026 The Frosting Fairy Confectionery Ltd.</span>
          <span>Freshly Baked Every Day</span>
        </div>
      </footer>
    </div>
  );
}
