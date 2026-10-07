import { ArrowRight, HeartHandshake, ShieldCheck, Users, Activity, MapPin, CheckCircle, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 md:pt-24 lg:pt-32 pb-16">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 0.7 }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-red-50 blur-3xl"></motion.div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 0.5 }} transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }} className="absolute top-48 -left-24 h-72 w-72 rounded-full bg-red-100 blur-3xl"></motion.div>
        
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
              Emergency shortage in your area
            </motion.div>
            <motion.h1 variants={fadeUp} className="app-title max-w-xl text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl md:text-7xl leading-[1.1]">
              Give blood.<br/>
              <span className="text-red-700">Save lives.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Your donation can save up to three lives. Find an approved campaign near you and make time for a simple act that has a lasting impact.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/book" className="group inline-flex items-center gap-2 rounded-lg bg-red-700 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-red-800 hover:shadow-lg hover:-translate-y-0.5">
                Find a Drive
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link to="/eligibility" className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-200 px-6 py-3.5 font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50">
                Check Eligibility
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold ${i === 1 ? 'bg-red-100 text-red-700' : 'text-slate-600'}`}>
                    {i === 1 ? <Star size={12} className="fill-current"/> : String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p>Join 10,000+ donors this month</p>
            </motion.div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-red-100 to-red-50 opacity-50 blur-lg"></div>
            <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <HeartHandshake className="text-red-700" size={48} aria-hidden="true" />
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle size={14} /> Verified System
                </span>
              </div>
              <h2 className="app-title text-2xl font-bold text-slate-950 mb-2">Why Donate with Lifeline?</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">Safe, organized donation appointments with the information you need at every step of your journey.</p>
              <ul className="space-y-5">
                <li className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
                    <ShieldCheck size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Trusted campaigns</h3>
                    <p className="text-sm text-slate-500 mt-1">Only medically approved and verified campaigns appear in our system.</p>
                  </div>
                </li>
                <li className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
                    <Users size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Community powered</h3>
                    <p className="text-sm text-slate-500 mt-1">Each appointment directly supports local hospitals and emergency care.</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-950 py-12 text-white overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={staggerContainer} className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center divide-x divide-slate-800">
            <motion.div variants={fadeUp} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-white mb-2">15k+</span>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Donors</span>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-white mb-2">50+</span>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Partner Hospitals</span>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-red-500 mb-2">45k</span>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Lives Impacted</span>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-white mb-2">24/7</span>
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Emergency Support</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Available Campaigns Section */}
      <section className="bg-slate-50 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <motion.div variants={fadeUp} className="max-w-2xl">
              <p className="eyebrow text-red-700">Upcoming opportunities</p>
              <h2 className="app-title mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Available campaigns near you</h2>
              <p className="mt-4 text-lg text-slate-600">Find a convenient location and time to make your donation.</p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors" to="/book">
                View all options <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
          
          <motion.div variants={fadeUp} className="mt-6">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-44 rounded-xl" />
                <Skeleton className="h-44 rounded-xl" />
              </div>
            ) : error ? (
              <ErrorState message={error} retry={load} />
            ) : campaigns.length === 0 ? (
              <EmptyState title="No campaigns are open right now" description="Please check again soon for the next approved donation campaign." />
            ) : (
              <CampaignList campaigns={campaigns} />
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* How it works Section */}
      <section className="bg-white py-24 overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <motion.p variants={fadeUp} className="eyebrow text-red-700">Simple Process</motion.p>
          <motion.h2 variants={fadeUp} className="app-title mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">How donating works</motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">Your donation journey is simple, safe, and fully supported by medical professionals.</motion.p>
          
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { num: '01', icon: Activity, title: 'Check Eligibility', text: 'Review the basic health, age, and timing guidance before choosing to donate.' },
              { num: '02', icon: MapPin, title: 'Book an Appointment', text: 'Choose an approved campaign, select a venue, and pick a time slot that works for you.' },
              { num: '03', icon: HeartHandshake, title: 'Give with Confidence', text: 'Arrive prepared. Our care team will guide you safely through the entire visit.' }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="group relative rounded-2xl border border-slate-100 bg-white p-8 text-left shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-white shadow-lg shadow-red-700/30">
                  <step.icon size={24} />
                </div>
                <div className="mt-6">
                  <span className="text-sm font-bold tracking-widest text-slate-300">STEP {step.num}</span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-50 py-24 border-t border-slate-200">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <motion.h2 variants={fadeUp} className="app-title text-3xl font-bold text-slate-950 sm:text-4xl">Voices of our community</motion.h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3 text-left">
            {[
              { name: 'Sarah M.', role: 'Regular Donor', quote: '"The process was incredibly smooth. The staff made me feel comfortable and I was out in less than an hour knowing I helped someone."' },
              { name: 'James T.', role: 'First-time Donor', quote: '"I was nervous at first, but the app made it so easy to find a local drive and understand the eligibility requirements beforehand."' },
              { name: 'Dr. Emily R.', role: 'Hospital Partner', quote: '"Lifeline has transformed how we manage our blood supply. The predictable flow of donors ensures we are always prepared for emergencies."' }
            ].map((testimonial, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 relative">
                <div className="flex text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} className="fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-6">"{testimonial.quote.replace(/"/g, '')}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-red-700 py-20 text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10"></div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <motion.h2 variants={fadeUp} className="app-title text-3xl font-bold text-white sm:text-4xl">Ready to make a difference?</motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-red-100">Join thousands of donors who are already saving lives in your community.</motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book" className="rounded-lg bg-white px-8 py-4 font-bold text-red-700 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1">
              Book Your Appointment
            </Link>
            <Link to="/register" className="rounded-lg border-2 border-red-500 bg-transparent px-8 py-4 font-bold text-white transition-all hover:bg-red-800">
              Create an Account
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}