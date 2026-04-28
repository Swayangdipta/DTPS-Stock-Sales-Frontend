import { create } from 'zustand';
import api from '../api/axios';

export const useProductStore = create((set, get) => ({
  products:    [],
  total:       0,
  pages:       1,
  page:        1,
  loading:     false,
  error:       null,

  fetch: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/products', { params });
      set({
        products: data.data,
        total:    data.total,
        pages:    data.pages,
        page:     data.page,
        loading:  false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load', loading: false });
    }
  },

  create: async (payload) => {
    const { data } = await api.post('/products', payload);
    set((s) => ({ products: [data.data, ...s.products], total: s.total + 1 }));
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/products/${id}`, payload);
    set((s) => ({
      products: s.products.map((p) => (p._id === id ? data.data : p)),
    }));
    return data.data;
  },

  remove: async (id) => {
    await api.delete(`/products/${id}`);
    set((s) => ({
      products: s.products.filter((p) => p._id !== id),
      total:    s.total - 1,
    }));
  },
}));