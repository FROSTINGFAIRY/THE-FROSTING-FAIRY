import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import logoImg from '../assets/images/frosting_fairy_logo_1784129178255.webp';
import OrderSuccessModal, { OrderSuccessDetails } from './OrderSuccessModal';
import { BakeryStoreMapModal } from './BakeryMapModal';
import { triggerOrderSuccessConfetti } from '../lib/confetti';
import { INITIAL_RECIPES, INITIAL_CATEGORY_INFOS } from '../data';
import { Recipe, ShoppingItem, MealPlanEntry, CategoryInfo, CheckoutData, LayoutContextType, CustomerProfile } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { X, Instagram, ArrowLeft, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  getStoredCustomer,
  getStoredCustomerToken,
  storeCustomerSession,
  clearCustomerSession,
  fetchCurrentSession,
  updateCustomerProfileOnServer,
} from '../lib/customerAuth';

const SHOPPING_STORAGE_KEY = 'tff_shopping_list';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- CORE STATE DRIVEN BY FIRESTORE ---
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>([]);
  const [categoryInfos, setCategoryInfos] = useState<CategoryInfo[]>(INITIAL_CATEGORY_INFOS);

  // Store & Branding State
  const [logo, setLogo] = useState<string>(logoImg);
  const [websiteName, setWebsiteName] = useState<string>('THE FROSTING FAIRY');
  const [websiteSlogan, setWebsiteSlogan] = useState<string>('CREATING EDIBLE MAGIC');
  const [upiId, setUpiId] = useState<string>('justforme680@oksbi');
  const [upiQrCode, setUpiQrCode] = useState<string>('');
  const [cashOnDeliveryEnabled, setCashOnDeliveryEnabled] = useState<boolean>(true);

  // 1. LIVE PRODUCTS DATA FROM FIRESTORE
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      if (snapshot.empty) {
        setRecipes(INITIAL_RECIPES);
      } else {
        const initialMap = new Map(INITIAL_RECIPES.map((r) => [r.id, r]));
        const loadedRecipes: Recipe[] = [];
        const seenIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const docData = docSnap.data() as Partial<Recipe>;
          const initial = initialMap.get(docSnap.id);
          seenIds.add(docSnap.id);

          if (initial) {
            const isStaleCookie = docSnap.id.startsWith('cookie-') && (
              docData.name === 'Dark Chocolate Chunks Cookies' ||
              (docSnap.id === 'cookie-dark-chunks' && (docData.priceOptions?.[0]?.price !== 360 || docData.image !== initial.image)) ||
              (docSnap.id === 'cookie-red-velvet' && docData.priceOptions?.[0]?.price !== 390) ||
              (docSnap.id === 'cookie-choco-chip' && docData.priceOptions?.[0]?.price !== 250) ||
              (docSnap.id === 'cookie-double-choco' && docData.priceOptions?.[0]?.price !== 300) ||
              (docSnap.id === 'cookie-mm' && docData.priceOptions?.[0]?.price !== 330)
            );

            const normalizedCategory = (docData.category === 'New Additions' ? 'Cinnamon Rolls' : (docData.category || initial.category));
            if (isStaleCookie) {
              loadedRecipes.push({
                ...initial,
                category: normalizedCategory,
                isFavorite: docData.isFavorite ?? initial.isFavorite,
              });
            } else {
              loadedRecipes.push({
                ...initial,
                ...docData,
                category: normalizedCategory,
                id: docSnap.id,
              } as Recipe);
            }
          } else {
            const normalizedCategory = docData.category === 'New Additions' ? 'Cinnamon Rolls' : (docData.category || 'Cinnamon Rolls');
            loadedRecipes.push({ id: docSnap.id, ...docData, category: normalizedCategory } as Recipe);
          }
        });

        INITIAL_RECIPES.forEach((initRecipe) => {
          if (!seenIds.has(initRecipe.id)) {
            loadedRecipes.push(initRecipe);
          }
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
        const cName = (data.customerName || data.contactName || '').toLowerCase();
        const cPhone = (data.customerPhone || data.contactPhone || '').toLowerCase();
        const cAddr = (data.deliveryAddress || '').toLowerCase();

        const isDummy =
          cName.includes('jane doe') ||
          cName.includes('test') ||
          cPhone.includes('15550192834') ||
          cPhone.includes('5550192834') ||
          cAddr.includes('fairy lane') ||
          cAddr.includes('pastry tow');

        if (isDummy) {
          deleteDoc(doc(db, 'orders', docSnap.id)).catch((err) => {
            console.warn('Auto-purge dummy order error:', err);
          });
          return;
        }

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
          paymentMethod: (!cashOnDeliveryEnabled && data.paymentMethod === 'COD') ? 'UPI' : (data.paymentMethod === 'COD' ? 'COD' : 'UPI'),
          paymentDetails: data.paymentDetails || {},
          adminNotes: data.adminNotes || [],
          boxContents: data.boxContents || undefined,
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
  }, [cashOnDeliveryEnabled]);

  // 3. LIVE BRANDING & STORE SETTINGS FROM FIRESTORE
  useEffect(() => {
    const brandingRef = doc(db, 'settings', 'branding');
    const unsubscribe = onSnapshot(brandingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.logo) setLogo(data.logo);
        if (data.websiteName) setWebsiteName(data.websiteName);
        if (data.websiteSlogan) setWebsiteSlogan(data.websiteSlogan);
        if (data.upiId) {
          if (data.upiId === 'thefrostingfairy@okaxis') {
            setUpiId('justforme680@oksbi');
            setDoc(brandingRef, { upiId: 'justforme680@oksbi' }, { merge: true }).catch((err) => {
              console.warn('Auto-sync UPI ID update error:', err);
            });
          } else {
            setUpiId(data.upiId);
          }
        } else {
          setUpiId('justforme680@oksbi');
        }
        if (data.upiQrCode !== undefined) setUpiQrCode(data.upiQrCode);
        if (data.cashOnDeliveryEnabled !== undefined) setCashOnDeliveryEnabled(data.cashOnDeliveryEnabled);
      } else {
        setDoc(brandingRef, {
          upiId: 'justforme680@oksbi',
        }, { merge: true }).catch((err) => {
          console.warn('Init branding doc error:', err);
        });
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

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('tff_theme') as 'light' | 'dark') || 'light';
  });

  // Modals state
  const [orderSuccessModalData, setOrderSuccessModalData] = useState<OrderSuccessDetails | null>(null);
  const [isBakeryMapOpen, setIsBakeryMapOpen] = useState<boolean>(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tff_theme', theme);
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

  // Global Toast State
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: 'success' | 'info' | 'warning' }[]>([]);
  const [prevStatuses, setPrevStatuses] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const saved = localStorage.getItem('tff_my_orders');
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
    }, 6000);
  };

  useEffect(() => {
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

    const currentStatuses: Record<string, string> = {};
    mealPlan.forEach((order) => {
      currentStatuses[order.id] = order.status || 'Pending';
    });
    setPrevStatuses(currentStatuses);
  }, [mealPlan]);

  // Handlers
  const handleToggleFavorite = (recipeId: string) => {
    setRecipes((prevRecipes) => {
      return prevRecipes.map((r) =>
        r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r
      );
    });
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    navigate(`/product/${recipe.id}`);
  };

  const handleAddMeal = (entry: MealPlanEntry) => {
    setMealPlan((prev) => [...prev, entry]);
  };

  const handleRemoveMeal = async (id: string) => {
    setMealPlan((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteDoc(doc(db, 'orders', id));
      addToast('🗑️ Order Cancelled', 'The order has been removed.', 'info');
    } catch (e: any) {
      console.warn('Could not delete order from Firestore:', e);
    }
  };

  const handleReorder = (order: MealPlanEntry) => {
    const matchedRecipe = recipes.find(
      (r) => r.id === order.recipe?.id || r.name.toLowerCase() === order.cakeType.toLowerCase()
    );

    const cartItem = {
      productId: matchedRecipe?.id || order.recipe?.id || `product-${Date.now()}`,
      name: order.cakeType,
      category: matchedRecipe?.category || order.recipe?.category || 'Signature Cakes',
      selectedOption: order.weight || 'Standard',
      price: order.estimatedPrice || (matchedRecipe?.priceOptions?.[0]?.price ?? 500),
      amount: 1,
      unit: 'pcs',
      image:
        order.recipe?.image ||
        matchedRecipe?.image ||
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=300',
      customMessage: order.message || '',
      recipeName: order.flavor || 'Signature Flavor',
      boxContents:
        order.boxContents && order.boxContents.length > 0
          ? order.boxContents.map((b) => ({ name: b.name, quantity: b.quantity, price: b.price ?? 0 }))
          : undefined,
    };

    handleAddToCart(cartItem);
    addToast(
      '🛒 Re-Order Added to Cart!',
      `"${order.cakeType}" (${order.weight}) with previous customizations has been added to your cart.`,
      'success'
    );
    navigate('/cart');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: MealPlanEntry['status']) => {
    setMealPlan((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      addToast('✨ Status Updated', `Order marked as ${newStatus}.`, 'success');
    } catch (err: any) {
      console.warn('Could not update order status in Firestore:', err);
    }
  };

  const handleAddToCart = (item: {
    productId: string;
    name: string;
    category: string;
    selectedOption: string;
    price: number;
    amount: number;
    unit: string;
    image: string;
    customMessage: string;
    recipeName: string;
    boxContents?: { name: string; quantity: number; price: number }[];
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
      boxContents: item.boxContents,
    };

    setShoppingList((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.selectedOption === item.selectedOption &&
          i.customMessage === item.customMessage &&
          i.recipeName === item.recipeName &&
          JSON.stringify(i.boxContents || []) === JSON.stringify(item.boxContents || [])
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

  const handleCheckout = async (checkoutData: CheckoutData) => {
    if (!cashOnDeliveryEnabled && checkoutData.paymentMethod === 'COD') {
      alert("Cash on Delivery is currently disabled. Please select a different payment method.");
      return;
    }

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
            customMessage: item.customMessage,
            boxContents: item.boxContents,
          })),
          checkoutData
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process order checkout.');
      }

      const cartSubtotal = shoppingList.reduce((sum, item) => sum + (item.price || 0) * item.amount, 0);
      const deliveryCharge = checkoutData.deliveryType === 'Delivery' ? (cartSubtotal >= 600 ? 0 : 50) : 0;
      const grandTotal = cartSubtotal + deliveryCharge;
      const totalCount = shoppingList.reduce((sum, item) => sum + item.amount, 0);

      triggerOrderSuccessConfetti();

      setOrderSuccessModalData({
        orderId: data.orderId || data.id,
        customerName: checkoutData.customerName,
        deliveryType: checkoutData.deliveryType,
        deliveryAddress: checkoutData.deliveryAddress,
        pickupDate: checkoutData.pickupDate,
        pickupTime: checkoutData.pickupTime,
        totalAmount: grandTotal,
        itemsCount: totalCount,
      });

      addToast(
        '🎉 Order Placed Successfully!',
        `Thank you ${checkoutData.customerName}! Your order has been placed and queued with our bakers.`,
        'success'
      );

      setShoppingList([]);
    } catch (err: any) {
      console.error('Error during order creation checkout:', err);
      alert('Order checkout notice: ' + (err.message || 'Please try again.'));
    }
  };

  const handleUpiPaymentSuccess = (verifiedData: {
    orderIds: string[];
    orderNumber: string;
    paidAmount: number;
    transactionId: string;
    paidAt: string;
    gatewayRef: string;
    checkoutData: any;
  }) => {
    const { checkoutData, orderNumber, paidAmount, gatewayRef } = verifiedData;
    const totalCount = shoppingList.reduce((sum, item) => sum + item.amount, 0);

    triggerOrderSuccessConfetti();

    setOrderSuccessModalData({
      orderId: orderNumber,
      customerName: checkoutData.customerName,
      deliveryType: checkoutData.deliveryType,
      deliveryAddress: checkoutData.deliveryAddress,
      pickupDate: checkoutData.pickupDate,
      pickupTime: checkoutData.pickupTime,
      totalAmount: paidAmount,
      itemsCount: totalCount,
    });

    addToast(
      '🎉 Payment Verified & Confirmed!',
      `Thank you ${checkoutData.customerName}! Your UPI payment of ₹${paidAmount} was verified (Ref: ${gatewayRef}). Order #${orderNumber} is confirmed!`,
      'success'
    );

    setShoppingList([]);
  };

  const handleToggleBought = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isBought: !item.isBought } : item))
    );
  };

  const handleUpdateQuantity = (id: string, newAmount: number) => {
    if (newAmount <= 0) {
      handleRemoveShoppingItem(id);
      return;
    }
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: newAmount } : item))
    );
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCompleted = () => {
    setShoppingList((prev) => prev.filter((item) => !item.isBought));
  };

  const handleClearAllShopping = () => {
    setShoppingList([]);
  };

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

  // Customer Mobile Authentication state
  const [customer, setCustomer] = useState<CustomerProfile | null>(getStoredCustomer);
  const [customerToken, setCustomerToken] = useState<string | null>(getStoredCustomerToken);

  useEffect(() => {
    if (customerToken) {
      fetchCurrentSession(customerToken).then((profile) => {
        if (profile) {
          setCustomer(profile);
        } else {
          setCustomer(null);
          setCustomerToken(null);
        }
      });
    }
  }, [customerToken]);

  const handleCustomerLogin = (newCustomer: CustomerProfile, token: string) => {
    setCustomer(newCustomer);
    setCustomerToken(token);
    storeCustomerSession(token, newCustomer);
    addToast(
      '👋 Logged In Successfully',
      `Welcome ${newCustomer.fullName || newCustomer.fullPhoneNumber}! You can now proceed with your order.`,
      'success'
    );
  };

  const handleCustomerLogout = () => {
    setCustomer(null);
    setCustomerToken(null);
    clearCustomerSession();
    addToast('Logged Out', 'You have been logged out. Please verify your number when you are ready to checkout.', 'info');
  };

  const handleUpdateCustomerProfile = async (data: Partial<CustomerProfile>) => {
    if (!customerToken) return;
    try {
      const updated = await updateCustomerProfileOnServer(customerToken, data);
      setCustomer(updated);
    } catch (e) {
      console.warn('Profile update error:', e);
    }
  };

  const layoutContextValue: LayoutContextType = {
    recipes,
    setRecipes,
    mealPlan,
    setMealPlan,
    categoryInfos,
    setCategoryInfos,
    logo,
    setLogo,
    websiteName,
    setWebsiteName,
    websiteSlogan,
    setWebsiteSlogan,
    upiId,
    setUpiId,
    upiQrCode,
    setUpiQrCode,
    cashOnDeliveryEnabled,
    setCashOnDeliveryEnabled,
    shoppingList,
    setShoppingList,
    toasts,
    setToasts,
    addToast,
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    handleToggleFavorite,
    handleSelectRecipe,
    handleAddMeal,
    handleRemoveMeal,
    handleReorder,
    handleUpdateOrderStatus,
    handleAddToCart,
    handleCheckout,
    handleUpiPaymentSuccess,
    handleToggleBought,
    handleUpdateQuantity,
    handleRemoveShoppingItem,
    handleClearCompleted,
    handleClearAllShopping,
    handleAddIngredientsToShoppingList,
    setIsBakeryMapOpen,
    customer,
    customerToken,
    isCustomerLoggedIn: !!customer,
    handleCustomerLogin,
    handleCustomerLogout,
    handleUpdateCustomerProfile,
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-brand-cream text-brand-cocoa font-sans antialiased flex flex-col">
      {/* Website Top Header Navbar */}
      <Navbar
        shoppingItemsCount={shoppingList.reduce((acc, item) => acc + item.amount, 0)}
        ordersCount={mealPlan.length}
        logo={logo}
        websiteName={websiteName}
        websiteSlogan={websiteSlogan}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenMap={() => setIsBakeryMapOpen(true)}
        customer={customer}
        onLogout={handleCustomerLogout}
      />

      {/* Main Screen Outlet Layout */}
      <main id="app-main-content" className="flex-1 w-full flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 flex flex-col w-full"
          >
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center p-16 min-h-[360px] space-y-3">
                  <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
                  <span className="text-xs font-mono text-brand-cocoa-light">Loading fresh treats...</span>
                </div>
              }
            >
              <Outlet context={layoutContextValue} />
            </Suspense>
          </motion.div>
        </AnimatePresence>

        {/* Global Floating Back Button (Hidden on /) */}
        {location.pathname !== '/' && (
          <div className="fixed bottom-6 left-6 z-40 animate-fadeIn">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-3 bg-brand-cocoa text-white hover:bg-brand-cocoa-light text-xs font-semibold rounded-full shadow-xl border border-brand-cocoa border-brand-cocoa-border cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-4 h-4 text-brand-pink" />
              <span>Back</span>
            </button>
          </div>
        )}
      </main>

      {/* Global Toast System */}
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

      {/* Celebratory Order Confirmation Modal */}
      <AnimatePresence>
        {orderSuccessModalData && (
          <OrderSuccessModal
            orderDetails={orderSuccessModalData}
            onClose={() => setOrderSuccessModalData(null)}
            onViewOrders={() => {
              setOrderSuccessModalData(null);
              navigate('/orders');
            }}
            onContinueShopping={() => {
              setOrderSuccessModalData(null);
              navigate('/shop');
            }}
          />
        )}
      </AnimatePresence>

      {/* Interactive Google Map Modal */}
      <BakeryStoreMapModal
        isOpen={isBakeryMapOpen}
        onClose={() => setIsBakeryMapOpen(false)}
      />

      {/* Boutique Confectionery Footer with Legal Column */}
      <footer className="bg-brand-cocoa text-brand-cream border-t border-brand-cocoa-border py-12 px-6 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left text-sm">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-brand-cream/25 overflow-hidden bg-white/10 p-0.5 shrink-0">
                <img src={logo} alt={`${websiteName} Logo`} width="56" height="56" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-full" />
              </div>
              <h4 className="font-display font-black text-lg text-white uppercase tracking-wider">{websiteName}</h4>
            </div>
            <p className="text-brand-cream-light/70 text-xs leading-relaxed">
              We specialize in artisanal pastries, custom milestone cakes, and organic hand-piped treats. Handcrafted with love in our signature fairy kitchen.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-brand-pink font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Guest Checkout • Direct UPI & COD</span>
            </div>
          </div>

          {/* Column 2: Legal & Policies */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-brand-pink">
              Legal & Compliance
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-y-1.5 text-xs text-brand-cream-light/75">
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-pink transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-brand-pink transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-brand-pink transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="hover:text-brand-pink transition-colors">Cancellation Policy</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-brand-pink transition-colors">Delivery & Store Pickup</Link>
              </li>
              <li>
                <Link to="/returns-exchange-policy" className="hover:text-brand-pink transition-colors">Returns & Exchanges</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-brand-pink transition-colors">Allergen & Product Disclaimer</Link>
              </li>
              <li>
                <Link to="/accessibility-statement" className="hover:text-brand-pink transition-colors">Accessibility Statement</Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-brand-pink transition-colors">Cookie & Storage Policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Gourmet Assistance */}
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-brand-pink">
              Gourmet Assistance
            </h4>
            <p className="text-brand-cream-light/70 text-xs leading-relaxed">
              Got a custom milestone cake in mind? Drop us an inquiry or visit our kitchen for a personal cake-tasting session.
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
          <span>Freshly Baked Every Day in India</span>
        </div>
      </footer>
    </div>
  );
}
