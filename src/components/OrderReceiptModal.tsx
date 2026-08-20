import React from 'react';
import { X, Printer, RotateCcw, CheckCircle2, MapPin, Calendar, Clock, Phone, CreditCard, Sparkles, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { MealPlanEntry, Recipe } from '../types';

interface OrderReceiptModalProps {
  order: MealPlanEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onReorder: (order: MealPlanEntry) => void;
  logo?: string;
  websiteName?: string;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  onReorder,
  logo,
  websiteName = 'The Frosting Fairy',
}) => {
  if (!isOpen || !order) return null;

  const orderRefId = `TFF-${(order.id || 'ORDER').slice(-6).toUpperCase()}`;
  const isDelivered = order.status === 'Completed';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-brand-cocoa-border text-left">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-brand-cream/80 border-b border-brand-cocoa-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink font-bold">
              🧾
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-brand-cocoa">Digital Order Receipt</h3>
              <p className="text-[11px] text-brand-cocoa-light font-mono">Invoice Reference: #{orderRefId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-brand-cocoa-border bg-white hover:bg-brand-cream text-xs font-semibold text-brand-cocoa flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-brand-cocoa-light" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-brand-pink/10 border border-brand-cocoa-border/60 flex items-center justify-center text-brand-cocoa transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-xs text-brand-cocoa">
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-brand-cocoa-border/60">
            <div className="flex items-center gap-3">
              {logo ? (
                <img src={logo} alt={websiteName} className="w-12 h-12 rounded-xl object-cover border border-brand-cocoa-border shadow-xs" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-brand-pink flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs">
                  TF
                </div>
              )}
              <div>
                <h4 className="font-serif font-bold text-lg text-brand-cocoa">{websiteName}</h4>
                <p className="text-[11px] text-brand-cocoa-light font-mono">Artisanal Patisserie & Confectionery</p>
                <p className="text-[10px] text-brand-cocoa-light/70 font-mono">orders@thefrostingfairy.com • Mumbai, India</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border ${
                isDelivered
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {isDelivered ? 'Fulfilled & Delivered' : (order.status || 'In Progress')}
              </span>
              <p className="text-[11px] text-brand-cocoa-light font-mono mt-1">
                Fulfilled Date: {order.pickupDate || 'Recent'}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-cream/40 p-4 rounded-2xl border border-brand-cocoa-border/60">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold block mb-1">
                Billed & Delivered To
              </span>
              <p className="font-bold text-sm text-brand-cocoa">{order.customerName || order.contactName || 'Valued Customer'}</p>
              <p className="text-brand-cocoa-light flex items-center gap-1 mt-0.5 font-mono">
                <Phone className="w-3 h-3 text-brand-pink shrink-0" />
                {order.customerPhone || order.contactPhone || 'N/A'}
              </p>
              {order.deliveryType === 'Delivery' && order.deliveryAddress && (
                <p className="text-[11px] text-brand-cocoa/90 mt-1.5 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5" />
                  <span>{order.deliveryAddress}</span>
                </p>
              )}
            </div>

            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold block mb-1">
                Fulfillment Details
              </span>
              <p className="font-semibold text-brand-cocoa flex items-center gap-1.5">
                <span className="text-sm">{order.deliveryType === 'Delivery' ? '🛵 Doorstep Delivery' : '🏪 Boutique Pickup'}</span>
              </p>
              <p className="text-brand-cocoa-light flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3 text-brand-pink" />
                <span>Scheduled: {order.pickupDate} {order.pickupTime ? `at ${order.pickupTime}` : ''}</span>
              </p>
              <p className="text-brand-cocoa-light flex items-center gap-1.5 mt-0.5">
                <CreditCard className="w-3 h-3 text-brand-pink" />
                <span>Payment: {order.paymentMethod === 'Card' ? 'Credit / Debit Card' : order.paymentMethod === 'UPI' ? 'UPI Instant Pay' : 'Cash on Delivery'}</span>
              </p>
            </div>
          </div>

          {/* Purchased Item Breakdown */}
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-cocoa-light font-bold block mb-2">
              Purchased Bakery Items
            </span>
            <div className="border border-brand-cocoa-border rounded-2xl overflow-hidden bg-white">
              <div className="p-4 flex gap-4 items-start border-b border-brand-cocoa-border/40">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand-cocoa-border shrink-0 bg-brand-cream">
                  <img
                    src={order.recipe?.image || 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=300'}
                    alt={order.cakeType}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-serif font-bold text-base text-brand-cocoa">{order.cakeType}</h5>
                    <span className="font-mono font-bold text-sm text-brand-pink">₹{order.estimatedPrice}</span>
                  </div>
                  <p className="text-xs text-brand-cocoa-light font-medium mt-0.5">
                    Selected Variant: <span className="text-brand-cocoa font-bold">{order.weight}</span>
                  </p>
                  {order.flavor && (
                    <p className="text-xs text-brand-cocoa-light mt-0.5">
                      Frosting / Flavor: <span className="text-brand-cocoa font-medium">{order.flavor}</span>
                    </p>
                  )}
                  {order.message && (
                    <p className="text-xs text-brand-pink font-semibold mt-1 bg-brand-pink/5 p-1.5 rounded-lg border border-brand-pink/20">
                      Piped Message: "{order.message}"
                    </p>
                  )}
                  {order.specialInstructions && (
                    <p className="text-[11px] text-brand-cocoa-light italic mt-1">
                      Note: "{order.specialInstructions}"
                    </p>
                  )}
                </div>
              </div>

              {/* Assorted Box Breakdown if present */}
              {order.boxContents && order.boxContents.length > 0 && (
                <div className="p-3.5 bg-brand-cream/30 border-t border-brand-cocoa-border/30 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-brand-pink uppercase tracking-wider">
                    <span>🎁 Box Contents Breakdown:</span>
                    <span>{order.boxContents.reduce((s, c) => s + c.quantity, 0)} Items Selected</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {order.boxContents.map((item, idx) => (
                      <div key={idx} className="bg-white px-2.5 py-1 rounded-lg border border-brand-cocoa-border/40 flex items-center justify-between text-xs">
                        <span><strong className="text-brand-pink font-mono">{item.quantity}x</strong> {item.name}</span>
                        {item.price ? <span className="font-mono text-brand-cocoa-light">₹{item.price * item.quantity}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Calculation Row */}
              <div className="p-4 bg-brand-cream/20 space-y-2 border-t border-brand-cocoa-border/40">
                <div className="flex justify-between text-brand-cocoa-light">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">₹{order.estimatedPrice}</span>
                </div>
                <div className="flex justify-between text-brand-cocoa-light">
                  <span>Delivery & Temperature-Shield Packaging</span>
                  <span className="font-mono font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-brand-cocoa-light">
                  <span>GST (5% Confectionery Tax included)</span>
                  <span className="font-mono font-semibold">Included</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-cocoa pt-2 border-t border-brand-cocoa-border/60">
                  <span className="font-serif">Total Paid</span>
                  <span className="font-mono text-base text-brand-pink">₹{order.estimatedPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-center gap-2.5 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Freshness & Quality Guaranteed:</strong> Handcrafted with 100% pure butter and single-origin cocoa.
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-brand-cream/80 border-t border-brand-cocoa-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-brand-cocoa-border bg-white hover:bg-brand-cream text-xs font-semibold text-brand-cocoa transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
          <button
            onClick={() => {
              onReorder(order);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-order This Confection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
