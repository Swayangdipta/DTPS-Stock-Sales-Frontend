import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import StatCard          from '../components/common/StatCard';
import RevenueAreaChart  from '../components/charts/RevenueAreaChart';
import TopProductsChart  from '../components/charts/TopProductsChart';
import CategoryPieChart  from '../components/charts/CategoryPieChart';
import Layout            from '../components/layout/Layout';

const PERIODS = [
  { key: 'week',  label: 'Week'  },
  { key: 'month', label: 'Month' },
  { key: 'year',  label: 'Year'  },
];

const TREND_DAYS = [
  { key: 7,  label: '7d'  },
  { key: 14, label: '14d' },
  { key: 30, label: '30d' },
  { key: 90, label: '90d' },
];

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, action, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border
                    border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4
                      border-b border-gray-50 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {title}
        </h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Period pill selector ──────────────────────────────────────────────────────
function PillSelector({ options, value, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {options.map((o) => (
        <button key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition
            ${value === o.key
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Low stock alert row ───────────────────────────────────────────────────────
function LowStockRow({ product }) {
  const pct = Math.min(100,
    (product.currentStock / Math.max(product.baseStock, 1)) * 100
  );
  const isCritical = product.currentStock === 0;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b
                    border-gray-50 dark:border-gray-800 last:border-0">
      <div className={`w-2 h-2 rounded-full shrink-0 ${
        isCritical ? 'bg-red-500' : 'bg-orange-400'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-orange-400'}`}
              style={{ width: `${Math.max(2, pct)}%` }}
            />
          </div>
          <span className={`text-xs font-semibold shrink-0 ${
            isCritical
              ? 'text-red-600 dark:text-red-400'
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {product.currentStock} left
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {product.category?.name}
        </p>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
          min {product.lowStockThreshold}
        </p>
      </div>
    </div>
  );
}

// ── Main Analytics Page ───────────────────────────────────────────────────────
export default function Analytics() {
  const {
    summary, topProducts, dailyTrends, monthlyTrends,
    categoryRevenue, lowStock, loading,
    fetchSummary, fetchTopProducts, fetchDailyTrends,
    fetchMonthlyTrends, fetchCategoryRevenue, fetchLowStock,
  } = useAnalyticsStore();

  const [period,    setPeriod]    = useState('month');
  const [trendDays, setTrendDays] = useState(30);
  const [trendView, setTrendView] = useState('daily');  // 'daily' | 'monthly'

  // Initial load
  useEffect(() => {
    fetchSummary();
    fetchDailyTrends(30);
    fetchMonthlyTrends(12);
    fetchLowStock();
    fetchTopProducts('month');
    fetchCategoryRevenue('month');
  }, []);

  // Reload when period filter changes
  useEffect(() => {
    fetchTopProducts(period);
    fetchCategoryRevenue(period);
  }, [period]);

  // Reload when trend window changes
  useEffect(() => {
    if (trendView === 'daily') fetchDailyTrends(trendDays);
  }, [trendDays, trendView]);

  const s = summary;
  const fmt = (n) => n >= 100_000
    ? `₹${(n / 100_000).toFixed(1)}L`
    : n >= 1_000
      ? `₹${(n / 1_000).toFixed(1)}k`
      : `₹${n}`;

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Business performance overview
            </p>
          </div>
          <button
            onClick={() => {
              fetchSummary(); fetchTopProducts(period);
              fetchDailyTrends(trendDays); fetchLowStock();
            }}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800
                       text-sm font-medium text-gray-600 dark:text-gray-300
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            ↻ Refresh
          </button>
        </div>

        {/* ── KPI grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Today's revenue"
            value={fmt(s?.today?.revenue || 0)}
            sub={`${s?.today?.itemsSold || 0} items sold`}
            icon="💰" color="indigo"
            loading={loading.summary}
          />
          <StatCard
            label="This month"
            value={fmt(s?.month?.revenue || 0)}
            sub={`${s?.month?.activeDays || 0} active days`}
            icon="📅" color="green"
            loading={loading.summary}
          />
          <StatCard
            label="This year"
            value={fmt(s?.year?.revenue || 0)}
            sub={`${s?.year?.itemsSold?.toLocaleString() || 0} items`}
            icon="📈" color="amber"
            loading={loading.summary}
          />
          <StatCard
            label="Low stock alerts"
            value={s?.overview?.lowStockCount || 0}
            sub={`of ${s?.overview?.totalProducts || 0} products`}
            icon="⚠️" color="red"
            loading={loading.summary}
          />
        </div>

        {/* ── Revenue trend chart ────────────────────────────────────── */}
        <Section
          title="Revenue trend"
          action={
            <div className="flex items-center gap-2">
              <PillSelector
                options={[
                  { key: 'daily',   label: 'Daily'   },
                  { key: 'monthly', label: 'Monthly' },
                ]}
                value={trendView}
                onChange={setTrendView}
              />
              {trendView === 'daily' && (
                <PillSelector
                  options={TREND_DAYS}
                  value={trendDays}
                  onChange={setTrendDays}
                />
              )}
            </div>
          }>
          {(loading.daily || loading.monthly) ? (
            <div className="h-52 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : (
            <RevenueAreaChart
              data={trendView === 'daily' ? dailyTrends : monthlyTrends}
              showItems
            />
          )}
        </Section>

        {/* ── Top products + Category revenue ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <Section
            title="Top products"
            action={
              <PillSelector options={PERIODS} value={period} onChange={setPeriod} />
            }>
            {loading.top ? (
              <div className="h-52 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
            ) : topProducts.length === 0 ? (
              <EmptyChart message="No sales data for this period" />
            ) : (
              <TopProductsChart data={topProducts} />
            )}
          </Section>

          <Section
            title="Revenue by category"
            action={
              <PillSelector options={PERIODS} value={period} onChange={setPeriod} />
            }>
            {loading.category ? (
              <div className="h-52 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
            ) : (
              <CategoryPieChart data={categoryRevenue} />
            )}
          </Section>

        </div>

        {/* ── Top products table ─────────────────────────────────────── */}
        <Section title="Product leaderboard">
          {loading.top ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-12 bg-gray-50 dark:bg-gray-800
                                        rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <EmptyChart message="No sales yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-400
                                  dark:text-gray-500 uppercase tracking-wide">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4 text-right">Qty sold</th>
                    <th className="pb-3 pr-4 text-right">Revenue</th>
                    <th className="pb-3 text-right">Stock left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {topProducts.map((p, i) => (
                    <tr key={p._id} className="hover:bg-gray-50
                                                dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center justify-center
                          w-6 h-6 rounded-full text-xs font-bold
                          ${i === 0 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                          : i === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                          : i === 2 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-500'
                          : 'text-gray-400 dark:text-gray-500'}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900 dark:text-white truncate
                                       max-w-[140px]">
                          {p.name}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full
                                          text-xs font-medium"
                          style={{
                            backgroundColor: (p.categoryColor || '#6366f1') + '22',
                            color: p.categoryColor || '#6366f1',
                          }}>
                          {p.categoryName || '—'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right font-medium
                                      text-gray-700 dark:text-gray-300">
                        {p.totalQty}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold
                                      text-indigo-600 dark:text-indigo-400">
                        ₹{p.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`text-xs font-semibold ${
                          p.currentStock === 0
                            ? 'text-red-500'
                            : p.currentStock <= 10
                              ? 'text-orange-500'
                              : 'text-green-600 dark:text-green-400'
                        }`}>
                          {p.currentStock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* ── Low stock alerts ───────────────────────────────────────── */}
        {(lowStock.length > 0 || loading.lowStock) && (
          <Section
            title={`⚠️ Low stock alerts ${lowStock.length ? `(${lowStock.length})` : ''}`}>
            {loading.lowStock ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-gray-50 dark:bg-gray-800
                                          rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div>
                {lowStock.map((p) => <LowStockRow key={p._id} product={p} />)}
              </div>
            )}
          </Section>
        )}

      </div>
    </Layout>
  );
}

// ── Empty chart placeholder ───────────────────────────────────────────────────
function EmptyChart({ message }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center
                    text-gray-400 dark:text-gray-600 gap-2">
      <span className="text-3xl">📊</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}