import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { authApi, bloodBanksApi, campaignsApi, getErrorMessage, venuesApi } from '../../api'
import { Button } from '../../components/Button'
import { ActionMenu } from '../../components/ActionMenu'
import { Card } from '../../components/Card'
import { rowActionClass } from '../../components/DataTable'
import { ErrorState } from '../../components/ErrorState'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { Stepper, WizardNav } from '../../components/Stepper'
import { useToast } from '../../context/ToastContext'
import { hostName, venueIdsOf, venuesOf } from '../../utils/campaigns'
import type { Bank, Campaign, CampaignStatus, Hoster, Venue } from '../../types/api'

const today = () => new Date().toISOString().slice(0, 10)

function bankName(venue: Venue, banks: Bank[]) {
  return banks.find((bank) => bank.bankID === venue.assignedBank)?.name ?? `Bank ${venue.assignedBank}`
}

const CAMPAIGN_STATUSES: CampaignStatus[] = ['PENDING', 'APPROVED', 'REJECTED']
const STATUS_STYLES: Record<CampaignStatus, string> = { PENDING: 'bg-amber-50 text-amber-700', APPROVED: 'bg-green-50 text-green-700', REJECTED: 'bg-red-50 text-red-700' }

// The status cell is the control rather than a third button in Actions: it is where the status
// already is, it keeps the colour coding that makes the column scannable, and it costs no width
// in a table that already scrolls sideways.
function StatusSelect({ campaign, onChange }: { campaign: Campaign; onChange: (status: CampaignStatus) => void }) {
  return <select
    aria-label={`Status for ${campaign.name}`}
    value={campaign.status}
    onChange={(event) => onChange(event.target.value as CampaignStatus)}
    className={`cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-6 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-100 ${STATUS_STYLES[campaign.status]}`}
  >
    {CAMPAIGN_STATUSES.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}
  </select>
}

