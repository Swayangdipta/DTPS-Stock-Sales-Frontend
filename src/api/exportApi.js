import api from './axios';

/**
 * Fetch a binary file from the export endpoint and trigger browser download.
 */
export const downloadExport = async ({ format, type, date, month, year, onProgress }) => {
  const params = { type, date, month, year };

  const response = await api.get(`/export/${format}`, {
    params,
    responseType: 'blob',
    onDownloadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  // Build filename from Content-Disposition header or fallback
  const disposition = response.headers['content-disposition'] || '';
  const match       = disposition.match(/filename="(.+)"/);
  const filename    = match?.[1] || `stocksales-export.${format}`;

  // Trigger download
  const url  = URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href  = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const fetchExportPreview = async (params) => {
  const { data } = await api.get('/export/preview', { params });
  return data.data;
};

// frontend/src/api/exportApi.js — add at bottom
export const buildExportUrl = (format, params) => {
  const token    = localStorage.getItem('token');
  const base     = import.meta.env.VITE_API_URL;
  const query    = new URLSearchParams({ ...params, token }).toString();
  return `${base}/export/${format}?${query}`;
};