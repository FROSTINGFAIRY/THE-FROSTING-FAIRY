import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
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
  Check
} from 'lucide-react';
import { ShoppingItem, CheckoutData } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CartCheckoutProps {
  shoppingList: ShoppingItem[];
  onToggleBought: (id: string) => void;
  onAddItem: (name: string, category: string, amount: number, unit: string) => void; // kept for legacy compat
  onRemoveItem: (id: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onCheckout: (checkoutData: CheckoutData) => void;
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

export default function CartCheckout({
  shoppingList,
  onRemoveItem,
  onClearAll,
  onCheckout,
  onUpiPaymentSuccess,
  cashOnDeliveryEnabled = true,
}: CartCheckoutProps) {
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

  // Delivery & location state
  const [deliveryType, setDeliveryType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState('');

  // Payment Method: 'Razorpay' (Pay Online via UPI, Cards, NetBanking, Wallets) or 'COD'
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');

  useEffect(() => {
    if (!cashOnDeliveryEnabled && paymentMethod === 'COD') {
      setPaymentMethod('Razorpay');
    }
  }, [cashOnDeliveryEnabled, paymentMethod]);

  // Cart totals calculation
  const totalItemsCount = shoppingList.reduce((sum, item) => sum + item.amount, 0);
  const cartSubtotal = shoppingList.reduce((sum, item) => sum + (item.price || 0) * item.amount, 0);

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (shoppingList.length === 0) {
      setErrorMessage('Your shopping cart is empty! Add a treat from our menu first.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Please provide your name for the order.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Please enter a phone number so we can contact you.');
      return;
    }
    if (!pickupDate) {
      setErrorMessage('Please pick an order collection/delivery date.');
      return;
    }

    if (deliveryType === 'Delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please enter a delivery address or pin your current location.');
      return;
    }

    if (paymentMethod === 'COD' && !cashOnDeliveryEnabled) {
      setErrorMessage('Cash on Delivery is currently disabled by store management. Please select Pay Online.');
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

        // 1. Create order on backend (re-derives price strictly on server)
        const createOrderRes = await fetch('/api/razorpay/create-order', {
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

        const orderData = await createOrderRes.json();
        if (!createOrderRes.ok || !orderData.success) {
          throw new Error(orderData.error || 'Failed to initialize payment gateway order.');
        }

        const { razorpayOrderId, amount, currency, keyId } = orderData;
        const resolvedKeyId = keyId || (import.meta as any).env.VITE_RAZORPAY_KEY_ID || '';

        // 2. Open official Razorpay Checkout modal
        const options = {
          key: resolvedKeyId,
          amount: amount,
          currency: currency || 'INR',
          name: 'The Frosting Fairy',
          description: `Custom Bakery Order (${totalItemsCount} item${totalItemsCount > 1 ? 's' : ''})`,
          order_id: razorpayOrderId,
          prefill: {
            name: customerName.trim(),
            contact: customerPhone.trim(),
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
            try {
              setIsSubmitting(true);
              // 3. Verify payment signature on backend
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

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
            }
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
      <header id="shopping-header" className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-cocoa-border pb-6 shrink-0">
        <div>
          <h2 id="shopping-title" className="font-display font-bold text-3xl text-brand-cocoa tracking-tight">
            Your Shopping Cart
          </h2>
          <p id="shopping-subtitle" className="text-sm text-brand-cocoa-light mt-1 font-sans">
            Review your customized fairy cakes, choose home delivery or pickup, select your payment option, and confirm your order.
          </p>
        </div>

        {shoppingList.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-cocoa-border hover:border-brand-pink transition-all bg-white cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {shoppingList.length > 0 ? (
        <div id="shopping-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div id="cart-items-container" className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-cocoa-light">
                Order Items ({totalItemsCount})
              </span>
              <span className="text-xs font-bold text-brand-pink">
                Subtotal: ₹{cartSubtotal}
              </span>
            </div>

            <div className="space-y-3">
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-brand-cocoa-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-brand-pink-accent/50"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-brand-cocoa-border shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-brand-pink-light/30 border border-brand-pink-accent/30 flex items-center justify-center text-brand-pink shrink-0">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-base text-brand-cocoa truncate">
                          {item.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-pink-light/40 text-brand-pink-dark border border-brand-pink-accent/30 shrink-0">
                          Qty: {item.amount}
                        </span>
                      </div>

                      <p className="text-xs text-brand-cocoa-light mt-0.5 truncate">
                        {item.selectedOption || 'Standard'} {item.recipeName ? `· ${item.recipeName}` : ''}
                      </p>

                      {item.customMessage && (
                        <p className="text-[11px] font-mono text-brand-pink mt-1 italic truncate">
                          Message: &ldquo;{item.customMessage}&rdquo;
                        </p>
                      )}

                      {Array.isArray(item.boxContents) && item.boxContents.length > 0 && (
                        <div className="mt-1.5 text-[11px] font-mono text-brand-cocoa-light bg-brand-cream-light/60 p-2 rounded-lg border border-brand-cocoa-border/40">
                          <span className="font-bold text-brand-cocoa block mb-0.5">Box Contents:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.boxContents.map((c, i) => (
                              <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-brand-cocoa-border/60 text-[10px]">
                                {c.name} × {c.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-cocoa-border/40 gap-2 shrink-0">
                    <span className="font-display font-bold text-base text-brand-pink">
                      ₹{(item.price || 0) * item.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs text-brand-cocoa-light hover:text-red-500 flex items-center gap-1 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden text-[11px]">Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Info Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-800 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Free Home Delivery</strong> on all orders above ₹600! All fairy treats are freshly baked to order with organic ingredients.
              </span>
            </div>
          </div>

          {/* Right Column: Checkout Form & Razorpay Gateway */}
          <div id="checkout-form-container" className="lg:col-span-5 bg-white border border-brand-cocoa-border rounded-3xl p-6 shadow-sm space-y-5">
            <div className="border-b border-brand-cocoa-border/60 pb-4">
              <h3 className="font-display font-bold text-lg text-brand-cocoa">
                Complete Your Order
              </h3>
              <p className="text-xs text-brand-cocoa-light mt-0.5">
                Fast, secure checkout powered by 256-bit encryption.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 animate-fadeIn">
                <span className="font-bold">Notice:</span>
                <span className="flex-1">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-400 hover:text-red-700 font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Customer Contact Details */}
              <div className="space-y-3">
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
                    className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2.5 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink placeholder-brand-cocoa-light/40"
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
                    className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2.5 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink placeholder-brand-cocoa-light/40"
                  />
                </div>
              </div>

              {/* Delivery or Pickup Selection */}
              <div className="space-y-2 pt-2 border-t border-brand-cocoa-border/40">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light">
                  Fulfilment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('Pickup')}
                    className={`py-2.5 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      deliveryType === 'Pickup'
                        ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink shadow-xs font-bold'
                        : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50'
                    }`}
                  >
                    <span>Store Pick-up</span>
                    <span className="text-[10px] font-mono text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">FREE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('Delivery')}
                    className={`py-2.5 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      deliveryType === 'Delivery'
                        ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink shadow-xs font-bold'
                        : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50'
                    }`}
                  >
                    <span>Home Delivery</span>
                    {cartSubtotal >= 600 ? (
                      <span className="text-[10px] font-mono text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">FREE</span>
                    ) : (
                      <span className="text-[10px] font-mono text-brand-cocoa-light bg-brand-cream px-1.5 py-0.5 rounded border border-brand-cocoa-border">₹50</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Address / GPS Section (Show only if Delivery is selected) */}
              {deliveryType === 'Delivery' && (
                <div className="space-y-2.5 p-4 bg-brand-pink-light/10 border border-brand-pink-accent/20 rounded-2xl animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-pink-dark flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Delivery Address</span>
                    </label>

                    <button
                      type="button"
                      onClick={handlePinLocation}
                      disabled={isLocating}
                      className="text-[11px] font-semibold text-brand-pink-dark hover:text-brand-pink bg-brand-pink-light/70 border border-brand-pink/20 hover:border-brand-pink px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLocating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <MapPin className="w-3 h-3 fill-brand-pink/20 animate-pulse" />
                      )}
                      <span>Pin GPS</span>
                    </button>
                  </div>

                  {locationFeedback && (
                    <p className={`text-[11px] font-medium font-sans leading-tight ${
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
                    className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                    required={deliveryType === 'Delivery'}
                  />

                  {gpsCoordinates && (
                    <div className="flex items-center gap-1 text-[10px] text-brand-cocoa-light font-mono">
                      <span className="font-semibold text-brand-cocoa">🛰️ GPS Pinned:</span>
                      <span>{gpsCoordinates}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Requested Date</span>
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Preferred Time</span>
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-xl px-3 py-2 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
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
              <div className="space-y-2.5 border-t border-brand-cocoa-border/40 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light">
                    Payment Method
                  </label>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>SSL 256-Bit Secured</span>
                  </span>
                </div>

                <div className={`grid ${cashOnDeliveryEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-2.5`}>
                  {/* Razorpay Online Button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`py-3.5 px-3 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                      paymentMethod === 'Razorpay'
                        ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink shadow-xs ring-2 ring-brand-pink/20'
                        : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-brand-pink" />
                      <Smartphone className="w-4 h-4 text-brand-pink" />
                      <Wallet className="w-4 h-4 text-brand-pink" />
                    </div>
                    <span className="text-xs font-bold font-sans">
                      Pay Online (Razorpay)
                    </span>
                    <span className="text-[9px] font-mono text-brand-cocoa-light">
                      UPI · Cards · NetBanking · Wallets
                    </span>
                  </button>

                  {/* Cash on Delivery Button */}
                  {cashOnDeliveryEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`py-3.5 px-3 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'COD'
                          ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink shadow-xs ring-2 ring-brand-pink/20'
                          : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50'
                      }`}
                    >
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold font-sans">
                        Cash on Delivery
                      </span>
                      <span className="text-[9px] font-mono text-brand-cocoa-light">
                        Pay upon receipt / collection
                      </span>
                    </button>
                  )}
                </div>

                {/* Sub-info banner for Razorpay */}
                {paymentMethod === 'Razorpay' && (
                  <div className="p-3 bg-brand-cream-light/50 border border-brand-cocoa-border rounded-xl space-y-1.5 animate-fadeIn">
                    <p className="text-xs font-bold text-brand-cocoa flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Instant Secure Checkout</span>
                    </p>
                    <p className="text-[11px] text-brand-cocoa-light leading-relaxed font-sans">
                      Opens Razorpay Checkout modal to pay with <strong className="text-brand-cocoa">Google Pay, PhonePe, Paytm, BHIM, Any Credit/Debit Card, or NetBanking</strong>.
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
                  className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2.5 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink placeholder-brand-cocoa-light/40"
                />
              </div>

              {/* Pricing breakdown card */}
              <div className="border-t border-dashed border-brand-cocoa-border/80 pt-4 space-y-2 text-xs">
                <div className="flex justify-between font-sans">
                  <span className="text-brand-cocoa-light">Cart Items Subtotal:</span>
                  <span className="font-semibold text-brand-cocoa">₹{cartSubtotal}</span>
                </div>

                <div className="flex justify-between font-sans">
                  <span className="text-brand-cocoa-light">Delivery Charges:</span>
                  {deliveryType === 'Pickup' ? (
                    <span className="font-bold text-green-600 uppercase text-[9px] tracking-wider">FREE PICKUP</span>
                  ) : deliveryCharge === 0 ? (
                    <span className="font-bold text-green-600 uppercase text-[9px] tracking-wider">FREE (Orders &gt; ₹600)</span>
                  ) : (
                    <span className="font-semibold text-brand-cocoa">₹{deliveryCharge}</span>
                  )}
                </div>

                <div className="flex justify-between font-sans">
                  <span className="text-brand-cocoa-light">Custom Piping & Luxury Box:</span>
                  <span className="font-bold text-green-600 uppercase text-[9px] tracking-wider">FREE</span>
                </div>

                <div className="border-t border-brand-cocoa-border/60 pt-3 flex items-baseline justify-between">
                  <span className="font-display text-brand-cocoa font-extrabold text-sm uppercase tracking-wide">Total Amount</span>
                  <span className="text-2xl font-display font-extrabold text-brand-pink">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-sans font-bold py-4 rounded-xl transition-all shadow-md shadow-brand-pink/15 flex items-center justify-center gap-2 group cursor-pointer mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
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
        <div id="no-shopping-fallback" className="text-center py-20 bg-white rounded-2xl border border-brand-cocoa-border px-4 flex-1 flex flex-col justify-center items-center">
          <div id="bag-illustration" className="w-16 h-16 bg-brand-pink-light text-brand-pink rounded-full flex items-center justify-center mb-6">
            <ShoppingBag id="fallback-bag-icon" className="w-8 h-8" />
          </div>
          <h4 id="fallback-shop-title" className="font-display font-bold text-brand-cocoa text-xl">Your Shopping Cart is Empty</h4>
          <p id="fallback-shop-desc" className="text-sm text-brand-cocoa-light mt-2 max-w-sm leading-relaxed">
            Head back to our Menu page and pick any delicious confection, custom size, or flavour to add it here!
          </p>
          <p className="text-xs text-brand-cocoa-light/80 mt-6 font-medium">
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
