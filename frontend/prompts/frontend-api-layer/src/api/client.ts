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
    const status = err.response?.status;
    if (typeof data === 'string' && data.trim()) return data;
    const d = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    // Prefer a specific reason (e.g. "Username is already taken") over the generic HTTP
    // reason phrase Spring always puts in "error" (e.g. "Forbidden"), which isn't useful on its own.
    if (d && typeof d.message === 'string' && d.message && d.message !== d.error) return d.message;
    if (status === 401) return 'Your session has expired. Please log in again.';
    if (status === 403) return 'You do not have permission to do that.';
    if (status === 404) return 'That could not be found.';
    if (!err.response) return 'Cannot reach the server. Check that the backend is running.';
    if (d && typeof d.error === 'string' && d.error) return d.error;
    return `Request failed (${status}).`;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

export function isNotBuilt(err: unknown): boolean {
  return axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 405);
}
