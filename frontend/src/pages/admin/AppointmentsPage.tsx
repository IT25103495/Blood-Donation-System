import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, CalendarClock, CalendarDays, CalendarX2, CheckCircle2, MapPin, Trash2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { appointmentsApi, getErrorMessage, venuesApi, authApi, campaignsApi } from '../../api'
import { ActionMenu } from '../../components/ActionMenu'
import { Card } from '../../components/Card'
import { ErrorState } from '../../components/ErrorState'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { WizardNav, Stepper } from '../../components/Stepper'
import { useToast } from '../../context/ToastContext'
import type { Appointment, AppointmentStatus, Venue, Donor, Campaign } from '../../types/api'

const today = () => new Date().toISOString().slice(0, 10)
const STATUSES: AppointmentStatus[] = ['BOOKED', 'CANCELLED', 'COMPLETE']
// The dot beside a row, so a column of appointments reads at a glance.
const DOT: Record<AppointmentStatus, string> = { BOOKED: 'bg-amber-500', COMPLETE: 'bg-green-600', CANCELLED: 'bg-red-600' }

function StatCard({ icon: Icon, value, label, share, tone }: { icon: typeof CalendarDays; value: number; label: string; share: number; tone: string }) {
  return <div className="flex-1 border-slate-200 p-5 sm:border-r sm:last:border-r-0">
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon size={18} aria-hidden="true" /></span>
    <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
    <p className="mt-1 text-sm text-slate-500">{label}</p>
    {/* Share of all appointments rather than a change over time - nothing here records history. */}
    <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className={`h-1.5 rounded-full ${tone}`} style={{ width: `${share}%` }} /></div>
  </div>
}

