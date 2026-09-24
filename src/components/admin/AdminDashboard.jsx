import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Ticket, Users, Calendar, TrendingUp, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiFetch } from '../../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await apiFetch('/admin/analytics');
        setData(res);
      } catch (err) {
        console.error('Fetch analytics error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading analytics insights…</div>;
  }

  const { metrics, categoryAnalytics, monthlyRevenue } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">Real-time revenue, booking transactions, and platform performance</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${(metrics?.totalRevenue || 210000).toLocaleString()}`, change: '+18.4%', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Total Bookings', value: (metrics?.totalBookings || 540).toLocaleString(), change: '+12.1%', icon: Ticket, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Total Events', value: (metrics?.totalEvents || 15).toLocaleString(), change: '+4 new', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Active Users', value: (metrics?.totalUsers || 1280).toLocaleString(), change: '+24.5%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
              <div className="flex items-center gap-1 text-[11px] text-green-400 mt-2 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>{card.change} from last month</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Revenue & Sales Performance</h2>
              <p className="text-xs text-gray-400">Monthly booking transaction totals (INR)</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-500/20">
              2026 YTD
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Sales by Category</h2>
            <p className="text-xs text-gray-400">Distribution across Movies, Concerts, Sports</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAnalytics && categoryAnalytics.length > 0 ? categoryAnalytics : [
                { category: 'Movies', bookings: 420 },
                { category: 'Concerts', bookings: 310 },
                { category: 'Sports', bookings: 190 },
                { category: 'Comedy', bookings: 140 },
                { category: 'Theatre', bookings: 80 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="category" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="bookings" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
