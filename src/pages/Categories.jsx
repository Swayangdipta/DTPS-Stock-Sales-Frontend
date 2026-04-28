import { useEffect, useState } from 'react';
import { useCategoryStore } from '../store/categoryStore';
import Modal from '../components/common/Modal';
import SkeletonCard from '../components/common/SkeletonCard';
import Layout from '../components/layout/Layout';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444',
                '#06b6d4','#8b5cf6','#ec4899','#14b8a6'];

const emptyForm = { name: '', description: '', color: '#6366f1' };

export default function Categories() {
  const { categories, loading, fetch, create, update, remove } = useCategoryStore();
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(emptyForm);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit   = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description, color: cat.color });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      editing ? await update(editing._id, form) : await create(form);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await remove(id); }
    catch (err) { alert(err.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Categories
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {categories.length} total
            </p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600
                       hover:bg-indigo-700 text-white font-medium rounded-xl
                       text-sm transition shadow-md">
            + New Category
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 dark:text-gray-400">
              No categories yet. Create your first one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat._id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border
                           border-gray-100 dark:border-gray-800
                           hover:shadow-md transition group">

                {/* Color bar */}
                <div className="w-10 h-10 rounded-xl mb-3 flex items-center
                                justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: cat.color }}>
                  {cat.name[0].toUpperCase()}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  {cat.productCount ?? 0} product{cat.productCount !== 1 ? 's' : ''}
                </p>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(cat)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg
                               bg-gray-100 dark:bg-gray-800 text-gray-700
                               dark:text-gray-300 hover:bg-indigo-50
                               dark:hover:bg-indigo-900/30 transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat._id)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg
                               bg-gray-100 dark:bg-gray-800 text-red-500
                               hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={closeModal}
             title={editing ? 'Edit Category' : 'New Category'}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600
                          dark:text-red-400 rounded-lg text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-1">Name *</label>
            <input required value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Electronics"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         text-gray-900 dark:text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-1">Description</label>
            <textarea rows={3} value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional description…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         text-gray-900 dark:text-white text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700
                              dark:text-gray-300 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button"
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className="w-8 h-8 rounded-full transition-transform
                             hover:scale-110 border-2"
                  style={{
                    backgroundColor: c,
                    borderColor: form.color === c ? '#fff' : 'transparent',
                    boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
                  }} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl border border-gray-200
                         dark:border-gray-700 text-sm font-medium
                         text-gray-600 dark:text-gray-300 hover:bg-gray-50
                         dark:hover:bg-gray-800 transition">
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
    </Layout>
  );
}