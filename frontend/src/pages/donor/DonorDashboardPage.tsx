import { CalendarDays, CheckCircle2, Clock3, Droplets, MapPin, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { appointmentsApi, getErrorMessage } from '../../api'
import { Card } from '../../components/Card'
import { ErrorState } from '../../components/ErrorState'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { canBook } from '../../utils/eligibility'
import { getUsername } from '../../utils/session'
import type { Appointment } from '../../types/api'

const today = () => new Date().toISOString().slice(0, 10)
const daysUntil = (date: Date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000))

export function DonorDashboardPage() { 
  const { userId, token } = useAuth(); 
  const [appointments, setAppointments] = useState<Appointment[]>([]); 
  const [error, setError] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true); 
  
  const load = () => { 
    if (userId === null) { 
      setLoading(false); 
      setError('Your account ID is missing from the login token. Contact support.'); 
      return 
    } 
    setLoading(true); 
    appointmentsApi.getForDonor(userId)
      .then(setAppointments)
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false)) 
  }; 
  
  useEffect(load, [userId]); 
  
  const eligibility = canBook(appointments); 
  const upcoming = appointments.filter((appointment) => appointment.status === 'BOOKED' && appointment.date >= today()).sort((a, b) => a.date.localeCompare(b.date))[0]; 
  const completeCount = appointments.filter((appointment) => appointment.status === 'COMPLETE').length; 
  
  if (loading) return (
    <div className="space-y-8">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  ); 
  
  if (error) return <ErrorState message={error} retry={load} />; 
  
  return (
    <div className="space-y-10">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 to-red-900 p-8 sm:p-12 shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 text-white/10">
          <Droplets size={250} />
        </div>
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-red-200 tracking-wider uppercase text-sm">Donor Dashboard</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-white">Good to see you, {getUsername(token)?.split(' ')[0] || 'Donor'}</h1>
            <p className="mt-3 text-lg text-red-100 max-w-xl">Keep your donation journey moving forward. Every drop makes a difference.</p>
          </div>
          <Link to="/donor/book" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-red-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow hover:-translate-y-0.5">
            Book appointment <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Eligibility Card */}
        <Card className={`relative overflow-hidden ${eligibility.eligible ? 'border-green-100 bg-green-50/50' : 'border-amber-100 bg-amber-50/50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-wide uppercase text-slate-500">Status</span>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${eligibility.eligible ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-600'}`}>
              <CheckCircle2 size={24} aria-hidden="true" />
            </div>
          </div>
          <p className="mt-6 text-2xl font-bold text-slate-900">
            {eligibility.eligible ? 'Eligible now' : `Eligible ${eligibility.nextDate?.toLocaleDateString()}`}
          </p>
          <p className="mt-2 font-medium text-slate-600">
            {eligibility.eligible ? 'You can book your next donation.' : `${daysUntil(eligibility.nextDate!)} days remaining`}
          </p>
        </Card>

        {/* Next Appointment Card */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-wide uppercase text-slate-500">Next Visit</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-700">
              <CalendarDays size={24} aria-hidden="true" />
            </div>
          </div>
          {upcoming ? (
            <>
              <p className="mt-6 text-2xl font-bold text-slate-900">{upcoming.date}</p>
              <p className="mt-2 font-medium text-slate-600 truncate" title={upcoming.campaign.name}>{upcoming.campaign.name}</p>
              <div className="mt-4"><StatusBadge status={upcoming.status} /></div>
            </>
          ) : (
            <>
              <p className="mt-6 text-lg font-medium text-slate-500">No upcoming appointment.</p>
              <Link to="/donor/book" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-red-700 hover:text-red-800 group">
                Find a drive <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </Card>

        {/* Completed Card */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-wide uppercase text-slate-500">Impact</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Clock3 size={24} aria-hidden="true" />
            </div>
          </div>
          <p className="mt-6 text-4xl font-black text-slate-900">{completeCount}</p>
          <p className="mt-2 font-medium text-slate-600">Completed donations</p>
        </Card>
      </div>

      {upcoming && (
        <Card className="border-l-4 border-l-red-600 shadow-md">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center p-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Coming up</p>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{upcoming.campaign.name}</h2>
              <div className="mt-3 flex items-center gap-2 text-slate-600">
                <MapPin size={18} className="text-slate-400" />
                <span className="font-medium">{upcoming.venue.name} · {upcoming.venue.address}</span>
              </div>
            </div>
            <Link to="/donor/appointments" className="shrink-0 rounded-xl bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 border border-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Manage Appointment
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}