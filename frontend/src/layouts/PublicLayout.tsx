import { HeartPulse, LogIn, LogOut } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardFor } from '../routes/ProtectedRoute'

const donorLinks = [
  { to: '/donor', label: 'My account' },
  { to: '/donor/book', label: 'Book a donation' },
  { to: '/donor/appointments', label: 'My appointments' },
]
const hosterLinks = [{ to: '/hoster', label: 'My campaigns' }]

export function PublicLayout() {
  const { token, role, adminType, logout } = useAuth()
  const authedLinks = !token || !role
    ? []
    : role === 'DONOR' ? donorLinks
    : role === 'HOSTER' ? hosterLinks
    : [{ to: dashboardFor(role, adminType), label: 'My dashboard' }]

  return <div className="min-h-screen bg-slate-50 text-slate-800">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-white"><HeartPulse size={20} aria-hidden="true" /></span><span className="app-title text-xl font-bold text-slate-950">Lifeline</span></Link>
        <nav className="flex items-center gap-3 text-sm font-medium sm:gap-6" aria-label="Public navigation">
          <NavLink to="/eligibility" className={({ isActive }) => `hidden sm:inline ${isActive ? 'text-red-700' : 'text-slate-600 hover:text-red-700'}`}>Eligibility</NavLink>
          {authedLinks.map((link) => <NavLink end={link.to === '/donor'} key={link.to} to={link.to} className={({ isActive }) => `hidden sm:inline ${isActive ? 'text-red-700' : 'text-slate-600 hover:text-red-700'}`}>{link.label}</NavLink>)}
          {token && role
            ? <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"><LogOut size={16} aria-hidden="true" />Log out</button>
            : <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-2 text-white transition hover:bg-red-800"><LogIn size={16} aria-hidden="true" />Log in</Link>}
        </nav>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span className="font-semibold text-slate-700">Lifeline blood donation</span><span>Every donation helps someone recover.</span></div></footer>
  </div>
}
