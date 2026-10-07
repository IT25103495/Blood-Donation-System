import { Check } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appointmentsApi, bookableCampaigns, campaignsApi, getErrorMessage, venuesApi } from '../../api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { Stepper, WizardNav } from '../../components/Stepper'
import { useAuth } from '../../context/AuthContext'
import { venuesOf } from '../../utils/campaigns'
import { canBook } from '../../utils/eligibility'
import type { Appointment, Campaign, Venue } from '../../types/api'

const steps = ['Campaign', 'Venue', 'Date', 'Review']
const HEADINGS = [
  { title: 'Choose a campaign', description: 'Pick the donation drive you want to take part in.' },
  { title: 'Choose a venue', description: 'Where you would like to donate.' },
  { title: 'Choose a date', description: 'Pick a day inside the campaign window.' },
  { title: 'Review your appointment', description: 'Check the details before you confirm.' },
]

// Selecting a card highlights it; the Next button in the footer is what moves the step on, so the
// way forward is always in the same place and a mis-click is never an accidental advance.
function choice(selected: boolean) {
  return `rounded-lg border p-4 text-left transition ${selected ? 'border-red-700 bg-red-50 ring-1 ring-red-200' : 'border-slate-200 hover:border-red-400 hover:bg-red-50'}`
}

export function BookAppointmentPage() {
  const { userId } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [venue, setVenue] = useState<Venue | null>(null)
  const [date, setDate] = useState('')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  const load = () => {
    if (userId === null) { setLoading(false); setError('Your account ID is missing from the login token. Contact support.'); return }
    setLoading(true)
    Promise.all([campaignsApi.getPublic(), venuesApi.getAll(), appointmentsApi.getForDonor(userId)])
      .then(([publicCampaigns, venueItems, donorAppointments]) => { setCampaigns(bookableCampaigns(publicCampaigns)); setVenues(venueItems); setAppointments(donorAppointments) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [userId])

  const eligibility = canBook(appointments)
  const campaignVenues = useMemo(() => venuesOf(campaign, venues), [campaign, venues])
  const dateRange = useMemo(() => campaign ? { min: campaign.startDate > today ? campaign.startDate : today, max: campaign.endDate } : { min: today, max: today }, [campaign, today])

  // Choosing a different campaign invalidates the venue and date picked under the old one.
  const chooseCampaign = (selected: Campaign) => { if (selected.campID === campaign?.campID) return; setCampaign(selected); setVenue(null); setDate('') }

  const submit = async () => {
    if (!campaign || !venue || !date || userId === null) return
    setSubmitting(true)
    setMessage(null)
    setSubmitError(null)
    try { setMessage(await appointmentsApi.create({ date, campId: campaign.campID, donorID: userId, venueID: venue.venueID })) }
    catch (err: unknown) { setSubmitError(getErrorMessage(err)) }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="space-y-6"><Skeleton className="h-12 w-64" /><Skeleton className="h-96" /></div>
  if (error) return <ErrorState message={error} retry={load} />
  if (!eligibility.eligible) return <Card>
    <p className="eyebrow">Booking unavailable</p>
    <h1 className="app-title mt-3 text-3xl font-bold text-slate-950">You are not eligible to book yet</h1>
    <p className="mt-3 text-slate-600">Your next eligible date is <strong>{eligibility.nextDate?.toLocaleDateString()}</strong>, with {Math.max(0, Math.ceil((eligibility.nextDate!.getTime() - Date.now()) / 86400000))} days remaining.</p>
    <Link className="mt-6 inline-flex font-semibold text-red-700 hover:text-red-800" to="/eligibility">Read the eligibility guide</Link>
  </Card>
  if (message) return <Card>
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700"><Check size={22} /></div>
    <h1 className="app-title mt-5 text-3xl font-bold text-slate-950">Appointment requested</h1>
    <p className="mt-3 text-slate-600">{message}</p>
    <div className="mt-6 flex gap-3">
      <Button type="button" onClick={() => navigate('/donor/appointments')}>View appointments</Button>
      {/*<Button type="button" className="bg-slate-600 hover:bg-slate-700" onClick={reset}>Book another</Button>*/}
    </div>
  </Card>

  // What has to be chosen before the step is allowed to advance.
  const ready = [Boolean(campaign), Boolean(venue), Boolean(date), true][step]
  const heading = HEADINGS[step]
  return <div className="space-y-8">
    <div>
      <p className="eyebrow">Make time to give</p>
      <h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Book an appointment</h1>
      <p className="mt-2 text-slate-600">Choose a campaign, venue, and date that work for you.</p>
    </div>

    <Stepper steps={steps} current={step} onStepSelect={setStep} />

    <Card className="mx-auto w-full max-w-2xl">
      <h2 className="text-xl font-bold text-slate-950">{heading.title}</h2>
      <p className="mt-1 text-sm text-slate-500">{heading.description}</p>

      <div className="mt-5">
        {step === 0 && <div className="grid gap-3">
          {campaigns.length === 0
            ? <EmptyState title="No campaigns are available" description="Check back soon for an approved campaign." />
            : campaigns.map((item) => <button type="button" key={item.campID} aria-pressed={campaign?.campID === item.campID} onClick={() => chooseCampaign(item)} className={choice(campaign?.campID === item.campID)}>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-slate-950">{item.name}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.startDate} to {item.endDate} · {venuesOf(item, venues).length} venue{venuesOf(item, venues).length === 1 ? '' : 's'}</p>
              </button>)}
        </div>}

        {step === 1 && <div className="grid gap-3">
          {campaignVenues.length === 0
            ? <EmptyState title="No venues for this campaign" description="Go back and pick a different campaign." />
            : campaignVenues.map((item) => <button type="button" key={item.venueID} aria-pressed={venue?.venueID === item.venueID} onClick={() => setVenue(item)} className={choice(venue?.venueID === item.venueID)}>
                <p className="font-semibold text-slate-950">{item.name}</p>
                <p className="mt-1 text-sm text-slate-600">{item.address}</p>
              </button>)}
        </div>}

        {step === 2 && <label className="block max-w-sm space-y-2">
          <span className="text-sm font-medium text-slate-700">Donation date</span>
          <input type="date" min={dateRange.min} max={dateRange.max} value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2.5 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100" />
          <span className="block text-xs text-slate-500">Available from {dateRange.min} to {dateRange.max}.</span>
        </label>}

        {step === 3 && campaign && venue && <div>
          <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {[['Campaign', campaign.name], ['Venue', `${venue.name}, ${venue.address}`], ['Date', date]].map(([term, value]) => <div key={term} className="flex flex-col gap-1 p-4 sm:flex-row sm:justify-between">
              <dt className="text-sm text-slate-500">{term}</dt>
              <dd className="font-semibold text-slate-950">{value}</dd>
            </div>)}
          </dl>
          {submitError && <div role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{submitError}</div>}
        </div>}
      </div>

      <WizardNav
        onPrevious={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={step === 3 ? submit : () => setStep(step + 1)}
        nextLabel={step === 3 ? (submitting ? 'Confirming...' : 'Confirm appointment') : 'Next'}
        nextDisabled={!ready}
        busy={submitting}
      />
    </Card>
  </div>
}
