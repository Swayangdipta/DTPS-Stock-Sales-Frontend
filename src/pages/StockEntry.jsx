import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useProductStore  } from '../store/productStore';
import { useStockLogStore } from '../store/stockLogStore';
import Layout from '../components/layout/Layout';
import { useLocation } from 'react-router-dom';

// ── Small reusable item row ───────────────────────────────────────────────────
function ItemRow({ item, products, onUpdate, onRemove, type }) {
  const product = products.find((p) => p._id === item.productId);

  return (
    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50
                    rounded-xl px-3 py-2.5 border border-gray-100
                    dark:border-gray-700">

      {/* Product selector */}
      <select
        value={item.productId}
        onChange={(e) => onUpdate(item.id, 'productId', e.target.value)}
        className="flex-1 min-w-0 bg-transparent text-sm text-gray-900
                   dark:text-white focus:outline-none">
        <option value="">Select product…</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} {type === 'sold' ? `(${p.currentStock} left)` : ''}
          </option>
        ))}
      </select>

      {/* Quantity */}
      <div className="flex items-center gap-1 shrink-0">
        <button type="button"
          onClick={() => onUpdate(item.id, 'quantity', Math.max(1, item.quantity - 1))}
          className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700
                     text-gray-700 dark:text-gray-300 font-bold text-sm
                     hover:bg-gray-300 dark:hover:bg-gray-600 transition
                     flex items-center justify-center">
          −
        </button>
        <input
          type="number" min="1"
          value={item.quantity}
          onChange={(e) => onUpdate(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
          className="w-14 text-center text-sm font-semibold bg-transparent
                     text-gray-900 dark:text-white border border-gray-200
                     dark:border-gray-700 rounded-lg py-1 focus:outline-none
                     focus:ring-2 focus:ring-indigo-500"/>
        <button type="button"
          onClick={() => onUpdate(item.id, 'quantity', item.quantity + 1)}
          className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700
                     text-gray-700 dark:text-gray-300 font-bold text-sm
                     hover:bg-gray-300 dark:hover:bg-gray-600 transition
                     flex items-center justify-center">
          +
        </button>
      </div>

      {/* Subtotal (sold only) */}
      {type === 'sold' && product && (
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400
                         shrink-0 w-20 text-right">
          ₹{(product.price * item.quantity).toLocaleString('en-IN')}
        </span>
      )}

      {/* Remove */}
      <button type="button" onClick={() => onRemove(item.id)}
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                   transition shrink-0 text-lg leading-none">
        ×
      </button>
    </div>
  );
}

// ── Unique ID helper ──────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const makeItem  = (productId = '', quantity = 1) => ({ id: uid(), productId, quantity });

