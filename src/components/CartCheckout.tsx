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
  ChevronDown,
  ChevronUp,
  X, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  Loader2,
  Lock,
  Smartphone,
  Check,
  Cake,
  Truck,
  Store,
  Gift,
  Tag,
  Share2,
  ExternalLink
} from 'lucide-react';
import { ShoppingItem, CheckoutData, LayoutContextType, CustomerProfile } from '../types';
import CustomerMobileLogin from './CustomerMobileLogin';

// ==========================================
// AUTHENTIC HIGH-QUALITY UPI BRAND ICONS
// ==========================================

const UpiBrandIcon = () => (
  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-700 text-white shrink-0 p-1 shadow-3xs">
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5 3L6 14h6l-1.5 7L18 10h-6l1.5-7z" />
    </svg>
  </span>
);

const GPayLogo = () => (
  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-3xs shrink-0 transition-transform hover:scale-105">
    <svg className="w-8 h-8 object-contain" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.42 6.85a3.71 3.71 0 0 0-5.25 0l-5.6 5.6a3.71 3.71 0 0 0 0 5.25l.88.88a3.71 3.71 0 0 0 5.25 0l5.6-5.6a3.71 3.71 0 0 0 0-5.25l-.88-.88z" fill="#4285F4"/>
      <path d="M10.17 18.58a3.71 3.71 0 0 1-5.25 0l-.88-.88a3.71 3.71 0 0 1 0-5.25l2.8-2.8 2.8 2.8a3.71 3.71 0 0 1 0 5.25l.53.88z" fill="#34A853"/>
      <path d="M19.45 6.85a3.71 3.71 0 0 0-5.25 0l-1.4 1.4 2.8 2.8 1.4-1.4a3.71 3.71 0 0 0 0-5.25l2.45 2.45z" fill="#EA4335"/>
      <path d="M19.45 12.1a3.71 3.71 0 0 1 0 5.25l-.88.88a3.71 3.71 0 0 1-5.25 0l-5.6-5.6a3.71 3.71 0 0 1 0-5.25l.88-.88a3.71 3.71 0 0 1 5.25 0l5.6 5.6z" fill="#FBBC04"/>
    </svg>
  </div>
);

const PhonePeLogo = () => (
  <div className="w-12 h-12 rounded-xl bg-[#5f259f] border border-[#5f259f] flex items-center justify-center p-2 shadow-3xs shrink-0 transition-transform hover:scale-105">
    <svg className="w-8 h-8 object-contain" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 11.8C16.8 11.2 15.6 10.7 14.1 10.7H11.2V7.5H13.6C14.3 7.5 14.8 7 14.8 6.3C14.8 5.6 14.3 5.1 13.6 5.1H9.2C8.5 5.1 8 5.6 8 6.3C8 7 8.5 7.5 9.2 7.5H9.7V17.7C9.7 18.4 10.2 18.9 10.9 18.9C11.6 18.9 12.1 18.4 12.1 17.7V14.1H14.1C16 14.1 17.6 13.4 18.1 12.6C18.4 12.2 18 11.7 17.5 11.8Z" fill="#FFFFFF" />
      <path d="M13.8 13.8L17.2 18.3C17.6 18.8 18.3 18.9 18.8 18.5C19.3 18.1 19.4 17.4 19 16.9L15.6 12.4C15.1 12.9 14.5 13.4 13.8 13.8Z" fill="#FFFFFF" />
    </svg>
  </div>
);

const PaytmLogo = () => (
  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center p-1.5 shadow-3xs shrink-0 transition-transform hover:scale-105">
    <svg className="w-9 h-4 object-contain" viewBox="0 0 46 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" fill="#002970" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="-0.5">Pay</text>
      <text x="24" y="12" fill="#00BAF2" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="-0.5">tm</text>
    </svg>
    <span className="text-[8px] font-bold text-slate-500 font-mono tracking-tighter">UPI</span>
  </div>
);

