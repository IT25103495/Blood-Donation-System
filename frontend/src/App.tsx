import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AppLayout } from './layouts/AppLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { DonorLayout } from './layouts/DonorLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { AppointmentsPage } from './pages/donor/AppointmentsPage'
import { BookAppointmentPage } from './pages/donor/BookAppointmentPage'
import { ComingSoonPage } from './pages/donor/ComingSoonPage'
import { DonorDashboardPage } from './pages/donor/DonorDashboardPage'
import { EligibilityPage } from './pages/EligibilityPage'
import { HomePage } from './pages/HomePage'
import { HosterPage } from './pages/hoster/HosterPage'
import { HospitalPage } from './pages/hospital/HospitalPage'
import { AdminsAdminPage, AppointmentsAdminPage, BanksAdminPage, CampaignsAdminPage, HospitalsAdminPage, InventoryAdminPage, VenuesAdminPage } from './pages/admin/AdminDataPages'
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage'
import { ApprovalsPage } from './pages/admin/ApprovalsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForbiddenPage, NotFoundPage } from './pages/StatusPages'
import { ProtectedRoute, PublicOnlyRoute, dashboardFor } from './routes/ProtectedRoute'
import './App.css'

const Placeholder = ({ title, description }: { title: string; description: string }) => <section className="space-y-2"><p className="eyebrow">Blood donation system</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1><p className="max-w-xl text-slate-600">{description}</p></section>
function BookRedirect() { const { role } = useAuth(); return <Navigate to={role === 'DONOR' ? '/donor/book' : '/login'} replace /> }
function DashboardRedirect() { const { role, adminType } = useAuth(); return role ? <Navigate to={dashboardFor(role, adminType)} replace /> : <Navigate to="/login" replace /> }

function AppRoutes() {
  return <BrowserRouter><Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="eligibility" element={<EligibilityPage />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      <Route path="book" element={<BookRedirect />} />
      <Route path="403" element={<ForbiddenPage />} />
      <Route path="404" element={<NotFoundPage />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route path="dashboard" element={<DashboardRedirect />} />
      <Route element={<ProtectedRoute allowedRoles={['DONOR']} />}>
        <Route element={<DonorLayout />}>
          <Route path="donor" element={<DonorDashboardPage />} />
          <Route path="donor/book" element={<BookAppointmentPage />} />
          <Route path="donor/appointments" element={<AppointmentsPage />} />
          <Route path="donor/profile" element={<ComingSoonPage title="Profile" />} />
          <Route path="donor/password" element={<ComingSoonPage title="Change password" />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['HOSTER']} />}><Route element={<AppLayout />}><Route path="hoster" element={<HosterPage />} /></Route></Route>
      <Route element={<ProtectedRoute allowedRoles={['HOSPITAL']} />}><Route element={<AppLayout />}><Route path="hospital" element={<HospitalPage />} /></Route></Route>
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} allowedAdminTypes={['DOCTOR']} />}><Route element={<AppLayout />}><Route path="staff" element={<Placeholder title="Staff workspace" description="Staff operations will appear here." />} /></Route></Route>
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} allowedAdminTypes={['MANAGER', 'SYSADMIN']} />}><Route element={<AdminLayout />}>
        <Route path="admin" element={<AdminOverviewPage />} />
        <Route path="admin/approvals" element={<ApprovalsPage />} />
        <Route path="admin/campaigns" element={<CampaignsAdminPage />} />
        <Route path="admin/venues" element={<VenuesAdminPage />} />
        <Route path="admin/banks" element={<BanksAdminPage />} />
        <Route path="admin/appointments" element={<AppointmentsAdminPage />} />
        <Route path="admin/inventory" element={<InventoryAdminPage />} />
        <Route path="admin/hospitals" element={<HospitalsAdminPage />} />
        <Route path="admin/admins" element={<AdminsAdminPage />} />
      </Route></Route>
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HOSTER', 'HOSPITAL']} />}><Route element={<AppLayout />}>
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
