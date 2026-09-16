import axios, { AxiosError } from 'axios';
import { TOKEN_KEY } from '../utils/constants';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !config.url?.startsWith('/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const isLogin = error.config?.url?.startsWith('/auth/login');
    // Spring Security often answers 403 (not 401) for a missing/expired token.
    if (!isLogin && status === 401) {
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  },
);

/** Many list endpoints are typed as "object" in the spec. Accept arrays or common wrappers. */
export function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['content', 'items', 'data', 'results']) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as unknown;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      const msg = d.message ?? d.error;
      if (typeof msg === 'string') return msg;
    }
    if (err.response?.status === 403) return 'You do not have permission to do that.';
    if (!err.response) return 'Cannot reach the server. Check that the backend is running.';
    return `Request failed (${err.response.status}).`;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}