const AmazonPayLogo = () => (
  <div className="w-12 h-12 rounded-xl bg-[#232f3e] border border-slate-700 flex flex-col items-center justify-center p-1.5 shadow-3xs shrink-0 transition-transform hover:scale-105">
    <span className="text-[11px] font-bold text-white tracking-tighter leading-none">pay</span>
    <svg className="w-7 h-2 object-contain mt-0.5" viewBox="0 0 28 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 5.5C7 8 20 8 27 2" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M25 1L27.5 2.5L25.5 4" stroke="#FF9900" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const BhimUpiLogo = () => (
  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center p-1 shadow-3xs shrink-0 transition-transform hover:scale-105">
    <div className="flex items-center gap-0.5">
      <span className="w-1.5 h-3 bg-[#007934] rounded-xs" />
      <span className="w-1.5 h-3 bg-[#F26522] rounded-xs" />
    </div>
    <span className="text-[9px] font-black text-slate-800 tracking-tighter mt-0.5">BHIM</span>
  </div>
);

const CredLogo = () => (
  <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-slate-800 flex flex-col items-center justify-center p-1.5 shadow-3xs shrink-0 transition-transform hover:scale-105">
    <div className="w-5 h-6 border-2 border-white rounded-xs flex items-center justify-center">
      <span className="text-[8px] font-bold text-white">C</span>
    </div>
  </div>
);

interface CartCheckoutProps {
  shoppingList?: ShoppingItem[];
  onToggleBought?: (id: string) => void;
  onAddItem?: (name: string, category: string, amount: number, unit: string) => void;
  onUpdateQuantity?: (id: string, newAmount: number) => void;
  onRemoveItem?: (id: string) => void;
  onClearCompleted?: () => void;
  onClearAll?: () => void;
  onCheckout?: (checkoutData: CheckoutData) => void;
  onUpiPaymentSuccess?: (verifiedData: any) => void;
  upiId?: string;
  upiQrCode?: string;
  cashOnDeliveryEnabled?: boolean;
}

