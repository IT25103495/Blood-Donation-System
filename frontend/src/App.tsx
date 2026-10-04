import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AppointmentsPage } from './pages/donor/AppointmentsPage'
import { BookAppointmentPage } from './pages/donor/BookAppointmentPage'
import { ComingSoonPage } from './pages/donor/ComingSoonPage'
import { DonorDashboardPage } from './pages/donor/DonorDashboardPage'
import { EligibilityPage } from './pages/EligibilityPage'
import { HomePage } from './pages/HomePage'
import { HosterPage } from './pages/hoster/HosterPage'
import { HospitalPage } from './pages/hospital/HospitalPage'
import { AppointmentsAdminPage, InventoryAdminPage, RequestsAdminPage } from './pages/admin/AdminDataPages'
import { BankEditPage, BanksAdminPage } from './pages/admin/BanksPage'
import { VenueEditPage, VenuesAdminPage } from './pages/admin/VenuesPage'
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage'
import { CampaignEditPage, CampaignsAdminPage } from './pages/admin/CampaignsPage'
import { UsersPage } from './pages/admin/UsersPage'
import { CampaignApprovalsPage } from './pages/admin/CampaignApprovalsPage'
import { RequestApprovalsPage } from './pages/admin/RequestApprovalsPage'
import { StaffPage } from './pages/staff/StaffPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForbiddenPage, NotFoundPage } from './pages/StatusPages'
import { ProtectedRoute, PublicOnlyRoute, dashboardFor } from './routes/ProtectedRoute'
import './App.css'

const AppLayout = lazy(() => import('./layouts/AppLayout').then((module) => ({ default: module.AppLayout })))
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })))
const PublicLayout = lazy(() => import('./layouts/PublicLayout').then((module) => ({ default: module.PublicLayout })))
const PageContainer = lazy(() => import('./layouts/PageContainer').then((module) => ({ default: module.PageContainer })))

const Placeholder = ({ title, description }: { title: string; description: string }) => <section className="space-y-2"><p className="eyebrow">Blood donation system</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1><p className="max-w-xl text-slate-600">{description}</p></section>
function BookRedirect() { const { role } = useAuth(); return <Navigate to={role === 'DONOR' ? '/donor/book' : '/login'} replace /> }
function DashboardRedirect() { const { role, adminType } = useAuth(); return role ? <Navigate to={dashboardFor(role, adminType)} replace /> : <Navigate to="/login" replace /> }
const LayoutFallback = () => <div className="min-h-screen bg-slate-50 p-8"><div className="mx-auto h-10 max-w-6xl animate-pulse rounded bg-slate-200" /></div>

function AppRoutes() {
  return <BrowserRouter><Routes>
    {/* Sign-in and registration bring their own full-page layout, so they sit outside the site chrome. */}
    <Route element={<PublicOnlyRoute />}>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
    </Route>

    <Route element={<Suspense fallback={<LayoutFallback />}><PublicLayout /></Suspense>}>
      <Route index element={<HomePage />} />
      <Route path="eligibility" element={<EligibilityPage />} />
      <Route path="book" element={<BookRedirect />} />
      <Route path="403" element={<ForbiddenPage />} />
      <Route path="404" element={<NotFoundPage />} />

      {/* Donor and hoster stay on the same site chrome as the home page (no sidebar dashboard). */}
      <Route element={<ProtectedRoute allowedRoles={['DONOR']} />}>
        <Route element={<Suspense fallback={<LayoutFallback />}><PageContainer /></Suspense>}>
          <Route path="donor" element={<DonorDashboardPage />} />
          <Route path="donor/book" element={<BookAppointmentPage />} />
          <Route path="donor/appointments" element={<AppointmentsPage />} />
          <Route path="donor/profile" element={<ComingSoonPage title="Profile" />} />
          <Route path="donor/password" element={<ComingSoonPage title="Change password" />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['HOSTER']} />}>
        <Route element={<Suspense fallback={<LayoutFallback />}><PageContainer /></Suspense>}>
          <Route path="hoster" element={<HosterPage />} />
        </Route>
      </Route>
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="dashboard" element={<DashboardRedirect />} />
      <Route element={<ProtectedRoute allowedRoles={['HOSPITAL']} />}><Route element={<Suspense fallback={<LayoutFallback />}><AppLayout /></Suspense>}><Route path="hospital" element={<HospitalPage />} /></Route></Route>
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} allowedAdminTypes={['DOCTOR']} />}><Route element={<Suspense fallback={<LayoutFallback />}><AppLayout /></Suspense>}><Route path="staff" element={<StaffPage />} /></Route></Route>
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} allowedAdminTypes={['MANAGER', 'SYSADMIN']} />}><Route element={<Suspense fallback={<LayoutFallback />}><AdminLayout /></Suspense>}>
        <Route path="admin" element={<AdminOverviewPage />} />
        {/* A manager handles blood requests and the stock behind them. */}
        <Route path="admin/approvals/requests" element={<RequestApprovalsPage />} />
        <Route path="admin/requests" element={<RequestsAdminPage />} />
        <Route path="admin/banks" element={<BanksAdminPage />} />
        <Route path="admin/banks/:bankID" element={<BankEditPage />} />
        <Route path="admin/inventory" element={<InventoryAdminPage />} />
        {/* Everything else is the sysadmin's; the backend turns a manager away from these too. */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} allowedAdminTypes={['SYSADMIN']} />}>
          <Route path="admin/approvals/campaigns" element={<CampaignApprovalsPage />} />
          <Route path="admin/campaigns" element={<CampaignsAdminPage />} />
          <Route path="admin/campaigns/:campID" element={<CampaignEditPage />} />
          <Route path="admin/venues" element={<VenuesAdminPage />} />
          <Route path="admin/venues/:venueID" element={<VenueEditPage />} />
          <Route path="admin/appointments" element={<AppointmentsAdminPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          {/* Hospitals and admins are two tabs on the users page now; keep the old links working. */}
          <Route path="admin/hospitals" element={<Navigate to="/admin/users" replace />} />
          <Route path="admin/admins" element={<Navigate to="/admin/users" replace />} />
        </Route>
      </Route></Route>
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HOSPITAL']} />}><Route element={<Suspense fallback={<LayoutFallback />}><AppLayout /></Suspense>}>
        <Route path="appointments" element={<Placeholder title="Appointments" description="Manage donation appointments and upcoming campaigns." />} />
        <Route path="campaigns" element={<Placeholder title="Campaigns" description="Review donation campaigns and their venues." />} />
        <Route path="requests" element={<Placeholder title="Requests" description="Review blood requests." />} />
        <Route path="inventory" element={<Placeholder title="Inventory" description="Monitor blood inventory." />} />
        <Route path="settings" element={<Placeholder title="Settings" description="Manage account settings." />} />
      </Route></Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></BrowserRouter>
}

export default function App() { return <ToastProvider><AuthProvider><AppRoutes /></AuthProvider></ToastProvider> }
