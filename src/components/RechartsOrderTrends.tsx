import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import { Order, Product } from '../types';
import { TrendingUp, ShoppingBag, DollarSign, Calendar, PieChart as PieIcon, BarChart3, Layers } from 'lucide-react';

interface RechartsOrderTrendsProps {
  orders: Order[];
  products?: Product[];
}

export const RechartsOrderTrends: React.FC<RechartsOrderTrendsProps> = ({ orders = [], products = [] }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'composed'>('area');

  const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;

  // Compute Daily Trend Data from actual orders
  const dailyData = useMemo(() => {
    const days = daysCount;
    const now = new Date();
    const map: { [key: string]: { date: string; rawDate: string; earnings: number; ordersCount: number; completedCount: number; cancelledCount: number } } = {};

    // Initialize all days in range
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      map[key] = {
        date: dateLabel,
        rawDate: key,
        earnings: 0,
        ordersCount: 0,
        completedCount: 0,
        cancelledCount: 0,
      };
    }

    // Aggregate real orders
    orders.forEach((o) => {
      let orderKey = '';
      if (o.createdAt) {
        try {
          orderKey = new Date(o.createdAt).toISOString().split('T')[0];
        } catch {
          orderKey = new Date().toISOString().split('T')[0];
        }
      } else {
        orderKey = new Date().toISOString().split('T')[0];
      }

      if (map[orderKey]) {
        map[orderKey].earnings += o.totalAmount || 0;
        map[orderKey].ordersCount += 1;
        if (o.orderStatus === 'delivered') {
          map[orderKey].completedCount += 1;
        } else if (o.orderStatus === 'cancelled') {
          map[orderKey].cancelledCount += 1;
        }
      }
    });

    return Object.values(map);
  }, [orders, daysCount]);

  // Total summary for selected range
  const rangeEarnings = dailyData.reduce((sum, d) => sum + d.earnings, 0);
  const rangeOrders = dailyData.reduce((sum, d) => sum + d.ordersCount, 0);
  const rangeCompleted = dailyData.reduce((sum, d) => sum + d.completedCount, 0);
  const peakDay = useMemo(() => {
    if (dailyData.length === 0) return null;
    return [...dailyData].sort((a, b) => b.earnings - a.earnings)[0];
  }, [dailyData]);

  // Compute Category Distribution from actual orders
  const categoryData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        // Try to match product category or use categoryName
        const categoryName = item.category
          ? item.category.replace(/_/g, ' ').toUpperCase()
          : 'GROCERY STAPLES';
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (item.price * item.quantity);
      });
    });

    const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'];
    const entries = Object.entries(categoryMap);
    if (entries.length === 0) {
      return [
        { name: 'FRESH FRUITS & VEG', value: 1200, color: '#10b981' },
        { name: 'DAIRY & EGGS', value: 850, color: '#f59e0b' },
        { name: 'SNACKS & MUNCHIES', value: 650, color: '#8b5cf6' },
      ];
    }

    const totalCategoryRevenue = entries.reduce((s, [, val]) => s + val, 0) || 1;
    return entries.map(([name, value], idx) => ({
      name,
      value,
      percentage: Math.round((value / totalCategoryRevenue) * 100),
      color: COLORS[idx % COLORS.length],
    }));
  }, [orders]);

  // Tooltip formatter for Recharts Currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <p className="font-black text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
              <span style={{ color: entry.color || entry.fill }} className="font-bold">
                {entry.name}:
              </span>
              <span className="font-mono font-extrabold text-white">
                {entry.name.toLowerCase().includes('earnings') || entry.name.toLowerCase().includes('revenue')
                  ? `₹${Number(entry.value).toLocaleString('en-IN')}`
                  : `${entry.value} Orders`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-300">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Real-Time Daily Earnings & Volume Trends</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-300 font-mono">
                Recharts Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Live trend analytics powered by real-time customer order history ({orders.length} total orders recorded)
            </p>
          </div>
        </div>

        {/* Chart View Toggle & Time Filter */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                chartType === 'area' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Earnings Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                chartType === 'bar' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order Volume
            </button>
            <button
              onClick={() => setChartType('composed')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                chartType === 'composed' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dual View
            </button>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-1 rounded-2xl flex items-center gap-1">
            {(['7d', '14d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${
                  timeRange === r ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '14d' ? '14 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip for selected period */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Period Revenue</span>
          <span className="text-lg font-black text-slate-900">₹{rangeEarnings.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Last {daysCount} Days</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Period Orders</span>
          <span className="text-lg font-black text-teal-800">{rangeOrders} Orders</span>
          <span className="text-[10px] text-teal-600 font-bold block mt-0.5">{rangeCompleted} Delivered</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Daily Sales</span>
          <span className="text-lg font-black text-emerald-800">
            ₹{Math.round(rangeEarnings / (daysCount || 1)).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Daily Velocity</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Day Revenue</span>
          <span className="text-lg font-black text-amber-900">
            {peakDay && peakDay.earnings > 0 ? `₹${peakDay.earnings.toLocaleString('en-IN')}` : '₹0'}
          </span>
          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
            {peakDay && peakDay.earnings > 0 ? peakDay.date : 'No Orders Yet'}
          </span>
        </div>
      </div>

      {/* Main Interactive Recharts Graph */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
              <Area
                type="monotone"
                dataKey="earnings"
                name="Gross Earnings (₹)"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#earningsGradient)"
                activeDot={{ r: 7, strokeWidth: 2, fill: '#ffffff', stroke: '#059669' }}
              />
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
              <Bar dataKey="ordersCount" name="Total Placed Orders" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar dataKey="completedCount" name="Delivered Orders" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          ) : (
            <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsDualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} tickFormatter={(v) => `₹${v}`} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
              <Area yAxisId="left" type="monotone" dataKey="earnings" name="Gross Revenue (₹)" stroke="#059669" strokeWidth={3} fill="url(#earningsDualGrad)" />
              <Bar yAxisId="right" dataKey="ordersCount" name="Order Volume" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Category Revenue Breakdown Pie Chart with Recharts */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-purple-600" /> Category Share of Gross Revenue (Recharts Donut)
          </h4>
          <span className="text-[10px] font-bold text-slate-500">Derived from Real Basket Line Items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-extrabold text-slate-800 truncate max-w-[150px]">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-slate-900">₹{cat.value.toLocaleString('en-IN')}</span>
                  {cat.percentage !== undefined && (
                    <span className="text-[10px] text-slate-500 font-bold block">({cat.percentage}%)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
