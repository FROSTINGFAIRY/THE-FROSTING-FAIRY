import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Minus,
  Plus,
  Calendar, 
  Clock, 
  Phone, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  Loader2,
  Lock,
  Smartphone,
  Check,
  Cake
} from 'lucide-react';
import { ShoppingItem, CheckoutData, LayoutContextType } from '../types';

// Badges & Logos for recognizable UPI & card network icons
const GPayLogo = () => (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white border border-slate-200 shrink-0 p-1.5 transition-transform hover:scale-105" title="Google Pay">
    <svg className="w-5 h-5 object-contain" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.42 6.85a3.71 3.71 0 0 0-5.25 0l-5.6 5.6a3.71 3.71 0 0 0 0 5.25l.88.88a3.71 3.71 0 0 0 5.25 0l5.6-5.6a3.71 3.71 0 0 0 0-5.25l-.88-.88z" fill="#4285F4"/>
      <path d="M10.17 18.58a3.71 3.71 0 0 1-5.25 0l-.88-.88a3.71 3.71 0 0 1 0-5.25l2.8-2.8 2.8 2.8a3.71 3.71 0 0 1 0 5.25l.53.88z" fill="#34A853"/>
      <path d="M19.45 6.85a3.71 3.71 0 0 0-5.25 0l-1.4 1.4 2.8 2.8 1.4-1.4a3.71 3.71 0 0 0 0-5.25l2.45 2.45z" fill="#EA4335"/>
      <path d="M19.45 12.1a3.71 3.71 0 0 1 0 5.25l-.88.88a3.71 3.71 0 0 1-5.25 0l-5.6-5.6a3.71 3.71 0 0 1 0-5.25l.88-.88a3.71 3.71 0 0 1 5.25 0l5.6 5.6z" fill="#FBBC04"/>
    </svg>
  </span>
);

