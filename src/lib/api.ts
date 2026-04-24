import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
let refreshInFlight: Promise<string> | null = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** Full URL for a request config (used to avoid refresh-on-refresh and refresh-after-failed-login). */
const combinedRequestUrl = (config: { baseURL?: string; url?: string } | undefined): string => {
  if (!config) return '';
  const base = config.baseURL || '';
  const path = config.url || '';
  if (path.startsWith('http')) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const shouldSkipAuthRefreshRetry = (config: { baseURL?: string; url?: string } | undefined): boolean => {
  const u = combinedRequestUrl(config);
  return /\/auth\/(login|register|refresh)(\?|$)/i.test(u);
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipAuthRefreshRetry(originalRequest)
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshInFlight) {
          refreshInFlight = axios
            .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .then((res) => {
              const newToken = res.data.data.accessToken as string;
              setAccessToken(newToken);
              return newToken;
            })
            .finally(() => {
              refreshInFlight = null;
            });
        }

        const newToken = await refreshInFlight;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        clearAccessToken();
        const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/invite', '/verify-email'].some(
          (p) => typeof window !== 'undefined' && window.location.pathname.startsWith(p)
        );
        if (typeof window !== 'undefined' && !isAuthPage) {
          window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        }
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 429) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      if (originalRequest._retryCount <= 3) {
        const retryAfter = error.response.headers['retry-after'];
        const wait = retryAfter
          ? parseFloat(retryAfter) * 1000
          : Math.min(1000 * 2 ** originalRequest._retryCount, 16000);
        await new Promise((r) => setTimeout(r, wait));
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
