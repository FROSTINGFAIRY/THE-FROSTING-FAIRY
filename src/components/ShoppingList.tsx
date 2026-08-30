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
  QrCode,
  Smartphone
} from 'lucide-react';
import { ShoppingItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import UpiQrPaymentModal, { UpiSessionDetails } from './UpiQrPaymentModal';

interface ShoppingListProps {
  shoppingList: ShoppingItem[];
  onToggleBought: (id: string) => void;
  onAddItem: (name: string, category: string, amount: number, unit: string) => void; // kept for legacy compat
  onRemoveItem: (id: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onCheckout: (checkoutData: {
    customerName: string;
    customerPhone: string;
    pickupDate: string;
    pickupTime: string;
    specialInstructions: string;
    deliveryType: 'Pickup' | 'Delivery';
    deliveryAddress: string;
    gpsCoordinates: string;
    paymentMethod: 'Card' | 'UPI' | 'COD';
    paymentStatus?: 'Unpaid' | 'Paid' | 'Pending';
    paymentDetails: {
      cardHolder?: string;
      cardNumber?: string;
      upiId?: string;
      customerUpiId?: string;
      upiTransactionId?: string;
      gatewayRef?: string;
      paidAt?: string;
      verifiedOnServer?: boolean;
    };
  }) => void;
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

export default function ShoppingList({
  shoppingList,
  onRemoveItem,
  onClearAll,
  onCheckout,
  onUpiPaymentSuccess,
  upiId: propUpiId = 'thefrostingfairy@okaxis',
  upiQrCode = '',
  cashOnDeliveryEnabled = true,
}: ShoppingListProps) {
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

  // New features state
  const [deliveryType, setDeliveryType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'COD'>('UPI');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [customerUpiId, setCustomerUpiId] = useState('');

  // Dynamic UPI Session State
  const [upiSession, setUpiSession] = useState<UpiSessionDetails | null>(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  useEffect(() => {
    if (!cashOnDeliveryEnabled && paymentMethod === 'COD') {
      setPaymentMethod('Card');
    }
  }, [cashOnDeliveryEnabled, paymentMethod]);
  const [showQR, setShowQR] = useState(false);

  // Cart totals calculation
  const totalItemsCount = shoppingList.reduce((sum, item) => sum + item.amount, 0);
  const cartSubtotal = shoppingList.reduce((sum, item) => sum + (item.price || 0) * item.amount, 0);

  // Delivery Charge logic: flat ₹50, but FREE above ₹600 or if Pickup
  const deliveryCharge = deliveryType === 'Delivery' ? (cartSubtotal >= 600 ? 0 : 50) : 0;
  const grandTotal = cartSubtotal + deliveryCharge;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Format Card Expiry (adds slash MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Format CVV (max 3 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

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

  // UPI params & deep links for mobile apps
  const upiParams = `pa=${encodeURIComponent(propUpiId)}&pn=${encodeURIComponent('The Frosting Fairy')}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Order payment - ' + (customerName || 'Customer'))}`;

  const upiApps = [
    { name: 'Google Pay', link: `tez://upi/pay?${upiParams}` },
    { name: 'PhonePe', link: `phonepe://pay?${upiParams}` },
    { name: 'Paytm', link: `paytmmp://pay?${upiParams}` },
    { name: 'BHIM', link: `bhim://pay?${upiParams}` },
    { name: 'CRED', link: `credpay://upi/pay?${upiParams}` },
    { name: 'Other', link: `upi://pay?${upiParams}` },
  ];

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

    // Delivery validations
    if (deliveryType === 'Delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please enter a delivery address or pin your current location.');
      return;
    }

    // Payment validations
    if (paymentMethod === 'Card') {
      if (!cardHolder.trim()) {
        setErrorMessage('Please enter the cardholder name.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('Please enter card expiry in MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter the 3-digit CVV number.');
        return;
      }
    } else if (paymentMethod === 'COD') {
      if (!cashOnDeliveryEnabled) {
        setErrorMessage('Cash on Delivery is currently disabled by store management. Please select Card or UPI.');
        return;
      }
    }

    // Dynamic UPI QR Payment Flow (Secure Backend Session)
    if (paymentMethod === 'UPI') {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/upi/initiate', {
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
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              pickupDate,
              pickupTime,
              specialInstructions: specialInstructions.trim(),
              deliveryType,
              deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Pick-up',
              gpsCoordinates,
              paymentMethod: 'UPI',
              paymentDetails: {
                upiId: propUpiId,
                customerUpiId: customerUpiId.trim() || undefined,
              },
            },
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to initiate secure UPI payment session.');
        }

        setUpiSession(data);
        setIsUpiModalOpen(true);
      } catch (err: any) {
        console.error('UPI initiation error:', err);
        setErrorMessage(err.message || 'Unable to connect to UPI payment gateway. Please check your network.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const cleanCard = cardNumber.replace(/\s/g, '');
    const last4 = cleanCard.slice(-4);
    const maskedCard = `•••• •••• •••• ${last4}`;

    setIsSubmitting(true);
    try {
      onCheckout({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        pickupDate,
        pickupTime,
        specialInstructions: specialInstructions.trim(),
        deliveryType,
        deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Pick-up',
        gpsCoordinates,
        paymentMethod,
        paymentDetails: {
          cardHolder: paymentMethod === 'Card' ? cardHolder : undefined,
          cardNumber: paymentMethod === 'Card' ? maskedCard : undefined,
          upiId: undefined,
        },
      });
    } finally {
      setIsSubmitting(false);
    }

    // Security: Clear CVV right after submit and set the card number to the masked version
    setCardCvv('');
    setCardNumber(maskedCard);
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
          <button
            id="btn-clear-all"
            onClick={onClearAll}
            className="text-xs font-semibold font-sans border border-red-100 hover:border-red-200 px-4 py-2.5 rounded-xl text-red-500 hover:text-red-600 bg-red-50/20 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
          >
            Clear Cart
          </button>
        )}
      </header>

      {shoppingList.length > 0 ? (
        <div id="cart-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-0 pb-12">
          {/* Left Column: Cart items list */}
          <div id="cart-items-panel" className="lg:col-span-6 space-y-5">
            <div>
              <h3 className="text-xs font-bold font-mono text-brand-cocoa-light uppercase tracking-widest mb-3">
                Selected Treats ({totalItemsCount} items)
              </h3>

              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2 border border-brand-cocoa-border/40 bg-brand-cream-light/10 p-2.5 rounded-2xl">
                {shoppingList.map((item, cartIdx) => (
                  <div
                    key={`cart-item-${item.id}-${cartIdx}`}
                    id={`cart-item-row-${item.id}`}
                    className="bg-white border border-brand-cocoa-border rounded-2xl p-4 flex gap-4 hover:border-brand-pink-accent/40 shadow-2xs transition-all relative"
                  >
                    {/* Product thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-brand-cocoa-border shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        width="80"
                        height="80"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-brand-pink-light/60 text-brand-pink-dark text-[9px] font-bold font-mono uppercase tracking-wider rounded-md mb-1">
                            {item.category}
                          </span>
                          <h4 className="font-sans font-bold text-brand-cocoa text-sm md:text-base leading-tight truncate">
                            {item.name}
                          </h4>
                        </div>
                        <span className="font-display font-bold text-brand-pink text-base shrink-0">
                          ₹{(item.price || 0) * item.amount}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-xs text-brand-cocoa-light">
                        <p>
                          <span className="font-semibold text-brand-cocoa">Portion Choice:</span> {item.selectedOption}
                        </p>
                        {item.recipeName && (
                          <p>
                            <span className="font-semibold text-brand-cocoa">Flavour:</span> {item.recipeName}
                          </p>
                        )}
                        {item.customMessage && (
                          <p className="bg-brand-pink-light/30 border border-brand-pink/10 rounded-lg p-1.5 mt-1.5 inline-block text-brand-pink-dark font-medium">
                            🎂 <span className="font-semibold">Piped Text:</span> "{item.customMessage}"
                          </p>
                        )}
                        {item.boxContents && item.boxContents.length > 0 && (
                          <div className="bg-brand-pink-light/25 border border-brand-pink/20 rounded-xl p-3 mt-2.5 space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-brand-pink-dark">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                                <span>Box Treat Breakdown</span>
                              </div>
                              <span className="font-semibold">{item.boxContents.reduce((s, c) => s + c.quantity, 0)} items selected</span>
                            </div>
                            <div className="space-y-1.5 pt-1">
                              {item.boxContents.map((content, idx) => {
                                const linePrice = content.price !== undefined ? content.price * content.quantity : undefined;
                                return (
                                  <div
                                    key={`box-item-${idx}`}
                                    className="flex items-center justify-between text-xs font-sans text-brand-cocoa bg-white border border-brand-cocoa-border/40 px-3 py-1.5 rounded-lg shadow-3xs"
                                  >
                                    <span>
                                      <strong className="text-brand-pink font-mono mr-1">{content.quantity}x</strong> {content.name}
                                    </span>
                                    {linePrice !== undefined ? (
                                      <span className="text-xs font-mono font-bold text-brand-cocoa-light">
                                        ₹{linePrice}
                                      </span>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-brand-pink/20 text-xs font-mono font-bold text-brand-cocoa">
                              <span>Box Subtotal:</span>
                              <span className="text-brand-pink font-display font-extrabold text-sm">
                                ₹{item.price || 0}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantity Indicator */}
                      <div className="flex items-center justify-between border-t border-brand-cocoa-border/40 mt-3 pt-3">
                        <div className="flex items-center gap-1.5 text-xs text-brand-cocoa-light font-mono uppercase">
                          <span>Quantity:</span>
                          <span className="font-bold text-brand-cocoa text-sm bg-brand-cream px-2 py-0.5 rounded-md font-sans">
                            {item.amount}
                          </span>
                        </div>

                        <button
                          id={`btn-cart-item-remove-${item.id}`}
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[11px] font-semibold text-brand-cocoa-light hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Promise */}
            <div className="bg-brand-cream-light/30 border border-brand-cocoa-border/60 rounded-xl p-4 flex items-center gap-3 mt-4">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-[11px] text-brand-cocoa-light font-sans leading-relaxed text-left">
                <span className="font-bold text-brand-cocoa">Fairy Kitchen Promise:</span> All orders are handmade from scratch using premium organic ingredients. Collect at your preferred time to enjoy optimal freshness!
              </p>
            </div>
          </div>

          {/* Right Column: Checkout Pager */}
          <div id="checkout-pager-panel" className="lg:col-span-6 bg-white border border-brand-cocoa-border rounded-2xl p-6 shadow-md space-y-6">
            <h3 className="font-display font-bold text-brand-cocoa text-lg flex items-center gap-2 border-b border-brand-cocoa-border pb-3">
              <Sparkles className="w-5 h-5 text-brand-pink fill-brand-pink" />
              <span>Gourmet Delivery & Checkout</span>
            </h3>

            {errorMessage && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3.5 text-xs font-sans text-left flex items-start gap-2">
                <span className="font-bold">⚠️ Error:</span> {errorMessage}
              </div>
            )}

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5 text-left">
              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light flex items-center gap-1">
                    <User className="w-3 h-3 text-brand-pink" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2.5 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light flex items-center gap-1">
                    <Phone className="w-3 h-3 text-brand-pink" />
                    <span>Contact Phone</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-2.5 text-sm text-brand-cocoa focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                    required
                  />
                </div>
              </div>

              {/* Delivery Type Toggle Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light">
                  Choose Service Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-brand-cream-light/30 border border-brand-cocoa-border rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('Pickup')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      deliveryType === 'Pickup'
                        ? 'bg-brand-cocoa text-white shadow-xs'
                        : 'text-brand-cocoa-light hover:text-brand-cocoa'
                    }`}
                  >
                    <span>🏪 Store Pickup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('Delivery')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      deliveryType === 'Delivery'
                        ? 'bg-brand-pink text-white shadow-xs'
                        : 'text-brand-cocoa-light hover:text-brand-cocoa'
                    }`}
                  >
                    <span>🛵 Home Delivery</span>
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
                      <span>Pin Current Location</span>
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

              {/* Payment Methods Section */}
              {/* PAYMENT SECTION */}
              <div className="space-y-2 border-t border-brand-cocoa-border/40 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-cocoa-light">
                    Select Payment Method
                  </label>
                  <span className="text-[10px] text-brand-pink font-bold font-mono">
                    {paymentMethod === 'UPI' ? '✨ Instant QR Pay' : ''}
                  </span>
                </div>

                <div className={`grid ${cashOnDeliveryEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink shadow-xs'
                        : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[10px] font-bold font-mono uppercase tracking-tight">UPI QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-3 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink shadow-xs'
                        : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] font-bold font-mono uppercase tracking-tight">Card</span>
                  </button>

                  {cashOnDeliveryEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`py-3 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'COD'
                          ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink shadow-xs'
                          : 'border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span className="text-[10px] font-bold font-mono uppercase tracking-tight">COD</span>
                    </button>
                  )}
                </div>

                {/* Sub-fields for UPI */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-3 p-3.5 bg-brand-cream-light/40 border border-brand-cocoa-border rounded-2xl mt-2.5 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-pink-light flex items-center justify-center text-brand-pink shrink-0 mt-0.5">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-brand-cocoa">
                          Dynamic UPI QR Payment
                        </p>
                        <p className="text-[11px] text-brand-cocoa-light leading-relaxed">
                          A secure QR code for exactly <strong className="text-brand-pink font-bold">₹{grandTotal}</strong> will be generated for your order. Scan with any UPI app to pay.
                        </p>
                      </div>
                    </div>

                    {/* Supported Apps Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-brand-cocoa-light font-medium">Supported:</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-brand-cocoa-border/60 text-[10px] font-bold text-brand-cocoa font-mono">GPay</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-brand-cocoa-border/60 text-[10px] font-bold text-brand-cocoa font-mono">PhonePe</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-brand-cocoa-border/60 text-[10px] font-bold text-brand-cocoa font-mono">Paytm</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-brand-cocoa-border/60 text-[10px] font-bold text-brand-cocoa font-mono">BHIM</span>
                      <span className="px-2 py-0.5 bg-white rounded-md border border-brand-cocoa-border/60 text-[10px] font-bold text-brand-cocoa font-mono">CRED</span>
                    </div>

                    {/* Optional Customer UPI ID */}
                    <div className="pt-2 border-t border-brand-cocoa-border/40 space-y-1">
                      <label className="text-[10px] font-bold font-mono text-brand-cocoa-light uppercase">
                        Customer UPI ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                        value={customerUpiId}
                        onChange={(e) => setCustomerUpiId(e.target.value)}
                        className="w-full bg-white border border-brand-cocoa-border rounded-lg px-3 py-2 text-xs text-brand-cocoa focus:outline-none font-mono"
                      />
                    </div>

                    {/* Direct UPI App Deep Links */}
                    <div className="pt-2 border-t border-brand-cocoa-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold font-mono text-brand-cocoa-light uppercase">
                          Pay Directly with UPI App
                        </label>
                        <span className="text-[9px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Mobile Instant</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {upiApps.map((app) => (
                          <button
                            key={app.name}
                            type="button"
                            onClick={() => {
                              window.location.href = app.link;
                            }}
                            className="bg-white hover:bg-brand-pink-light/25 hover:border-brand-pink border border-brand-cocoa-border text-brand-cocoa font-sans font-semibold py-2 px-1 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 text-[11px] cursor-pointer active:scale-95 text-center"
                          >
                            <Smartphone className="w-3 h-3 text-brand-pink shrink-0" />
                            <span className="truncate">{app.name}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-brand-cocoa-light text-center leading-tight">
                        Opens your chosen UPI app with the amount and store UPI ID pre-filled. Works on mobile only — use the QR code on desktop.
                      </p>
                    </div>
                  </div>
                )}

                {/* Sub-fields for Card */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-2.5 p-3.5 bg-brand-cream-light/35 border border-brand-cocoa-border rounded-xl mt-2.5 animate-fadeIn">
                    <div className="text-[10px] text-brand-pink-dark bg-brand-pink-light/30 border border-brand-pink-accent/20 px-3 py-2 rounded-lg flex items-start gap-1.5 leading-relaxed">
                      <span>🔒</span>
                      <span>Card payments are securely tokenized and verified.</span>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Cardholder Name"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-white border border-brand-cocoa-border rounded-lg px-3 py-2 text-xs text-brand-cocoa focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Card Number (16 Digits)"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-white border border-brand-cocoa-border rounded-lg px-3 py-2 text-xs text-brand-cocoa focus:outline-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Expiry (MM/YY)"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-white border border-brand-cocoa-border rounded-lg px-3 py-2 text-xs text-brand-cocoa focus:outline-none font-mono"
                      />
                      <input
                        type="password"
                        placeholder="CVV (3 Digits)"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        className="w-full bg-white border border-brand-cocoa-border rounded-lg px-3 py-2 text-xs text-brand-cocoa focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Info on COD */}
                {paymentMethod === 'COD' && (
                  <div className="p-3.5 bg-brand-cream-light/40 border border-brand-cocoa-border rounded-xl mt-2.5 animate-fadeIn">
                    <p className="text-[11px] font-medium text-brand-cocoa-light">
                      👍 <span className="font-bold text-brand-cocoa">Cash on Collection/Delivery:</span> Pay with Cash or UPI once your treats are safely in your hands.
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
                  <span className="font-display text-brand-cocoa font-extrabold text-sm uppercase tracking-wide">Total Estimate</span>
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
                    <span>Preparing Payment Gateway...</span>
                  </>
                ) : paymentMethod === 'UPI' ? (
                  <>
                    <Smartphone className="w-4 h-4 text-white" />
                    <span>Pay ₹{grandTotal} via UPI QR 📱</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                ) : paymentMethod === 'Card' ? (
                  <>
                    <CreditCard className="w-4 h-4 text-white" />
                    <span>Pay ₹{grandTotal} via Card 💳</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    <span>Place Cash on Delivery Order 💵</span>
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

      {/* DYNAMIC SECURE UPI QR PAYMENT MODAL */}
      <UpiQrPaymentModal
        session={upiSession}
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        onPaymentSuccess={(verifiedData) => {
          setIsUpiModalOpen(false);
          if (onUpiPaymentSuccess) {
            onUpiPaymentSuccess({
              ...verifiedData,
              checkoutData: {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                pickupDate,
                pickupTime,
                specialInstructions: specialInstructions.trim(),
                deliveryType,
                deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Pick-up',
                gpsCoordinates,
                paymentMethod: 'UPI',
                paymentStatus: 'Paid',
                paymentDetails: {
                  upiId: upiSession?.payeeVpa || propUpiId,
                  customerUpiId: customerUpiId.trim() || undefined,
                  upiTransactionId: verifiedData.transactionId,
                  gatewayRef: verifiedData.gatewayRef,
                  paidAt: verifiedData.paidAt,
                  verifiedOnServer: true,
                },
              },
            });
          } else {
            onCheckout({
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              pickupDate,
              pickupTime,
              specialInstructions: specialInstructions.trim(),
              deliveryType,
              deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Pick-up',
              gpsCoordinates,
              paymentMethod: 'UPI',
              paymentStatus: 'Paid',
              paymentDetails: {
                upiId: upiSession?.payeeVpa || propUpiId,
                customerUpiId: customerUpiId.trim() || undefined,
                upiTransactionId: verifiedData.transactionId,
                gatewayRef: verifiedData.gatewayRef,
                paidAt: verifiedData.paidAt,
                verifiedOnServer: true,
              },
            });
          }
        }}
        onPaymentFailed={(errMsg) => {
          setErrorMessage(`Payment Gateway: ${errMsg}`);
        }}
      />
    </div>
  );
}
