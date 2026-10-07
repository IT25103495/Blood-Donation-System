import { ArrowRight, Calendar, UserPlus, Droplets, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookableCampaigns, campaignsApi, getErrorMessage } from '../api'
import type { Campaign } from '../types/api'
import { CampaignList } from '../components/CampaignList'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Skeleton } from '../components/Skeleton'

export function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => { 
    setLoading(true); 
    setError(null); 
    campaignsApi.getPublic()
      .then((items) => setCampaigns(bookableCampaigns(items)))
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false)) 
  }
  
  useEffect(load, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-50 blur-3xl"></div>
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="app-title text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl mb-6">
              Give Blood. <span className="text-red-700">Save Lives.</span>
            </h1>
            <p className="text-lg leading-8 text-slate-600 mb-10">
              Welcome to the Blood Donation Management System. Find upcoming blood donation campaigns near you and easily book your appointment online to help those in need.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/book" className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-red-700 px-8 py-3.5 font-semibold text-white transition-all hover:bg-red-800 hover:-translate-y-0.5 shadow-md hover:shadow-lg">
                View Campaigns
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link to="/register" className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border-2 border-slate-200 px-8 py-3.5 font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
                Register as Donor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Campaigns Section */}
      <section className="bg-slate-50 py-20 border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="app-title text-3xl font-bold text-slate-950">Upcoming Campaigns</h2>
              <p className="mt-2 text-slate-600">Browse and book an appointment at an active donation drive.</p>
            </div>
            <Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors" to="/book">
              See all <ArrowRight size={16} />
            </Link>
          </div>
          
          <div>
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-44 rounded-xl" />
                <Skeleton className="h-44 rounded-xl" />
              </div>
            ) : error ? (
              <ErrorState message={error} retry={load} />
            ) : campaigns.length === 0 ? (
              <EmptyState title="No campaigns available" description="There are currently no upcoming campaigns. Please check back later." />
            ) : (
              <CampaignList campaigns={campaigns} />
            )}
          </div>
        </div>
      </section>

      {/* How it Works (System Workflow) */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="app-title text-3xl font-bold text-slate-950">How the System Works</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Our platform makes it simple to manage your blood donation journey from registration to your actual appointment.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-slate-100 -z-10"></div>
            
            <div className="bg-white p-6 rounded-2xl text-center border border-slate-100 shadow-sm relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700 mb-6 border border-red-100 shadow-sm">
                <UserPlus size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. Register Account</h3>
              <p className="text-slate-600 text-sm">Create an account with your basic details and medical information to verify your eligibility.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl text-center border border-slate-100 shadow-sm relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700 mb-6 border border-red-100 shadow-sm">
                <Calendar size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. Book Appointment</h3>
              <p className="text-slate-600 text-sm">Browse approved campaigns near you and select a convenient time slot and venue.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl text-center border border-slate-100 shadow-sm relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700 mb-6 border border-red-100 shadow-sm">
                <Droplets size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">3. Donate Blood</h3>
              <p className="text-slate-600 text-sm">Visit the venue at your scheduled time. The system will track your donation history.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Requirements */}
      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:flex lg:items-center lg:justify-between gap-12">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h2 className="app-title text-3xl font-bold text-white mb-4">Basic Eligibility</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Before booking an appointment, please ensure you meet the general requirements for blood donation. 
              Our system will also verify these details during registration.
            </p>
            <div className="mt-8">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600">
                Register Now
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <ul className="space-y-4">
              {[
                'Must be at least 17 years old',
                'Weigh at least 110 lbs (50 kg)',
                'Be in general good health and feeling well',
                'Have not donated blood in the last 56 days'
              ].map((req, i) => (
                <li key={i} className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                  <span className="font-medium">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