export function AppointmentsAdminPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<Appointment[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [venueFilter, setVenueFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([appointmentsApi.getAll(), venuesApi.getAll()])
      .then(([appointmentRows, venueRows]) => { setRows(appointmentRows); setVenues(venueRows) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const changeStatus = async (row: Appointment, status: AppointmentStatus) => {
    if (status === row.status) return
    try { const result = await appointmentsApi.setStatus(row.appID, status); showToast(result || 'Appointment status updated.'); load() }
    catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }

  const remove = async (row: Appointment) => {
    if (!window.confirm(`Delete ${row.donor.firstName} ${row.donor.lastName}'s appointment? This cannot be undone.`)) return
    try { await appointmentsApi.remove(row.appID); showToast('Appointment deleted.'); load() }
    catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((row) => {
      const text = `${row.donor.firstName} ${row.donor.lastName} ${row.campaign.name} ${row.venue.name}`.toLowerCase()
      return text.includes(term)
        && (!venueFilter || row.venue.venueID === Number(venueFilter))
        && (statusFilter === 'ALL' || row.status === statusFilter)
    })
  }, [rows, search, venueFilter, statusFilter])

  // Appointments carry a date but no time of day, so the schedule is grouped by when they fall
  // rather than into morning and afternoon.
  const groups = useMemo(() => {
    const day = today()
    return [
      { label: 'Today', items: filtered.filter((row) => row.date === day) },
      { label: 'Upcoming', items: filtered.filter((row) => row.date > day).sort((a, b) => a.date.localeCompare(b.date)) },
      { label: 'Earlier', items: filtered.filter((row) => row.date < day).sort((a, b) => b.date.localeCompare(a.date)) },
    ].filter((group) => group.items.length > 0)
  }, [filtered])

  const stats = useMemo(() => {
    const day = today()
    const total = Math.max(1, rows.length)
    const share = (n: number) => Math.round((n / total) * 100)
    const todays = rows.filter((row) => row.date === day).length
    const booked = rows.filter((row) => row.status === 'BOOKED').length
    const complete = rows.filter((row) => row.status === 'COMPLETE').length
    const cancelled = rows.filter((row) => row.status === 'CANCELLED').length
    return { todays, booked, complete, cancelled, share }
  }, [rows])

  // Venues with an appointment today, and what is still to come after today.
  const venuesToday = useMemo(() => {
    const day = today()
    const active = new Set(rows.filter((row) => row.date === day && row.status !== 'CANCELLED').map((row) => row.venue.venueID))
    return venues.map((venue) => ({ venue, inUse: active.has(venue.venueID) })).sort((a, b) => Number(b.inUse) - Number(a.inUse))
  }, [rows, venues])
  const upcoming = useMemo(() => rows.filter((row) => row.status === 'BOOKED' && row.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5), [rows])

  if (loading) return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-32" /><Skeleton className="h-96" /></div>
  if (error) return <ErrorState message={error} retry={load} />

  const inUseCount = venuesToday.filter((item) => item.inUse).length
  return <div className="space-y-6">
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <Link to="/admin" className="hover:text-slate-900">Administration</Link>
      <span className="px-2" aria-hidden="true">/</span>
      <span className="text-slate-900">Appointments</span>
    </nav>

    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="app-title text-4xl font-bold text-slate-950">Appointments</h1>
        <p className="mt-2 text-slate-600">{stats.todays} appointment{stats.todays === 1 ? '' : 's'} today · {inUseCount} venue{inUseCount === 1 ? '' : 's'} in use</p>
      </div>
      <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center justify-center rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-800">
        Add Appointment
      </button>
    </div>

    <Card className="!p-0">
      <div className="flex flex-col divide-y divide-slate-200 sm:flex-row sm:divide-y-0">
        <StatCard icon={CalendarDays} value={stats.todays} label="Today's appointments" share={stats.share(stats.todays)} tone="bg-slate-500" />
        <StatCard icon={CalendarCheck2} value={stats.booked} label="Booked" share={stats.share(stats.booked)} tone="bg-amber-500" />
        <StatCard icon={CheckCircle2} value={stats.complete} label="Completed" share={stats.share(stats.complete)} tone="bg-green-600" />
        <StatCard icon={CalendarX2} value={stats.cancelled} label="Cancelled" share={stats.share(stats.cancelled)} tone="bg-red-600" />
      </div>
    </Card>

    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input aria-label="Search by donor, campaign or venue" placeholder="Search by donor, campaign or venue" value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100" />
            <select aria-label="Filter by venue" value={venueFilter} onChange={(event) => setVenueFilter(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">All venues</option>
              {venues.map((venue) => <option key={venue.venueID} value={venue.venueID}>{venue.name}</option>)}
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="ALL">All statuses</option>
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">Schedule</h2>
          {groups.length === 0
            ? <p className="mt-5 py-10 text-center text-sm text-slate-500">No appointments match these filters.</p>
            : <div className="mt-5 space-y-6">{groups.map((group) => <div key={group.label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
                <ul className="mt-3 space-y-2">{group.items.map((row) => <li key={row.appID} className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[row.status]}`} />
                  <span className="w-24 shrink-0 text-sm font-semibold text-slate-700">{row.date}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-950">{row.donor.firstName} {row.donor.lastName}</span>
                    <span className="block truncate text-sm text-slate-500">{row.campaign.name} · {row.venue.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={row.status} />
                    <ActionMenu label={`Actions for ${row.donor.firstName} ${row.donor.lastName}`} actions={[
                      { label: 'Reschedule', icon: CalendarClock, onClick: () => setEditing(row) },
                      { label: 'Mark as booked', icon: CalendarCheck2, disabled: row.status === 'BOOKED', onClick: () => changeStatus(row, 'BOOKED') },
                      { label: 'Mark as complete', icon: CheckCircle2, disabled: row.status === 'COMPLETE', onClick: () => changeStatus(row, 'COMPLETE') },
                      { label: 'Cancel appointment', icon: XCircle, disabled: row.status === 'CANCELLED', onClick: () => changeStatus(row, 'CANCELLED') },
                      { label: 'Delete', icon: Trash2, tone: 'danger', separated: true, onClick: () => remove(row) },
                    ]} />
                  </span>
                </li>)}</ul>
              </div>)}</div>}
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Venues today</h2>
          <ul className="mt-4 space-y-2">{venuesToday.length === 0
            ? <li className="text-sm text-slate-500">No venues yet.</li>
            : venuesToday.map(({ venue, inUse }) => <li key={venue.venueID} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2.5">
                <span className="flex min-w-0 items-center gap-2">
                  <MapPin size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="truncate text-sm text-slate-800">{venue.name}</span>
                </span>
                <span className={`flex shrink-0 items-center gap-1.5 text-xs font-semibold ${inUse ? 'text-green-700' : 'text-slate-500'}`}>
                  <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${inUse ? 'bg-green-600' : 'bg-slate-400'}`} />{inUse ? 'In use' : 'Free'}
                </span>
              </li>)}</ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Coming up</h2>
          <ul className="mt-4 space-y-3">{upcoming.length === 0
            ? <li className="text-sm text-slate-500">Nothing booked ahead.</li>
            : upcoming.map((row) => <li key={row.appID} className="text-sm">
                <p className="font-semibold text-slate-900">{row.date} · {row.donor.firstName} {row.donor.lastName}</p>
                <p className="mt-0.5 text-slate-500">{row.campaign.name} · {row.venue.name}</p>
              </li>)}</ul>
        </Card>
      </div>
    </div>

    <EditAppointmentDialog appointment={editing} venues={venues} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} showToast={showToast} />
    {creating && <CreateAppointmentDialog onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load() }} showToast={showToast} />}
  </div>
}

function EditAppointmentDialog({ appointment, venues, onClose, onSaved, showToast }: { appointment: Appointment | null; venues: Venue[]; onClose: () => void; onSaved: () => void; showToast: (message: string, tone?: 'success' | 'error') => void }) {
  const [date, setDate] = useState('')
  const [venueID, setVenueID] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!appointment) return
    setDate(appointment.date)
    setVenueID(String(appointment.venue.venueID))
    setFormError(null)
  }, [appointment])

  if (!appointment) return null

  const submit = async () => {
    setFormError(null)
    if (!date) return setFormError('Choose a date.')
    if (!venueID) return setFormError('Choose a venue.')
    setSaving(true)
    try {
      await appointmentsApi.update(appointment.appID, { date, campId: appointment.campaign.campID, donorID: appointment.donor.donorID, venueID: Number(venueID), status: appointment.status })
      showToast('Appointment updated.')
      onSaved()
    } catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Modal open title="Edit appointment" description={`${appointment.donor.firstName} ${appointment.donor.lastName} · ${appointment.campaign.name}`} onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); submit() }} className="space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      <Input label="Date" id="edit-appointment-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      <Select label="Venue" id="edit-appointment-venue" value={venueID} onChange={(event) => setVenueID(event.target.value)}>
        {venues.map((venue) => <option key={venue.venueID} value={venue.venueID}>{venue.name}</option>)}
      </Select>
      <div className="flex items-center gap-2 text-sm text-slate-500"><StatusBadge status={appointment.status} /> set from the schedule list</div>
      <WizardNav onPrevious={onClose} previousLabel="Cancel" previousIcon={false} onNext={submit} nextLabel={saving ? 'Saving...' : 'Save changes'} busy={saving} />
    </form>
  </Modal>
}


