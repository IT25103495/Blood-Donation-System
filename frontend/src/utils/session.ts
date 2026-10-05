import { jwtDecode } from 'jwt-decode'

export type Role = 'DONOR' | 'HOSTER' | 'HOSPITAL' | 'ADMIN'
export function normalizeRole(role: string | null | undefined): Role | null {
  const normalized = role?.replace('ROLE_', '').toUpperCase()
  return normalized === 'DONOR' || normalized === 'HOSTER' || normalized === 'HOSPITAL' || normalized === 'ADMIN' ? normalized : null
}
export function getUserId(token: string | null): number | null {
  if (!token) return null
  try { const payload = jwtDecode<{ id?: number; userId?: number; sub?: string }>(token); const candidate = payload.id ?? payload.userId ?? (payload.sub ? Number(payload.sub) : null); return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : null }
  catch { return null }
}
export function isExpired(token: string | null): boolean {
  if (!token) return true
  try { const payload = jwtDecode<{ exp?: number }>(token); return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now() }
  catch { return true }
}
export function getUsername(token: string | null): string | null {
  if (!token) return null
  try { return jwtDecode<{ sub?: string }>(token).sub ?? null } catch { return null }
}