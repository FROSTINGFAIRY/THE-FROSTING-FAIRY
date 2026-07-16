import React, { useState } from 'react';
import { Calendar, Trash2, Check, Clock, Phone, User, AlertCircle, ShoppingBag, ArrowLeft, CheckCircle2, CookingPot } from 'lucide-react';
import { Recipe, MealPlanEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MealPlannerProps {
  recipes: Recipe[];
  mealPlan: MealPlanEntry[];
  onAddMeal: (entry: MealPlanEntry) => void;
  onRemoveMeal: (id: string) => void;
  onAddIngredientsToShoppingList: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  preselectedRecipeId?: string;
  clearPreselectedRecipeId?: () => void;
}

export default function MealPlanner({
  mealPlan,
  onRemoveMeal,
  onSelectRecipe,
}: MealPlannerProps) {
  const [syncedOrders, setSyncedOrders] = useState<Record<string, boolean>>({});

  // Helper to determine status color tags and icons
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: 'bg-amber-50 text-amber-600 border-amber-200', text: 'Order Sent ✉️' };
      case 'Confirmed':
        return { bg: 'bg-blue-50 text-blue-600 border-blue-200', text: 'Confirmed 🤝' };
      case 'Baking':
        return { bg: 'bg-pink-50 text-brand-pink border-brand-pink/20', text: 'In Oven 🥣' };
      case 'Ready':
        return { bg: 'bg-green-50 text-green-600 border-green-200', text: 'Ready! 📦' };
      case 'Ready for Pickup':
        return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', text: 'Ready for Pickup 🏪📦' };
      case 'Out for Delivery':
        return { bg: 'bg-indigo-50 text-indigo-600 border-indigo-200', text: 'Out for Delivery 🛵💨' };
      case 'Completed':
        return { bg: 'bg-gray-100 text-gray-500 border-gray-200', text: 'Delivered 🎉' };
      default:
        return { bg: 'bg-brand-pink-light text-brand-pink border-brand-pink/10', text: 'Processing ✨' };
    }
  };

  // Orders statistics
  const pendingCount = mealPlan.filter(o => o.status === 'Pending' || !o.status).length;
  const bakingCount = mealPlan.filter(o => o.status === 'Baking').length;
  const readyCount = mealPlan.filter(o => o.status === 'Ready' || o.status === 'Ready for Pickup' || o.status === 'Out for Delivery').length;

  return (
    <div id="planner-root" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-brand-cream flex flex-col">
      {/* Top Header */}
      <header id="planner-header" className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0 border-b border-brand-cocoa-border pb-6">
        <div>
          <h2 id="planner-title" className="font-display font-bold text-3xl text-brand-cocoa tracking-tight">
            Order Status Tracker
          </h2>
          <p id="planner-subtitle" className="text-sm text-brand-cocoa-light mt-1 font-sans">
            Follow the live progress of your custom cakes and fresh bakes as our master chefs prepare them.
          </p>
        </div>

        {/* Live Counters */}
        {mealPlan.length > 0 && (
          <div id="tracker-stats" className="flex flex-wrap gap-2.5">
            <div className="bg-white border border-brand-cocoa-border px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-sans font-medium text-brand-cocoa-light">Pending:</span>
              <span className="font-bold text-brand-cocoa">{pendingCount}</span>
            </div>
            <div className="bg-white border border-brand-cocoa-border px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-pink animate-pulse" />
              <span className="font-sans font-medium text-brand-cocoa-light">Baking:</span>
              <span className="font-bold text-brand-cocoa">{bakingCount}</span>
            </div>
            <div className="bg-white border border-brand-cocoa-border px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="font-sans font-medium text-brand-cocoa-light">Ready:</span>
              <span className="font-bold text-brand-cocoa">{readyCount}</span>
            </div>
          </div>
        )}
      </header>

      {/* Orders queue display */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {mealPlan.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              {mealPlan.map((order) => {
                const orderStatus = order.status || 'Pending';
                const statusTag = getStatusStyle(orderStatus);

                return (
                  <div
                    key={order.id}
                    id={`order-card-${order.id}`}
                    className="bg-white border border-brand-cocoa-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-brand-pink-accent/35 transition-all text-left"
                  >
                    {/* Card Header: Product Cover & Baker Status */}
                    <div className="p-5 border-b border-brand-cocoa-border/50 flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand-cocoa-border shrink-0">
                        <img
                          src={order.recipe?.image || 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=300'}
                          alt={order.cakeType}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${statusTag.bg} mb-1.5`}>
                          {statusTag.text}
                        </span>
                        <h4 className="font-sans font-bold text-brand-cocoa text-sm md:text-base truncate">
                          {order.cakeType}
                        </h4>
                        <p className="text-xs text-brand-cocoa-light font-semibold font-sans mt-0.5">
                          Size Choice: {order.weight} • <span className="font-bold text-brand-pink">₹{order.estimatedPrice}</span>
                        </p>
                      </div>
                    </div>

                    {/* Card Body: Custom details */}
                    <div className="p-5 space-y-3.5 bg-brand-cream-light/10 flex-1 text-xs">
                      {order.flavor && (
                        <div className="flex gap-2">
                          <span className="font-mono text-brand-cocoa-light text-[10px] uppercase w-24 shrink-0">Frosting Flavor:</span>
                          <span className="font-semibold text-brand-cocoa">{order.flavor}</span>
                        </div>
                      )}

                      {order.message && (
                        <div className="flex gap-2">
                          <span className="font-mono text-brand-cocoa-light text-[10px] uppercase w-24 shrink-0">Piped Message:</span>
                          <span className="font-bold text-brand-pink">"{order.message}"</span>
                        </div>
                      )}

                      {order.specialInstructions && (
                        <div className="flex gap-2">
                          <span className="font-mono text-brand-cocoa-light text-[10px] uppercase w-24 shrink-0">Special Request:</span>
                          <span className="text-brand-cocoa italic">"{order.specialInstructions}"</span>
                        </div>
                      )}

                      {/* Delivery / Pickup Details Row */}
                      <div className="border-t border-brand-cocoa-border/40 pt-3 mt-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-brand-cream-light/40 p-2.5 rounded-lg border border-brand-cocoa-border/40">
                            <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light/80 block">Service Type</span>
                            <span className="font-sans font-bold text-brand-cocoa text-xs flex items-center gap-1 mt-0.5">
                              {order.deliveryType === 'Delivery' ? '🛵 Home Delivery' : '🏪 Store Pickup'}
                            </span>
                          </div>
                          <div className="bg-brand-cream-light/40 p-2.5 rounded-lg border border-brand-cocoa-border/40">
                            <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light/80 block">Payment Option</span>
                            <span className="font-sans font-bold text-brand-cocoa text-[11px] flex items-center gap-1 mt-0.5">
                              {order.paymentMethod === 'Card' ? '💳 Credit Card' : order.paymentMethod === 'UPI' ? '📱 UPI / QR Scan' : '💵 COD (Pay on Arrival)'}
                            </span>
                            {order.paymentDetails?.upiId && (
                              <span className="text-[9px] font-mono text-brand-cocoa-light block mt-0.5 truncate">{order.paymentDetails.upiId}</span>
                            )}
                            {order.paymentDetails?.cardNumber && (
                              <span className="text-[9px] font-mono text-brand-cocoa-light block mt-0.5">Card ending {order.paymentDetails.cardNumber.slice(-4)}</span>
                            )}
                          </div>
                        </div>

                        {order.deliveryType === 'Delivery' && order.deliveryAddress && (
                          <div className="bg-brand-pink-light/10 p-2.5 rounded-lg border border-brand-pink-accent/20 mb-2.5">
                            <span className="font-mono text-[8px] uppercase tracking-wider text-brand-pink-dark block">🛵 Delivery Address</span>
                            <span className="font-sans text-brand-cocoa text-xs font-medium block mt-1 leading-normal">{order.deliveryAddress}</span>
                            {order.gpsCoordinates && (
                              <span className="text-[9px] font-mono text-brand-cocoa-light mt-1 block flex items-center gap-1">
                                🛰️ Pinned Coordinates: <span className="font-semibold text-brand-pink-dark">{order.gpsCoordinates}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Collection Details Grid */}
                      <div className="border-t border-brand-cocoa-border/60 pt-3 grid grid-cols-2 gap-4 bg-brand-cream-light/35 p-3 rounded-xl">
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light/80 block">Customer</span>
                          <span className="font-sans font-bold text-brand-cocoa text-xs block truncate">{order.customerName || order.contactName}</span>
                          <span className="text-[10px] text-brand-cocoa-light block truncate mt-0.5">{order.customerPhone || order.contactPhone}</span>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light/80 block">{order.deliveryType === 'Delivery' ? 'Delivery Time' : 'Collection Time'}</span>
                          <span className="font-sans font-bold text-brand-cocoa text-xs flex items-center gap-1 block mt-0.5">
                            <Calendar className="w-3 h-3 text-brand-pink shrink-0" />
                            {order.pickupDate}
                          </span>
                          <span className="font-mono text-[10px] text-brand-pink-dark font-semibold block mt-0.5">
                            🕒 {order.pickupTime || '14:00'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 bg-brand-cream-light/20 border-t border-brand-cocoa-border/50 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3.5 h-3.5 text-brand-pink" />
                        <span className="font-medium text-brand-cocoa-light">Status: {orderStatus}</span>
                      </div>

                      <button
                        onClick={() => onRemoveMeal(order.id)}
                        className="text-xs font-semibold text-brand-cocoa-light hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-brand-cocoa-border/60 hover:border-red-100 transition-all flex items-center gap-1 cursor-pointer"
                        title="Cancel Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-brand-cocoa-border rounded-2xl p-8 max-w-lg mx-auto shadow-xs">
              <CookingPot className="w-12 h-12 text-brand-cocoa-light/30 mx-auto mb-4" />
              <h4 className="font-display font-bold text-brand-cocoa text-lg">No Active Custom Orders</h4>
              <p className="text-sm text-brand-cocoa-light mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                You haven't placed any confections orders yet. Head to our Menu page, customize your sweets, add them to your cart, and checkout!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