export default function CartCheckout(props: CartCheckoutProps) {
  const context = useOutletContext<LayoutContextType | null>();
  const navigate = useNavigate();

  const shoppingList = props.shoppingList || context?.shoppingList || [];
  const onRemoveItem = props.onRemoveItem || ((id: string) => context?.handleRemoveShoppingItem(id));
  const onClearAll = props.onClearAll || (() => context?.handleClearAllShopping());
  const onCheckout = props.onCheckout || ((data: CheckoutData) => context?.handleCheckout(data));
  const cashOnDeliveryEnabled = props.cashOnDeliveryEnabled ?? context?.cashOnDeliveryEnabled ?? true;

  // Title update
  useEffect(() => {
    document.title = 'My Order & Checkout | The Frosting Fairy';
  }, []);

  // Customer Profile & Authentication State
  const customer = context?.customer || null;
  const customerToken = context?.customerToken || null;
  const isCustomerLoggedIn = context?.isCustomerLoggedIn ?? false;

  // Checkout Form Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('orders@frostingfairy.com');
  const [deliveryType, setDeliveryType] = useState<'Pickup' | 'Delivery'>('Delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState('');

  // Date & Time
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('14:00');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Collapsible cards state
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Offers & Rewards State
  const [couponCode, setCouponCode] = useState('BOND60');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountRate: number; name: string } | null>({
    code: 'BOND60',
    discountRate: 0.05,
    name: '"BOND60" applied',
  });
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [customCouponInput, setCustomCouponInput] = useState('');
  const [giftCardRedeemed, setGiftCardRedeemed] = useState(false);
  const [showGiftCardInput, setShowGiftCardInput] = useState(false);
  const [giftCardInput, setGiftCardInput] = useState('');
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [partnerOfferCollected, setPartnerOfferCollected] = useState(false);

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback modal for UPI app launch issues (matching reference screenshot)
  const [fallbackModal, setFallbackModal] = useState<{
    isOpen: boolean;
    appName: string;
    phone: string;
    smsSent: boolean;
  }>({
    isOpen: false,
    appName: 'G Pay',
    phone: '',
    smsSent: false,
  });

  // Sync authenticated customer data
  useEffect(() => {
    if (customer) {
      if (customer.fullPhoneNumber) {
        setCustomerPhone(customer.fullPhoneNumber);
      }
      if (customer.fullName && !customerName) {
        setCustomerName(customer.fullName);
      }
      if (customer.deliveryAddress && !deliveryAddress) {
        setDeliveryAddress(customer.deliveryAddress);
      }
      if (customer.gpsCoordinates && !gpsCoordinates) {
        setGpsCoordinates(customer.gpsCoordinates);
      }
      if (customer.preferredDeliveryType) {
        setDeliveryType(customer.preferredDeliveryType);
      }
    }
  }, [customer]);

  const handleLoginSuccess = (verifiedCustomer: CustomerProfile, token: string) => {
    if (context?.handleCustomerLogin) {
      context.handleCustomerLogin(verifiedCustomer, token);
    }
    setCustomerPhone(verifiedCustomer.fullPhoneNumber);
    if (verifiedCustomer.fullName) {
      setCustomerName(verifiedCustomer.fullName);
    }
    if (verifiedCustomer.deliveryAddress) {
      setDeliveryAddress(verifiedCustomer.deliveryAddress);
    }
    if (verifiedCustomer.gpsCoordinates) {
      setGpsCoordinates(verifiedCustomer.gpsCoordinates);
    }
    if (verifiedCustomer.preferredDeliveryType) {
      setDeliveryType(verifiedCustomer.preferredDeliveryType);
    }
    setErrorMessage('');
  };

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

  // Calculations
  const totalItemsCount = shoppingList.reduce((sum, item) => sum + item.amount, 0);
  const cartSubtotal = shoppingList.reduce((sum, item) => sum + getItemUnitPrice(item) * item.amount, 0);

  // Original list MRP estimate (shows striking crossed out price like reference ₹10,398 vs ₹1,799)
  const estimatedOriginalMrp = Math.round(cartSubtotal * 1.35);

  // Delivery charge
  const deliveryCharge = deliveryType === 'Delivery' ? (cartSubtotal >= 600 ? 0 : 50) : 0;
  const freeDeliverySavings = deliveryType === 'Delivery' && cartSubtotal >= 600 ? 50 : 0;

  // Coupon discount
  const couponDiscount = appliedCoupon ? Math.round(cartSubtotal * appliedCoupon.discountRate) : 0;

  // Total savings
  const totalSavings = (estimatedOriginalMrp - cartSubtotal) + couponDiscount + giftCardDiscount + freeDeliverySavings;

  // Final Payable
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount - giftCardDiscount + deliveryCharge);

  // GPS Location Pin
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
              setLocationFeedback('Location permission denied. Please write address manually.');
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
      setLocationFeedback('Location blocked by browser. Enter address manually.');
    }
  };

  // Coupons
  const handleApplyCustomCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = customCouponInput.trim().toUpperCase();
    if (!code) return;
    if (code === 'FAIRY5' || code === 'BOND60' || code === 'SWEET10') {
      const rate = code === 'SWEET10' ? 0.10 : 0.05;
      setAppliedCoupon({
        code,
        discountRate: rate,
        name: `"${code}" applied`,
      });
      setShowCouponInput(false);
      setCustomCouponInput('');
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid coupon code. Try "BOND60" or "FAIRY5" for 5% off!');
    }
  };

  const handleRedeemGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (giftCardInput.trim().length >= 4) {
      setGiftCardRedeemed(true);
      setGiftCardDiscount(100);
      setShowGiftCardInput(false);
      setErrorMessage('');
    } else {
      setErrorMessage('Please enter a valid gift card code.');
    }
  };

  // Validation
  const validateCheckout = (): boolean => {
    setErrorMessage('');

    if (shoppingList.length === 0) {
      setErrorMessage('My order is empty! Add a treat from our menu first.');
      return false;
    }

    if (!isCustomerLoggedIn || !customer) {
      setErrorMessage('Please login and verify your mobile number with OTP before continuing.');
      return false;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please provide your name for the order.');
      setIsEditingAddress(true);
      return false;
    }

    if (deliveryType === 'Delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide your delivery address or pin your location.');
      setIsEditingAddress(true);
      return false;
    }

    return true;
  };

  // Submission Flow (Direct UPI / COD)
  const handleProceedToPayment = async (selectedApp?: string) => {
    if (!validateCheckout()) {
      return;
    }

    const checkoutPayload: CheckoutData = {
      customerName: customerName.trim(),
      customerPhone: (customer?.fullPhoneNumber || customerPhone).trim(),
      customerId: customer?.fullPhoneNumber || customerPhone.trim(),
      customerToken: customerToken || undefined,
      pickupDate,
      pickupTime,
      specialInstructions: specialInstructions.trim(),
      deliveryType,
      deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Collection',
      gpsCoordinates,
      paymentMethod,
    };

    // 1) DIRECT UPI ORDER FLOW -> Automatically opens dedicated UPI payment page
    if (paymentMethod === 'UPI') {
      setIsSubmitting(true);
      setErrorMessage('');

      try {
        const orderRes = await fetch('/api/create-order', {
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

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.success) {
          throw new Error(orderData.error || 'Failed to initialize order for UPI payment.');
        }

        const resolvedOrderId = orderData.orderId;
        const resolvedTotal = orderData.totalPrice || grandTotal;

        // Automatically open/redirect to dedicated direct UPI Payment Page
        navigate(`/upi-payment?orderId=${encodeURIComponent(resolvedOrderId)}`, {
          state: {
            orderId: resolvedOrderId,
            orderNumber: resolvedOrderId,
            grandTotal: resolvedTotal,
            totalPrice: resolvedTotal,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryType,
            deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Collection',
            pickupDate,
            pickupTime,
            preferredApp: selectedApp || undefined,
            orderDetails: {
              id: resolvedOrderId,
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              deliveryType,
              deliveryAddress: deliveryType === 'Delivery' ? deliveryAddress.trim() : 'Store Collection',
              pickupDate,
              pickupTime,
              totalPrice: resolvedTotal,
              paymentMethod: 'UPI',
              paymentStatus: 'Pending',
            },
          },
        });
      } catch (err: any) {
        console.error('UPI Order initialization error:', err);
        setErrorMessage(err.message || 'Unable to initialize UPI payment. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2) CASH ON DELIVERY FLOW
    setIsSubmitting(true);
    setErrorMessage('');
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
    <div id="checkout-root" className="min-h-screen bg-slate-50/60 pb-20 font-sans">
      {/* 1. TOP HEADER (Matching reference style: < STORE NAME on left, 100% Secured Payment on right) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-3 sm:px-6 transition-all">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Back arrow + Brand Name */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-slate-800 hover:text-brand-pink transition-colors cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <Link to="/shop" className="flex items-center gap-1.5 text-slate-900 group">
              <span className="font-display font-black text-sm sm:text-base tracking-wider uppercase group-hover:text-brand-pink transition-colors">
                THE FROSTING FAIRY
              </span>
            </Link>
          </div>

          {/* Right: 100% Secured Payment with Lock */}
          <div className="flex items-center gap-1 text-slate-600 text-xs sm:text-sm font-semibold">
            <span>100% Secured Payment</span>
            <Lock className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
          </div>
        </div>
      </header>

      {/* 2. PROMOTIONAL BANNER (Directly below header, full width, using website's theme color) */}
      <div className="bg-brand-pink text-white text-xs font-semibold py-2 px-4 text-center tracking-wide shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>Get Flat 5% off on Prepaid Orders • Free Delivery &gt; ₹600</span>
        </div>
      </div>

      {/* Main Single-Column Checkout Container */}
      <main className="max-w-xl mx-auto px-3.5 sm:px-4 py-4 space-y-3.5">
        {shoppingList.length === 0 ? (
          /* Empty Order State */
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs mt-4">
            <div className="w-16 h-16 bg-pink-50 text-brand-pink rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">My Order is Empty</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
              Explore our boutique bakery menu to add delightful artisan treats, custom bento cakes, and dessert boxes!
            </p>
            <div className="mt-6">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                <Cake className="w-4 h-4" />
                <span>Explore Boutique Menu</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Global Error Banner if any */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Notice:</span>
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-400 hover:text-red-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Authentication Step (If not logged in) */}
            {!isCustomerLoggedIn && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Smartphone className="w-4 h-4 text-brand-pink" />
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Login / Continue using Mobile Number
                  </h3>
                </div>
                <CustomerMobileLogin
                  embedded={true}
                  title="Verify Mobile Number"
                  subtitle="Enter your mobile number to receive a one-time OTP before confirming checkout."
                  onSuccess={handleLoginSuccess}
                />
              </div>
            )}

            {/* 3. ORDER SUMMARY CARD (Rounded, clean, collapsible without leaving checkout) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
              {/* Header Row */}
              <div
                onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 select-none transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-brand-pink shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                      Order Summary
                    </h3>
                    <div className="mt-1">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        ₹{totalSavings.toFixed(2)} saved so far
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <span className="text-xs text-slate-500 font-sans block">
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                    </span>
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{estimatedOriginalMrp}
                      </span>
                      <span className="font-display font-bold text-base sm:text-lg text-slate-900">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 pl-1">
                    {isOrderSummaryOpen ? (
                      <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Items List & Details */}
              {isOrderSummaryOpen && (
                <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/30 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                      Cart Items ({totalItemsCount})
                    </span>
                    <button
                      type="button"
                      onClick={onClearAll}
                      className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Order</span>
                    </button>
                  </div>

                  {/* List of Cart Items */}
                  <div className="space-y-2.5">
                    {shoppingList.map((item) => {
                      const unitPrice = getItemUnitPrice(item);
                      const lineTotal = unitPrice * item.amount;
                      const stockLimit = getItemStockLimit(item);

                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3 shadow-3xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                width="48"
                                height="48"
                                loading="lazy"
                                className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-brand-pink shrink-0">
                                <Cake className="w-5 h-5" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {item.selectedOption || 'Standard'}
                              </p>
                              {item.customMessage && (
                                <p className="text-[10px] text-brand-pink font-mono italic truncate">
                                  &ldquo;{item.customMessage}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stepper and Price */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, item.amount - 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-700 hover:text-brand-pink rounded cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                                {item.amount}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, item.amount + 1)}
                                disabled={stockLimit !== undefined && item.amount >= stockLimit}
                                className="w-6 h-6 flex items-center justify-center text-slate-700 hover:text-brand-pink rounded cursor-pointer disabled:opacity-40"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right w-16">
                              <span className="font-display font-bold text-xs sm:text-sm text-slate-900 block">
                                ₹{lineTotal}
                              </span>
                              {item.amount > 1 && (
                                <span className="text-[9px] text-slate-400 font-mono block">
                                  ₹{unitPrice} ea
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing Breakdown inside expanded view */}
                  <div className="border-t border-slate-200/60 pt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-slate-900">₹{cartSubtotal}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Prepaid / Coupon Discount</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}
                    {giftCardDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Gift Card Credit</span>
                        <span>-₹{giftCardDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      {deliveryType === 'Pickup' ? (
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">Free Pickup</span>
                      ) : deliveryCharge === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">Free (&gt; ₹600)</span>
                      ) : (
                        <span className="font-semibold text-slate-900">₹{deliveryCharge}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Artisanal Gift Box & Piping</span>
                      <span className="text-emerald-700 font-bold uppercase text-[10px]">Free Included</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. DELIVERY ADDRESS CARD (Matching reference structure) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
              {/* Header with Deliver To + Edit pill */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <MapPin className="w-4 h-4 text-brand-pink" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                      Deliver To {customerName ? customerName.toUpperCase() : (customer?.fullName?.toUpperCase() || 'CUSTOMER')}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer hidden sm:inline-block"
                  >
                    Tap To Edit Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-brand-pink border border-slate-300 rounded-lg hover:border-brand-pink transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Display Address, Phone, Email details */}
              <div className="pl-10 text-xs sm:text-sm text-slate-700 space-y-1">
                <p className="font-medium leading-snug">
                  {deliveryType === 'Pickup'
                    ? 'Boutique Store Collection • The Frosting Fairy Boutique Kitchen'
                    : deliveryAddress || 'Please enter street, door number, and delivery landmarks'}
                </p>
                <div className="flex items-center gap-2 text-slate-500 text-xs flex-wrap">
                  <span>{customer?.fullPhoneNumber || customerPhone || '+91 98765 43210'}</span>
                  <span>|</span>
                  <span className="truncate">{customerEmail}</span>
                </div>
              </div>

              {/* 5. DELIVERY METHOD (Home Delivery as primary / first option, Store Collection as second option) */}
              <div className="pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Home Delivery (Primary / First) */}
                  <button
                    type="button"
                    onClick={() => setDeliveryType('Delivery')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      deliveryType === 'Delivery'
                        ? 'border-brand-pink bg-pink-50/50 text-slate-900 ring-1 ring-brand-pink'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-display text-xs text-slate-900">Home Delivery</span>
                      {deliveryType === 'Delivery' && <Check className="w-3.5 h-3.5 text-brand-pink" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Direct to Doorstep</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 mt-1">
                      {cartSubtotal >= 600 ? 'Free Shipping • Free' : '₹50 (Free > ₹600)'}
                    </span>
                  </button>

                  {/* Store Collection (Second Option) */}
                  <button
                    type="button"
                    onClick={() => setDeliveryType('Pickup')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      deliveryType === 'Pickup'
                        ? 'border-brand-pink bg-pink-50/50 text-slate-900 ring-1 ring-brand-pink'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-display text-xs text-slate-900">Store Collection</span>
                      {deliveryType === 'Pickup' && <Check className="w-3.5 h-3.5 text-brand-pink" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Boutique Kitchen</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 mt-1">
                      Free Pickup
                    </span>
                  </button>
                </div>
              </div>

              {/* Inline Address Editor (Expanded when clicking Change / Tap To Edit Address) */}
              {isEditingAddress && (
                <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Edit Delivery & Contact Details</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase font-mono text-slate-500">Your Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Akram J"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-pink mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase font-mono text-slate-500">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="e.g. customer@gmail.com"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-pink mt-1"
                      />
                    </div>
                  </div>

                  {deliveryType === 'Delivery' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase font-mono text-slate-500">Delivery Address</label>
                        <button
                          type="button"
                          onClick={handlePinLocation}
                          disabled={isLocating}
                          className="text-[10px] text-brand-pink font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                          <span>Pin GPS Location</span>
                        </button>
                      </div>
                      {locationFeedback && (
                        <p className="text-[10px] text-brand-pink font-sans">{locationFeedback}</p>
                      )}
                      <textarea
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House/flat number, building name, street, landmarks..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase font-mono text-slate-500">Requested Date</label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-pink mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase font-mono text-slate-500">Time Slot</label>
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-pink mt-1"
                      >
                        <option value="10:00">10:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="18:00">06:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Save & Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 6. OFFERS & REWARDS SECTION (Matching reference structure with rows for applied coupon, gift card, partner offers) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold font-mono tracking-wider text-slate-500 uppercase px-1 block">
                OFFERS &amp; REWARDS
              </span>

              {/* 7. SAVINGS HIGHLIGHT (Show total savings prominently in a small highlighted area) */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-3xs">
                <span>You saved ₹{totalSavings.toFixed(2)}</span>
              </div>

              {/* Offers Card with Separate Rows */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
                {/* Row 1: Applied Coupon */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 fill-emerald-100" />
                    <div>
                      {appliedCoupon ? (
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {appliedCoupon.name}
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-slate-700">
                          Apply Discount Coupon
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {appliedCoupon ? 'Flat 5% instant discount applied' : 'Enter code for savings'}
                      </p>
                    </div>
                  </div>

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer px-2 py-1"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCouponInput(!showCouponInput)}
                      className="text-xs font-bold text-brand-pink hover:text-brand-pink-dark transition-colors cursor-pointer px-2 py-1"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {/* Inline Coupon Input */}
                {showCouponInput && !appliedCoupon && (
                  <form onSubmit={handleApplyCustomCoupon} className="p-3 bg-slate-50 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter BOND60 or FAIRY5"
                      value={customCouponInput}
                      onChange={(e) => setCustomCouponInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-brand-pink"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Row 2: Gift Card */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-slate-600 shrink-0" />
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {giftCardRedeemed ? 'Gift Card Applied (₹100 Credit)' : 'Have Gift Card?'}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {giftCardRedeemed ? 'Credit applied to total' : 'Redeem bakery voucher'}
                      </p>
                    </div>
                  </div>

                  {giftCardRedeemed ? (
                    <button
                      type="button"
                      onClick={() => {
                        setGiftCardRedeemed(false);
                        setGiftCardDiscount(0);
                      }}
                      className="text-xs font-bold text-slate-700 hover:text-red-600 cursor-pointer px-2 py-1"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowGiftCardInput(!showGiftCardInput)}
                      className="text-xs font-bold text-slate-700 hover:text-brand-pink cursor-pointer px-2 py-1"
                    >
                      Redeem
                    </button>
                  )}
                </div>

                {/* Inline Gift Card Input */}
                {showGiftCardInput && !giftCardRedeemed && (
                  <form onSubmit={handleRedeemGiftCard} className="p-3 bg-slate-50 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter 16-digit Gift Card or code"
                      value={giftCardInput}
                      onChange={(e) => setGiftCardInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-brand-pink"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Redeem
                    </button>
                  </form>
                )}

                {/* Row 3: Collect Exclusive Partner Offers */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Gift className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {partnerOfferCollected
                          ? 'Exclusive Offers Collected worth ₹1150'
                          : 'Collect Exclusive Partner Offers worth ₹1150'}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {partnerOfferCollected ? 'Vouchers unlocked for your order' : 'Complimentary partner perks'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPartnerOfferCollected(!partnerOfferCollected)}
                    className={`text-xs font-bold px-2 py-1 transition-colors cursor-pointer ${
                      partnerOfferCollected ? 'text-emerald-700 font-bold' : 'text-slate-700 hover:text-brand-pink'
                    }`}
                  >
                    {partnerOfferCollected ? 'Collected ✓' : 'Collect'}
                  </button>
                </div>
              </div>
            </div>

            {/* 8. PAYMENT OPTIONS (Clean separated section with UPI card & horizontal scrollable UPI apps) */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold font-mono tracking-wider text-slate-500 uppercase px-1 block">
                PAYMENT OPTIONS
              </span>

              {/* Additional 5% discount banner */}
              <div>
                <span className="bg-pink-50 text-brand-pink border border-pink-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md inline-block">
                  Additional 5% discount
                </span>
              </div>

              {/* UPI Card (Clean, large card with UPI heading, amount on right, horizontal scroll of real apps) */}
              <div
                onClick={() => setPaymentMethod('UPI')}
                className={`bg-white rounded-2xl border-2 transition-all p-4 shadow-2xs cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'border-slate-900 ring-2 ring-slate-900/5'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Top Badge: Get 5% off + cashback */}
                <div className="flex justify-center mb-3">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-3xs">
                    Get 5% off + cashback
                  </span>
                </div>

                {/* UPI Header Row: UPI on left, Final payable amount on right */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <UpiBrandIcon />
                    <span className="font-display font-black text-base sm:text-lg text-slate-900 tracking-tight">
                      UPI
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-display font-black text-lg sm:text-xl text-slate-900">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Horizontal Scrollable Area of Supported UPI Apps with Proper Icons */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
                    {/* Paytm */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMethod('UPI');
                        handleProceedToPayment('paytm');
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-brand-pink transition-colors">
                        Win Cashback
                      </span>
                      <PaytmLogo />
                    </div>

                    {/* PhonePe */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMethod('UPI');
                        handleProceedToPayment('phonepe');
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-brand-pink transition-colors">
                        Win Cashback
                      </span>
                      <PhonePeLogo />
                    </div>

                    {/* Google Pay */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMethod('UPI');
                        handleProceedToPayment('gpay');
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-brand-pink transition-colors">
                        Win Cashback
                      </span>
                      <GPayLogo />
                    </div>

                    {/* Amazon Pay */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMethod('UPI');
                        handleProceedToPayment('amazonpay');
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-brand-pink transition-colors">
                        Win Cashback
                      </span>
                      <AmazonPayLogo />
                    </div>

                    {/* BHIM */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMethod('UPI');
                        handleProceedToPayment('bhim');
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-brand-pink transition-colors">
                        Fast UPI
                      </span>
                      <BhimUpiLogo />
                    </div>

                    {/* CRED */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMethod('UPI');
                        handleProceedToPayment('cred');
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-brand-pink transition-colors">
                        Rewards
                      </span>
                      <CredLogo />
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFallbackModal((prev) => ({ ...prev, isOpen: true, appName: 'G Pay / UPI' }));
                      }}
                      className="text-[11px] text-slate-500 hover:text-brand-pink font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Can&apos;t open your UPI app? Get payment link via SMS
                    </button>
                  </div>
                </div>
              </div>

              {/* Cash on Delivery Card (If enabled in admin settings) */}
              {cashOnDeliveryEnabled && (
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`bg-white rounded-2xl border-2 transition-all p-4 shadow-2xs cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-slate-900 ring-2 ring-slate-900/5'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-display font-bold text-sm sm:text-base text-slate-900">
                          Cash on Delivery (COD)
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {deliveryType === 'Pickup' ? 'Pay upon boutique collection' : 'Pay upon home delivery handover'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-bold text-base sm:text-lg text-slate-900">
                        ₹{(grandTotal + couponDiscount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Special Instructions Input */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-1">
              <label className="text-[10px] font-bold uppercase font-mono text-slate-500">
                Special Delivery Notes / Cake Customization
              </label>
              <input
                type="text"
                placeholder="e.g. Please ring doorbell twice, eggless packaging, happy birthday note..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-pink"
              />
            </div>

            {/* 9. MAIN CHECKOUT ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleProceedToPayment()}
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-between shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Lock className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-sm sm:text-base">
                    {isSubmitting
                      ? 'Processing Order...'
                      : paymentMethod === 'UPI'
                      ? 'Proceed with UPI'
                      : 'Place Cash on Delivery Order'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-base sm:text-lg font-mono">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Safe &amp; Direct Bank-to-Bank UPI Transfer</span>
              </p>
            </div>
          </>
        )}
      </main>

      {/* UPI App Fallback Bottom Sheet / Modal (Matching reference screenshot 2) */}
      {fallbackModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 animate-in slide-in-from-bottom-4">
            {/* Header with Close */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                  Can&apos;t open your UPI app?
                </h3>
                <p className="text-xs text-slate-500">Please try again</p>
              </div>
              <button
                type="button"
                onClick={() => setFallbackModal((prev) => ({ ...prev, isOpen: false, smsSent: false }))}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-amber-200 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-amber-900 font-medium leading-snug">
                {fallbackModal.appName} is not installed on your phone or failed to launch.
              </p>
            </div>

            {/* SMS Payment Link Option */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block">Get a payment Link</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">+91 -</span>
                  <input
                    type="tel"
                    value={fallbackModal.phone || (customerPhone ? customerPhone.replace('+91', '').trim() : '73975 28957')}
                    onChange={(e) => setFallbackModal((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="73975 28957"
                    className="w-full bg-transparent focus:outline-none text-slate-900 font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFallbackModal((prev) => ({ ...prev, smsSent: true }));
                    setTimeout(() => {
                      setFallbackModal((prev) => ({ ...prev, isOpen: false, smsSent: false }));
                      handleProceedToPayment();
                    }, 1000);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {fallbackModal.smsSent ? 'Sent! ✓' : 'Send SMS'}
                </button>
              </div>
            </div>

            {/* Direct UPI Page Action */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setFallbackModal((prev) => ({ ...prev, isOpen: false }));
                  handleProceedToPayment();
                }}
                className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Pay with UPI QR Code or Other Apps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
