import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, MapPin, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { authApi, bloodBanksApi, campaignsApi, getErrorMessage, venuesApi } from '../../api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { DataTable, type TableColumn } from '../../components/DataTable'
import { ErrorState } from '../../components/ErrorState'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import type { Bank, Campaign, Hoster, Venue } from '../../types/api'

const today = () => new Date().toISOString().slice(0, 10)

// A campaign's hoster arrives either as a full object or as a bare id, depending on whether Jackson
// already serialised that hoster earlier in the same response. Accept both.
function hostName(campaign: Campaign, hosters: Hoster[]) {
  const raw = campaign.hoster as Hoster | number | null
  if (raw && typeof raw === 'object') return raw.orgName
  return hosters.find((hoster) => hoster.id === raw)?.orgName ?? 'Unknown host'
}

// Same story for the venues on a campaign: keep only the ids and read the details from the venue
// list, so a venue edited on this page shows its new name straight away.
function venueIdsOf(campaign: Campaign | null) {
  return (campaign?.venueSet ?? []).map((entry) => (typeof entry === 'object' ? entry.venueID : (entry as number)))
}

function bankName(venue: Venue, banks: Bank[]) {
  return banks.find((bank) => bank.bankID === venue.assignedBank)?.name ?? `Bank ${venue.assignedBank}`
}

function RowAction({ label, onClick, tone = 'neutral' }: { label: string; onClick: () => void; tone?: 'neutral' | 'danger' }) {
  return <button type="button" onClick={onClick} className={`text-xs font-semibold ${tone === 'danger' ? 'text-red-700 hover:text-red-800' : 'text-slate-600 hover:text-slate-900'}`}>{label}</button>
}

function LoadingPage() {
  return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-64" /></div>
}

/* ------------------------------------------------------------------ */
/* Campaign list                                                       */
/* ------------------------------------------------------------------ */