const PhonePeLogo = () => (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[#5f259f] border border-[#5f259f] shrink-0 p-1.5 transition-transform hover:scale-105" title="PhonePe">
    <svg className="w-5 h-5 object-contain" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 11.8C16.8 11.2 15.6 10.7 14.1 10.7H11.2V7.5H13.6C14.3 7.5 14.8 7 14.8 6.3C14.8 5.6 14.3 5.1 13.6 5.1H9.2C8.5 5.1 8 5.6 8 6.3C8 7 8.5 7.5 9.2 7.5H9.7V17.7C9.7 18.4 10.2 18.9 10.9 18.9C11.6 18.9 12.1 18.4 12.1 17.7V14.1H14.1C16 14.1 17.6 13.4 18.1 12.6C18.4 12.2 18 11.7 17.5 11.8Z" fill="#FFFFFF" />
      <path d="M13.8 13.8L17.2 18.3C17.6 18.8 18.3 18.9 18.8 18.5C19.3 18.1 19.4 17.4 19 16.9L15.6 12.4C15.1 12.9 14.5 13.4 13.8 13.8Z" fill="#FFFFFF" />
    </svg>
  </span>
);

const PaytmLogo = () => (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white border border-slate-200 shrink-0 p-1 transition-transform hover:scale-105" title="Paytm">
    <svg className="w-6 h-3 object-contain" viewBox="0 0 46 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" fill="#002970" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="-0.5">Pay</text>
      <text x="24" y="12" fill="#00BAF2" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="-0.5">tm</text>
    </svg>
  </span>
);

interface CartCheckoutProps {
  shoppingList?: ShoppingItem[];
  onToggleBought?: (id: string) => void;
  onAddItem?: (name: string, category: string, amount: number, unit: string) => void; // kept for legacy compat
  onUpdateQuantity?: (id: string, newAmount: number) => void;
  onRemoveItem?: (id: string) => void;
  onClearCompleted?: () => void;
  onClearAll?: () => void;
  onCheckout?: (checkoutData: CheckoutData) => void;
  onUpiPaymentSuccess?: (verifiedData: {
    orderIds: string[];
    orderNumber: string;
    paidAmount: number;
    transactionId: string;
    paidAt: string;
    gatewayRef: string;
    checkoutData: any;
  }) => void;
  upiId?: string;
  upiQrCode?: string;
  cashOnDeliveryEnabled?: boolean;
}

// 1. Standard Modal Razorpay Loader (checkout.js)
const loadRazorpaySdk = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// 2. Razorpay Custom/Intent SDK Loader (razorpay.js) for Direct UPI App Deep-Linking
const loadRazorpayCustomSdk = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/razorpay.js"]');
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/razorpay.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartCheckout(props: CartCheckoutProps) {
  const context = useOutletContext<LayoutContextType | null>();
  const navigate = useNavigate();

  const shoppingList = props.shoppingList || context?.shoppingList || [];
  const onRemoveItem = props.onRemoveItem || ((id: string) => context?.handleRemoveShoppingItem(id));
  const onClearAll = props.onClearAll || (() => context?.handleClearAllShopping());
  const onCheckout = props.onCheckout || ((data: CheckoutData) => context?.handleCheckout(data));
  const onUpiPaymentSuccess = props.onUpiPaymentSuccess || ((data: any) => context?.handleUpiPaymentSuccess(data));
  const cashOnDeliveryEnabled = props.cashOnDeliveryEnabled ?? context?.cashOnDeliveryEnabled ?? true;

  // Mobile Viewport detection for UPI app deep-links
  const [isMobileView, setIsMobileView] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getItemUnitPrice = (item: ShoppingItem): number => {
    if (context?.recipes) {
      const matched = context.recipes.find(
        (r) => r.id === item.productId || r.name.toLowerCase() === item.name.toLowerCase()
      );
      if (matched && Array.isArray(matched.priceOptions) && matched.priceOptions.length > 0) {
        if (item.selectedOption) {
          const opt = matched.priceOptions.find(
            (o) => (o.label || '').toLowerCase() === (item.selectedOption || '').toLowerCase()
          );
          if (opt && typeof opt.price === 'number') {
            return opt.price;
          }
        }
        if (typeof item.price === 'number' && item.price > 0) {
          return item.price;
        }
        return matched.priceOptions[0].price;
      }
    }
    return typeof item.price === 'number' ? item.price : 0;
  };

  const getItemStockLimit = (item: ShoppingItem): number | undefined => {
    if (context?.recipes) {
      const matched = context.recipes.find(
        (r) => r.id === item.productId || r.name.toLowerCase() === item.name.toLowerCase()
      );
      if (matched) {
        const stock = (matched as any).stockLimit ?? (matched as any).stock ?? (matched as any).maxQuantity;
        if (typeof stock === 'number' && stock > 0) {
          return stock;
        }
      }
    }
    return undefined;
  };

  const handleUpdateQty = (itemId: string, newAmount: number) => {
    if (props.onUpdateQuantity) {
      props.onUpdateQuantity(itemId, newAmount);
    } else if (context?.handleUpdateQuantity) {
      context.handleUpdateQuantity(itemId, newAmount);
    } else if (context?.setShoppingList) {
      if (newAmount <= 0) {
        onRemoveItem(itemId);
      } else {
        context.setShoppingList((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, amount: newAmount } : item))
        );
      }
    }
  };

  useEffect(() => {
    document.title = 'Shopping Cart & Checkout | The Frosting Fairy';
  }, []);

  // --- FORM STATE ---
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Set default pickup date to tomorrow
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  
  const [pickupTime, setPickupTime] = useState('14:00');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payingWithApp, setPayingWithApp] = useState<string | null>(null);

  // Delivery & location state
  const [deliveryType, setDeliveryType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState('');

  // Payment Method: 'Razorpay' (Pay Online via UPI, Cards, NetBanking, Wallets) or 'COD'
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'all' | 'google_pay' | 'phonepe' | 'paytm' | 'bhim' | 'cred'>('all');

  useEffect(() => {
    if (!cashOnDeliveryEnabled && paymentMethod === 'COD') {
      setPaymentMethod('Razorpay');
    }
  }, [cashOnDeliveryEnabled, paymentMethod]);

  // Preload Razorpay SDK dynamically on mount when entering checkout flow
  useEffect(() => {
    loadRazorpaySdk().catch(() => {});
    loadRazorpayCustomSdk().catch(() => {});
  }, []);

  // Cart totals calculation
  const totalItemsCount = shoppingList.reduce((sum, item) => sum + item.amount, 0);
  const cartSubtotal = shoppingList.reduce((sum, item) => sum + getItemUnitPrice(item) * item.amount, 0);

  // Delivery Charge logic: flat ₹50, but FREE above ₹600 or if Pickup
  const deliveryCharge = deliveryType === 'Delivery' ? (cartSubtotal >= 600 ? 0 : 50) : 0;
  const grandTotal = cartSubtotal + deliveryCharge;

  // Geolocation trigger
  const handlePinLocation = () => {
    if (!navigator.geolocation) {
      setLocationFeedback('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationFeedback('Connecting to GPS satellites...');

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setGpsCoordinates(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
          setLocationFeedback('Pin secured! Fetching street address...');

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
            );
            if (response.ok) {
              const data = await response.json();
              if (data && data.display_name) {
                setDeliveryAddress(data.display_name);
                setLocationFeedback('Address auto-filled successfully! ✨');
              } else {
                setDeliveryAddress(`Latitude: ${lat.toFixed(6)}, Longitude: ${lon.toFixed(6)}`);
                setLocationFeedback('Coordinates pinned! (Type flat/building number)');
              }
            } else {
              setDeliveryAddress(`Latitude: ${lat.toFixed(6)}, Longitude: ${lon.toFixed(6)}`);
              setLocationFeedback('Coordinates pinned! (Type street details)');
            }
          } catch (err) {
            setDeliveryAddress(`Latitude: ${lat.toFixed(6)}, Longitude: ${lon.toFixed(6)}`);
            setLocationFeedback('Location secured! (Lookup offline, type landmark)');
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          setIsLocating(false);
          console.error(error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationFeedback('Location permission denied. Please write address manually, or open the website in a new tab.');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationFeedback('GPS signal unavailable. Please write address manually.');
              break;
            case error.TIMEOUT:
              setLocationFeedback('GPS connection timed out. Please write address manually.');
              break;
            default:
              setLocationFeedback('Failed to access location. Type address below.');
              break;
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } catch (err) {
      setIsLocating(false);
      setLocationFeedback('Location blocked by browser or iframe policy. Open the app in a new tab to pin!');
    }
  };

  // --- REUSABLE FORM VALIDATION ---
  const validateCheckoutForm = (): boolean => {
    setErrorMessage('');

    if (shoppingList.length === 0) {
      setErrorMessage('Your shopping cart is empty! Add a treat from our menu first.');
      return false;
    }
    if (!customerName.trim()) {
      setErrorMessage('Please provide your name for the order.');
      return false;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Please enter a phone number so we can contact you.');
      return false;
    }
    if (!pickupDate) {
      setErrorMessage('Please pick an order collection/delivery date.');
      return false;
    }

    if (deliveryType === 'Delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please enter a delivery address or pin your current location.');
      return false;
    }

    if (paymentMethod === 'COD' && !cashOnDeliveryEnabled) {
      setErrorMessage('Cash on Delivery is currently disabled by store management. Please select Pay Online.');
      return false;
    }

    return true;
  };

  // --- REUSABLE SERVER ORDER CREATION ---
  const createRazorpayOrder = async (preferredApp?: string) => {
    const checkoutPayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      pickupDate,
      pickupTime,
      specialInstructions: specialInstructions.trim(),
      deliveryType,
      deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Pick-up',
      gpsCoordinates,
      paymentMethod: 'Razorpay' as const,
    };

    let createOrderRes = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: shoppingList.map((item) => ({
          productId: item.productId,
          name: item.name,
          recipeName: item.recipeName,
          selectedOption: item.selectedOption,
          amount: item.amount,
          unit: item.unit,
          customMessage: item.customMessage,
          boxContents: item.boxContents,
        })),
        checkoutData: {
          ...checkoutPayload,
          preferredUpiApp: preferredApp || selectedUpiApp,
        },
      }),
    });

    // Fallback to /api/razorpay/create-order if /api/payment/create-order returned 404
    if (createOrderRes.status === 404) {
      createOrderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: shoppingList.map((item) => ({
            productId: item.productId,
            name: item.name,
            recipeName: item.recipeName,
            selectedOption: item.selectedOption,
            amount: item.amount,
            unit: item.unit,
            customMessage: item.customMessage,
            boxContents: item.boxContents,
          })),
          checkoutData: checkoutPayload,
        }),
      });
    }

    const orderData = await createOrderRes.json();
    if (!createOrderRes.ok || !orderData.success) {
      throw new Error(orderData.error || 'Failed to initialize payment gateway order.');
    }

    const razorpayOrderId = orderData.order_id || orderData.razorpayOrderId;
    const amount = orderData.amount;
    const currency = orderData.currency || 'INR';
    const resolvedKeyId = orderData.key_id || orderData.RAZORPAY_KEY_ID || orderData.keyId || (import.meta as any).env.VITE_RAZORPAY_KEY_ID || '';

    return { razorpayOrderId, amount, currency, resolvedKeyId, checkoutPayload };
  };

  // --- REUSABLE SERVER PAYMENT VERIFICATION & COMPLETION ---
  const verifyAndCompleteRazorpayPayment = async (
    response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
    checkoutPayload: any
  ) => {
    try {
      setIsSubmitting(true);
      // 3. Verify payment signature on backend
      let verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      if (verifyRes.status === 404) {
        verifyRes = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
      }

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment signature verification failed.');
      }

      // 4. Trigger celebration & confirmed order modal
      if (onUpiPaymentSuccess) {
        onUpiPaymentSuccess({
          orderIds: verifyData.orderIds || [verifyData.orderNumber],
          orderNumber: verifyData.orderNumber,
          paidAmount: verifyData.paidAmount || grandTotal,
          transactionId: verifyData.transactionId,
          paidAt: verifyData.paidAt,
          gatewayRef: verifyData.gatewayRef,
          checkoutData: {
            ...checkoutPayload,
            paymentStatus: 'Paid',
            paymentDetails: {
              gateway: 'Razorpay',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              gatewayRef: response.razorpay_payment_id,
              paidAt: verifyData.paidAt,
              verifiedOnServer: true,
            },
          },
        });
      } else {
        onCheckout({
          ...checkoutPayload,
          paymentStatus: 'Paid',
          paymentDetails: {
            gateway: 'Razorpay',
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            gatewayRef: response.razorpay_payment_id,
            paidAt: verifyData.paidAt,
            verifiedOnServer: true,
          },
        });
      }
    } catch (verErr: any) {
      console.error('Razorpay verification error:', verErr);
      setErrorMessage(verErr.message || 'Payment verification failed. If your money was deducted, our bakery team will confirm your order shortly.');
    } finally {
      setIsSubmitting(false);
      setPayingWithApp(null);
    }
  };

  // --- DIRECT UPI APP DEEP-LINK HANDLER (Razorpay UPI Custom Intent) ---
  const handleDirectUpiAppPay = async (appId: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred') => {
    if (!validateCheckoutForm()) {
      return;
    }

    setIsSubmitting(true);
    setPayingWithApp(appId);

    try {
      const { razorpayOrderId, amount, currency, resolvedKeyId, checkoutPayload } = await createRazorpayOrder(appId);
      const isSdkLoaded = await loadRazorpayCustomSdk();
      if (!isSdkLoaded || !(window as any).Razorpay) {
        throw new Error('Could not load Razorpay UPI SDK. Please check your internet connection and try again.');
      }

      const razorpayInstance = new (window as any).Razorpay({ key: resolvedKeyId });

      razorpayInstance.on('payment.success', async (response: any) => {
        await verifyAndCompleteRazorpayPayment(response, checkoutPayload);
      });

      razorpayInstance.on('payment.error', (error: any) => {
        console.error('Direct UPI payment failed:', error);
        setErrorMessage(error?.error?.description || 'Payment failed or was cancelled. Please try again.');
        setIsSubmitting(false);
        setPayingWithApp(null);
      });

      razorpayInstance.createPayment(
        {
          amount,
          currency: currency || 'INR',
          order_id: razorpayOrderId,
          contact: customerPhone.trim(),
        },
        {
          app: appId,
        }
      );
    } catch (err: any) {
      console.error('Direct UPI App checkout error:', err);
      setErrorMessage(err.message || 'Unable to open UPI application. Please try standard Razorpay checkout.');
      setIsSubmitting(false);
      setPayingWithApp(null);
    }
  };

  // --- MAIN FORM SUBMISSION (Standard Modal or COD) ---
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckoutForm()) {
      return;
    }

    const checkoutPayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      pickupDate,
      pickupTime,
      specialInstructions: specialInstructions.trim(),
      deliveryType,
      deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Pick-up',
      gpsCoordinates,
      paymentMethod,
    };

    // ============================================
    // 1) REAL RAZORPAY CHECKOUT POPUP PAYMENT FLOW
    // ============================================
    if (paymentMethod === 'Razorpay') {
      setIsSubmitting(true);
      try {
        const isSdkLoaded = await loadRazorpaySdk();
        if (!isSdkLoaded || !(window as any).Razorpay) {
          throw new Error('Could not load Razorpay payment gateway. Please check your internet connection and try again.');
        }

        const { razorpayOrderId, amount, currency, resolvedKeyId } = await createRazorpayOrder();

        // 2. Open official Razorpay Checkout modal
        const options: any = {
          key: resolvedKeyId,
          amount: amount,
          currency: currency,
          name: 'The Frosting Fairy',
          description: `Bakery Order (${totalItemsCount} item${totalItemsCount > 1 ? 's' : ''})`,
          order_id: razorpayOrderId,
          prefill: {
            name: customerName.trim(),
            contact: customerPhone.trim(),
          },
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: "Pay via UPI apps",
                  instruments: [{ method: "upi" }]
                }
              },
              sequence: ["block.upi"],
              preferences: { show_default_blocks: true }
            }
          },
          theme: {
            color: '#d946ef', // brand-pink accent
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            await verifyAndCompleteRazorpayPayment(response, checkoutPayload);
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (failRes: any) => {
          console.error('Razorpay payment failed:', failRes);
          setErrorMessage(failRes?.error?.description || 'Payment was unsuccessful or cancelled. Please try again.');
          setIsSubmitting(false);
        });

        rzp.open();
      } catch (err: any) {
        console.error('Razorpay checkout error:', err);
        setErrorMessage(err.message || 'Unable to connect to Razorpay payment gateway. Please check your connection.');
        setIsSubmitting(false);
      }
      return;
    }

    // ============================================
    // 2) CASH ON DELIVERY (COD) ORDER FLOW
    // ============================================
    setIsSubmitting(true);
    try {
      await onCheckout({
        ...checkoutPayload,
        paymentStatus: 'Unpaid',
        paymentDetails: {},
      });
    } catch (codErr: any) {
      console.error('COD order error:', codErr);
      setErrorMessage(codErr.message || 'Failed to place cash on delivery order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="shopping-root" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-brand-cream flex flex-col">
      {/* Top Header */}
      <header id="shopping-header" className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-cocoa-border pb-5 shrink-0">
        <div>
          <h2 id="shopping-title" className="font-display font-bold text-2xl sm:text-3xl text-brand-cocoa tracking-tight">
            Your Shopping Cart
          </h2>
          <p id="shopping-subtitle" className="text-xs sm:text-sm text-brand-cocoa-light mt-1 font-sans">
            Review your items, choose home delivery or pickup, select your payment option, and confirm your order.
          </p>
        </div>

        {shoppingList.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-cocoa-border hover:border-slate-400 transition-colors bg-white cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {shoppingList.length > 0 ? (
        <div id="shopping-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cart Items List */}
          <div id="cart-items-container" className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-cocoa-light">
                Order Items ({totalItemsCount})
              </span>
              <span className="text-xs font-bold text-brand-pink">
                Subtotal: ₹{cartSubtotal}
              </span>
            </div>

            <div className="space-y-2.5">
              {shoppingList.map((item) => {
                const unitPrice = getItemUnitPrice(item);
                const lineTotal = unitPrice * item.amount;
                const stockLimit = getItemStockLimit(item);

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-brand-cocoa-border rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-colors hover:border-brand-pink-accent/50"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          width="60"
                          height="60"
                          loading="lazy"
                          decoding="async"
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover border border-brand-cocoa-border shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-brand-pink-light/30 border border-brand-pink-accent/30 flex items-center justify-center text-brand-pink shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-sm sm:text-base text-brand-cocoa truncate">
                            {item.name}
                          </h4>

                          {/* Interactive Quantity Stepper */}
                          <div className="inline-flex items-center bg-brand-cream border border-brand-cocoa-border rounded-md p-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, item.amount - 1)}
                              disabled={item.amount <= 1}
                              className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                                item.amount <= 1
                                  ? 'text-brand-cocoa-light/40 cursor-not-allowed opacity-50'
                                  : 'text-brand-cocoa hover:bg-white hover:text-brand-pink cursor-pointer'
                              }`}
                              title={item.amount <= 1 ? 'Minimum quantity is 1 (use trash to remove)' : 'Decrease quantity'}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="w-6 text-center font-mono font-bold text-xs text-brand-cocoa select-none">
                              {item.amount}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, item.amount + 1)}
                              disabled={stockLimit !== undefined && item.amount >= stockLimit}
                              className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                                stockLimit !== undefined && item.amount >= stockLimit
                                  ? 'text-brand-cocoa-light/40 cursor-not-allowed opacity-50'
                                  : 'text-brand-cocoa hover:bg-white hover:text-brand-pink cursor-pointer'
                              }`}
                              title={stockLimit !== undefined && item.amount >= stockLimit ? `Max stock (${stockLimit}) reached` : 'Increase quantity'}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] sm:text-xs text-brand-cocoa-light mt-0.5 truncate">
                          {item.selectedOption || 'Standard'} {item.recipeName ? `· ${item.recipeName}` : ''}
                        </p>

                        {item.customMessage && (
                          <p className="text-[10px] sm:text-[11px] font-mono text-brand-pink mt-0.5 italic truncate">
                            Message: &ldquo;{item.customMessage}&rdquo;
                          </p>
                        )}

                        {Array.isArray(item.boxContents) && item.boxContents.length > 0 && (
                          <div className="mt-1 text-[10px] font-mono text-brand-cocoa-light bg-brand-cream-light/60 p-1.5 rounded-md border border-brand-cocoa-border/40">
                            <span className="font-bold text-brand-cocoa block mb-0.5">Box Contents:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.boxContents.map((c, i) => (
                                <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-brand-cocoa-border/60 text-[9px]">
                                  {c.name} × {c.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-cocoa-border/40 gap-2 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="font-display font-bold text-sm sm:text-base text-brand-pink block">
                          ₹{lineTotal}
                        </span>
                        {item.amount > 1 && (
                          <span className="text-[9px] sm:text-[10px] text-brand-cocoa-light font-mono block">
                            ₹{unitPrice} each
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-xs text-brand-cocoa-light hover:text-red-500 flex items-center gap-1 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sm:hidden text-[10px]">Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Info Banner */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-tight">
                <strong>Free Home Delivery</strong> on all orders above ₹600! Freshly baked to order with organic ingredients.
              </span>
            </div>
          </div>

          {/* Right Column: Checkout Form & Razorpay Gateway */}
          <div id="checkout-form-container" className="lg:col-span-5 bg-white border border-brand-cocoa-border rounded-lg p-5 sm:p-6 space-y-4">
            <div className="border-b border-brand-cocoa-border/60 pb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-brand-cocoa">
                Complete Your Order
              </h3>
              <p className="text-xs text-brand-cocoa-light mt-0.5">
                Fast, secure checkout with encrypted processing.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-md flex items-start gap-2">
                <span className="font-bold">Notice:</span>
                <span className="flex-1">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-400 hover:text-red-700 font-bold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-3.5">
              {/* Customer Contact Details */}
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light flex items-center gap-1">
                    <User className="w-3 h-3 text-brand-pink" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-md px-3 py-2 text-sm text-brand-cocoa focus:outline-none focus:border-brand-pink placeholder-brand-cocoa-light/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light flex items-center gap-1">
                    <Phone className="w-3 h-3 text-brand-pink" />
                    <span>Contact Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-md px-3 py-2 text-sm text-brand-cocoa focus:outline-none focus:border-brand-pink placeholder-brand-cocoa-light/40"
                  />
                </div>
              </div>

              {/* Delivery or Pickup Selection */}
              <div className="space-y-1.5 pt-2 border-t border-brand-cocoa-border/40">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light">
                  Fulfilment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('Pickup')}
                    className={`py-2 px-2.5 border rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer ${
                      deliveryType === 'Pickup'
                        ? 'border-brand-cocoa bg-slate-50 text-brand-cocoa font-bold'
                        : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-slate-400 font-normal'
                    }`}
                  >
                    <span>Store Pick-up</span>
                    <span className="text-[9px] font-mono text-green-700 bg-green-50 px-1 py-0.2 rounded border border-green-200">FREE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('Delivery')}
                    className={`py-2 px-2.5 border rounded-md flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer ${
                      deliveryType === 'Delivery'
                        ? 'border-brand-cocoa bg-slate-50 text-brand-cocoa font-bold'
                        : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-slate-400 font-normal'
                    }`}
                  >
                    <span>Home Delivery</span>
                    {cartSubtotal >= 600 ? (
                      <span className="text-[9px] font-mono text-green-700 bg-green-50 px-1 py-0.2 rounded border border-green-200">FREE</span>
                    ) : (
                      <span className="text-[9px] font-mono text-brand-cocoa-light bg-brand-cream px-1 py-0.2 rounded border border-brand-cocoa-border">₹50</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Address / GPS Section (Show only if Delivery is selected) */}
              {deliveryType === 'Delivery' && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-pink" />
                      <span>Delivery Address</span>
                    </label>

                    <button
                      type="button"
                      onClick={handlePinLocation}
                      disabled={isLocating}
                      className="text-[10px] font-semibold text-brand-cocoa hover:text-brand-pink bg-white border border-slate-300 hover:border-brand-pink px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isLocating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <MapPin className="w-3 h-3 text-brand-pink" />
                      )}
                      <span>Pin GPS</span>
                    </button>
                  </div>

                  {locationFeedback && (
                    <p className={`text-[10px] font-medium font-sans leading-tight ${
                      locationFeedback.includes('successfully') ? 'text-green-600' : 'text-brand-pink'
                    }`}>
                      {locationFeedback}
                    </p>
                  )}

                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter street name, house/flat number, block, and landmarks..."
                    className="w-full bg-white border border-brand-cocoa-border rounded-md px-3 py-1.5 text-xs sm:text-sm text-brand-cocoa focus:outline-none focus:border-brand-pink placeholder-brand-cocoa-light/40"
                    required={deliveryType === 'Delivery'}
                  />

                  {gpsCoordinates && (
                    <div className="flex items-center gap-1 text-[9px] text-brand-cocoa-light font-mono">
                      <span className="font-semibold text-brand-cocoa">🛰️ GPS:</span>
                      <span>{gpsCoordinates}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-pink" />
                    <span>Requested Date</span>
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-md px-2.5 py-1.5 text-xs sm:text-sm text-brand-cocoa focus:outline-none focus:border-brand-pink"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-pink" />
                    <span>Preferred Time</span>
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-md px-2 py-1.5 text-xs sm:text-sm text-brand-cocoa focus:outline-none focus:border-brand-pink"
                  >
                    <option value="10:00">10:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:30">05:30 PM</option>
                    <option value="19:00">07:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Real Razorpay Payment Options */}
              <div className="space-y-2 border-t border-brand-cocoa-border/40 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light">
                    Payment Method
                  </label>
                  <span className="text-[9px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>SSL 256-Bit</span>
                  </span>
                </div>

                <div className={`grid ${cashOnDeliveryEnabled ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-2.5`}>
                  {/* Single Pay Online (Razorpay) Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`p-3.5 border rounded-md flex flex-col justify-between gap-2.5 transition-colors cursor-pointer relative text-left w-full ${
                      paymentMethod === 'Razorpay'
                        ? 'border-brand-cocoa bg-slate-50 text-brand-cocoa'
                        : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-brand-pink shrink-0" />
                        <span className="text-xs font-bold font-sans text-brand-cocoa">
                          Pay Online (Razorpay)
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                        Instant
                      </span>
                    </div>

                    {/* Logos and payment text container */}
                    <div className="w-full bg-white border border-slate-200 rounded-md p-2.5 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <GPayLogo />
                        <PhonePeLogo />
                        <PaytmLogo />
                      </div>

                      <p className="text-[11px] text-slate-500 font-normal leading-tight">
                        + BHIM, Cards &amp; NetBanking also accepted
                      </p>
                    </div>

                    <span className="text-[9px] font-mono text-slate-500">
                      100% Secure via Razorpay Gateway
                    </span>
                  </button>

                  {/* Cash on Delivery Button */}
                  {cashOnDeliveryEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3.5 border rounded-md flex flex-col justify-between gap-2.5 transition-colors cursor-pointer relative text-left w-full ${
                        paymentMethod === 'COD'
                          ? 'border-brand-cocoa bg-slate-50 text-brand-cocoa'
                          : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold font-sans text-brand-cocoa">
                            Cash on Delivery
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                          COD
                        </span>
                      </div>

                      <div className="w-full bg-white border border-slate-200 rounded-md p-2.5 flex flex-col items-center justify-center min-h-[64px] space-y-0.5">
                        <span className="text-base">💵</span>
                        <span className="text-[11px] font-bold font-mono text-emerald-800 text-center">
                          Pay Upon Arrival / Pickup
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 text-center">
                          Exact cash change appreciated
                        </span>
                      </div>

                      <span className="text-[9px] font-mono text-slate-500">
                        Pay cash upon order handover
                      </span>
                    </button>
                  )}
                </div>

                {/* DIRECT UPI APP INTENT GRID (Only rendered when paymentMethod === 'Razorpay' and isMobileView is true) */}
                {paymentMethod === 'Razorpay' && isMobileView && (
                  <div className="pt-2 border-t border-brand-cocoa-border/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light">
                        Pay Directly with UPI App
                      </label>
                      <span className="text-[9px] font-mono text-green-700 bg-green-50 px-1.5 py-0.2 rounded border border-green-200 font-semibold">
                        Mobile Instant
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'gpay' as const, name: 'Google Pay', dot: 'bg-[#4285F4]' },
                        { id: 'phonepe' as const, name: 'PhonePe', dot: 'bg-[#5f259f]' },
                        { id: 'paytm' as const, name: 'Paytm', dot: 'bg-[#00BAF2]' },
                        { id: 'bhim' as const, name: 'BHIM UPI', dot: 'bg-[#0088cc]' },
                        { id: 'cred' as const, name: 'CRED UPI', dot: 'bg-black' },
                      ].map((app) => {
                        const isThisAppPaying = payingWithApp === app.id;
                        return (
                          <button
                            key={app.id}
                            type="button"
                            disabled={isSubmitting}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDirectUpiAppPay(app.id);
                            }}
                            className="p-2 border border-brand-cocoa-border rounded-lg bg-white hover:border-brand-pink-accent/50 text-brand-cocoa transition-colors flex flex-col items-center justify-center gap-1 text-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px]"
                          >
                            {isThisAppPaying ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-pink" />
                                <span className="text-[10px] font-semibold text-brand-pink font-sans">Opening...</span>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${app.dot} shrink-0`} />
                                  <Smartphone className="w-3 h-3 text-slate-500" />
                                </div>
                                <span className="text-[11px] font-bold font-sans truncate max-w-full">
                                  {app.name}
                                </span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-brand-cocoa-light font-sans leading-tight">
                      Opens your chosen UPI app with the order amount pre-filled. Works on mobile only.
                    </p>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light">
                  Special Notes or Custom Requests
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please make it eggless, add chocolate sprinkles, write birthday card, etc."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-white border border-brand-cocoa-border rounded-md px-3 py-1.5 text-xs sm:text-sm text-brand-cocoa focus:outline-none focus:border-brand-pink placeholder-brand-cocoa-light/40"
                />
              </div>

              {/* Pricing breakdown section - clean flat rows with top divider */}
              <div className="border-t border-brand-cocoa-border/60 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between font-sans text-slate-600">
                  <span>Cart Items Subtotal:</span>
                  <span className="font-semibold text-slate-900">₹{cartSubtotal}</span>
                </div>

                <div className="flex justify-between font-sans text-slate-600">
                  <span>Delivery Charges:</span>
                  {deliveryType === 'Pickup' ? (
                    <span className="font-bold text-green-700 uppercase text-[9px] tracking-wider">FREE PICKUP</span>
                  ) : deliveryCharge === 0 ? (
                    <span className="font-bold text-green-700 uppercase text-[9px] tracking-wider">FREE (Orders &gt; ₹600)</span>
                  ) : (
                    <span className="font-semibold text-slate-900">₹{deliveryCharge}</span>
                  )}
                </div>

                <div className="flex justify-between font-sans text-slate-600">
                  <span>Custom Piping & Luxury Box:</span>
                  <span className="font-bold text-green-700 uppercase text-[9px] tracking-wider">FREE</span>
                </div>

                <div className="border-t border-brand-cocoa-border/60 pt-2.5 flex items-baseline justify-between">
                  <span className="font-display text-brand-cocoa font-bold text-sm uppercase tracking-wide">Total Amount</span>
                  <span className="text-xl sm:text-2xl font-display font-black text-brand-pink">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* Main Submit Button - solid flat button, no gradient, no drop-shadow */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-sans font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 group cursor-pointer mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : paymentMethod === 'Razorpay' ? (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>Pay ₹{grandTotal} with Razorpay</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    <span>Place Cash on Delivery Order (₹{grandTotal})</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div id="no-shopping-fallback" className="text-center py-16 bg-white rounded-lg border border-brand-cocoa-border px-4 flex-1 flex flex-col justify-center items-center">
          <div id="bag-illustration" className="w-14 h-14 bg-brand-pink-light text-brand-pink rounded-full flex items-center justify-center mb-4">
            <ShoppingBag id="fallback-bag-icon" className="w-7 h-7" />
          </div>
          <h4 id="fallback-shop-title" className="font-display font-bold text-brand-cocoa text-xl">Your Shopping Cart is Empty</h4>
          <p id="fallback-shop-desc" className="text-xs sm:text-sm text-brand-cocoa-light mt-1.5 max-w-sm leading-relaxed">
            Head back to our Menu and pick any delicious confection, custom size, or flavour to add it here!
          </p>
          <div className="mt-5">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
            >
              <Cake className="w-4 h-4" />
              <span>Explore Boutique Menu</span>
            </Link>
          </div>
          <p className="text-xs text-brand-cocoa-light/80 mt-5 font-medium">
            For custom requests or bulk inquiries, contact us:{' '}
            <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink hover:underline font-bold">
              hellofrostingfairy@gmail.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
