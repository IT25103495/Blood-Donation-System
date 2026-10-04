import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Donors and campaign hosts have no sidebar, so their own pages sit in a tab strip at the top of
// their workspace. The site header above it keeps only what applies everywhere.
const LINKS: Record<string, { to: string; label: string; end?: boolean }[]> = {
  DONOR: [
    { to: '/donor', label: 'Dashboard', end: true },
    { to: '/donor/book', label: 'Book a donation' },
    { to: '/donor/appointments', label: 'My appointments' },
    { to: '/donor/profile', label: 'My profile' },
  ],
  HOSTER: [
    { to: '/hoster', label: 'My campaigns', end: true },
    { to: '/hoster/profile', label: 'My profile' },
  ],
}

export function WorkspaceNav() {
  const { role } = useAuth()
  const links = LINKS[role ?? ''] ?? []
  if (links.length === 0) return null
  return <nav aria-label="Workspace" className="mb-8 flex gap-1 overflow-x-auto border-b border-slate-200">
    {links.map((link) => <NavLink
      key={link.to}
      to={link.to}
      end={link.end}
      className={({ isActive }) => `whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${isActive ? 'border-red-700 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
    >{link.label}</NavLink>)}
  </nav>
}
