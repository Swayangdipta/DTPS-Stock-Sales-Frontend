import { useEffect, useState, useCallback } from 'react';
import { useProductStore }  from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import Modal       from '../components/common/Modal';
import SkeletonCard from '../components/common/SkeletonCard';
import Badge       from '../components/common/Badge';
import Layout      from '../components/layout/Layout';
import BulkImportModal from '../components/import/BulkImportModal';

const emptyForm = {
  name: '', category: '', price: '', baseStock: '',
  lowStockThreshold: 10, sku: '', description: '', unit: 'pcs',
};

export default function Products() {
  const { products, total, pages, loading, fetch, create, update, remove } = useProductStore();
  const { categories, fetch: fetchCats } = useCategoryStore();

  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(emptyForm);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  // Filters
  const [search,   setSearch]   = useState('');
  const [catFilter,setCatFilter] = useState('');
  const [lowStock, setLowStock]  = useState(false);
  const [page,     setPage]      = useState(1);
  const [importOpen, setImportOpen] = useState(false);

  const loadProducts = useCallback(() => {
    fetch({
      search:   search   || undefined,
      category: catFilter || undefined,
      lowStock: lowStock  || undefined,
      page,
      limit: 12,
    });
  }, [search, catFilter, lowStock, page]);

  useEffect(() => { fetchCats(); }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); loadProducts(); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category._id, price: p.price,
      baseStock: p.baseStock, lowStockThreshold: p.lowStockThreshold,
      sku: p.sku || '', description: p.description || '', unit: p.unit,
    });
    setError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...form, price: Number(form.price), baseStock: Number(form.baseStock) };
      editing ? await update(editing._id, payload) : await create(payload);
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Archive this product?')) return;
    try { await remove(id); } catch (err) { alert(err.response?.data?.message); }
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm((p) => ({ ...p, [name]: e.target.value })),
  });

  const inputClass = `w-full px-4 py-2.5 rounded-xl border border-gray-200
    dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900
    dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {total} product{total !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100
                      dark:bg-gray-800 text-gray-700 dark:text-gray-300
                      font-medium rounded-xl text-sm transition
                      hover:bg-gray-200 dark:hover:bg-gray-700">
            ⬆️ Import CSV
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600
                       hover:bg-indigo-700 text-white font-medium rounded-xl
                       text-sm transition shadow-md">
            + New Product
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search products or SKU…"
            className={`${inputClass} flex-1`}
          />
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className={`${inputClass} sm:w-48`}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => setLowStock((p) => !p)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition
              ${lowStock
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
            ⚠️ Low stock
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 dark:text-gray-400">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p._id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border
                           border-gray-100 dark:border-gray-800
                           hover:shadow-md transition group flex flex-col">

                {/* Top row */}
                <div className="flex items-start justify-between mb-2">
                  <Badge label={p.category?.name} color={p.category?.color} />
                  {p.isLowStock && (
                    <span className="text-xs font-medium text-orange-500
                                     bg-orange-50 dark:bg-orange-900/20
                                     px-2 py-0.5 rounded-full">
                      Low stock
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {p.name}
                </h3>

                {p.sku && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                    SKU: {p.sku}
                  </p>
                )}

                {/* Stock meter */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500
                                  dark:text-gray-400 mb-1">
                    <span>Stock</span>
                    <span className={p.isLowStock ? 'text-orange-500 font-semibold' : ''}>
                      {p.currentStock} {p.unit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        p.isLowStock ? 'bg-orange-400' : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(100,
                          (p.currentStock / Math.max(p.baseStock, 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-auto">
                  ₹{p.price.toLocaleString('en-IN')}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg
                               bg-gray-100 dark:bg-gray-800 text-gray-700
                               dark:text-gray-300 hover:bg-indigo-50
                               dark:hover:bg-indigo-900/30 transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg
                               bg-gray-100 dark:bg-gray-800 text-red-500
                               hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                  n === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)}
             title={editing ? 'Edit Product' : 'New Product'} size="lg">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600
                          dark:text-red-400 rounded-lg text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">Product Name *</label>
              <input required placeholder="e.g. Basmati Rice 1kg"
                className={inputClass} {...field('name')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">Category *</label>
              <select required className={inputClass} {...field('category')}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">Unit</label>
              <select className={inputClass} {...field('unit')}>
                {['pcs','kg','g','ltr','ml','box','pack'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">Price (₹) *</label>
              <input required type="number" min="0" step="0.01"
                placeholder="0.00" className={inputClass} {...field('price')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">Base Stock *</label>
              <input required type="number" min="0"
                placeholder="Initial quantity" className={inputClass} {...field('baseStock')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">Low Stock Alert</label>
              <input type="number" min="0" placeholder="10"
                className={inputClass} {...field('lowStockThreshold')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">SKU</label>
              <input placeholder="Optional SKU code"
                className={inputClass} {...field('sku')} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">Description</label>
              <textarea rows={2} placeholder="Optional description…"
                className={`${inputClass} resize-none`} {...field('description')} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200
                         dark:border-gray-700 text-sm font-medium
                         text-gray-600 dark:text-gray-300 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700
                         disabled:bg-indigo-400 text-white text-sm font-medium
                         transition flex items-center justify-center gap-2">
              {saving ? (
                <span className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin"/>
              ) : (editing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
      <BulkImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => { setImportOpen(false); loadProducts(); }}
      />
    </Layout>
  );
}