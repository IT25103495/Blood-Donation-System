import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CalendarClock, ClipboardList, Package, Droplets, Activity } from 'lucide-react'
import { appointmentsApi, campaignsApi, getErrorMessage, inventoryApi, requestsApi } from '../../api'
import { Card } from '../../components/Card'
import { ErrorState } from '../../components/ErrorState'
import { Skeleton } from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { BLOOD_TYPES } from '../../utils/constants'
import { countAvailableByType } from '../../utils/bloodTypes'
import type { Appointment, BloodRequest, Campaign, InventoryItem } from '../../types/api'

const today = () => new Date().toISOString().slice(0, 10)
// A blood type counts as "low stock" once the bank has fewer than this many available units.
const LOW_STOCK_THRESHOLD = 5

function StatCard({ to, label, value, tone, icon: Icon }: { to: string; label: string; value: number; tone?: 'warn', icon: React.ElementType }) {
  return (
    <Link to={to} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-red-200 hover:shadow-md hover:-translate-y-1">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${tone === 'warn' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
      <div className="flex items-center justify-between relative z-10">
        <span className="text-sm font-bold tracking-wide text-slate-500 uppercase">{label}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === 'warn' && value > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500'}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className={`mt-4 text-4xl font-black relative z-10 ${tone === 'warn' && value > 0 ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
    </Link>
  )
}

export function AdminOverviewPage() {
  const { adminType } = useAuth()
  const isManager = adminType === 'MANAGER'
  const [data, setData] = useState<{ campaigns: Campaign[]; requests: BloodRequest[]; appointments: Appointment[]; inventory: InventoryItem[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      isManager ? Promise.resolve<Campaign[]>([]) : campaignsApi.getAll(),
      requestsApi.getAll(),
      isManager ? Promise.resolve<Appointment[]>([]) : appointmentsApi.getAll(),
      inventoryApi.getAvailable(),
    ])
      .then(([campaigns, requests, appointments, inventory]) => setData({ campaigns, requests, appointments, inventory }))
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [isManager])

  if (loading) return (
    <div className="space-y-8">
      <Skeleton className="h-16 w-1/3 rounded-xl" />
      <div className="grid gap-6 md:grid-cols-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
  
  if (error || !data) return <ErrorState message={error ?? 'Could not load the admin overview.'} retry={load} />

  const stock = countAvailableByType(data.inventory)
  const maxStock = Math.max(1, ...BLOOD_TYPES.map((type) => stock[type]))
  const lowStockCount = BLOOD_TYPES.filter((type) => stock[type] < LOW_STOCK_THRESHOLD).length
  
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-red-700">Administration</p>
          <h1 className="app-title mt-2 text-4xl font-extrabold text-slate-950">Overview</h1>
          <p className="mt-2 text-lg text-slate-600">{isManager ? 'Blood requests and the stock behind them.' : 'A quick view of today’s donation operations.'}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm border border-slate-200">
          <Activity size={16} className="text-green-500 animate-pulse" /> Live Status
        </div>
      </div>

      <div className={`grid gap-6 ${isManager ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
        {!isManager && <StatCard to="/admin/approvals/campaigns" label="Pending campaigns" value={data.campaigns.filter((item) => item.status === 'PENDING').length} icon={ClipboardList} />}
        <StatCard to="/admin/approvals/requests" label="Pending requests" value={data.requests.filter((item) => item.status === 'PENDING').length} icon={AlertCircle} tone={data.requests.filter((item) => item.status === 'PENDING').length > 0 ? 'warn' : undefined} />
        {!isManager && <StatCard to="/admin/appointments" label="Today’s appointments" value={data.appointments.filter((item) => item.date === today()).length} icon={CalendarClock} />}
        <StatCard to="/admin/inventory" label="Low-stock types" value={lowStockCount} tone="warn" icon={Package} />
      </div>

      <Card className="p-8 border border-slate-100 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 flex items-center gap-3">
              <Droplets className="text-red-700" size={28} />
              Available stock
            </h2>
            <p className="mt-2 text-slate-500">{data.inventory.length} available unit{data.inventory.length === 1 ? '' : 's'} across all banks.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
            {adminType}
          </span>
        </div>
        
        <div className="mt-8 space-y-5">
          {BLOOD_TYPES.map((type) => {
            const isLow = stock[type] < LOW_STOCK_THRESHOLD;
            const percentage = Math.max(2, (stock[type] / maxStock) * 100);
            
            return (
              <div key={type} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-4 text-sm group">
                <span className="font-bold text-slate-700 text-right">{type}</span>
                <div className="relative h-6 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div 
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2 ${
                      isLow 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                        : 'bg-gradient-to-r from-red-600 to-red-700'
                    }`} 
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 10 && <div className="h-full w-full bg-[linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-50"></div>}
                  </div>
                </div>
                <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-700'}`}>{stock[type]}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}