function RowAction({ label, onClick, tone = 'neutral', disabled, title }: { label: string; onClick: () => void; tone?: 'neutral' | 'danger'; disabled?: boolean; title?: string }) {
  return <button type="button" onClick={onClick} disabled={disabled} title={title} className={`${rowActionClass} ${tone === 'danger' ? 'text-red-700 hover:text-red-800' : 'text-slate-600 hover:text-slate-900'}`}>{label}</button>
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

  // The approvals queue only ever moves a campaign out of PENDING; this puts every status within
  // reach, so a decision made by mistake can be taken back without touching the database.
  const changeStatus = async (campaign: Campaign, status: CampaignStatus) => {
    if (status === campaign.status) return
    try { await campaignsApi.setStatus(campaign.campID, status); showToast(`"${campaign.name}" marked ${status.toLowerCase()}.`); load() }
    catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }



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

    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3">
            <input aria-label="Search campaigns" placeholder="Search campaigns by name" className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100" />
            <select aria-label="Filter by status" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="ALL">All statuses</option>
              {CAMPAIGN_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">All campaigns</h2>
          {campaigns.length === 0 ? (
            <p className="mt-5 py-10 text-center text-sm text-slate-500">No campaigns yet. Create one to get started.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {campaigns.map((row) => (
                <li key={row.campID} className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-950">{row.name}</span>
                    <span className="block truncate text-sm text-slate-500">{hostName(row, hosters)} · {row.startDate} to {row.endDate}</span>
                  </span>
                  <span className="shrink-0">
                    <StatusSelect campaign={row} onChange={(status) => changeStatus(row, status)} />
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <ActionMenu label={`Actions for ${row.name}`} actions={[
                      { label: 'Edit campaign', icon: Pencil, onClick: () => navigate(`/admin/campaigns/${row.campID}`) },
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
            <span className="text-sm text-slate-500">Total campaigns</span>
            <span className="font-bold text-slate-950">{campaigns.length}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-sm text-slate-500">Approved</span>
            <span className="font-bold text-green-700">{campaigns.filter((c) => c.status === 'APPROVED').length}</span>
          </div>
          <div className="mt-4 flex items-center justify-between pb-2">
            <span className="text-sm text-slate-500">Pending</span>
            <span className="font-bold text-amber-600">{campaigns.filter((c) => c.status === 'PENDING').length}</span>
          </div>
        </Card>
      </div>
    </div>

    <CreateCampaignDialog open={createOpen} hosters={hosters} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load() }} />
  </div>
}

const CAMPAIGN_STEPS = ['Details', 'Schedule', 'Venues']
const CAMPAIGN_HEADINGS = [
  { title: 'Campaign details', description: 'What the campaign is called and who is running it.' },
  { title: 'Schedule', description: 'The window donors can book inside.' },
  { title: 'Venues', description: 'Where donors can give blood. Pick at least one; you can change them later.' },
]
const LAST_STEP = CAMPAIGN_STEPS.length - 1

function CreateCampaignDialog({ open, hosters, onClose, onCreated }: { open: boolean; hosters: Hoster[]; onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [hosterID, setHosterID] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueIDs, setVenueIDs] = useState<number[]>([])
  const [venueSearch, setVenueSearch] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(0)

  // Start every dialog from a blank form rather than whatever the last attempt left behind. The
  // venue list is only needed once the dialog is actually open, so it is fetched here.
  useEffect(() => {
    if (!open) return
    setStep(0); setName(''); setHosterID(''); setStartDate(''); setEndDate(''); setVenueIDs([]); setVenueSearch(''); setFormError(null)
    venuesApi.getAll().then(setVenues).catch((err: unknown) => setFormError(getErrorMessage(err)))
  }, [open])

  const matches = venues.filter((venue) => `${venue.name} ${venue.address}`.toLowerCase().includes(venueSearch.trim().toLowerCase()))
  // Ticking a venue is what the "select at least one" error asks for, so clear it straight away
  // rather than leaving a complaint on screen that the person has already acted on.
  const toggleVenue = (venueID: number) => {
    setFormError(null)
    setVenueIDs((current) => current.includes(venueID) ? current.filter((id) => id !== venueID) : [...current, venueID])
  }

  const create = async () => {
    setSaving(true)
    try {
      await campaignsApi.create({ name: name.trim(), startDate, endDate, hosterID: Number(hosterID), venueIDs })
      showToast(`Campaign created with ${venueIDs.length} venue${venueIDs.length === 1 ? '' : 's'}.`)
      onCreated()
    } catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  // Each step checks only its own fields, so you are never told off about a question further on.
  const advance = () => {
    setFormError(null)
    if (step === 0) {
      if (!name.trim()) return setFormError('Enter a campaign name.')
      if (!hosterID) return setFormError('Choose the organization hosting this campaign.')
      return setStep(1)
    }
    if (step === 1) {
      if (!startDate || !endDate) return setFormError('Choose a start and end date.')
      if (startDate < today()) return setFormError('The campaign cannot start in the past.')
      if (endDate < startDate) return setFormError('The end date must be on or after the start date.')
      return setStep(2)
    }
    if (venueIDs.length === 0) return setFormError('Select at least one venue for this campaign.')
    create()
  }

  const heading = CAMPAIGN_HEADINGS[step]
  return <Modal open={open} title="Create campaign" description="Set up the campaign and pick where it runs." onClose={onClose}>
    <Stepper steps={CAMPAIGN_STEPS} current={step} onStepSelect={setStep} />
    <form onSubmit={(event) => { event.preventDefault(); advance() }} className="mt-6">
      <h3 className="font-semibold text-slate-900">{heading.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{heading.description}</p>
      <div className="mt-4 space-y-4">
        {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
        {step === 0 && <>
          <Input label="Campaign name" id="create-campaign-name" value={name} onChange={(event) => setName(event.target.value)} />
          <Select label="Host" id="create-campaign-host" value={hosterID} onChange={(event) => setHosterID(event.target.value)}>
            <option value="">Select a host</option>
            {hosters.map((hoster) => <option key={hoster.id} value={hoster.id}>{hoster.orgName}</option>)}
          </Select>
        </>}
        {step === 1 && <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Start date" id="create-campaign-start" type="date" min={today()} value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input label="End date" id="create-campaign-end" type="date" min={startDate || today()} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>}
        {step === 2 && <>
          <input aria-label="Search venues" placeholder="Search venues" value={venueSearch} onChange={(event) => setVenueSearch(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100" />
          <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200">
            {matches.length === 0
              ? <p className="p-4 text-sm text-slate-500">{venues.length === 0 ? <>No venues exist yet. <Link to="/admin/venues" className="font-semibold text-red-700 hover:text-red-800">Add one first</Link>, then come back.</> : 'No venues match that search.'}</p>
              : matches.map((venue) => <label key={venue.venueID} className="flex cursor-pointer items-start gap-3 border-b border-slate-100 p-3 last:border-0 hover:bg-slate-50">
                  <input type="checkbox" checked={venueIDs.includes(venue.venueID)} onChange={() => toggleVenue(venue.venueID)} className="mt-1 accent-red-700" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">{venue.name}</span>
                    <span className="block text-xs text-slate-500">{venue.address}</span>
                  </span>
                </label>)}
          </div>
          <p className="text-xs text-slate-500">{venueIDs.length === 0 ? 'At least one venue is required.' : `${venueIDs.length} venue${venueIDs.length === 1 ? '' : 's'} selected.`}</p>
        </>}
      </div>
      <WizardNav
        onPrevious={step === 0 ? onClose : () => setStep(step - 1)}
        previousLabel={step === 0 ? 'Cancel' : 'Previous'}
        previousIcon={step > 0}
        onNext={advance}
        nextLabel={step === LAST_STEP ? (saving ? 'Creating...' : 'Create campaign') : 'Next'}
        busy={saving}
      />
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
  const campaignVenues = useMemo(() => venuesOf(campaign, venues), [campaign, venues])

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

  // A campaign has to run somewhere, so the last venue cannot be taken away - add the replacement
  // first, then remove this one.
  const isOnlyVenue = campaignVenues.length <= 1

  const remove = async (venue: Venue) => {
    if (isOnlyVenue) return showToast('A campaign must keep at least one venue. Add another one first.', 'error')
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
              <RowAction label="Remove" tone="danger" disabled={isOnlyVenue} title={isOnlyVenue ? 'A campaign must keep at least one venue' : undefined} onClick={() => remove(venue)} />
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