function CreateAppointmentDialog({ onClose, onSaved, showToast }: { onClose: () => void; onSaved: () => void; showToast: (message: string, tone?: 'success' | 'error') => void }) {
  const [step, setStep] = useState(0)
  const [date, setDate] = useState('')
  const [venueID, setVenueID] = useState('')
  const [donorID, setDonorID] = useState('')
  const [campId, setCampId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingLists, setLoadingLists] = useState(true)
  
  const [donors, setDonors] = useState<Donor[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    Promise.all([authApi.getDonors(), campaignsApi.getAll()])
      .then(([d, c]) => { setDonors(d); setCampaigns(c) })
      .catch((err) => setFormError(getErrorMessage(err)))
      .finally(() => setLoadingLists(false))
  }, [])

  const selectedCampaign = campaigns.find(c => c.campID === Number(campId))
  const validVenues = selectedCampaign?.venueSet || []

  const nextStep = () => {
    setFormError(null)
    if (step === 0 && (!donorID || !campId)) {
      return setFormError('Please select both a donor and a campaign.')
    }
    if (step === 1 && !venueID) {
      return setFormError('Please select a venue.')
    }
    setStep((s) => s + 1)
  }

  const submit = async () => {
    setFormError(null)
    if (!date) return setFormError('Choose a date.')
    if (selectedCampaign && (date < selectedCampaign.startDate || date > selectedCampaign.endDate)) {
      return setFormError(`Date must be between ${selectedCampaign.startDate} and ${selectedCampaign.endDate}.`)
    }
    
    setSaving(true)
    try {
      await appointmentsApi.create({ date, campId: Number(campId), donorID: Number(donorID), venueID: Number(venueID) })
      showToast('Appointment created.', 'success')
      onSaved()
    } catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Modal open title="Create appointment" description="Set up the appointment and pick where it runs." onClose={onClose}>
    {loadingLists ? <div className="space-y-4"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div> : (
      <div className="space-y-6">
        <Stepper steps={['Details', 'Venue', 'Schedule']} current={step} onStepSelect={setStep} />
        
        <form onSubmit={(event) => { event.preventDefault(); if (step === 2) submit(); else nextStep(); }} className="space-y-4">
          {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
          
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Appointment details</h3>
                <p className="text-sm text-slate-500 mb-4">Who the appointment is for and which campaign.</p>
              </div>
              <Select label="Donor" id="create-appointment-donor" value={donorID} onChange={(event) => setDonorID(event.target.value)}>
                <option value="">Select a donor...</option>
                {donors.map((d) => <option key={d.id} value={d.id}>{d.f_Name} {d.l_Name}</option>)}
              </Select>
              <Select label="Campaign" id="create-appointment-campaign" value={campId} onChange={(event) => setCampId(event.target.value)}>
                <option value="">Select a campaign...</option>
                {campaigns.map((c) => <option key={c.campID} value={c.campID}>{c.name}</option>)}
              </Select>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Venue selection</h3>
                <p className="text-sm text-slate-500 mb-4">Where the appointment will take place.</p>
              </div>
              {validVenues.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                  The selected campaign does not have any active venues. Please choose a different campaign.
                </p>
              ) : (
                <Select label="Venue" id="create-appointment-venue" value={venueID} onChange={(event) => setVenueID(event.target.value)}>
                  <option value="">Select a venue...</option>
                  {validVenues.map((v) => <option key={v.venueID} value={v.venueID}>{v.name}</option>)}
                </Select>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Schedule</h3>
                <p className="text-sm text-slate-500 mb-4">When the appointment is scheduled.</p>
              </div>
              <Input 
                label="Date" 
                id="create-appointment-date" 
                type="date" 
                min={selectedCampaign?.startDate}
                max={selectedCampaign?.endDate}
                value={date} 
                onChange={(event) => setDate(event.target.value)} 
              />
              {selectedCampaign && (
                <p className="text-xs text-slate-500">
                  Must be between {selectedCampaign.startDate} and {selectedCampaign.endDate}
                </p>
              )}
            </div>
          )}

          {step === 0 && <WizardNav onPrevious={onClose} previousLabel="Cancel" previousIcon={false} onNext={nextStep} nextLabel="Next" />}
          {step === 1 && <WizardNav onPrevious={() => setStep(0)} onNext={nextStep} nextLabel="Next" />}
          {step === 2 && <WizardNav onPrevious={() => setStep(1)} onNext={submit} nextLabel={saving ? 'Creating...' : 'Create appointment'} busy={saving} />}
        </form>
      </div>
    )}
  </Modal>
}
