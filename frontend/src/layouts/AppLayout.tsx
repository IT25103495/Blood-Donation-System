import { CalendarDays, HeartHandshake, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUsername } from '../utils/session'
import { DashboardShell, type NavSection } from './DashboardShell'

// The hospital and the doctor each have one working page plus their profile, so they get the same
// rail as the admin rather than a different kind of chrome - only the links differ.
const HOSPITAL_SECTIONS: NavSection[] = [
  { label: 'Main', items: [{ to: '/hospital', label: 'Blood requests', icon: HeartHandshake, end: true }] },
  { label: 'Account', items: [{ to: '/hospital/profile', label: 'My profile', icon: UserRound }] },
]

const DOCTOR_SECTIONS: NavSection[] = [
  { label: 'Main', items: [{ to: '/staff', label: 'Venue appointments', icon: CalendarDays, end: true }] },
  { label: 'Account', items: [{ to: '/staff/profile', label: 'My profile', icon: UserRound }] },
]

export function AppLayout() {
  const { token, role, adminType } = useAuth()
  const isHospital = role === 'HOSPITAL'

  return <DashboardShell
    title={isHospital ? 'Lifeline hospital' : 'Lifeline staff'}
    sections={isHospital ? HOSPITAL_SECTIONS : DOCTOR_SECTIONS}
    accountName={getUsername(token) ?? (isHospital ? 'Hospital' : 'Staff')}
    accountSubtitle={isHospital ? 'HOSPITAL' : adminType}
    profileTo={isHospital ? '/hospital/profile' : '/staff/profile'}
  />
}
