import { create } from 'zustand';
import api from '../api/axios';
import dayjs from 'dayjs';

export const useCalendarStore = create((set, get) => ({
  // month logs indexed by date string: { 'YYYY-MM-DD': logData }
  monthData:   {},
  selectedLog: null,
  month:       dayjs().format('YYYY-MM'),   // currently displayed month
  loading:     false,
  detailLoading: false,

  setMonth: (month) => set({ month, monthData: {} }),

  fetchMonth: async (month) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/stock-logs', { params: { month } });
      // Index by date for O(1) lookup
      const indexed = {};
      data.data.forEach((log) => { indexed[log.date] = log; });
      set({ monthData: indexed, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchDayDetail: async (date) => {
    set({ detailLoading: true, selectedLog: null });
    try {
      const { data } = await api.get(`/stock-logs/${date}`);
      set({ selectedLog: data.data, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },

  clearSelection: () => set({ selectedLog: null }),
}));