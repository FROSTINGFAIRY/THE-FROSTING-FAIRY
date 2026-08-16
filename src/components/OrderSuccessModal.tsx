import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, Clock, Calendar, MapPin, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import { triggerOrderSuccessConfetti } from '../lib/confetti';

export interface OrderSuccessDetails {
  orderId?: string;
  customerName: string;
  deliveryType: 'Pickup' | 'Delivery';
  deliveryAddress?: string;
  pickupDate: string;
  pickupTime: string;
  totalAmount: number;
  itemsCount: number;
}

interface OrderSuccessModalProps {
  orderDetails: OrderSuccessDetails | null;
  onClose: () => void;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

export default function OrderSuccessModal({
  orderDetails,
  onClose,
  onViewOrders,
  onContinueShopping,
}: OrderSuccessModalProps) {
  useEffect(() => {
    if (orderDetails) {
      triggerOrderSuccessConfetti();
    }
  }, [orderDetails]);

  if (!orderDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-cocoa/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white border border-brand-cocoa-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
      >
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-pink via-amber-300 to-brand-pink" />

        {/* Celebratory Icon with Soft Pulse Rings */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-pink-light/40 rounded-full animate-ping opacity-60" />
          <div className="w-20 h-20 bg-brand-pink-light rounded-full flex items-center justify-center text-brand-pink border-2 border-brand-pink/30 shadow-inner relative z-10">
            <CheckCircle2 className="w-10 h-10 text-brand-pink" />
          </div>
          <span className="absolute -top-1 -right-1 text-xl animate-bounce">
            ✨
          </span>
        </div>

        {/* Heading & Subtext */}
        <h3 className="font-display font-black text-2xl text-brand-cocoa tracking-tight">
          Order Placed Successfully!
        </h3>
        <p className="text-xs font-sans text-brand-cocoa-light mt-1.5 leading-relaxed">
          Thank you, <strong className="text-brand-cocoa">{orderDetails.customerName}</strong>! Your artisanal treats are being queued with our bakery artists.
        </p>

        {/* Order Quick Summary Card */}
        <div className="my-5 p-4 bg-brand-cream/60 border border-brand-cocoa-border/60 rounded-2xl text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between font-mono pb-2 border-b border-brand-cocoa-border/40">
            <span className="text-brand-cocoa-light font-medium text-[10px] uppercase">
              {orderDetails.deliveryType === 'Delivery' ? '🛵 Home Delivery' : '🏪 Boutique Pickup'}
            </span>
            <span className="font-bold text-brand-pink text-sm">
              ₹{orderDetails.totalAmount}
            </span>
          </div>

          <div className="flex items-start gap-2 text-brand-cocoa">
            <Calendar className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5" />
            <span>
              <strong>Date:</strong> {orderDetails.pickupDate} at {orderDetails.pickupTime}
            </span>
          </div>

          {orderDetails.deliveryType === 'Delivery' && orderDetails.deliveryAddress && (
            <div className="flex items-start gap-2 text-brand-cocoa">
              <MapPin className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                <strong>Address:</strong> {orderDetails.deliveryAddress}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-brand-cocoa-light pt-1">
            <span>Items: {orderDetails.itemsCount} total</span>
            <span className="text-emerald-700 font-medium font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Queued for baking
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onViewOrders}
            className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-sans font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-brand-pink/20 flex items-center justify-center gap-2 cursor-pointer group text-sm"
          >
            <span>Track Order Live in Tracker 📦</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full bg-white hover:bg-brand-cream border border-brand-cocoa-border text-brand-cocoa font-sans font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-brand-pink" />
            <span>Continue Browsing Menu</span>
          </button>
        </div>

        {/* Re-trigger Confetti button for extra fun */}
        <div className="mt-4 pt-3 border-t border-brand-cocoa-border/30">
          <button
            type="button"
            onClick={triggerOrderSuccessConfetti}
            className="text-[11px] font-mono text-brand-pink hover:text-brand-pink-dark flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>Celebrate with Confetti Again! 🎉</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
