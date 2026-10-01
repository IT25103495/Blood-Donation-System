import { useEffect, useState } from 'react'
import { campaignsApi, getErrorMessage } from '../../api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { StatusBadge } from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import type { Campaign } from '../../types/api'

export function CampaignApprovalsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const load = () => { setLoading(true); campaignsApi.getAll().then((items) => setCampaigns(items.filter((item) => item.status === 'PENDING'))).catch((err: unknown) => setError(getErrorMessage(err))).finally(() => setLoading(false)) }
  useEffect(load, [])
  const campaignStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => { try { await campaignsApi.setStatus(id, status); showToast(`Campaign ${status.toLowerCase()}.`); load() } catch (err: unknown) { showToast(getErrorMessage(err), 'error') } }
  if (loading) return <div className="space-y-5"><div className="h-12 w-64 animate-pulse rounded bg-slate-200" /><div className="h-72 animate-pulse rounded bg-slate-200" /></div>
  if (error) return <ErrorState message={error} retry={load} />
  return <div className="space-y-6">
    <div><p className="eyebrow">Review queue</p><h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Campaign approvals</h1><p className="mt-2 text-slate-600">Review donation campaigns waiting for a decision.</p></div>
    <div className="space-y-4">{campaigns.length === 0 ? <EmptyState title="No campaigns need approval" description="Pending campaigns will appear here." /> : campaigns.map((campaign) => <Card key={campaign.campID}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="font-bold text-slate-950">{campaign.name}</h2><p className="mt-1 text-sm text-slate-500">{campaign.hoster.orgName} · {campaign.startDate} to {campaign.endDate}</p></div><StatusBadge status={campaign.status} /></div><div className="mt-4"><p className="text-sm font-semibold text-slate-700">Venues</p><div className="mt-2 flex flex-wrap gap-2">{campaign.venueSet.map((venue) => <span key={venue.venueID} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{venue.name} · {venue.address}</span>)}</div></div><div className="mt-5 flex gap-2"><Button type="button" onClick={() => campaignStatus(campaign.campID, 'APPROVED')}>Approve campaign</Button><Button type="button" className="bg-slate-600 hover:bg-slate-700" onClick={() => campaignStatus(campaign.campID, 'REJECTED')}>Reject campaign</Button></div></Card>)}</div>
  </div>
}
