import { CalendarDays, MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { appointmentsApi, getErrorMessage, venuesApi } from '../../api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import type { Appointment, Venue } from '../../types/api'

const today = () => new Date().toISOString().slice(0, 10)

export function StaffPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [venueID, setVenueID] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState<number | null>(null)
  const { showToast } = useToast()
  const load = () => { setLoading(true); Promise.all([venuesApi.getAll(), appointmentsApi.getAll()]).then(([venueItems, appointmentItems]) => { setVenues(venueItems); setAppointments(appointmentItems) }).catch((err: unknown) => setError(getErrorMessage(err))).finally(() => setLoading(false)) }
  useEffect(load, [])
  const selectedVenue = venues.find((venue) => venue.venueID === Number(venueID))
  const grouped = useMemo(() => { const relevant = appointments.filter((appointment) => appointment.status === 'BOOKED' && (!venueID || appointment.venue.venueID === Number(venueID))); return relevant.sort((a, b) => a.date.localeCompare(b.date)).reduce<Record<string, Appointment[]>>((groups, appointment) => { groups[appointment.date] = [...(groups[appointment.date] ?? []), appointment]; return groups }, {}) }, [appointments, venueID])
  const updateStatus = async (appointment: Appointment, status: 'COMPLETE' | 'CANCELLED') => { if (status === 'CANCELLED' && !window.confirm('Cancel this appointment?')) return; setWorking(appointment.appID); try { await appointmentsApi.setStatus(appointment.appID, status);
    if (status === 'COMPLETE') {
      // const venue = await venuesApi.getById(appointment.venue.venueID);
      // await inventoryApi.create({ bloodType: appointment.donor.bloodType, appointmentID: appointment.appID, bankID: venue.assignedBank });
      showToast('Appointment completed and inventory created.') }
    else showToast('Appointment cancelled.'); load() }
  catch (err: unknown) {
    showToast(getErrorMessage(err), 'error') }
  finally {
    setWorking(null) }
  }
  if (loading) return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-16" /><Skeleton className="h-48" /></div>
  if (error) return <ErrorState message={error} retry={load} />
  return <div className="space-y-8"><div><p className="eyebrow">Doctor staff</p><h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Venue appointments</h1><p className="mt-2 text-slate-600">Review today’s booked donors and record the outcome of each visit.</p></div><Card><label htmlFor="staff-venue" className="block max-w-md space-y-2"><span className="text-sm font-medium text-slate-700">Choose a venue</span><select id="staff-venue" value={venueID} onChange={(event) => setVenueID(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100"><option value="">All venues</option>{venues.map((venue) => <option key={venue.venueID} value={venue.venueID}>{venue.name} · {venue.address}</option>)}</select></label></Card>{selectedVenue && <p className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} aria-hidden="true" />{selectedVenue.name}, {selectedVenue.address}</p>}{Object.keys(grouped).length === 0 ? <EmptyState title="No booked appointments" description="Booked appointments for the selected venue will appear here." /> : <div className="space-y-8">{Object.entries(grouped).map(([date, dateAppointments]) => <section key={date}><div className="mb-3 flex items-center gap-2"><CalendarDays className={date === today() ? 'text-red-700' : 'text-slate-500'} size={18} aria-hidden="true" /><h2 className="font-bold text-slate-950">{date === today() ? 'Today' : date}</h2><span className="text-sm text-slate-500">{dateAppointments.length} appointment{dateAppointments.length === 1 ? '' : 's'}</span></div><div className="space-y-3">{dateAppointments.map((appointment) => <Card key={appointment.appID}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold text-slate-950">{appointment.donor.firstName} {appointment.donor.lastName}</h3><StatusBadge status={appointment.status} /></div><p className="mt-2 text-sm text-slate-600">{appointment.donor.bloodType} · {appointment.campaign.name} · {appointment.venue.name}</p></div><div className="flex gap-2"><Button type="button" disabled={working === appointment.appID} onClick={() => updateStatus(appointment, 'COMPLETE')}>Mark completed</Button><Button type="button" disabled={working === appointment.appID} className="bg-slate-600 hover:bg-slate-700" onClick={() => updateStatus(appointment, 'CANCELLED')}>Cancel</Button></div></div></Card>)}</div></section>)}</div>}</div>
}