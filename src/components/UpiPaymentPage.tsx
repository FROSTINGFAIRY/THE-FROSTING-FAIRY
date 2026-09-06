import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams, Link, useOutletContext } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  QrCode as QrIcon,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  ShoppingBag,
  Info
} from 'lucide-react';
import { LayoutContextType } from '../types';
import { triggerOrderSuccessConfetti } from '../lib/confetti';

export default function UpiPaymentPage() {
  const context = useOutletContext<LayoutContextType | null>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract order information from navigation state or URL query parameters
  const stateData = (location.state as any) || {};
  const queryOrderId = searchParams.get('orderId') || searchParams.get('order') || searchParams.get('id') || '';
  const initialOrderId = stateData.orderId || stateData.orderNumber || queryOrderId || '';

  const [orderId, setOrderId] = useState<string>(initialOrderId);
  const [orderDetails, setOrderDetails] = useState<any>(stateData.orderDetails || null);
  const [totalAmount, setTotalAmount] = useState<number>(() => {
    return Number(stateData.grandTotal || stateData.totalPrice || stateData.amount || 0);
  });
  const [customerName, setCustomerName] = useState<string>(stateData.customerName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(stateData.customerPhone || '');

  // Merchant UPI Configuration (from live Firestore branding settings or standard fallback)
  const merchantUpiId = context?.upiId || 'justforme680@oksbi';
  const merchantName = context?.websiteName || 'The Frosting Fairy';

  // Payment UI State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [customerUpiId, setCustomerUpiId] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'VERIFYING' | 'PAID' | 'FAILED'>('PENDING');
  const [verifiedPaymentData, setVerifiedPaymentData] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');

  // Mobile detection for 1-click app links
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.title = 'Direct UPI Payment | The Frosting Fairy';
  }, []);

  // Fetch order details if loaded directly via URL or if totalAmount is 0
  useEffect(() => {
    if (!orderId) return;

    // If we already have full details and positive amount, check if already paid
    if (orderDetails && totalAmount > 0) {
      if (orderDetails.paymentStatus === 'Paid') {
        setPaymentStatus('PAID');
        setVerifiedPaymentData({
          orderNumber: orderId,
          paidAmount: totalAmount,
          transactionId: orderDetails.transactionId || 'Confirmed',
          paidAt: orderDetails.paymentTimestamp || new Date().toISOString(),
        });
      }
      return;
    }

    let isMounted = true;
    setIsLoadingOrder(true);
    setFetchError('');

    fetch(`/api/order/${encodeURIComponent(orderId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found or expired.');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setOrderDetails(data);
        const derivedTotal = Number(data.totalPrice || data.estimatedPrice || 0);
        setTotalAmount(derivedTotal);
        if (data.customerName) setCustomerName(data.customerName);
        if (data.customerPhone) setCustomerPhone(data.customerPhone);

        if (data.paymentStatus === 'Paid') {
          setPaymentStatus('PAID');
          setVerifiedPaymentData({
            orderNumber: orderId,
            paidAmount: derivedTotal,
            transactionId: data.transactionId || 'Confirmed',
            paidAt: data.paymentTimestamp || new Date().toISOString(),
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Could not load order details:', err);
        setFetchError('Unable to load order information. Please verify your order ID.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingOrder(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Construct standard NPCI UPI URI Specification
  // upi://pay?pa=<payee_vpa>&pn=<payee_name>&am=<amount>&cu=INR&tn=<transaction_note>
  const upiDeepLink = React.useMemo(() => {
    const formattedAmount = totalAmount > 0 ? totalAmount.toFixed(2) : '';
    const note = `Order ${orderId || 'Bakery'}`;
    const params = new URLSearchParams();
    params.set('pa', merchantUpiId);
    params.set('pn', merchantName);
    if (formattedAmount) {
      params.set('am', formattedAmount);
    }
    params.set('cu', 'INR');
    params.set('tn', note);
    return `upi://pay?${params.toString()}`;
  }, [merchantUpiId, merchantName, totalAmount, orderId]);

  // Generate crisp local Dynamic UPI QR Code
  useEffect(() => {
    if (!upiDeepLink) return;

    QRCode.toDataURL(upiDeepLink, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#2c1810', // brand-cocoa color for crisp scanning
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error('Failed to generate local UPI QR code:', err);
      });
  }, [upiDeepLink]);

  // Copy Merchant UPI ID to clipboard
  const handleCopyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(merchantUpiId).then(() => {
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = merchantUpiId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // Verify and record UPI payment using customer's 12-digit UTR
  const handleVerifyUpiPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerificationError('');

    const trimmedUtr = utrNumber.trim();
    if (!trimmedUtr) {
      setVerificationError('Please enter the 12-digit UPI Reference Number / Bank UTR ID from your payment app.');
      return;
    }

    if (trimmedUtr.length < 6) {
      setVerificationError('Invalid UPI Reference / UTR Number. It is typically a 12-digit number found on your payment receipt.');
      return;
    }

    if (!orderId) {
      setVerificationError('Missing order number. Please return to your cart and place the order again.');
      return;
    }

    setIsVerifying(true);
    setPaymentStatus('VERIFYING');

    try {
      const response = await fetch('/api/upi/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          utrNumber: trimmedUtr,
          customerUpiId: customerUpiId.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment verification failed. Please double check your UTR number.');
      }

      // Success: update states
      setPaymentStatus('PAID');
      setVerifiedPaymentData(data);

      // Trigger celebratory confetti
      triggerOrderSuccessConfetti();

      // Notify parent layout context
      if (context?.handleUpiPaymentSuccess) {
        context.handleUpiPaymentSuccess({
          orderIds: [orderId],
          orderNumber: orderId,
          paidAmount: totalAmount,
          transactionId: trimmedUtr,
          paidAt: data.paidAt || new Date().toISOString(),
          gatewayRef: trimmedUtr,
          checkoutData: {
            customerName: customerName || 'Customer',
            customerPhone: customerPhone || '',
            deliveryType: orderDetails?.deliveryType || 'Delivery',
            deliveryAddress: orderDetails?.deliveryAddress || '',
            pickupDate: orderDetails?.pickupDate || '',
            pickupTime: orderDetails?.pickupTime || '',
          },
        });
      }
    } catch (err: any) {
      console.error('UPI Verification error:', err);
      setPaymentStatus('FAILED');
      setVerificationError(err.message || 'Payment confirmation failed. Please check your reference number and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset verification to retry
  const handleRetryPayment = () => {
    setPaymentStatus('PENDING');
    setVerificationError('');
  };

  // If no order ID provided and none found
  if (!orderId && !isLoadingOrder) {
    return (
      <div className="flex-1 bg-brand-cream px-4 sm:px-6 py-12 flex flex-col items-center justify-center">
        <div className="bg-white border border-brand-cocoa-border rounded-xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-xl text-brand-cocoa">No Active Order Found</h2>
          <p className="text-xs text-brand-cocoa-light mt-2 leading-relaxed font-sans">
            It looks like you arrived here without an active checkout order. Please check My Order or explore our menu.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/cart"
              className="px-4 py-2.5 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-md text-xs font-bold font-sans transition-colors"
            >
              Go to My Order
            </Link>
            <Link
              to="/shop"
              className="px-4 py-2.5 bg-brand-cream hover:bg-brand-cream-light text-brand-cocoa border border-brand-cocoa-border rounded-md text-xs font-bold font-sans transition-colors"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cocoa hover:text-brand-pink transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart & Checkout</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Direct Zero-Fee UPI</span>
            </span>
          </div>
        </div>

        {/* Loading Indicator for order information */}
        {isLoadingOrder && (
          <div className="bg-white border border-brand-cocoa-border rounded-xl p-4 mb-6 flex items-center gap-3 text-xs text-brand-cocoa">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-pink" />
            <span>Loading order details...</span>
          </div>
        )}

        {fetchError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Notice</p>
              <p className="mt-0.5">{fetchError}</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: PAYMENT SUCCESSFUL CONFIRMATION SCREEN                             */}
        {/* ========================================================================= */}
        {paymentStatus === 'PAID' ? (
          <div className="bg-white border border-brand-cocoa-border rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto shadow-xs space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Payment Verified &amp; Confirmed
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-cocoa mt-3">
                Payment Successful!
              </h2>
              <p className="text-xs sm:text-sm text-brand-cocoa-light mt-1.5 font-sans">
                Thank you{customerName ? `, ${customerName}` : ''}! Your UPI payment has been received and your bakery order is queued with our chefs.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-brand-cream-light/30 border border-brand-cocoa-border/60 rounded-xl p-4 text-left space-y-2.5 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-brand-cocoa-border/40 pb-2">
                <span className="text-brand-cocoa-light">Order Number:</span>
                <span className="font-mono font-bold text-brand-cocoa">{orderId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-brand-cocoa-border/40 pb-2">
                <span className="text-brand-cocoa-light">Amount Paid:</span>
                <span className="font-bold text-emerald-700 text-sm">₹{totalAmount || verifiedPaymentData?.paidAmount}</span>
              </div>
              <div className="flex justify-between items-center border-b border-brand-cocoa-border/40 pb-2">
                <span className="text-brand-cocoa-light">Payment Method:</span>
                <span className="font-medium text-brand-cocoa">Direct UPI Transfer</span>
              </div>
              <div className="flex justify-between items-center border-b border-brand-cocoa-border/40 pb-2">
                <span className="text-brand-cocoa-light">UPI Transaction ID / UTR:</span>
                <span className="font-mono font-semibold text-brand-cocoa truncate max-w-[200px]">
                  {verifiedPaymentData?.transactionId || utrNumber || 'Verified'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-cocoa-light">Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirmed &amp; Baking Queue</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/my-orders"
                className="flex-1 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Track My Orders</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="flex-1 bg-white hover:bg-slate-50 border border-brand-cocoa-border text-brand-cocoa text-xs font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-brand-cocoa-light" />
                <span>Return to Menu</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: ACTIVE DEDICATED DIRECT UPI PAYMENT SCREEN                        */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: QR Code & Mobile UPI Apps */}
            <div className="lg:col-span-6 bg-white border border-brand-cocoa-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col items-center text-center space-y-4">
              <div className="w-full flex items-center justify-between border-b border-brand-cocoa-border/40 pb-3">
                <div className="flex items-center gap-2 text-left">
                  <QrIcon className="w-4 h-4 text-brand-pink" />
                  <div>
                    <h3 className="font-display font-bold text-sm text-brand-cocoa">
                      Scan UPI QR Code
                    </h3>
                    <p className="text-[11px] text-brand-cocoa-light font-sans">
                      Compatible with Google Pay, PhonePe, Paytm, BHIM &amp; CRED
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-brand-cocoa-light block">Amount to Pay</span>
                  <span className="text-base sm:text-lg font-bold font-mono text-brand-pink">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Code Canvas Display */}
              <div className="bg-brand-cream-light/30 p-4 border border-brand-cocoa-border/60 rounded-xl relative flex flex-col items-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`UPI Payment QR Code for ₹${totalAmount}`}
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                    />
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-brand-pink" />
                      <span className="text-xs mt-2 font-mono">Generating QR...</span>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-1 text-[11px] font-mono text-brand-cocoa-light font-medium">
                  <Sparkles className="w-3 h-3 text-brand-pink" />
                  <span>Amount ₹{totalAmount} pre-filled automatically</span>
                </div>
              </div>

              {/* Merchant UPI ID Box with One-Click Copy */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 text-left">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">
                    Merchant UPI ID (VPA)
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-cocoa truncate block select-all mt-0.5">
                    {merchantUpiId}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-brand-cocoa rounded-md text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedUpi ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct UPI App Buttons for Mobile Devices */}
              <div className="w-full pt-1 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cocoa-light font-bold flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Pay via Installed App</span>
                  </span>
                  {isMobile && (
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                      Direct App Launch
                    </span>
                  )}
                </div>

                {/* Primary All-UPI Chooser Button */}
                <a
                  href={upiDeepLink}
                  className="w-full bg-brand-cocoa hover:bg-brand-cocoa/90 text-white font-sans text-xs font-bold py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Smartphone className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Open Any Installed UPI App (₹{totalAmount})</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>

                {/* App Buttons Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { name: 'Google Pay', scheme: `tez://upi/pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`, color: 'hover:border-blue-400' },
                    { name: 'PhonePe', scheme: `phonepe://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`, color: 'hover:border-purple-400' },
                    { name: 'Paytm', scheme: `paytmmp://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`, color: 'hover:border-cyan-400' },
                  ].map((app) => (
                    <a
                      key={app.name}
                      href={app.scheme}
                      className={`p-2 border border-slate-200 rounded-lg bg-white text-brand-cocoa text-[11px] font-bold font-sans text-center transition-colors flex items-center justify-center gap-1 ${app.color}`}
                    >
                      <span>{app.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Details & Payment Verification Form */}
            <div className="lg:col-span-6 space-y-4">
              {/* Order Overview Card */}
              <div className="bg-white border border-brand-cocoa-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-brand-cocoa-border/40 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cocoa-light font-bold">
                      Order Reference
                    </span>
                    <h4 className="font-mono font-bold text-sm text-brand-cocoa mt-0.5">
                      {orderId}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-brand-cocoa-light block">Current Status</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Awaiting Payment</span>
                    </span>
                  </div>
                </div>

                {/* Amount & Items Info */}
                <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Customer:</span>
                    <span className="font-bold text-brand-cocoa">{customerName || 'Customer'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Delivery Option:</span>
                    <span className="font-bold text-brand-cocoa">{orderDetails?.deliveryType || 'Home Delivery'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Order Total:</span>
                    <span className="font-black text-brand-pink text-sm">₹{totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Gateway Fee:</span>
                    <span className="font-bold text-emerald-700 uppercase text-[10px]">₹0 (Free Direct UPI)</span>
                  </div>
                </div>

                {orderDetails?.cakeType && (
                  <div className="border-t border-brand-cocoa-border/40 pt-2 text-xs text-brand-cocoa-light">
                    <span className="font-medium text-slate-700">Selected Confection:</span>{' '}
                    <span className="font-sans">{orderDetails.cakeType}</span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Payment Instructions */}
              <div className="bg-brand-cream-light/30 border border-brand-cocoa-border/50 rounded-2xl p-4 sm:p-5 text-xs text-brand-cocoa font-sans space-y-2.5">
                <h5 className="font-display font-bold text-xs uppercase tracking-wider text-brand-cocoa flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-pink" />
                  <span>How to Complete Payment</span>
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11.5px] leading-relaxed">
                  <li>Scan the QR code above or tap your preferred UPI app button.</li>
                  <li>Confirm the payee name is <strong>{merchantName}</strong> and amount is <strong>₹{totalAmount}</strong>.</li>
                  <li>Approve the transaction in your UPI app.</li>
                  <li>Copy your <strong>12-digit UPI Reference Number / Bank UTR ID</strong> and submit below to verify.</li>
                </ol>
              </div>

              {/* Verification Form */}
              <div className="bg-white border border-brand-cocoa-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-brand-cocoa">
                    Verify &amp; Confirm Your Payment
                  </h4>
                  <p className="text-[11px] text-brand-cocoa-light font-sans mt-0.5">
                    Enter the 12-digit UTR / Reference ID from your UPI app receipt to confirm your order.
                  </p>
                </div>

                {/* Verification Error Box */}
                {verificationError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">Payment Verification Notice</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed">{verificationError}</p>
                      <button
                        type="button"
                        onClick={handleRetryPayment}
                        className="mt-2 text-[11px] font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer"
                      >
                        Retry Verification
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerifyUpiPayment} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-cocoa-light block mb-1">
                      12-Digit UPI Ref / Bank UTR Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 423589102456"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                      maxLength={30}
                      className="w-full bg-slate-50 border border-brand-cocoa-border rounded-lg px-3 py-2 text-xs font-mono font-bold text-brand-cocoa focus:outline-none focus:border-brand-pink placeholder-slate-400"
                    />
                    <span className="text-[10px] text-slate-500 font-sans block mt-1">
                      Found on your Google Pay / PhonePe / Paytm receipt screen.
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-cocoa-light block mb-1">
                      Your UPI ID / VPA <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={customerUpiId}
                      onChange={(e) => setCustomerUpiId(e.target.value.trim())}
                      className="w-full bg-slate-50 border border-brand-cocoa-border rounded-lg px-3 py-2 text-xs font-mono text-brand-cocoa focus:outline-none focus:border-brand-pink placeholder-slate-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isVerifying || !utrNumber.trim()}
                    className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-sans font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying with Server...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Verify &amp; Confirm Order</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                    <button
                      type="button"
                      onClick={() => navigate('/cart')}
                      className="hover:underline text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>✕ Cancel Payment &amp; Return to Cart</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Zero Gateway Surcharge • Direct Bank UPI
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
