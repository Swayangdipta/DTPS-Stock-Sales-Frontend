import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

// ── Invoice-style line item ───────────────────────────────────────────────────
function InvoiceLine({ product, quantity, priceAtSale, subtotal }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b
                    border-gray-50 dark:border-gray-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {product?.name || 'Unknown product'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          ₹{priceAtSale?.toLocaleString('en-IN')} × {quantity} {product?.unit || 'pcs'}
        </p>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
        ₹{subtotal?.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

// ── Restock line ──────────────────────────────────────────────────────────────
function RestockLine({ product, quantity }) {
  return (
    <div className="flex items-center justify-between py-2 border-b
                    border-gray-50 dark:border-gray-800 last:border-0">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {product?.name || 'Unknown product'}
      </p>
      <span className="text-sm font-medium text-green-600 dark:text-green-400">
        +{quantity} {product?.unit || 'pcs'}
      </span>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function DrawerSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyDay({ date, onRecord }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800
                      flex items-center justify-center text-3xl mb-4">
        📋
      </div>
      <p className="font-semibold text-gray-900 dark:text-white mb-1">
        No entry for this day
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
        {dayjs(date).format('dddd, DD MMMM YYYY')}
      </p>
      <button onClick={onRecord}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700
                   text-white font-medium rounded-xl text-sm transition">
        Record Entry
      </button>
    </div>
  );
}

// ── Main Drawer ───────────────────────────────────────────────────────────────
export default function DayDetailDrawer({ isOpen, onClose, date, log, loading }) {
  const navigate  = useNavigate();
  const panelRef  = useRef(null);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedDate = date ? dayjs(date).format('dddd, DD MMM YYYY') : '';

  const goToEntry = () => {
    onClose();
    navigate('/stock', { state: { date } });
  };

  // ── Print / export as invoice ─────────────────────────────────────────────
  const handlePrint = () => window.print();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 sm:justify-end"
      onClick={handleBackdrop}>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel — bottom sheet on mobile, right sidebar on desktop */}
      <div
        ref={panelRef}
        className="relative z-10 w-full sm:w-[420px] sm:h-full
                   bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-none
                   shadow-2xl flex flex-col
                   max-h-[92vh] sm:max-h-full overflow-hidden
                   animate-slide-up sm:animate-slide-in-right">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500
                          uppercase tracking-wide">
              Daily Report
            </p>
            <h2 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
              {formattedDate}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {log && (
              <button onClick={handlePrint}
                className="w-8 h-8 flex items-center justify-center rounded-xl
                           bg-gray-100 dark:bg-gray-800 text-gray-500
                           hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm">
                🖨️
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl
                         bg-gray-100 dark:bg-gray-800 text-gray-500
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 overscroll-contain" id="invoice-print">

          {loading ? (
            <DrawerSkeleton />

          ) : !log ? (
            <EmptyDay date={date} onRecord={goToEntry} />

          ) : (
            <div className="p-5 space-y-5">

              {/* ── KPI row ──────────────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: 'Revenue',
                    value: `₹${log.totalRevenue?.toLocaleString('en-IN') || 0}`,
                    color: 'text-indigo-600 dark:text-indigo-400',
                    bg:    'bg-indigo-50 dark:bg-indigo-950/40',
                  },
                  {
                    label: 'Items sold',
                    value: log.totalItemsSold || 0,
                    color: 'text-green-600 dark:text-green-400',
                    bg:    'bg-green-50 dark:bg-green-950/40',
                  },
                  {
                    label: 'Restocked',
                    value: log.totalRestocked || 0,
                    color: 'text-amber-600 dark:text-amber-400',
                    bg:    'bg-amber-50 dark:bg-amber-950/40',
                  },
                ].map(({ label, value, color, bg }) => (
                  <div key={label}
                    className={`${bg} rounded-xl p-3 text-center`}>
                    <p className={`text-base font-bold ${color} leading-tight`}>
                      {value}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Sales invoice ─────────────────────────────────────── */}
              {log.soldItems?.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border
                                border-gray-100 dark:border-gray-800 overflow-hidden">

                  {/* Invoice header */}
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60
                                  border-b border-gray-100 dark:border-gray-800
                                  flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600
                                     dark:text-gray-400 uppercase tracking-wide">
                      🛒 Sales
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {log.soldItems.length} item{log.soldItems.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Line items */}
                  <div className="px-4">
                    {log.soldItems.map((item, i) => (
                      <InvoiceLine key={i} {...item} />
                    ))}
                  </div>

                  {/* Invoice footer */}
                  <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-950/30
                                  flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Total Revenue
                    </span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{log.totalRevenue?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Restocks ──────────────────────────────────────────── */}
              {log.restockedItems?.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border
                                border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60
                                  border-b border-gray-100 dark:border-gray-800
                                  flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600
                                     dark:text-gray-400 uppercase tracking-wide">
                      📦 Restocked
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {log.restockedItems.length} item{log.restockedItems.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="px-4">
                    {log.restockedItems.map((item, i) => (
                      <RestockLine key={i} {...item} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Category breakdown ────────────────────────────────── */}
              <CategoryBreakdown soldItems={log.soldItems} />

              {/* ── Notes ─────────────────────────────────────────────── */}
              {log.notes && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl
                                px-4 py-3 border border-amber-100 dark:border-amber-900/40">
                  <p className="text-xs font-semibold text-amber-700
                                dark:text-amber-400 mb-1 uppercase tracking-wide">
                    📝 Notes
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    {log.notes}
                  </p>
                </div>
              )}

              {/* ── Timestamps ────────────────────────────────────────── */}
              <div className="text-xs text-gray-400 dark:text-gray-600 space-y-0.5 pb-2">
                {log.createdAt && (
                  <p>Created: {dayjs(log.createdAt).format('DD MMM YYYY, h:mm A')}</p>
                )}
                {log.updatedAt && log.updatedAt !== log.createdAt && (
                  <p>Updated: {dayjs(log.updatedAt).format('DD MMM YYYY, h:mm A')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {!loading && (
          <div className="shrink-0 px-5 py-4 border-t border-gray-100
                          dark:border-gray-800">
            <button onClick={goToEntry}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700
                         text-white font-semibold rounded-xl text-sm transition
                         flex items-center justify-center gap-2">
              {log ? '✏️ Edit Entry' : '+ Record Entry'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Category breakdown sub-component ─────────────────────────────────────────
function CategoryBreakdown({ soldItems = [] }) {
  if (!soldItems.length) return null;

  // Group by category
  const groups = {};
  soldItems.forEach(({ product, subtotal, quantity }) => {
    const catName  = product?.category?.name || 'Uncategorised';
    const catColor = product?.category?.color || '#6366f1';
    if (!groups[catName]) groups[catName] = { revenue: 0, qty: 0, color: catColor };
    groups[catName].revenue += subtotal || 0;
    groups[catName].qty     += quantity || 0;
  });

  const total = Object.values(groups).reduce((s, g) => s + g.revenue, 0) || 1;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border
                    border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60
                      border-b border-gray-100 dark:border-gray-800">
        <span className="text-xs font-semibold text-gray-600
                         dark:text-gray-400 uppercase tracking-wide">
          Category breakdown
        </span>
      </div>

      {/* Stacked bar */}
      <div className="px-4 pt-3">
        <div className="h-2.5 rounded-full overflow-hidden flex">
          {Object.entries(groups).map(([name, g]) => (
            <div key={name}
              style={{ width: `${(g.revenue / total) * 100}%`, backgroundColor: g.color }}
              className="h-full transition-all" />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 space-y-2">
        {Object.entries(groups).map(([name, { revenue, qty, color }]) => (
          <div key={name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }} />
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
              {name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
              {qty} sold
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white
                             shrink-0 w-20 text-right">
              ₹{revenue.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}