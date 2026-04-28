import { create } from 'zustand';
import api from '../api/axios';

export const useStockLogStore = create((set) => ({
  logs:         [],
  currentLog:   null,
  todaySummary: null,
  loading:      false,
  error:        null,

  fetchLogs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/stock-logs', { params });
      set({ logs: data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load', loading: false });
    }
  },

  fetchByDate: async (date) => {
    set({ loading: true, currentLog: null });
    try {
      const { data } = await api.get(`/stock-logs/${date}`);
      set({ currentLog: data.data, loading: false });
      return data.data;
    } catch (err) {
      set({ loading: false });
      return null;
    }
  },

  fetchToday: async () => {
    try {
      const { data } = await api.get('/stock-logs/summary/today');
      set({ todaySummary: data.data });
    } catch {}
  },

  createLog: async (payload) => {
    const { data } = await api.post('/stock-logs', payload);
    set((s) => ({ logs: [data.data, ...s.logs], currentLog: data.data }));
    return data.data;
  },

  updateLog: async (date, payload) => {
    const { data } = await api.put(`/stock-logs/${date}`, payload);
    set((s) => ({
      logs:       s.logs.map((l) => (l.date === date ? data.data : l)),
      currentLog: data.data,
    }));
    return data.data;
  },
}));