// ── Main Component ────────────────────────────────────────────────────────────
export default function StockEntry() {
  const { products, fetch: fetchProducts } = useProductStore();
  const { fetchByDate, createLog, updateLog, currentLog, loading } = useStockLogStore();

//   const [date,      setDate]      = useState(dayjs().format('YYYY-MM-DD'));
  const [soldItems, setSoldItems] = useState([makeItem()]);
  const [restocked, setRestocked] = useState([]);
  const [notes,     setNotes]     = useState('');
  const [tab,       setTab]       = useState('sold');  // 'sold' | 'restock'
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [isEdit,    setIsEdit]    = useState(false);
  // Add at top of StockEntry component:
  const location = useLocation();
  const [date, setDate] = useState(
    location.state?.date || dayjs().format('YYYY-MM-DD')
  );
  useEffect(() => { fetchProducts({ limit: 200 }); }, []);

  // Load existing log when date changes
  useEffect(() => {
    const load = async () => {
      setError(''); setSuccess('');
      const existing = await fetchByDate(date);
      if (existing) {
        setIsEdit(true);
        setSoldItems(
          existing.soldItems.map((i) => makeItem(i.product._id, i.quantity))
        );
        setRestocked(
          existing.restockedItems.map((i) => makeItem(i.product._id, i.quantity))
        );
        setNotes(existing.notes || '');
      } else {
        setIsEdit(false);
        setSoldItems([makeItem()]);
        setRestocked([]);
        setNotes('');
      }
    };
    load();
  }, [date]);

  // ── Item CRUD helpers ─────────────────────────────────────────────────────

  const addItem = (setter) => setter((p) => [...p, makeItem()]);

  const updateItem = (setter) => (id, field, value) =>
    setter((prev) =>
      prev.map((item) => item.id === id ? { ...item, [field]: value } : item)
    );

  const removeItem = (setter) => (id) =>
    setter((prev) => prev.filter((item) => item.id !== id));

  // ── Live totals ───────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    const productMap = new Map(products.map((p) => [p._id, p]));
    let revenue = 0, qty = 0, restock = 0;
    soldItems.forEach((i) => {
      const p = productMap.get(i.productId);
      if (p) { revenue += p.price * i.quantity; qty += i.quantity; }
    });
    restocked.forEach((i) => { restock += i.quantity; });
    return { revenue, qty, restock };
  }, [soldItems, restocked, products]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const validSold = soldItems.filter((i) => i.productId && i.quantity > 0);
    const validRest = restocked.filter((i) => i.productId && i.quantity > 0);

    if (!validSold.length && !validRest.length) {
      return setError('Add at least one item to save.');
    }

    const payload = {
      date,
      soldItems:      validSold.map(({ productId, quantity }) => ({ product: productId, quantity })),
      restockedItems: validRest.map(({ productId, quantity }) => ({ product: productId, quantity })),
      notes,
    };

    setSaving(true);
    try {
      isEdit ? await updateLog(date, payload) : await createLog(payload);
      setSuccess(`Entry ${isEdit ? 'updated' : 'saved'} for ${dayjs(date).format('DD MMM YYYY')} ✓`);
      setIsEdit(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const activeItems  = tab === 'sold' ? soldItems : restocked;
  const activeSetter = tab === 'sold' ? setSoldItems : setRestocked;

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stock Entry
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Record daily sales and restocks
          </p>
        </div>

        {/* Date Picker */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-4 mb-4">
          <label className="block text-xs font-semibold text-gray-500
                            dark:text-gray-400 uppercase tracking-wide mb-2">
            Entry Date
          </label>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         text-gray-900 dark:text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            <button type="button"
              onClick={() => setDate(dayjs().format('YYYY-MM-DD'))}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30
                         text-indigo-600 dark:text-indigo-400 text-sm font-medium
                         hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
              Today
            </button>
          </div>

          {isEdit && (
            <div className="mt-2 flex items-center gap-2 text-amber-600
                            dark:text-amber-400 text-xs font-medium">
              <span>✏️</span>
              <span>Editing existing entry — saving will recalculate all stock</span>
            </div>
          )}
        </div>

        {/* Live Summary Bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Revenue',   value: `₹${totals.revenue.toLocaleString('en-IN')}`, color: 'indigo' },
            { label: 'Qty Sold',  value: totals.qty,     color: 'green'  },
            { label: 'Restocked', value: totals.restock, color: 'amber'  },
          ].map(({ label, value, color }) => (
            <div key={label}
              className="bg-white dark:bg-gray-900 rounded-xl p-3 border
                         border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-lg font-bold text-${color}-600 dark:text-${color}-400`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
          {[
            { key: 'sold',    label: '🛒 Sales',    count: soldItems.length  },
            { key: 'restock', label: '📦 Restocks', count: restocked.length  },
          ].map(({ key, label, count }) => (
            <button key={key} type="button"
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition
                flex items-center justify-center gap-2
                ${tab === key
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
              {label}
              <span className={`inline-flex items-center justify-center w-5 h-5
                                text-xs rounded-full
                                ${tab === key
                                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Item List */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border
                          border-gray-100 dark:border-gray-800 p-4 mb-4">

            {activeItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                <div className="text-3xl mb-2">{tab === 'sold' ? '🛒' : '📦'}</div>
                <p className="text-sm">
                  No {tab === 'sold' ? 'sales' : 'restocks'} added yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    products={products}
                    type={tab}
                    onUpdate={updateItem(activeSetter)}
                    onRemove={removeItem(activeSetter)}
                  />
                ))}
              </div>
            )}

            <button type="button"
              onClick={() => addItem(activeSetter)}
              className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed
                         border-gray-200 dark:border-gray-700 text-sm font-medium
                         text-gray-500 dark:text-gray-400 hover:border-indigo-400
                         hover:text-indigo-500 dark:hover:text-indigo-400
                         transition flex items-center justify-center gap-2">
              + Add {tab === 'sold' ? 'Sale' : 'Restock'}
            </button>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border
                          border-gray-100 dark:border-gray-800 p-4 mb-4">
            <label className="block text-xs font-semibold text-gray-500
                              dark:text-gray-400 uppercase tracking-wide mb-2">
              Notes (optional)
            </label>
            <textarea rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any remarks for this entry…"
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5
                         text-sm text-gray-900 dark:text-white border border-gray-200
                         dark:border-gray-700 resize-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border
                            border-red-200 dark:border-red-800 rounded-xl
                            text-red-700 dark:text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border
                            border-green-200 dark:border-green-800 rounded-xl
                            text-green-700 dark:text-green-400 text-sm font-medium">
              {success}
            </div>
          )}

          {/* Save Button */}
          <button type="submit" disabled={saving || loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700
                       disabled:bg-indigo-400 text-white font-semibold
                       rounded-2xl transition text-base
                       flex items-center justify-center gap-3 shadow-lg">
            {saving ? (
              <>
                <span className="w-5 h-5 border-2 border-white
                                 border-t-transparent rounded-full animate-spin"/>
                Saving…
              </>
            ) : (
              <>
                {isEdit ? '✏️ Update Entry' : '✅ Save Entry'}
              </>
            )}
          </button>
        </form>

        {/* Daily Invoice Preview */}
        {currentLog && (
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border
                          border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800
                            flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                📋 Entry Summary — {dayjs(currentLog.date).format('DD MMM YYYY')}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {currentLog.soldItems?.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {item.product?.name}
                  </span>
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                    <span>× {item.quantity}</span>
                    <span className="font-semibold text-gray-900 dark:text-white w-24 text-right">
                      ₹{item.subtotal?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3
                              flex justify-between font-bold">
                <span className="text-gray-900 dark:text-white">Total Revenue</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-lg">
                  ₹{currentLog.totalRevenue?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}