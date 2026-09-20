import { jwtDecode } from 'jwt-decode';

export type AppRole = 'DONOR' | 'HOSTER' | 'HOSPITAL' | 'ADMIN' | 'UNKNOWN';

interface JwtPayload {
  sub?: string;
  exp?: number;
  id?: number | string;
  userId?: number | string;
  uid?: number | string;
  [claim: string]: unknown;
}

/** Accepts "DONOR", "ROLE_DONOR", "donor", etc. Confirm the real values from /auth/login. */
export function normalizeRole(role: string | null | undefined): AppRole {
  const r = (role ?? '').toUpperCase().replace(/^ROLE_/, '');
  if (r === 'DONOR' || r === 'HOSTER' || r === 'HOSPITAL' || r === 'ADMIN') return r;
  return 'UNKNOWN';
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

/**
 * The login response has no user id, but booking needs donorID, campaigns need
 * hosterID and requests need hospitalID. The backend must put the id in the JWT.
 * TODO: confirm the claim name with the backend team and keep only that one.
 */
export function getUserId(token: string): number | null {
  const p = decodeToken(token);
  const raw = p?.id ?? p?.userId ?? p?.uid;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function isExpired(token: string): boolean {
  const exp = decodeToken(token)?.exp;
  return exp ? exp * 1000 < Date.now() : false;
}
