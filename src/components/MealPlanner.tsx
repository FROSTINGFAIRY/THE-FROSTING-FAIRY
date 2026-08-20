import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Trash2,
  Clock,
  Phone,
  ShoppingBag,
  CheckCircle2,
  CookingPot,
  RotateCcw,
  Receipt,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Truck,
  Store,
  ChevronRight,
  PackageCheck,
  Flame,
  CreditCard,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import { Recipe, MealPlanEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { OrderReceiptModal } from './OrderReceiptModal';

interface MealPlannerProps {
  recipes: Recipe[];
  mealPlan: MealPlanEntry[];
  onAddMeal: (entry: MealPlanEntry) => void;
  onRemoveMeal: (id: string) => void;
  onAddIngredientsToShoppingList: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onReorder?: (order: MealPlanEntry) => void;
  onUpdateOrderStatus?: (orderId: string, status: MealPlanEntry['status']) => void;
  onNavigateToShop?: () => void;
  preselectedRecipeId?: string;
  clearPreselectedRecipeId?: () => void;
  cashOnDeliveryEnabled?: boolean;
  logo?: string;
  websiteName?: string;
}

type TabType = 'active' | 'history' | 'all';

export default function MealPlanner({
  recipes,
  mealPlan,
  onRemoveMeal,
  onSelectRecipe,
  onReorder,
  onUpdateOrderStatus,
  onNavigateToShop,
  cashOnDeliveryEnabled = true,
  logo,
  websiteName = 'The Frosting Fairy',
}: MealPlannerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<MealPlanEntry | null>(null);

  // Status visual styles & labels
  const getStatusStyle = (status: string = 'Pending') => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          text: 'Order Sent ✉️',
          stepIndex: 0,
        };
      case 'Confirmed':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          text: 'Confirmed 🤝',
          stepIndex: 1,
        };
      case 'Baking':
        return {
          bg: 'bg-pink-50 text-brand-pink border-brand-pink/20',
          text: 'In Oven 🥣',
          stepIndex: 2,
        };
      case 'Ready':
      case 'Ready for Pickup':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          text: 'Ready for Pickup 🏪📦',
          stepIndex: 3,
        };
      case 'Out for Delivery':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          text: 'Out for Delivery 🛵💨',
          stepIndex: 3,
        };
      case 'Completed':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          text: 'Fulfilled & Delivered 🎉',
          stepIndex: 4,
        };
      default:
        return {
          bg: 'bg-brand-pink-light text-brand-pink border-brand-pink/10',
          text: 'Processing ✨',
          stepIndex: 0,
        };
    }
  };

  // Group active vs history orders
  const activeOrders = useMemo(() => {
    return mealPlan.filter((o) => o.status !== 'Completed');
  }, [mealPlan]);

  const completedOrders = useMemo(() => {
    return mealPlan.filter((o) => o.status === 'Completed');
  }, [mealPlan]);

  // Filter based on active tab & search query
  const displayedOrders = useMemo(() => {
    let list: MealPlanEntry[] = [];
    if (activeTab === 'active') {
      list = activeOrders;
    } else if (activeTab === 'history') {
      list = completedOrders;
    } else {
      list = mealPlan;
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (o) =>
        o.cakeType.toLowerCase().includes(q) ||
        (o.flavor && o.flavor.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.contactName && o.contactName.toLowerCase().includes(q)) ||
        (o.message && o.message.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q))
    );
  }, [mealPlan, activeOrders, completedOrders, activeTab, searchQuery]);

  // Order history statistics
  const historyStats = useMemo(() => {
    const totalSpent = completedOrders.reduce((sum, o) => sum + (o.estimatedPrice || 0), 0);
    const itemFrequencies: Record<string, { count: number; order: MealPlanEntry }> = {};

    completedOrders.forEach((o) => {
      if (!itemFrequencies[o.cakeType]) {
        itemFrequencies[o.cakeType] = { count: 0, order: o };
      }
      itemFrequencies[o.cakeType].count += 1;
    });

    const topFavorite = Object.entries(itemFrequencies).sort((a, b) => b[1].count - a[1].count)[0];

    return {
      totalCompleted: completedOrders.length,
      totalSpent,
      topFavoriteName: topFavorite ? topFavorite[0] : null,
      topFavoriteCount: topFavorite ? topFavorite[1].count : 0,
      topFavoriteOrder: topFavorite ? topFavorite[1].order : null,
    };
  }, [completedOrders]);

  const handleReorderClick = (order: MealPlanEntry) => {
    if (onReorder) {
      onReorder(order);
    } else if (onSelectRecipe) {
      // Fallback: match recipe and open detail view
      const matched = recipes.find(
        (r) => r.id === order.recipe?.id || r.name.toLowerCase() === order.cakeType.toLowerCase()
      );
      if (matched) {
        onSelectRecipe(matched);
      }
    }
  };

  return (
    <div id="planner-root" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-brand-cream flex flex-col min-h-screen">
      {/* Top Header */}
      <header id="planner-header" className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b border-brand-cocoa-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="planner-title" className="font-serif font-bold text-3xl text-brand-cocoa tracking-tight">
              My Orders & History
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-pink text-white">
              {mealPlan.length} Total
            </span>
          </div>
          <p id="planner-subtitle" className="text-sm text-brand-cocoa-light mt-1 font-sans">
            Track ongoing artisan bakes in real time or re-order past favorite confections with a single click.
          </p>
        </div>

        {/* Action / View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-brand-cocoa-border shadow-xs">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-brand-pink text-white shadow-xs'
                : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Orders</span>
            {activeOrders.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'active' ? 'bg-white text-brand-pink' : 'bg-brand-pink/10 text-brand-pink'
              }`}>
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-brand-pink text-white shadow-xs'
                : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Order History</span>
            {completedOrders.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'history' ? 'bg-white text-brand-pink' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {completedOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-brand-cocoa text-white shadow-xs'
                : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream'
            }`}
          >
            <span>All ({mealPlan.length})</span>
          </button>
        </div>
      </header>

      {/* History Stats Bar (Shown when in Order History or when completed orders exist) */}
      {completedOrders.length > 0 && activeTab === 'history' && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-brand-cocoa-border shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-brand-cocoa-light tracking-wider block">
                Completed Transactions
              </span>
              <p className="font-serif font-bold text-lg text-brand-cocoa">
                {historyStats.totalCompleted} Orders Fulfilled
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-cocoa-border shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-brand-cocoa-light tracking-wider block">
                Total Confections Spent
              </span>
              <p className="font-mono font-bold text-lg text-brand-cocoa">
                ₹{historyStats.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-cocoa-border shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase font-bold text-brand-cocoa-light tracking-wider block truncate">
                  Most Re-Ordered Favorite
                </span>
                <p className="font-serif font-bold text-sm text-brand-cocoa truncate">
                  {historyStats.topFavoriteName || 'Artisan Pastry'}
                </p>
              </div>
            </div>
            {historyStats.topFavoriteOrder && (
              <button
                onClick={() => handleReorderClick(historyStats.topFavoriteOrder!)}
                className="px-2.5 py-1.5 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                title="Re-order Top Favorite"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-order</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-cocoa-light/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'history'
                ? "Search past orders by flavor, cake type, or ID..."
                : "Search active orders by item name or customer..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-cocoa-border rounded-xl text-xs text-brand-cocoa placeholder:text-brand-cocoa-light/50 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-cocoa-light hover:text-brand-cocoa"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-brand-cocoa-light font-mono flex items-center justify-between sm:justify-end gap-2">
          <span>Showing {displayedOrders.length} {activeTab === 'history' ? 'past transaction(s)' : 'order(s)'}</span>
        </div>
      </div>

      {/* Orders Grid Display */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {displayedOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              {displayedOrders.map((order, orderIdx) => {
                const orderStatus = order.status || 'Pending';
                const statusTag = getStatusStyle(orderStatus);
                const isDelivered = orderStatus === 'Completed';
                const orderRefId = `TFF-${(order.id || 'ORDER').slice(-6).toUpperCase()}`;

                return (
                  <motion.div
                    key={`order-card-${order.id}-${orderIdx}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all text-left ${
                      isDelivered
                        ? 'border-emerald-200/80 hover:border-emerald-400'
                        : 'border-brand-cocoa-border hover:border-brand-pink/40'
                    }`}
                  >
                    {/* Card Header: Product Cover, Status & Reference */}
                    <div className="p-5 border-b border-brand-cocoa-border/50 flex gap-4 bg-brand-cream/20">
                      <div className="w-18 h-18 rounded-2xl overflow-hidden border border-brand-cocoa-border shrink-0 bg-brand-cream">
                        <img
                          src={
                            order.recipe?.image ||
                            'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=300'
                          }
                          alt={order.cakeType}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${statusTag.bg}`}>
                            {statusTag.text}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-brand-cocoa-light/80">
                            #{orderRefId}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-brand-cocoa text-base truncate">
                          {order.cakeType}
                        </h4>
                        <p className="text-xs text-brand-cocoa-light font-semibold font-sans mt-0.5 flex items-center justify-between">
                          <span>Variant: {order.weight}</span>
                          <span className="font-mono font-bold text-sm text-brand-pink">₹{order.estimatedPrice}</span>
                        </p>
                      </div>
                    </div>

                    {/* Active Order Progress Stepper (Only for in-progress orders) */}
                    {!isDelivered && (
                      <div className="px-5 py-3 bg-brand-pink/5 border-b border-brand-cocoa-border/30">
                        <div className="flex items-center justify-between text-[10px] font-mono text-brand-cocoa-light mb-1.5">
                          <span className={statusTag.stepIndex >= 0 ? 'font-bold text-brand-pink' : ''}>1. Received</span>
                          <span className={statusTag.stepIndex >= 2 ? 'font-bold text-brand-pink' : ''}>2. Baking</span>
                          <span className={statusTag.stepIndex >= 3 ? 'font-bold text-brand-pink' : ''}>3. Ready / Dispatched</span>
                          <span className={statusTag.stepIndex >= 4 ? 'font-bold text-brand-pink' : ''}>4. Delivered</span>
                        </div>
                        <div className="w-full bg-brand-cocoa-border/40 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-pink h-full rounded-full transition-all duration-500"
                            style={{
                              width:
                                statusTag.stepIndex === 0
                                  ? '25%'
                                  : statusTag.stepIndex === 1
                                  ? '40%'
                                  : statusTag.stepIndex === 2
                                  ? '65%'
                                  : statusTag.stepIndex === 3
                                  ? '88%'
                                  : '100%',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Card Body: Custom details */}
                    <div className="p-5 space-y-3 bg-brand-cream-light/10 flex-1 text-xs">
                      {order.flavor && (
                        <div className="flex gap-2">
                          <span className="font-mono text-brand-cocoa-light text-[10px] uppercase w-28 shrink-0">
                            Frosting Flavor:
                          </span>
                          <span className="font-semibold text-brand-cocoa">{order.flavor}</span>
                        </div>
                      )}

                      {order.message && (
                        <div className="flex gap-2">
                          <span className="font-mono text-brand-cocoa-light text-[10px] uppercase w-28 shrink-0">
                            Piped Inscription:
                          </span>
                          <span className="font-bold text-brand-pink">"{order.message}"</span>
                        </div>
                      )}

                      {order.specialInstructions && (
                        <div className="flex gap-2">
                          <span className="font-mono text-brand-cocoa-light text-[10px] uppercase w-28 shrink-0">
                            Special Request:
                          </span>
                          <span className="text-brand-cocoa italic">"{order.specialInstructions}"</span>
                        </div>
                      )}

                      {/* Assorted Box Contents Breakdown */}
                      {order.boxContents && order.boxContents.length > 0 && (
                        <div className="bg-brand-pink-light/25 border border-brand-pink/20 rounded-xl p-3 space-y-2 mt-2">
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-brand-pink-dark">
                            <span>🎁 Assorted Box Selection:</span>
                            <span>{order.boxContents.reduce((s, c) => s + c.quantity, 0)} Items</span>
                          </div>
                          <div className="space-y-1.5 pt-0.5">
                            {order.boxContents.map((content, cIdx) => {
                              const linePrice =
                                content.price !== undefined ? content.price * content.quantity : undefined;
                              return (
                                <div
                                  key={`order-box-item-${cIdx}`}
                                  className="flex items-center justify-between text-xs font-sans text-brand-cocoa bg-white border border-brand-cocoa-border/40 px-2.5 py-1.5 rounded-lg shadow-3xs"
                                >
                                  <span>
                                    <strong className="text-brand-pink font-mono mr-1">{content.quantity}x</strong>{' '}
                                    {content.name}
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
                        </div>
                      )}

                      {/* Delivery / Payment Details */}
                      <div className="border-t border-brand-cocoa-border/40 pt-3 mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-brand-cocoa-border/50">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block">
                            Fulfillment
                          </span>
                          <span className="font-sans font-bold text-brand-cocoa text-xs flex items-center gap-1 mt-0.5">
                            {order.deliveryType === 'Delivery' ? '🛵 Home Delivery' : '🏪 Boutique Pickup'}
                          </span>
                          <span className="text-[10px] font-mono text-brand-cocoa-light mt-0.5 block">
                            {order.pickupDate} {order.pickupTime ? `• ${order.pickupTime}` : ''}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-brand-cocoa-border/50">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block">
                            Payment
                          </span>
                          <span className="font-sans font-bold text-brand-cocoa text-xs flex items-center gap-1 mt-0.5">
                            {order.paymentMethod === 'Card'
                              ? '💳 Card'
                              : order.paymentMethod === 'UPI'
                              ? '📱 UPI Scan'
                              : '💵 Cash'}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5 block">
                            {isDelivered ? 'Paid & Settled' : 'Verified'}
                          </span>
                        </div>
                      </div>

                      {order.deliveryType === 'Delivery' && order.deliveryAddress && (
                        <div className="bg-brand-pink-light/10 p-2.5 rounded-xl border border-brand-pink-accent/20">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-brand-pink-dark block">
                            Delivery Destination
                          </span>
                          <span className="font-sans text-brand-cocoa text-xs font-medium block mt-0.5 truncate">
                            📍 {order.deliveryAddress}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Action Buttons tailored for History vs Active */}
                    <div className="p-4 bg-brand-cream-light/30 border-t border-brand-cocoa-border/50 flex flex-wrap items-center justify-between gap-2.5">
                      {/* Left helper actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="text-xs font-semibold text-brand-cocoa hover:text-brand-pink hover:bg-white px-2.5 py-1.5 rounded-lg border border-brand-cocoa-border/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                          title="View Printable Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5 text-brand-pink" />
                          <span>Receipt</span>
                        </button>

                        {!isDelivered && onUpdateOrderStatus && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                            className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                            title="Mark this order as received/delivered"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark Received</span>
                          </button>
                        )}
                      </div>

                      {/* Right re-order & cancel actions */}
                      <div className="flex items-center gap-2">
                        {!isDelivered && (
                          <button
                            onClick={() => onRemoveMeal(order.id)}
                            className="text-xs font-semibold text-brand-cocoa-light hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-brand-cocoa-border/60 hover:border-red-100 transition-all flex items-center gap-1 cursor-pointer"
                            title="Cancel Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        )}

                        {/* RE-ORDER BUTTON: Highlights on history and accessible anytime */}
                        <button
                          onClick={() => handleReorderClick(order)}
                          className="text-xs font-bold text-white bg-brand-pink hover:bg-brand-pink-dark px-3.5 py-1.5 rounded-xl shadow-xs transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                          title="Re-order this exact pastry"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-order</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-brand-cocoa-border rounded-3xl p-8 max-w-lg mx-auto shadow-sm my-6">
              {activeTab === 'history' ? (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink mx-auto mb-4">
                    <RotateCcw className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif font-bold text-brand-cocoa text-xl">No Order History Yet</h4>
                  <p className="text-sm text-brand-cocoa-light mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                    Once your confections are fulfilled and delivered, they will appear here so you can easily re-order your favorite recipes and custom box creations with a single click.
                  </p>
                  {activeOrders.length > 0 ? (
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab('active')}
                        className="px-5 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        View {activeOrders.length} In-Progress Orders
                      </button>
                    </div>
                  ) : onNavigateToShop ? (
                    <div className="mt-6">
                      <button
                        onClick={onNavigateToShop}
                        className="px-5 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Explore Our Bakery Menu</span>
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-brand-cream border border-brand-cocoa-border flex items-center justify-center text-brand-cocoa-light mx-auto mb-4">
                    <CookingPot className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif font-bold text-brand-cocoa text-xl">No Active Custom Orders</h4>
                  <p className="text-sm text-brand-cocoa-light mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                    You haven't placed any pending confections orders. Select a handcrafted cake or sweet from our menu to customize your flavors, inscription, and delivery date!
                  </p>
                  {completedOrders.length > 0 ? (
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab('history')}
                        className="px-5 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Re-order from Order History ({completedOrders.length})</span>
                      </button>
                    </div>
                  ) : onNavigateToShop ? (
                    <div className="mt-6">
                      <button
                        onClick={onNavigateToShop}
                        className="px-5 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Browse Bakery Menu</span>
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Digital Receipt Modal */}
      <OrderReceiptModal
        order={selectedReceiptOrder}
        isOpen={Boolean(selectedReceiptOrder)}
        onClose={() => setSelectedReceiptOrder(null)}
        onReorder={handleReorderClick}
        logo={logo}
        websiteName={websiteName}
      />
    </div>
  );
}
