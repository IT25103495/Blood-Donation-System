import { useEffect, useState } from 'react'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { bloodBanksApi, getErrorMessage, venuesApi } from '../../api'
import { Button } from '../../components/Button'
import { ActionMenu } from '../../components/ActionMenu'
import { Card } from '../../components/Card'

import { ErrorState } from '../../components/ErrorState'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { WizardNav } from '../../components/Stepper'
import { useToast } from '../../context/ToastContext'
import type { Bank, Venue } from '../../types/api'

function bankName(venue: Venue, banks: Bank[]) {
  return banks.find((bank) => bank.bankID === venue.assignedBank)?.name ?? `Bank ${venue.assignedBank}`
}


function LoadingPage() {
  return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-64" /></div>
}

/* ------------------------------------------------------------------ */
/* Venue list                                                          */
/* ------------------------------------------------------------------ */

export function VenuesAdminPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [venues, setVenues] = useState<Venue[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([venuesApi.getAll(), bloodBanksApi.getAll()])
      .then(([venueRows, bankRows]) => { setVenues(venueRows); setBanks(bankRows) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const remove = async (venue: Venue) => {
    if (!window.confirm(`Delete "${venue.name}"? This cannot be undone.`)) return
    try { await venuesApi.remove(venue.venueID); showToast('Venue deleted.'); load() }
    catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }



  if (loading) return <LoadingPage />
  if (error) return <ErrorState message={error} retry={load} />
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">Administration</p>
        <h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Venues</h1>
        <p className="mt-2 text-slate-600">Donation locations and the bank each one collects for.</p>
      </div>
      <Button type="button" onClick={() => setCreateOpen(true)} className="inline-flex shrink-0 items-center gap-2"><Plus size={16} />Create venue</Button>
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3">
            <input aria-label="Search venues" placeholder="Search venues by name or address" className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100" />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">All venues</h2>
          {venues.length === 0 ? (
            <p className="mt-5 py-10 text-center text-sm text-slate-500">No venues yet. Create one to get started.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {venues.map((row) => (
                <li key={row.venueID} className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-950">{row.name}</span>
                    <span className="block truncate text-sm text-slate-500">{row.address}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-slate-600">{bankName(row, banks)}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <ActionMenu label={`Actions for ${row.name}`} actions={[
                      { label: 'Edit venue', icon: Pencil, onClick: () => navigate(`/admin/venues/${row.venueID}`) },
                      { label: 'Delete', icon: Trash2, tone: 'danger', separated: true, onClick: () => remove(row) },
                    ]} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Summary</h2>
          <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-sm text-slate-500">Total venues</span>
            <span className="font-bold text-slate-950">{venues.length}</span>
          </div>
        </Card>
      </div>
    </div>

    <CreateVenueDialog open={createOpen} banks={banks} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load() }} />
  </div>
}

// Three fields is not worth stepping through, so this is a plain dialog - steps show up only where
// there is something to separate, the way the campaign dialog splits details from schedule.
function CreateVenueDialog({ open, banks, onClose, onCreated }: { open: boolean; banks: Bank[]; onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [bankID, setBankID] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (open) { setName(''); setAddress(''); setBankID(''); setFormError(null) } }, [open])

  const submit = async () => {
    setFormError(null)
    if (!name.trim() || !address.trim()) return setFormError('Enter the venue name and address.')
    if (!bankID) return setFormError('Choose the blood bank this venue collects for.')
    setSaving(true)
    try { await venuesApi.create({ name: name.trim(), address: address.trim(), bankID: Number(bankID) }); showToast('Venue created.'); onCreated() }
    catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Modal open={open} title="Create venue" description="A place donors can give blood during a campaign." onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); submit() }} className="space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      <Input label="Venue name" id="create-venue-name" value={name} onChange={(event) => setName(event.target.value)} />
      <Input label="Address" id="create-venue-address" value={address} onChange={(event) => setAddress(event.target.value)} />
      <Select label="Collects for" id="create-venue-bank" value={bankID} onChange={(event) => setBankID(event.target.value)}>
        <option value="">Select a blood bank</option>
        {banks.map((bank) => <option key={bank.bankID} value={bank.bankID}>{bank.name}</option>)}
      </Select>
      <WizardNav onPrevious={onClose} previousLabel="Cancel" previousIcon={false} onNext={submit} nextLabel={saving ? 'Creating...' : 'Create venue'} busy={saving} />
    </form>
  </Modal>
}

