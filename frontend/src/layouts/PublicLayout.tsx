import { HeartPulse, LogIn, LogOut } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardFor } from '../routes/ProtectedRoute'
import { PageTransition } from '../components/PageTransition'

export function PublicLayout() {
  const { token, role, adminType, logout } = useAuth()
  // One way in for every signed-in role. For donors and campaign hosts the dashboard is where their
  // own tab strip (WorkspaceNav) lives, so this link is all the header needs to carry for them.
  const navLinks = [
    { to: '/eligibility', label: 'Eligibility' },
    ...(token && role ? [{ to: dashboardFor(role, adminType), label: 'Dashboard' }] : []),
  ]
  const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'text-red-700' : 'text-slate-600 hover:text-red-700')

  // Column layout with the content taking the slack, so the footer sits on the bottom edge of the
  // screen on a short page instead of floating halfway up it, and below the content on a long one.
  return <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-white shadow-sm"><HeartPulse size={20} aria-hidden="true" /></span><span className="app-title text-xl font-bold text-slate-950">Lifeline</span></Link>
        {/* Short enough now to stay on one row at phone width, so no second row is needed. */}
        <nav className="flex items-center gap-3 text-sm font-medium sm:gap-6" aria-label="Public navigation">
          {navLinks.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => `whitespace-nowrap transition-colors ${linkClass({ isActive })}`}>{link.label}</NavLink>)}
          {token && role
            ? <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow"><LogOut size={16} aria-hidden="true" /><span className="hidden sm:inline">Log out</span></button>
            : <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-2 text-white shadow-sm transition-all hover:bg-red-800 hover:shadow-md hover:-translate-y-0.5"><LogIn size={16} aria-hidden="true" /><span className="hidden sm:inline">Log in</span></Link>}
        </nav>
      </div>
    </header>
    <main className="flex-1">
      <PageTransition>
        <Outlet />
      </PageTransition>
    </main>
    <footer className="border-t border-slate-200 bg-white pb-8 pt-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-700 text-white"><HeartPulse size={16} aria-hidden="true" /></span><span className="app-title text-lg font-bold text-slate-950">Lifeline</span></Link>
          <p className="mt-4 text-sm leading-6 text-slate-500">Connecting generous donors with those in need. Every donation helps someone recover and thrive.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Resources</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li><Link to="/eligibility" className="hover:text-red-700 transition-colors">Eligibility Requirements</Link></li>
            <li><Link to="/book" className="hover:text-red-700 transition-colors">Find a Campaign</Link></li>
            <li><a href="#" className="hover:text-red-700 transition-colors">Donor FAQs</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Company</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li><a href="#" className="hover:text-red-700 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-red-700 transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-red-700 transition-colors">Partners</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Legal</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li><a href="#" className="hover:text-red-700 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-red-700 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-red-700 transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-slate-100 px-4 pt-8 sm:px-6 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Lifeline Blood Donation. All rights reserved.</p>
      </div>
    </footer>
  </div>
}
