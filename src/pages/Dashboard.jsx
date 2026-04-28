import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useStockLogStore  } from '../store/stockLogStore';
import { useProductStore   } from '../store/productStore';
import StatCard         from '../components/common/StatCard';
import RevenueAreaChart from '../components/charts/RevenueAreaChart';
import Layout           from '../components/layout/Layout';
import { useAuth }      from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { summary, dailyTrends, lowStock, loading,
          fetchSummary, fetchDailyTrends, fetchLowStock } = useAnalyticsStore();
  const { todaySummary, fetchToday } = useStockLogStore();
  const { fetch: fetchProducts }     = useProductStore();

  useEffect(() => {
    fetchSummary();
    fetchDailyTrends(14);
    fetchLowStock();
    fetchToday();
    fetchProducts({ limit: 5, lowStock: true });
  }, []);

  const hour    = dayjs().hour();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const fmt = (n) => `₹${n?.toLocaleString('en-IN') || 0}`;

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">

        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {greeting}, {user?.username} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {dayjs().format('dddd, DD MMMM YYYY')}
            </p>
          </div>
          <Link to="/stock"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600
                       hover:bg-indigo-700 text-white font-medium rounded-xl
                       text-sm transition shadow-md">
            ✏️ Add Entry
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Today revenue"
            value={fmt(summary?.today?.revenue)}
            sub={`${summary?.today?.itemsSold || 0} items sold`}
            icon="💰" color="indigo" loading={loading.summary} />
          <StatCard label="Month revenue"
            value={fmt(summary?.month?.revenue)}
            sub={`${summary?.month?.activeDays || 0} days active`}
            icon="📅" color="green" loading={loading.summary} />
          <StatCard label="Year revenue"
            value={fmt(summary?.year?.revenue)}
            sub={`${summary?.year?.itemsSold?.toLocaleString() || 0} sold`}
            icon="📈" color="amber" loading={loading.summary} />
          <StatCard label="Low stock"
            value={summary?.overview?.lowStockCount || 0}
            sub="products need restock"
            icon="⚠️" color="red" loading={loading.summary} />
        </div>

        {/* 14-day chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Last 14 days
            </h3>
            <Link to="/analytics"
              className="text-xs text-indigo-600 dark:text-indigo-400
                         hover:underline font-medium">
              Full analytics →
            </Link>
          </div>
          {loading.daily ? (
            <div className="h-48 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : (
            <RevenueAreaChart data={dailyTrends} />
          )}
        </div>

        {/* Today's summary + Low stock side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Today's entry quick view */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border
                          border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800
                            flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Today's entry
              </h3>
              <Link to="/stock"
                className="text-xs text-indigo-600 dark:text-indigo-400
                           hover:underline font-medium">
                {todaySummary?.totalItemsSold > 0 ? 'Edit' : 'Record'} →
              </Link>
            </div>
            <div className="p-5">
              {todaySummary?.totalItemsSold > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        ₹{todaySummary.totalRevenue?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Revenue</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/40 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {todaySummary.totalItemsSold}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Items sold</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {todaySummary.soldItems?.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 truncate mr-3">
                          {item.product?.name}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white shrink-0">
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                    {todaySummary.soldItems?.length > 4 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        +{todaySummary.soldItems.length - 4} more…
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-3xl mb-2">📋</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No entry recorded today
                  </p>
                  <Link to="/stock"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700
                               text-white text-sm font-medium rounded-xl transition">
                    Record now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Low stock quick list */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border
                          border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800
                            flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                ⚠️ Low stock
              </h3>
              <Link to="/analytics"
                className="text-xs text-indigo-600 dark:text-indigo-400
                           hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="p-5">
              {loading.lowStock ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i}
                      className="h-10 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : lowStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-3xl mb-2">✅</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    All products are well stocked!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lowStock.slice(0, 5).map((p) => (
                    <div key={p._id} className="flex items-center justify-between
                                                 py-1.5 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          p.currentStock === 0 ? 'bg-red-500' : 'bg-orange-400'
                        }`} />
                        <p className="text-sm text-gray-800 dark:text-gray-200
                                       truncate font-medium">
                          {p.name}
                        </p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${
                        p.currentStock === 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {p.currentStock === 0 ? 'OUT' : `${p.currentStock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick nav shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/products',   icon: '📦', label: 'Products',   color: 'indigo' },
            { to: '/categories', icon: '🗂️',  label: 'Categories', color: 'purple' },
            { to: '/calendar',   icon: '📅', label: 'Calendar',   color: 'green'  },
            { to: '/analytics',  icon: '📊', label: 'Analytics',  color: 'amber'  },
          ].map(({ to, icon, label }) => (
            <Link key={to} to={to}
              className="bg-white dark:bg-gray-900 rounded-2xl border
                         border-gray-100 dark:border-gray-800 p-4
                         flex flex-col items-center gap-2 text-center
                         hover:shadow-md hover:border-indigo-200
                         dark:hover:border-indigo-800 transition group">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {icon}
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}