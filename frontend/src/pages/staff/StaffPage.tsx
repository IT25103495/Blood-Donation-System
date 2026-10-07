import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, MapPin, RotateCcw, XCircle } from 'lucide-react'
import { appointmentsApi, getErrorMessage, venuesApi } from '../../api'
import { ActionMenu } from '../../components/ActionMenu'
import { Card } from '../../components/Card'
import { DataTable, type TableColumn } from '../../components/DataTable'
import { ErrorState } from '../../components/ErrorState'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import type { Appointment, Venue } from '../../types/api'

const today = () => new Date().toISOString().slice(0, 10)
// A doctor works the same venue day after day, so the picker remembers it instead of resetting to
// "All venues" on every visit. It is only a convenience - the list itself is not scoped to them.
const VENUE_KEY = 'staff.venueID'
const rememberedVenue = () => { try { return window.localStorage.getItem(VENUE_KEY) ?? '' } catch { return '' } }

export function StaffPage() {
  const { showToast } = useToast()
  const [venues, setVenues] = useState<Venue[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [venueID, setVenueID] = useState(rememberedVenue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState<number | null>(null)

  const chooseVenue = (value: string) => {
    setVenueID(value)
    try { window.localStorage.setItem(VENUE_KEY, value) } catch { /* private mode: the picker just will not stick */ }
  }

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([venuesApi.getAll(), appointmentsApi.getAll()])
      .then(([venueItems, appointmentItems]) => { setVenues(venueItems); setAppointments(appointmentItems) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const selectedVenue = venues.find((venue) => venue.venueID === Number(venueID))
  // The venue picker narrows the rows; the search box and status filter inside the table do the
  // rest, so the earliest clinic day stays at the top whichever way it is filtered.
  const rows = useMemo(
    () => appointments
      .filter((appointment) => !venueID || appointment.venue.venueID === Number(venueID))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [appointments, venueID],
  )

  // The backend creates the inventory unit itself when an appointment moves to COMPLETE, so this
  // only sends the status change - sending the unit as well would be a second insert on the same
  // appointment, which the unique constraint rejects.
  const updateStatus = async (appointment: Appointment, status: 'COMPLETE' | 'CANCELLED' | 'BOOKED') => {
    if (status === 'CANCELLED' && !window.confirm('Cancel this appointment?')) return
    setWorking(appointment.appID)
    try {
      await appointmentsApi.setStatus(appointment.appID, status)
      showToast(status === 'COMPLETE' ? 'Appointment completed and inventory recorded.' : status === 'BOOKED' ? 'Appointment reopened.' : 'Appointment cancelled.')
      load()
    } catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
    finally { setWorking(null) }
  }

  const isFuture = (appointment: Appointment) => appointment.date > today()

  const columns: TableColumn<Appointment>[] = [
    { key: 'donor', header: 'Donor', render: (row) => row.donor.firstName + ' ' + row.donor.lastName },
    { key: 'type', header: 'Blood type', render: (row) => row.donor.bloodType },
    { key: 'phone', header: 'Phone', render: (row) => row.donor.phone || '--' },
    { key: 'campaign', header: 'Campaign', render: (row) => row.campaign.name },
    { key: 'venue', header: 'Venue', render: (row) => row.venue.name },
    { key: 'date', header: 'Date', render: (row) => row.date === today() ? <span className="font-bold text-red-700">Today</span> : row.date },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} />, searchable: false },
  ]

  if (loading) return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-16" /><Skeleton className="h-64" /></div>
  if (error) return <ErrorState message={error} retry={load} />

  return <div className="space-y-6">
    <div>
      <p className="eyebrow">Doctor staff</p>
      <h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Venue appointments</h1>
      <p className="mt-2 text-slate-600">Review booked donors and record the outcome of each visit.</p>
    </div>

    <Card>
      <div className="max-w-md">
        <Select label="Venue" id="staff-venue" value={venueID} onChange={(event) => chooseVenue(event.target.value)}>
          <option value="">All venues</option>
          {venues.map((venue) => <option key={venue.venueID} value={venue.venueID}>{venue.name}</option>)}
        </Select>
      </div>
      {selectedVenue && <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} aria-hidden="true" />{selectedVenue.address}</p>}
    </Card>

    <DataTable
      rows={rows}
      columns={columns}
      getRowKey={(row) => row.appID}
      searchPlaceholder="Search donors, campaigns, venues"
      statusOptions={['BOOKED', 'COMPLETE', 'CANCELLED']}
      getStatus={(row) => row.status}
      emptyMessage="No appointments for the selected venue."
      actions={(row) => <div className="flex justify-end">
        <ActionMenu label={'Actions for appointment #' + row.appID} actions={[
          {
            label: 'Mark completed',
            icon: CheckCircle2,
            disabled: row.status !== 'BOOKED' || isFuture(row) || working === row.appID,
            title: isFuture(row) ? 'This visit is scheduled for ' + row.date + '.' : undefined,
            onClick: () => updateStatus(row, 'COMPLETE'),
          },
          {
            // A cancellation can be undone; a completed visit cannot, because it has already filed
            // an inventory unit that reopening would leave behind.
            label: 'Reopen as booked',
            icon: RotateCcw,
            disabled: row.status !== 'CANCELLED' || working === row.appID,
            title: row.status === 'COMPLETE' ? 'Completed visits cannot be reopened; the blood unit is already recorded.' : undefined,
            onClick: () => updateStatus(row, 'BOOKED'),
          },
          {
            label: 'Cancel appointment',
            icon: XCircle,
            tone: 'danger',
            separated: true,
            disabled: row.status !== 'BOOKED' || working === row.appID,
            onClick: () => updateStatus(row, 'CANCELLED'),
          },
        ]} />
      </div>}
    />
  </div>
}
