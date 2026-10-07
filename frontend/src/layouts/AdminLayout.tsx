import { BarChart3, Building2, CalendarDays, ClipboardCheck, ClipboardList, Droplets, FileText, HeartHandshake, Store, Users, type LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUsername } from '../utils/session'
import { DashboardShell } from './DashboardShell'

type AdminNavItem = { to: string; label: string; icon: LucideIcon; end?: boolean; manager?: boolean }
type AdminNavSection = { label: string; items: AdminNavItem[]; collapsible?: boolean }

// A manager looks after blood requests and the stock they draw on; campaigns, venues, appointments
// and accounts belong to the sysadmin. The backend enforces the same split - this keeps the sidebar
// from offering a manager pages they would only be turned away from.
const SECTIONS: AdminNavSection[] = [
  { label: 'Main', items: [{ to: '/admin', label: 'Overview', icon: BarChart3, end: true, manager: true }] },
  {
    label: 'Approvals',
    collapsible: true,
    items: [
      { to: '/admin/approvals/campaigns', label: 'Campaign approvals', icon: ClipboardCheck },
      { to: '/admin/approvals/requests', label: 'Request approvals', icon: ClipboardList, manager: true },
    ],
  },
  {
    label: 'Manage',
    collapsible: true,
    items: [
      { to: '/admin/campaigns', label: 'Campaigns', icon: FileText },
      { to: '/admin/requests', label: 'Blood requests', icon: HeartHandshake, manager: true },
      { to: '/admin/venues', label: 'Venues', icon: Store },
      { to: '/admin/banks', label: 'Blood banks', icon: Building2, manager: true },
      { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
      { to: '/admin/inventory', label: 'Inventory', icon: Droplets, manager: true },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
    ],
  },
]

export function AdminLayout() {
  const { token, adminType } = useAuth()
  const sections = SECTIONS.map((section) => ({
    ...section,
    items: adminType === 'MANAGER' ? section.items.filter((item) => item.manager) : section.items,
  }))

  return <DashboardShell
    title="Lifeline admin"
    sections={sections}
    accountName={getUsername(token) ?? 'Administrator'}
    accountSubtitle={adminType}
    profileTo="/admin/profile"
  />
}