export function CampaignsAdminPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [hosters, setHosters] = useState<Hoster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([campaignsApi.getAll(), authApi.getHosters()])
      .then(([campaignRows, hosterRows]) => { setCampaigns(campaignRows); setHosters(hosterRows) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const remove = async (campaign: Campaign) => {
    if (!window.confirm(`Delete "${campaign.name}"? This cannot be undone.`)) return
    try { await campaignsApi.remove(campaign.campID); showToast('Campaign deleted.'); load() }
    catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }

  // Dates render as plain text so the table's search box can match on them.
  const columns: TableColumn<Campaign>[] = useMemo(() => [
    { key: 'name', header: 'Campaign', render: (row) => row.name },
    { key: 'host', header: 'Host', render: (row) => hostName(row, hosters) },
    { key: 'dates', header: 'Dates', render: (row) => `${row.startDate} to ${row.endDate}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} />, searchable: false },
  ], [hosters])

  if (loading) return <LoadingPage />
  if (error) return <ErrorState message={error} retry={load} />
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">Administration</p>
        <h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Campaigns</h1>
        <p className="mt-2 text-slate-600">Every donation campaign. Open one to edit its details and venues.</p>
      </div>
      <Button type="button" onClick={() => setCreateOpen(true)} className="inline-flex shrink-0 items-center gap-2"><Plus size={16} />Create campaign</Button>
    </div>

    <DataTable
      rows={campaigns}
      columns={columns}
      getRowKey={(row) => row.campID}
      searchPlaceholder="Search campaigns"
      statusOptions={['PENDING', 'APPROVED', 'REJECTED']}
      getStatus={(row) => row.status}
      emptyMessage="No campaigns yet. Create one to get started."
      actions={(row) => <div className="flex justify-end gap-3">
        <RowAction label="Edit" onClick={() => navigate(`/admin/campaigns/${row.campID}`)} />
        <RowAction label="Delete" tone="danger" onClick={() => remove(row)} />
      </div>}
    />

    <CreateCampaignDialog open={createOpen} hosters={hosters} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load() }} />
  </div>
}

function CreateCampaignDialog({ open, hosters, onClose, onCreated }: { open: boolean; hosters: Hoster[]; onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [hosterID, setHosterID] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Start every dialog from a blank form rather than whatever the last attempt left behind.
  useEffect(() => { if (open) { setName(''); setHosterID(''); setStartDate(''); setEndDate(''); setFormError(null) } }, [open])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!name.trim()) return setFormError('Enter a campaign name.')
    if (!hosterID) return setFormError('Choose the organization hosting this campaign.')
    if (!startDate || !endDate) return setFormError('Choose a start and end date.')
    if (startDate < today()) return setFormError('The campaign cannot start in the past.')
    if (endDate < startDate) return setFormError('The end date must be on or after the start date.')
    setSaving(true)
    try {
      await campaignsApi.create({ name: name.trim(), startDate, endDate, hosterID: Number(hosterID), venueIDs: [] })
      showToast('Campaign created. Open it to add venues.')
      onCreated()
    } catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Modal open={open} title="Create campaign" description="Add the basics now; venues come next, from the campaign's own page." onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      <Input label="Campaign name" id="create-campaign-name" value={name} onChange={(event) => setName(event.target.value)} />
      <Select label="Host" id="create-campaign-host" value={hosterID} onChange={(event) => setHosterID(event.target.value)}>
        <option value="">Select a host</option>
        {hosters.map((hoster) => <option key={hoster.id} value={hoster.id}>{hoster.orgName}</option>)}
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Start date" id="create-campaign-start" type="date" min={today()} value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <Input label="End date" id="create-campaign-end" type="date" min={startDate || today()} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" className="bg-slate-600 hover:bg-slate-700" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create campaign'}</Button>
      </div>
    </form>
  </Modal>
}

/* ------------------------------------------------------------------ */
/* Campaign edit: details + the venues that belong to this campaign    */
/* ------------------------------------------------------------------ */

export function CampaignEditPage() {
  const { campID } = useParams()
  const id = Number(campID)
  const { showToast } = useToast()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [hosters, setHosters] = useState<Hoster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    if (!Number.isInteger(id)) { setLoading(false); setError('That campaign address is not valid.'); return }
    setLoading(true)
    setError(null)
    Promise.all([campaignsApi.getById(id), venuesApi.getAll(), bloodBanksApi.getAll(), authApi.getHosters()])
      .then(([campaignRow, venueRows, bankRows, hosterRows]) => { setCampaign(campaignRow); setVenues(venueRows); setBanks(bankRows); setHosters(hosterRows) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [id])

  const venueIDs = useMemo(() => venueIdsOf(campaign), [campaign])
  const campaignVenues = useMemo(
    () => venueIDs.map((venueID) => venues.find((venue) => venue.venueID === venueID)).filter((venue): venue is Venue => Boolean(venue)),
    [venueIDs, venues],
  )

  if (loading) return <LoadingPage />
  if (error || !campaign) return <div className="space-y-6">
    <Link to="/admin/campaigns" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />Campaigns</Link>
    <ErrorState message={error ?? 'That campaign could not be loaded.'} retry={load} />
  </div>

  return <div className="space-y-6">
    <div>
      <Link to="/admin/campaigns" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />Campaigns</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="app-title text-4xl font-bold text-slate-950">{campaign.name}</h1>
        <StatusBadge status={campaign.status} />
      </div>
      <p className="mt-2 text-slate-600">Hosted by {hostName(campaign, hosters)}</p>
    </div>

    <CampaignDetailsSection campaign={campaign} onSaved={load} />
    <CampaignVenuesSection campaign={campaign} venueIDs={venueIDs} campaignVenues={campaignVenues} venues={venues} banks={banks} onChanged={load} showToast={showToast} />
  </div>
}

function CampaignDetailsSection({ campaign, onSaved }: { campaign: Campaign; onSaved: () => void }) {
  const { showToast } = useToast()
  const [name, setName] = useState(campaign.name)
  const [startDate, setStartDate] = useState(campaign.startDate)
  const [endDate, setEndDate] = useState(campaign.endDate)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reset = () => { setName(campaign.name); setStartDate(campaign.startDate); setEndDate(campaign.endDate); setFormError(null) }
  useEffect(reset, [campaign])
  const dirty = name !== campaign.name || startDate !== campaign.startDate || endDate !== campaign.endDate

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!name.trim()) return setFormError('Enter a campaign name.')
    if (!startDate || !endDate) return setFormError('Choose a start and end date.')
    if (endDate < startDate) return setFormError('The end date must be on or after the start date.')
    setSaving(true)
    try { await campaignsApi.update(campaign.campID, { name: name.trim(), startDate, endDate }); showToast('Campaign details saved.'); onSaved() }
    catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Card>
    <h2 className="text-xl font-bold text-slate-950">Campaign details</h2>
    <form onSubmit={submit} className="mt-5 space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      <Input label="Campaign name" id="campaign-name" value={name} onChange={(event) => setName(event.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Start date" id="campaign-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <Input label="End date" id="campaign-end" type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving || !dirty}>{saving ? 'Saving...' : 'Save changes'}</Button>
        <Button type="button" className="bg-slate-600 hover:bg-slate-700" disabled={saving || !dirty} onClick={reset}>Cancel</Button>
      </div>
    </form>
  </Card>
}

type VenuesSectionProps = {
  campaign: Campaign
  venueIDs: number[]
  campaignVenues: Venue[]
  venues: Venue[]
  banks: Bank[]
  onChanged: () => void
  showToast: (message: string, tone?: 'success' | 'error') => void
}

function CampaignVenuesSection({ campaign, venueIDs, campaignVenues, venues, banks, onChanged, showToast }: VenuesSectionProps) {
  const [adding, setAdding] = useState(false)
  const [editingID, setEditingID] = useState<number | null>(null)

  const remove = async (venue: Venue) => {
    if (!window.confirm(`Remove "${venue.name}" from this campaign? The venue itself stays available for other campaigns.`)) return
    try {
      // The backend replaces the whole set, so send the venues that should remain.
      await campaignsApi.update(campaign.campID, { venueIDs: venueIDs.filter((venueID) => venueID !== venue.venueID) })
      showToast('Venue removed from this campaign.')
      onChanged()
    } catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }

  return <Card>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-slate-950">Venues</h2>
        <p className="mt-1 text-sm text-slate-500">{campaignVenues.length === 0 ? 'No venues yet.' : `${campaignVenues.length} venue${campaignVenues.length === 1 ? '' : 's'} in this campaign.`}</p>
      </div>
      {!adding && <Button type="button" onClick={() => { setAdding(true); setEditingID(null) }} className="inline-flex items-center gap-2"><Plus size={16} />Add venue</Button>}
    </div>

    {adding && <AddVenuePanel campaign={campaign} venues={venues} venueIDs={venueIDs} banks={banks} onClose={() => setAdding(false)} onAdded={() => { setAdding(false); onChanged() }} showToast={showToast} />}

    <div className="mt-5 divide-y divide-slate-100 rounded-md border border-slate-200">
      {campaignVenues.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Add the places where donors can give blood during this campaign.</p>}
      {campaignVenues.map((venue) => editingID === venue.venueID
        ? <EditVenueRow key={venue.venueID} venue={venue} banks={banks} onClose={() => setEditingID(null)} onSaved={() => { setEditingID(null); onChanged() }} showToast={showToast} />
        : <div key={venue.venueID} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{venue.name}</p>
                <p className="text-sm text-slate-500">{venue.address}</p>
                <p className="mt-1 text-xs text-slate-400">Collects for {bankName(venue, banks)}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <RowAction label="Edit" onClick={() => { setEditingID(venue.venueID); setAdding(false) }} />
              <RowAction label="Remove" tone="danger" onClick={() => remove(venue)} />
            </div>
          </div>)}
    </div>
  </Card>
}

function AddVenuePanel({ campaign, venues, venueIDs, banks, onClose, onAdded, showToast }: { campaign: Campaign; venues: Venue[]; venueIDs: number[]; banks: Bank[]; onClose: () => void; onAdded: () => void; showToast: VenuesSectionProps['showToast'] }) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [existingID, setExistingID] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [bankID, setBankID] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const available = venues.filter((venue) => !venueIDs.includes(venue.venueID))

  // The create endpoint answers with a status string, not the new venue, so re-read the list and
  // pick out the row that was not there before in order to attach it to this campaign.
  const createThenAttach = async () => {
    const known = new Set(venues.map((venue) => venue.venueID))
    await venuesApi.create({ name: name.trim(), address: address.trim(), bankID: Number(bankID) })
    const created = (await venuesApi.getAll()).find((venue) => !known.has(venue.venueID) && venue.name === name.trim() && venue.address === address.trim())
    if (!created) throw new Error('The venue was saved but could not be attached. Add it here with "An existing venue".')
    await campaignsApi.assignVenue(campaign.campID, created.venueID)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (mode === 'existing' && !existingID) return setFormError('Choose a venue to add.')
    if (mode === 'new' && (!name.trim() || !address.trim())) return setFormError('Enter the venue name and address.')
    if (mode === 'new' && !bankID) return setFormError('Choose the blood bank this venue collects for.')
    setSaving(true)
    try {
      if (mode === 'existing') await campaignsApi.assignVenue(campaign.campID, Number(existingID))
      else await createThenAttach()
      showToast('Venue added to this campaign.')
      onAdded()
    } catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <form onSubmit={submit} className="mt-5 space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">Add</legend>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="flex items-center gap-2"><input type="radio" name="venue-mode" className="accent-red-700" checked={mode === 'existing'} onChange={() => { setMode('existing'); setFormError(null) }} />An existing venue</label>
        <label className="flex items-center gap-2"><input type="radio" name="venue-mode" className="accent-red-700" checked={mode === 'new'} onChange={() => { setMode('new'); setFormError(null) }} />A new venue</label>
      </div>
    </fieldset>

    {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}

    {mode === 'existing'
      ? <Select label="Venue" id="add-existing-venue" value={existingID} onChange={(event) => setExistingID(event.target.value)}>
          <option value="">{available.length === 0 ? 'Every venue is already in this campaign' : 'Select a venue'}</option>
          {available.map((venue) => <option key={venue.venueID} value={venue.venueID}>{venue.name} — {venue.address}</option>)}
        </Select>
      : <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Venue name" id="add-venue-name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Address" id="add-venue-address" value={address} onChange={(event) => setAddress(event.target.value)} />
          <Select label="Collects for" id="add-venue-bank" value={bankID} onChange={(event) => setBankID(event.target.value)}>
            <option value="">Select a blood bank</option>
            {banks.map((bank) => <option key={bank.bankID} value={bank.bankID}>{bank.name}</option>)}
          </Select>
        </div>}

    <div className="flex gap-2">
      <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add venue'}</Button>
      <Button type="button" className="bg-slate-600 hover:bg-slate-700" onClick={onClose}>Cancel</Button>
    </div>
  </form>
}

function EditVenueRow({ venue, banks, onClose, onSaved, showToast }: { venue: Venue; banks: Bank[]; onClose: () => void; onSaved: () => void; showToast: VenuesSectionProps['showToast'] }) {
  const [name, setName] = useState(venue.name)
  const [address, setAddress] = useState(venue.address)
  const [bankID, setBankID] = useState(String(venue.assignedBank))
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!name.trim() || !address.trim()) return setFormError('Enter the venue name and address.')
    if (!bankID) return setFormError('Choose the blood bank this venue collects for.')
    setSaving(true)
    try { await venuesApi.update({ venueID: venue.venueID, name: name.trim(), address: address.trim(), bankID: Number(bankID) }); showToast('Venue updated.'); onSaved() }
    catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <form onSubmit={submit} className="space-y-4 bg-slate-50 p-4">
    {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Venue name" id={`venue-name-${venue.venueID}`} value={name} onChange={(event) => setName(event.target.value)} />
      <Input label="Address" id={`venue-address-${venue.venueID}`} value={address} onChange={(event) => setAddress(event.target.value)} />
      <Select label="Collects for" id={`venue-bank-${venue.venueID}`} value={bankID} onChange={(event) => setBankID(event.target.value)}>
        {banks.map((bank) => <option key={bank.bankID} value={bank.bankID}>{bank.name}</option>)}
      </Select>
    </div>
    {/* Venues are shared records, so this edit shows up in every campaign that uses the venue. */}
    <p className="text-xs text-slate-500">These details are shared with any other campaign using this venue.</p>
    <div className="flex gap-2">
      <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save venue'}</Button>
      <Button type="button" className="bg-slate-600 hover:bg-slate-700" onClick={onClose}>Cancel</Button>
    </div>
  </form>
}