/* ------------------------------------------------------------------ */
/* Venue edit                                                          */
/* ------------------------------------------------------------------ */

export function VenueEditPage() {
  const { venueID } = useParams()
  const id = Number(venueID)
  const { showToast } = useToast()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    if (!Number.isInteger(id)) { setLoading(false); setError('That venue address is not valid.'); return }
    setLoading(true)
    setError(null)
    Promise.all([venuesApi.getById(id), bloodBanksApi.getAll()])
      .then(([venueRow, bankRows]) => { setVenue(venueRow); setBanks(bankRows) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [id])

  if (loading) return <LoadingPage />
  if (error || !venue) return <div className="space-y-6">
    <Link to="/admin/venues" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />Venues</Link>
    <ErrorState message={error ?? 'That venue could not be loaded.'} retry={load} />
  </div>

  return <div className="space-y-6">
    <div>
      <Link to="/admin/venues" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />Venues</Link>
      <h1 className="app-title mt-3 text-4xl font-bold text-slate-950">{venue.name}</h1>
      <p className="mt-2 text-slate-600">{venue.address}</p>
    </div>
    <VenueDetailsSection venue={venue} banks={banks} onSaved={load} showToast={showToast} />
  </div>
}

function VenueDetailsSection({ venue, banks, onSaved, showToast }: { venue: Venue; banks: Bank[]; onSaved: () => void; showToast: (message: string, tone?: 'success' | 'error') => void }) {
  const [name, setName] = useState(venue.name)
  const [address, setAddress] = useState(venue.address)
  const [bankID, setBankID] = useState(String(venue.assignedBank))
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reset = () => { setName(venue.name); setAddress(venue.address); setBankID(String(venue.assignedBank)); setFormError(null) }
  useEffect(reset, [venue])
  const dirty = name !== venue.name || address !== venue.address || bankID !== String(venue.assignedBank)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!name.trim() || !address.trim()) return setFormError('Enter the venue name and address.')
    if (!bankID) return setFormError('Choose the blood bank this venue collects for.')
    setSaving(true)
    try { await venuesApi.update({ venueID: venue.venueID, name: name.trim(), address: address.trim(), bankID: Number(bankID) }); showToast('Venue saved.'); onSaved() }
    catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Card>
    <h2 className="text-xl font-bold text-slate-950">Venue details</h2>
    {/* Venues are shared, so an edit here shows up in every campaign that uses this venue. */}
    <p className="mt-1 text-sm text-slate-500">These details are shared with every campaign using this venue.</p>
    <form onSubmit={submit} className="mt-5 space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      <Input label="Venue name" id="venue-name" value={name} onChange={(event) => setName(event.target.value)} />
      <Input label="Address" id="venue-address" value={address} onChange={(event) => setAddress(event.target.value)} />
      <Select label="Collects for" id="venue-bank" value={bankID} onChange={(event) => setBankID(event.target.value)}>
        {banks.map((bank) => <option key={bank.bankID} value={bank.bankID}>{bank.name}</option>)}
      </Select>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving || !dirty}>{saving ? 'Saving...' : 'Save changes'}</Button>
        <Button type="button" className="bg-slate-600 hover:bg-slate-700" disabled={saving || !dirty} onClick={reset}>Cancel</Button>
      </div>
    </form>
  </Card>
}
