import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { TrendingUp, Calendar, DollarSign, Package, Sparkles, Trophy, ArrowUpRight } from 'lucide-react';
import { MealPlanEntry } from '../types';

interface PerformanceDashboardProps {
  orders: MealPlanEntry[];
  className?: string;
}

// Baseline monthly sales benchmark data for 12 months
const BASE_MONTHLY_DATA = [
  { month: 'Jan', fullName: 'January', baseOrders: 28, baseRevenue: 22400 },
  { month: 'Feb', fullName: 'February', baseOrders: 35, baseRevenue: 28500 },
  { month: 'Mar', fullName: 'March', baseOrders: 42, baseRevenue: 34600 },
  { month: 'Apr', fullName: 'April', baseOrders: 38, baseRevenue: 30200 },
  { month: 'May', fullName: 'May', baseOrders: 48, baseRevenue: 39800 },
  { month: 'Jun', fullName: 'June', baseOrders: 54, baseRevenue: 44200 },
  { month: 'Jul', fullName: 'July', baseOrders: 46, baseRevenue: 38900 },
  { month: 'Aug', fullName: 'August', baseOrders: 58, baseRevenue: 47900 },
  { month: 'Sep', fullName: 'September', baseOrders: 40, baseRevenue: 33100 },
  { month: 'Oct', fullName: 'October', baseOrders: 52, baseRevenue: 42800 },
  { month: 'Nov', fullName: 'November', baseOrders: 64, baseRevenue: 53100 },
  { month: 'Dec', fullName: 'December', baseOrders: 78, baseRevenue: 66400 },
];

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ orders, className = '' }) => {
  const [metricView, setMetricView] = useState<'orders' | 'revenue'>('orders');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Dynamically compute monthly aggregated orders & revenue by combining live orders + baseline
  const chartData = useMemo(() => {
    // Map of month indexes (0=Jan, 11=Dec) to live count & revenue
    const liveStats = new Array(12).fill(0).map(() => ({ count: 0, revenue: 0 }));

    orders.forEach((order) => {
      let monthIndex = 6; // default July if not parsed
      if (order.pickupDate) {
        const parts = order.pickupDate.split('-');
        if (parts.length >= 2) {
          const parsed = parseInt(parts[1], 10) - 1;
          if (!isNaN(parsed) && parsed >= 0 && parsed < 12) {
            monthIndex = parsed;
          }
        }
      }

      const price = typeof order.estimatedPrice === 'number'
        ? order.estimatedPrice
        : parseInt(String(order.estimatedPrice || '0').replace(/[^0-9]/g, ''), 10) || 0;

      liveStats[monthIndex].count += 1;
      liveStats[monthIndex].revenue += price;
    });

    return BASE_MONTHLY_DATA.map((item, idx) => {
      const live = liveStats[idx];
      const totalOrders = item.baseOrders + live.count;
      const totalRevenue = item.baseRevenue + live.revenue;
      return {
        month: item.month,
        fullName: item.fullName,
        orders: totalOrders,
        revenue: totalRevenue,
        liveOrders: live.count,
        liveRevenue: live.revenue,
      };
    });
  }, [orders]);

  // Aggregate stats
  const totalOrdersYear = useMemo(() => chartData.reduce((acc, curr) => acc + curr.orders, 0), [chartData]);
  const totalRevenueYear = useMemo(() => chartData.reduce((acc, curr) => acc + curr.revenue, 0), [chartData]);
  const avgOrdersPerMonth = Math.round(totalOrdersYear / 12);

  // Identify peak month
  const peakMonthObj = useMemo(() => {
    return [...chartData].sort((a, b) => b.orders - a.orders)[0];
  }, [chartData]);

  const currentMonthData = chartData[6]; // July (index 6)

  return (
    <div className={`bg-white rounded-3xl border border-brand-cocoa-border shadow-xs overflow-hidden ${className}`}>
      {/* Header section with Sage & Berry branding */}
      <div className="p-6 md:p-8 border-b border-brand-cocoa-border/40 bg-gradient-to-r from-brand-cream-light/40 via-white to-brand-pink-light/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EAF1EC] text-[#3D5B4B] border border-[#C2D8C9]">
                <TrendingUp className="w-3 h-3 text-[#4A725D]" />
                Analytics & Insight
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-pink-light/30 text-brand-pink border border-brand-pink/20">
                <Sparkles className="w-3 h-3 fill-brand-pink" />
                Live Order Pipeline
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-brand-cocoa flex items-center gap-2">
              <span>Performance Dashboard</span>
            </h3>
            <p className="text-xs text-brand-cocoa-light leading-relaxed max-w-2xl">
              Monthly distribution of custom cake and confectionery orders across the annual operational cycle.
            </p>
          </div>

          {/* Metric Toggle & Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-brand-cream-light/50 p-1.5 rounded-2xl border border-brand-cocoa-border/40">
            <button
              onClick={() => setMetricView('orders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                metricView === 'orders'
                  ? 'bg-[#5B7E6B] text-white shadow-xs'
                  : 'text-brand-cocoa-light hover:text-brand-cocoa'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Total Orders</span>
            </button>
            <button
              onClick={() => setMetricView('revenue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                metricView === 'revenue'
                  ? 'bg-brand-pink text-white shadow-xs'
                  : 'text-brand-cocoa-light hover:text-brand-cocoa'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Revenue (₹)</span>
            </button>
          </div>
        </div>

        {/* KPI Highlight Strip inside Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-brand-cocoa-border/30">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-brand-cocoa-border/50">
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold block">Annual Total Orders</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display font-black text-xl text-brand-cocoa">{totalOrdersYear.toLocaleString()}</span>
              <span className="text-[10px] text-[#4A725D] font-bold font-mono">orders</span>
            </div>
            <span className="text-[9.5px] text-brand-cocoa-light block mt-0.5">Across 12 months</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-brand-cocoa-border/50">
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold block">Monthly Average</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display font-black text-xl text-[#3D5B4B]">{avgOrdersPerMonth}</span>
              <span className="text-[10px] text-brand-cocoa-light font-mono">orders/mo</span>
            </div>
            <span className="text-[9.5px] text-brand-cocoa-light block mt-0.5">Steady demand rate</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-brand-cocoa-border/50">
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold block">Peak Season Month</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display font-black text-xl text-brand-pink">{peakMonthObj.fullName}</span>
            </div>
            <span className="text-[9.5px] text-brand-pink font-bold block mt-0.5">{peakMonthObj.orders} orders ({`₹${(peakMonthObj.revenue).toLocaleString()}`})</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-brand-cocoa-border/50">
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold block">Current Month (July)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display font-black text-xl text-brand-cocoa">{currentMonthData.orders}</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +14%
              </span>
            </div>
            <span className="text-[9.5px] text-brand-cocoa-light block mt-0.5">{currentMonthData.liveOrders} active in current queue</span>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#5B7E6B] inline-block" />
            <span className="text-xs font-bold text-brand-cocoa">
              {metricView === 'orders' ? 'Total Orders per Month' : 'Monthly Gross Revenue (₹)'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-brand-cocoa-light font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#5B7E6B] inline-block" /> Standard Month
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-brand-pink inline-block" /> Peak Month (Dec)
            </span>
          </div>
        </div>

        {/* Recharts BarChart Container */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2ECE6" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#7C6757', fontSize: 11, fontWeight: 600 }} 
                axisLine={{ stroke: '#E8DDD5' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#7C6757', fontSize: 11 }} 
                axisLine={{ stroke: '#E8DDD5' }}
                tickLine={false}
                tickFormatter={(val) => metricView === 'revenue' ? `₹${val / 1000}k` : val}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(232, 122, 144, 0.08)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3.5 border border-brand-cocoa-border/80 shadow-md rounded-2xl text-left text-xs font-sans space-y-1.5 min-w-[170px]">
                        <div className="flex items-center justify-between border-b border-brand-cream pb-1.5">
                          <span className="font-display font-bold text-brand-cocoa text-sm">{data.fullName}</span>
                          <span className="text-[10px] font-mono font-bold bg-[#EAF1EC] text-[#3D5B4B] px-1.5 py-0.5 rounded">2026</span>
                        </div>
                        <div className="flex items-center justify-between text-brand-cocoa">
                          <span className="text-brand-cocoa-light font-medium">Total Orders:</span>
                          <span className="font-mono font-bold text-[#3D5B4B]">{data.orders} orders</span>
                        </div>
                        <div className="flex items-center justify-between text-brand-cocoa">
                          <span className="text-brand-cocoa-light font-medium">Monthly Revenue:</span>
                          <span className="font-mono font-bold text-brand-pink">₹{data.revenue.toLocaleString()}</span>
                        </div>
                        {data.liveOrders > 0 && (
                          <div className="pt-1 border-t border-brand-cream text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Includes {data.liveOrders} custom queue orders</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey={metricView === 'orders' ? 'orders' : 'revenue'} 
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              >
                {chartData.map((entry, index) => {
                  // Color highlight for peak month (Dec) or highest bar vs standard sage green
                  const isPeak = entry.month === 'Dec';
                  const isJuly = entry.month === 'Jul';
                  let barColor = '#6B8E7B'; // Sage green default
                  
                  if (metricView === 'revenue') {
                    barColor = isPeak ? '#D84B70' : '#E87A90'; // Berry Pink palette
                  } else {
                    if (isPeak) barColor = '#D84B70'; // Berry pink for peak month
                    else if (isJuly) barColor = '#4E6E5D'; // Darker sage green for current month
                  }

                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={barColor} 
                      className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footnote / Sage Green Aesthetic Banner */}
        <div className="mt-6 pt-4 border-t border-brand-cocoa-border/30 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-cocoa-light gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="font-medium">
              Peak demand occurs in <strong>December</strong> (+62% over annual baseline) driven by holiday gift boxes and festive cakes.
            </span>
          </div>
          <span className="font-mono text-[10px] text-brand-cocoa-light/80 bg-brand-cream-light/40 px-2.5 py-1 rounded-full border border-brand-cocoa-border/30">
            Updated in real-time with Customer Orders Queue
          </span>
        </div>
      </div>
    </div>
  );
};
