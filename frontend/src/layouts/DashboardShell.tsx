import { useState } from 'react'
import { ChevronDown, HeartPulse, LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageTransition } from '../components/PageTransition'

export type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }
export type NavSection = { label: string; items: NavItem[]; collapsible?: boolean }

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
    isActive 
      ? 'bg-red-50 text-red-700 shadow-sm shadow-red-100' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
  }`

// The rail every signed-in dashboard uses: brand at the top, sections of links with collapsible
// groups, and the account pinned to the foot. Shared so the admin, hospital and staff dashboards
// cannot drift apart.
export function DashboardShell({ title, sections, accountName, accountSubtitle, profileTo }: {
  title: string
  sections: NavSection[]
  accountName: string
  accountSubtitle?: string | null
  profileTo: string
}) {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<string[]>([])
  const toggle = (label: string) => setCollapsed((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label])
  const visible = sections.filter((section) => section.items.length > 0)

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md md:hidden">
        <div className="flex h-16 items-center gap-3 px-4">
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-white shadow-sm"><HeartPulse size={20} /></span>
          <span className="app-title text-xl font-bold text-slate-950">{title}</span>
        </div>
      </header>

      <div className="flex w-full">
        <aside className={`${open ? 'fixed inset-y-0 left-0 z-50 flex w-72 shadow-2xl' : 'hidden'} flex-col border-r border-slate-200 bg-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shadow-none`}>
          <div className="flex items-center gap-3 px-6 py-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-white shadow-sm"><HeartPulse size={20} /></span>
            <span className="app-title text-lg font-bold text-slate-950">{title}</span>
            <button type="button" className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-4" aria-label="Dashboard navigation">
            {visible.map((section) => {
              const isCollapsed = collapsed.includes(section.label)
              return (
                <div key={section.label}>
                  {section.collapsible
                    ? (
                      <button type="button" onClick={() => toggle(section.label)} aria-expanded={!isCollapsed} className="group flex w-full items-center justify-between px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600">
                        {section.label}
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} aria-hidden="true" />
                      </button>
                    )
                    : <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">{section.label}</p>}

                  {!isCollapsed && (
                    <div className={`mt-2 space-y-1 ${section.collapsible ? 'ml-3 border-l-2 border-slate-100 pl-2' : ''}`}>
                      {section.items.map(({ to, label, icon: Icon, end }) => (
                        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={itemClass}>
                          {({ isActive }) => (
                            <>
                              <Icon size={18} className={isActive ? 'text-red-700' : 'text-slate-400 group-hover:text-slate-600 transition-colors'} aria-hidden="true" />
                              {label}
                            </>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50">
              <Link to={profileTo} onClick={() => setOpen(false)} className="flex min-w-0 flex-1 items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{accountName.slice(0, 2).toUpperCase()}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">{accountName}</span>
                  {accountSubtitle && <span className="block truncate text-xs font-medium text-slate-500">{accountSubtitle}</span>}
                </span>
              </Link>
              <button type="button" onClick={logout} aria-label="Log out" className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-700"><LogOut size={18} /></button>
            </div>
          </div>
        </aside>

        {open && <button type="button" aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden" />}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
