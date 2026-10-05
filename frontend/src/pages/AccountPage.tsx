import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { authApi, getErrorMessage } from '../api'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ErrorState } from '../components/ErrorState'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { dashboardFor } from '../routes/ProtectedRoute'
import { BLOOD_TYPES } from '../utils/constants'
import { ageOn } from '../utils/eligibility'
import type { Me } from '../types/api'

const ROLE_LABEL: Record<string, string> = { DONOR: 'Donor', HOSTER: 'Campaign host', HOSPITAL: 'Hospital', ADMIN: 'Administrator' }
const DASHBOARD_LABEL: Record<string, string> = { DONOR: 'My account', HOSTER: 'My campaigns', HOSPITAL: 'Hospital', ADMIN: 'Administration' }
// An admin's record can only be changed by a sysadmin, so their profile stays read-only here.
const EDITABLE_ROLES = ['DONOR', 'HOSTER', 'HOSPITAL']

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || '?'
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return <div>
    <dt className="text-sm text-slate-500">{term}</dt>
    <dd className="mt-1 font-medium text-slate-900">{children}</dd>
  </div>
}

type Fields = { f_Name: string; l_Name: string; nic: string; bloodType: string; dob: string; orgName: string; hospitalName: string; address: string; phoneNum: string; username: string; email: string }
const fieldsOf = (me: Me): Fields => ({
  f_Name: me.f_Name ?? '', l_Name: me.l_Name ?? '', nic: me.nic ?? '', bloodType: me.bloodType ?? '', dob: me.dob ?? '',
  orgName: me.orgName ?? '', hospitalName: me.hospitalName ?? '', address: me.address ?? '',
  phoneNum: me.phoneNum ?? '', username: me.username ?? '', email: me.email ?? '',
})

// One component, mounted under every role's own section. /auth/get/me answers with whichever
// account the token belongs to, so the shared fields always show and the rest depends on the role.
export function AccountPage() {
  const { role, adminType } = useAuth()
  const { showToast } = useToast()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    authApi.getMe().then(setMe).catch((err: unknown) => setError(getErrorMessage(err))).finally(() => setLoading(false))
  }
  useEffect(load, [])

  if (loading) return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-72" /></div>
  if (error || !me) return <ErrorState message={error ?? 'Your account could not be loaded.'} retry={load} />

  const fullName = [me.f_Name, me.l_Name].filter(Boolean).join(' ')
  const displayName = fullName || me.orgName || me.hospitalName || me.username
  const roleLabel = ROLE_LABEL[role ?? ''] ?? 'Account'
  const dashboard = role ? dashboardFor(role, adminType) : '/'
  const canEdit = EDITABLE_ROLES.includes(role ?? '')

  return <div className="space-y-6">
    <div>
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to={dashboard} className="hover:text-slate-900">{DASHBOARD_LABEL[role ?? ''] ?? 'Dashboard'}</Link>
        <span className="px-2" aria-hidden="true">/</span>
        <span className="text-slate-900">Profile</span>
      </nav>
      <h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Profile</h1>
    </div>

    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <Card className="h-fit text-center">
        <span aria-hidden="true" className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-red-700 text-3xl font-bold text-white">{initialsOf(displayName)}</span>
        <p className="mt-4 text-lg font-bold text-slate-950">{displayName}</p>
        <p className="mt-1 text-sm text-slate-500">{roleLabel}</p>
        {adminType && <span className="mt-3 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{adminType}</span>}
      </Card>

      {canEdit
        ? <ProfileForm me={me} role={role as string} onSaved={load} showToast={showToast} />
        : <Card>
            <h2 className="text-xl font-bold text-slate-950">Personal information</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Row term="Username">{me.username}</Row>
              {me.email && <Row term="Email">{me.email}</Row>}
              {me.type && <Row term="Administrator type">{me.type}</Row>}
              <Row term="Phone">{me.phoneNum}</Row>
            </dl>
            <p className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-500">Administrator records can only be changed by a sysadmin.</p>
          </Card>}
    </div>
  </div>
}

