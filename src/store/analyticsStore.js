import { create } from 'zustand';
import api from '../api/axios';

export const useAnalyticsStore = create((set) => ({
  summary:         null,
  topProducts:     [],
  dailyTrends:     [],
  monthlyTrends:   [],
  categoryRevenue: [],
  lowStock:        [],
  loading:         {},   // keyed by section
  error:           null,

  setLoading: (key, val) =>
    set((s) => ({ loading: { ...s.loading, [key]: val } })),

  fetchSummary: async () => {
    set((s) => ({ loading: { ...s.loading, summary: true } }));
    try {
      const { data } = await api.get('/analytics/summary');
      set((s) => ({ summary: data.data, loading: { ...s.loading, summary: false } }));
    } catch {
      set((s) => ({ loading: { ...s.loading, summary: false } }));
    }
  },

  fetchTopProducts: async (period = 'month') => {
    set((s) => ({ loading: { ...s.loading, top: true } }));
    try {
      const { data } = await api.get('/analytics/top-products', { params: { period } });
      set((s) => ({ topProducts: data.data, loading: { ...s.loading, top: false } }));
    } catch {
      set((s) => ({ loading: { ...s.loading, top: false } }));
    }
  },

  fetchDailyTrends: async (days = 30) => {
    set((s) => ({ loading: { ...s.loading, daily: true } }));
    try {
      const { data } = await api.get('/analytics/trends/daily', { params: { days } });
      set((s) => ({ dailyTrends: data.data, loading: { ...s.loading, daily: false } }));
    } catch {
      set((s) => ({ loading: { ...s.loading, daily: false } }));
    }
  },

  fetchMonthlyTrends: async (months = 12) => {
    set((s) => ({ loading: { ...s.loading, monthly: true } }));
    try {
      const { data } = await api.get('/analytics/trends/monthly', { params: { months } });
      set((s) => ({ monthlyTrends: data.data, loading: { ...s.loading, monthly: false } }));
    } catch {
      set((s) => ({ loading: { ...s.loading, monthly: false } }));
    }
  },

  fetchCategoryRevenue: async (period = 'month') => {
    set((s) => ({ loading: { ...s.loading, category: true } }));
    try {
      const { data } = await api.get('/analytics/category-revenue', { params: { period } });
      set((s) => ({ categoryRevenue: data.data, loading: { ...s.loading, category: false } }));
    } catch {
      set((s) => ({ loading: { ...s.loading, category: false } }));
    }
  },

  fetchLowStock: async () => {
    set((s) => ({ loading: { ...s.loading, lowStock: true } }));
    try {
      const { data } = await api.get('/analytics/low-stock');
      set((s) => ({ lowStock: data.data, loading: { ...s.loading, lowStock: false } }));
    } catch {
      set((s) => ({ loading: { ...s.loading, lowStock: false } }));
    }
  },

  fetchAll: async (period = 'month') => {
    await Promise.all([
      useAnalyticsStore.getState().fetchSummary(),
      useAnalyticsStore.getState().fetchTopProducts(period),
      useAnalyticsStore.getState().fetchDailyTrends(30),
      useAnalyticsStore.getState().fetchMonthlyTrends(12),
      useAnalyticsStore.getState().fetchCategoryRevenue(period),
      useAnalyticsStore.getState().fetchLowStock(),
    ]);
  },
}));