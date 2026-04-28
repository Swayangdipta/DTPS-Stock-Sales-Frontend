import { create } from 'zustand';
import api from '../api/axios';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading:    false,
  error:      null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/categories');
      set({ categories: data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load', loading: false });
    }
  },

  create: async (payload) => {
    const { data } = await api.post('/categories', payload);
    set((s) => ({ categories: [...s.categories, data.data] }));
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/categories/${id}`, payload);
    set((s) => ({
      categories: s.categories.map((c) => (c._id === id ? data.data : c)),
    }));
    return data.data;
  },

  remove: async (id) => {
    await api.delete(`/categories/${id}`);
    set((s) => ({ categories: s.categories.filter((c) => c._id !== id) }));
  },
}));