function ProfileForm({ me, role, onSaved, showToast }: { me: Me; role: string; onSaved: () => void; showToast: (message: string, tone?: 'success' | 'error') => void }) {
  const [form, setForm] = useState<Fields>(fieldsOf(me))
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (key: keyof Fields) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const reset = () => { setForm(fieldsOf(me)); setFormError(null) }
  useEffect(reset, [me])
  const original = fieldsOf(me)
  const dirty = (Object.keys(form) as (keyof Fields)[]).some((key) => form[key] !== original[key])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!form.username.trim() || !form.email.trim() || !form.phoneNum.trim()) return setFormError('Username, email, and phone are all required.')
    if (role === 'DONOR' && (!form.f_Name.trim() || !form.l_Name.trim() || !form.nic.trim() || !form.bloodType || !form.dob)) return setFormError('Fill in your name, NIC, blood type, and date of birth.')
    if (role === 'HOSTER' && !form.orgName.trim()) return setFormError('Enter your organisation name.')
    if (role === 'HOSPITAL' && (!form.hospitalName.trim() || !form.address.trim())) return setFormError('Enter the hospital name and address.')

    // The username goes only when it actually changed: the backend rejects any username already
    // registered without exempting this account, so resending your own is a conflict.
    const common = {
      id: me.id,
      username: form.username.trim() !== me.username ? form.username.trim() : undefined,
      email: form.email.trim() || undefined,
      phoneNum: form.phoneNum.trim() || undefined,
    }
    setSaving(true)
    try {
      if (role === 'DONOR') await authApi.editDonor({ ...common, f_Name: form.f_Name.trim(), l_Name: form.l_Name.trim(), nic: form.nic.trim(), bloodType: form.bloodType, dob: form.dob })
      else if (role === 'HOSTER') await authApi.editHoster({ ...common, orgName: form.orgName.trim() })
      else await authApi.editHospital({ ...common, hospitalName: form.hospitalName.trim(), address: form.address.trim() })
      showToast('Profile saved.')
      onSaved()
    } catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Card>
    <h2 className="text-xl font-bold text-slate-950">Personal information</h2>
    <form onSubmit={submit} className="mt-5 space-y-5">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}

      {role === 'DONOR' && <>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="First name" id="profile-first-name" value={form.f_Name} onChange={set('f_Name')} />
          <Input label="Last name" id="profile-last-name" value={form.l_Name} onChange={set('l_Name')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="NIC" id="profile-nic" value={form.nic} onChange={set('nic')} />
          <Select label="Blood type" id="profile-blood-type" value={form.bloodType} onChange={set('bloodType')}>
            <option value="">Select type</option>
            {BLOOD_TYPES.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </div>
        <div>
          <Input label="Date of birth" id="profile-dob" type="date" value={form.dob} onChange={set('dob')} />
          {form.dob && <p className="mt-1 text-xs text-slate-500">{ageOn(form.dob)} years old</p>}
        </div>
      </>}

      {role === 'HOSTER' && <Input label="Organisation" id="profile-org-name" value={form.orgName} onChange={set('orgName')} />}

      {role === 'HOSPITAL' && <>
        <Input label="Hospital name" id="profile-hospital-name" value={form.hospitalName} onChange={set('hospitalName')} />
        <Input label="Address" id="profile-address" value={form.address} onChange={set('address')} />
      </>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Email" id="profile-email" type="email" value={form.email} onChange={set('email')} />
        <Input label="Phone" id="profile-phone" value={form.phoneNum} onChange={set('phoneNum')} />
      </div>
      <Input label="Username" id="profile-username" value={form.username} onChange={set('username')} />

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        <Button type="button" className="bg-slate-600 hover:bg-slate-700" disabled={saving || !dirty} onClick={reset}>Cancel</Button>
        <Button type="submit" disabled={saving || !dirty}>{saving ? 'Saving...' : 'Save changes'}</Button>
      </div>
      {/* Passwords are deliberately not here: changing one needs confirming it twice, which belongs
          on its own page rather than mixed in with the details above. */}
      <p className="text-sm text-slate-500">Changing your password is not available here yet.</p>
    </form>
  </Card>
}
