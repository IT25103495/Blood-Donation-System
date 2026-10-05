import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../utils/session'

export function ProtectedRoute({ allowedRoles, allowedAdminTypes }: { allowedRoles?: Role[]; allowedAdminTypes?: string[] }) { const { token, role, adminType } = useAuth(); const location = useLocation(); if (!token || !role) return <Navigate to="/login" replace state={{ from: location.pathname }} />; if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/403" replace />; if (allowedAdminTypes && (!adminType || !allowedAdminTypes.includes(adminType))) return <Navigate to="/403" replace />; return <Outlet /> }

export function PublicOnlyRoute() { const { token, role, adminType } = useAuth(); if (!token || !role) return <Outlet />; return <Navigate to={dashboardFor(role, adminType)} replace /> }

export function dashboardFor(role: Role, adminType: string | null) { if (role === 'DONOR') return '/donor'; if (role === 'HOSTER') return '/hoster'; if (role === 'HOSPITAL') return '/hospital'; return adminType === 'DOCTOR' ? '/staff' : '/admin' }

// The same profile page is mounted under each role's own section so it keeps that role's chrome:
// the sidebar for anyone on a dashboard, the site header for donors and campaign hosts.
export function profileFor(role: Role, adminType: string | null) { return `${dashboardFor(role, adminType)}/profile` }