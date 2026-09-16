import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ADMIN_TYPE_KEY, ROLE_KEY, TOKEN_KEY } from '../utils/constants'
import { getUserId, isExpired, normalizeRole, type Role } from '../utils/session'

type AuthContextValue = { token: string | null; role: Role | null; adminType: string | null; userId: number | null; login: (token: string, role: string, adminType?: string | null) => void; logout: () => void }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [role, setRole] = useState(() => normalizeRole(localStorage.getItem(ROLE_KEY)))
  const [adminType, setAdminType] = useState(() => localStorage.getItem(ADMIN_TYPE_KEY))
  const logout = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(ROLE_KEY); localStorage.removeItem(ADMIN_TYPE_KEY); setToken(null); setRole(null); setAdminType(null) }
  const login = (nextToken: string, nextRole: string, nextAdminType?: string | null) => { localStorage.setItem(TOKEN_KEY, nextToken); localStorage.setItem(ROLE_KEY, nextRole); if (nextAdminType) localStorage.setItem(ADMIN_TYPE_KEY, nextAdminType); else localStorage.removeItem(ADMIN_TYPE_KEY); setToken(nextToken); setRole(normalizeRole(nextRole)); setAdminType(nextAdminType ?? null) }
  useEffect(() => { const handleLogout = () => logout(); window.addEventListener('auth:logout', handleLogout); return () => window.removeEventListener('auth:logout', handleLogout) }, [])
  useEffect(() => { if (isExpired(token)) logout() }, [token])
  return <AuthContext.Provider value={{ token, role, adminType, userId: getUserId(token), login, logout }}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context }