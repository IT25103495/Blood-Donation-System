import { useEffect, useMemo, useState } from 'react'
import { campaignsApi, getErrorMessage, venuesApi } from '../../api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { Input } from '../../components/Input'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import type { Campaign, Venue } from '../../types/api'

const today = () => new Date().toISOString().slice(0, 10)
export function HosterPage() {
  const { userId } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedVenueIds, setSelectedVenueIds] = useState<number[]>([])
  const [venueSearch, setVenueSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const load = () => { if (userId === null) { setLoading(false); setError('Your account ID is missing from the login token. Contact support.'); return } setLoading(true); Promise.all([campaignsApi.getByHoster(userId), venuesApi.getAll()]).then(([campaignItems, venueItems]) => { setCampaigns(campaignItems); setVenues(venueItems) }).catch((err: unknown) => setError(getErrorMessage(err))).finally(() => setLoading(false)) }
  useEffect(load, [userId])
  const filteredVenues = useMemo(() => venues.filter((venue) => `${venue.name} ${venue.address}`.toLowerCase().includes(venueSearch.toLowerCase())), [venueSearch, venues])
  const toggleVenue = (venueID: number) => setSelectedVenueIds((current) => current.includes(venueID) ? current.filter((id) => id !== venueID) : [...current, venueID])
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitError(null); setSuccess(null); if (userId === null) return setSubmitError('Your account ID is missing from the login token. Contact support.'); if (!name.trim() || !startDate || !endDate) return setSubmitError('Complete the campaign name and dates.'); if (startDate < today()) return setSubmitError('The campaign cannot start in the past.'); if (endDate <= startDate) return setSubmitError('The end date must be after the start date.'); if (selectedVenueIds.length === 0) return setSubmitError('Select at least one venue.'); setSubmitting(true); try { const result = await campaignsApi.create({ name: name.trim(), startDate, endDate, hosterID: userId, venueIDs: selectedVenueIds }); setSuccess(result); setName(''); setStartDate(''); setEndDate(''); setSelectedVenueIds([]); load() } catch (err: unknown) { setSubmitError(getErrorMessage(err)) } finally { setSubmitting(false) } }
  if (loading) return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-64" /><Skeleton className="h-48" /></div>
  if (error) return <ErrorState message={error} retry={load} />
  return <div className="space-y-8"><div><p className="eyebrow">Campaign host</p><h1 className="app-title mt-2 text-4xl font-bold text-slate-950">My campaigns</h1><p className="mt-2 text-slate-600">Create and follow donation campaigns for your organization.</p></div><Card><h2 className="text-xl font-bold text-slate-950">New campaign</h2><p className="mt-2 text-sm text-slate-600">New campaigns are submitted as <strong>PENDING</strong> until an admin approves them.</p>{submitError && <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{submitError}</div>}{success && <div role="status" className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</div>}<form onSubmit={submit} className="mt-5 space-y-5"><Input label="Campaign name" id="campaign-name" value={name} onChange={(event) => setName(event.target.value)} /><div className="grid gap-5 sm:grid-cols-2"><Input label="Start date" id="start-date" type="date" min={today()} value={startDate} onChange={(event) => setStartDate(event.target.value)} /><Input label="End date" id="end-date" type="date" min={startDate || today()} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></div><fieldset><legend className="text-sm font-medium text-slate-700">Campaign venues</legend><input aria-label="Search venues" placeholder="Search venues" value={venueSearch} onChange={(event) => setVenueSearch(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100" /><div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-slate-200">{filteredVenues.length === 0 ? <p className="p-4 text-sm text-slate-500">No matching venues.</p> : filteredVenues.map((venue) => <label key={venue.venueID} className="flex cursor-pointer items-start gap-3 border-b border-slate-100 p-3 last:border-0 hover:bg-slate-50"><input type="checkbox" checked={selectedVenueIds.includes(venue.venueID)} onChange={() => toggleVenue(venue.venueID)} className="mt-1 accent-red-700" /><span><span className="block text-sm font-medium text-slate-900">{venue.name}</span><span className="block text-xs text-slate-500">{venue.address}</span></span></label>)}</div></fieldset><Button type="submit" disabled={submitting}>{submitting ? 'Submitting campaign...' : 'Submit campaign'}</Button></form></Card><section><h2 className="text-xl font-bold text-slate-950">Campaign history</h2><div className="mt-4 space-y-4">{campaigns.length === 0 ? <EmptyState title="No campaigns yet" description="Create your first campaign above." /> : campaigns.map((campaign) => <Card key={campaign.campID}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h3 className="font-semibold text-slate-950">{campaign.name}</h3><p className="mt-1 text-sm text-slate-500">{campaign.startDate} to {campaign.endDate}</p></div><StatusBadge status={campaign.status} /></div><div className="mt-4 flex flex-wrap gap-2">{campaign.venueSet.length === 0 ? <span className="text-sm text-slate-500">No venues assigned.</span> : campaign.venueSet.map((venue) => <span key={venue.venueID} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{venue.name}</span>)}</div></Card>)}</div></section></div>
}