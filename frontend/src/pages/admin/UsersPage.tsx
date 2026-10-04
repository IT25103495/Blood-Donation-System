import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { authApi, getErrorMessage } from '../../api'
import { Button } from '../../components/Button'
import { DataTable, type TableColumn } from '../../components/DataTable'
import { ErrorState } from '../../components/ErrorState'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { BLOOD_TYPES } from '../../utils/constants'
import type { Admin, AdminType, Donor, Hospital, Hoster, UserType } from '../../types/api'

const TABS: { type: UserType; label: string }[] = [
  { type: 'DONOR', label: 'Donors' },
  { type: 'HOSTER', label: 'Hosts' },
  { type: 'HOSPITAL', label: 'Hospitals' },
  { type: 'ADMIN', label: 'Admins' },
]
const ADMIN_TYPES: AdminType[] = ['DOCTOR', 'MANAGER', 'SYSADMIN']
const SINGULAR: Record<UserType, string> = { DONOR: 'donor', HOSTER: 'host', HOSPITAL: 'hospital', ADMIN: 'admin' }

// One row shape for the table, whatever kind of account it came from. `label` is the account's
// human name, so search and the first column work the same way for every type.
// `undeletable` covers sysadmins: they are the only accounts that can manage other admins, so the
// backend refuses to delete one and the button is disabled rather than offering a guaranteed error.
type Row = { id: number; type: UserType; label: string; username: string; phoneNum: string; detail: string; undeletable?: boolean; source: Donor | Hoster | Hospital | Admin }

function donorRow(donor: Donor): Row {
  return { id: donor.id, type: 'DONOR', label: `${donor.f_Name ?? ''} ${donor.l_Name ?? ''}`.trim() || 'Unnamed donor', username: donor.username, phoneNum: donor.phoneNum, detail: donor.bloodType, source: donor }
}
function hosterRow(hoster: Hoster): Row {
  return { id: hoster.id, type: 'HOSTER', label: hoster.orgName, username: hoster.username, phoneNum: hoster.phoneNum, detail: '', source: hoster }
}
function hospitalRow(hospital: Hospital): Row {
  return { id: hospital.id, type: 'HOSPITAL', label: hospital.hospitalName, username: hospital.username, phoneNum: hospital.phoneNum, detail: hospital.address, source: hospital }
}
function adminRow(admin: Admin): Row {
  return { id: admin.id, type: 'ADMIN', label: admin.username, username: admin.username, phoneNum: admin.phoneNum, detail: admin.type, undeletable: admin.type === 'SYSADMIN', source: admin }
}

// Column three changes meaning per tab; the rest is the same for everyone.
const DETAIL_HEADER: Record<UserType, string> = { DONOR: 'Blood type', HOSTER: '', HOSPITAL: 'Address', ADMIN: 'Role' }

export function UsersPage() {
  const { adminType, userId } = useAuth()
  const { showToast } = useToast()
  const [tab, setTab] = useState<UserType>('DONOR')
  const [rows, setRows] = useState<Record<UserType, Row[]>>({ DONOR: [], HOSTER: [], HOSPITAL: [], ADMIN: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)

  // Only a sysadmin may create or remove administrator accounts, matching the backend's own split.
  const isSysadmin = adminType === 'SYSADMIN'

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([authApi.getDonors(), authApi.getHosters(), authApi.getHospitals(), authApi.getAdmins()])
      .then(([donors, hosters, hospitals, admins]) => setRows({
        DONOR: donors.map(donorRow),
        HOSTER: hosters.map(hosterRow),
        HOSPITAL: hospitals.map(hospitalRow),
        ADMIN: admins.map(adminRow),
      }))
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const remove = async (row: Row) => {
    if (row.undeletable) return showToast('Sysadmin accounts cannot be deleted. Change the role first if the account has to go.', 'error')
    if (row.type === 'ADMIN' && row.id === userId) return showToast('You cannot delete the account you are signed in with.', 'error')
    if (!window.confirm(`Delete the ${SINGULAR[row.type]} account "${row.label}"? This cannot be undone.`)) return
    try { await authApi.deleteUser(row.type, row.id); showToast('Account deleted.'); load() }
    catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }

  const columns: TableColumn<Row>[] = useMemo(() => {
    const base: TableColumn<Row>[] = [
      { key: 'label', header: tab === 'ADMIN' ? 'Administrator' : 'Name', render: (row) => row.label },
      { key: 'username', header: 'Username', render: (row) => row.username },
    ]
    if (DETAIL_HEADER[tab]) base.push({ key: 'detail', header: DETAIL_HEADER[tab], render: (row) => row.detail })
    base.push({ key: 'phone', header: 'Phone', render: (row) => row.phoneNum })
    return base
  }, [tab])

  if (loading) return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-64" /></div>
  if (error) return <ErrorState message={error} retry={load} />
  const canManage = tab !== 'ADMIN' || isSysadmin
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">Administration</p>
        <h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Users</h1>
        <p className="mt-2 text-slate-600">Every account in the system, grouped by what it is used for.</p>
      </div>
      {canManage && <Button type="button" onClick={() => setCreating(true)} className="inline-flex shrink-0 items-center gap-2"><Plus size={16} />Add {SINGULAR[tab]}</Button>}
    </div>

    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Account type">
      {TABS.map(({ type, label }) => <button key={type} type="button" role="tab" aria-selected={tab === type} onClick={() => setTab(type)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === type ? 'bg-red-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-950'}`}>{label} ({rows[type].length})</button>)}
    </div>

    {tab === 'ADMIN' && !isSysadmin && <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Administrator accounts can only be added, edited, or removed by a sysadmin.</p>}

    <DataTable
      rows={rows[tab]}
      columns={columns}
      getRowKey={(row) => `${row.type}-${row.id}`}
      searchPlaceholder={`Search ${TABS.find((item) => item.type === tab)?.label.toLowerCase()}`}
      emptyMessage="No accounts of this kind yet."
      actions={(row) => <div className="flex justify-end gap-3">
        <button type="button" disabled={!canManage} onClick={() => setEditing(row)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40">Edit</button>
        <button type="button" disabled={!canManage || row.undeletable} title={row.undeletable ? 'Sysadmin accounts cannot be deleted' : undefined} onClick={() => remove(row)} className="text-xs font-semibold text-red-700 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40">Delete</button>
      </div>}
    />

    <CreateUserDialog open={creating} type={tab} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load() }} />
    <EditUserDialog row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
  </div>
}

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */

type AccountFields = { username: string; email: string; password: string; phoneNum: string; firstName: string; lastName: string; nic: string; bloodType: string; dob: string; orgName: string; hospitalName: string; address: string; adminRole: AdminType }
const blankAccount: AccountFields = { username: '', email: '', password: '', phoneNum: '', firstName: '', lastName: '', nic: '', bloodType: '', dob: '', orgName: '', hospitalName: '', address: '', adminRole: 'DOCTOR' }

function CreateUserDialog({ open, type, onClose, onCreated }: { open: boolean; type: UserType; onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast()
  const [form, setForm] = useState<AccountFields>(blankAccount)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (key: keyof AccountFields) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }))

  useEffect(() => { if (open) { setForm(blankAccount); setFormError(null) } }, [open, type])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!form.username.trim() || !form.password || !form.email.trim() || !form.phoneNum.trim()) return setFormError('Username, email, phone, and password are all required.')
    if (type === 'DONOR' && (!form.firstName.trim() || !form.lastName.trim() || !form.nic.trim() || !form.bloodType || !form.dob)) return setFormError('Fill in the donor name, NIC, blood type, and date of birth.')
    if (type === 'HOSTER' && !form.orgName.trim()) return setFormError('Enter the organization name.')
    if (type === 'HOSPITAL' && (!form.hospitalName.trim() || !form.address.trim())) return setFormError('Enter the hospital name and address.')
    const common = { email: form.email.trim(), phoneNum: form.phoneNum.trim(), username: form.username.trim(), password: form.password }
    setSaving(true)
    try {
      if (type === 'DONOR') await authApi.registerDonor({ ...common, f_Name: form.firstName.trim(), l_Name: form.lastName.trim(), nic: form.nic.trim(), bloodType: form.bloodType, dob: form.dob })
      else if (type === 'HOSTER') await authApi.registerHoster({ ...common, orgName: form.orgName.trim() })
      else if (type === 'HOSPITAL') await authApi.registerHospital({ ...common, hospitalName: form.hospitalName.trim(), address: form.address.trim() })
      else await authApi.registerAdmin({ ...common, type: form.adminRole })
      showToast('Account created.')
      onCreated()
    } catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Modal open={open} title={`Add ${SINGULAR[type]}`} description="The account can sign in as soon as it is created." onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      {type === 'DONOR' && <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" id="new-first-name" value={form.firstName} onChange={set('firstName')} />
          <Input label="Last name" id="new-last-name" value={form.lastName} onChange={set('lastName')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="NIC" id="new-nic" value={form.nic} onChange={set('nic')} />
          <Select label="Blood type" id="new-blood-type" value={form.bloodType} onChange={set('bloodType')}>
            <option value="">Select type</option>
            {BLOOD_TYPES.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </div>
        <Input label="Date of birth" id="new-dob" type="date" value={form.dob} onChange={set('dob')} />
      </>}
      {type === 'HOSTER' && <Input label="Organization" id="new-org-name" value={form.orgName} onChange={set('orgName')} />}
      {type === 'HOSPITAL' && <>
        <Input label="Hospital name" id="new-hospital-name" value={form.hospitalName} onChange={set('hospitalName')} />
        <Input label="Address" id="new-hospital-address" value={form.address} onChange={set('address')} />
      </>}
      {type === 'ADMIN' && <Select label="Role" id="new-admin-role" value={form.adminRole} onChange={set('adminRole')}>{ADMIN_TYPES.map((item) => <option key={item}>{item}</option>)}</Select>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" id="new-email" type="email" value={form.email} onChange={set('email')} />
        <Input label="Phone" id="new-phone" value={form.phoneNum} onChange={set('phoneNum')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Username" id="new-username" value={form.username} onChange={set('username')} />
        <Input label="Password" id="new-password" type="password" value={form.password} onChange={set('password')} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" className="bg-slate-600 hover:bg-slate-700" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create account'}</Button>
      </div>
    </form>
  </Modal>
}

/* ------------------------------------------------------------------ */
/* Edit                                                                */
/* ------------------------------------------------------------------ */

function EditUserDialog({ row, onClose, onSaved }: { row: Row | null; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast()
  const [form, setForm] = useState<AccountFields>(blankAccount)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (key: keyof AccountFields) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }))

  // Email is not part of any account listing, so it starts blank and is only sent if filled in.
  useEffect(() => {
    if (!row) return
    const donor = row.type === 'DONOR' ? (row.source as Donor) : null
    setForm({
      ...blankAccount,
      username: row.username ?? '',
      phoneNum: row.phoneNum ?? '',
      firstName: donor?.f_Name ?? '',
      lastName: donor?.l_Name ?? '',
      nic: donor?.nic ?? '',
      bloodType: donor?.bloodType ?? '',
      dob: donor?.dob ?? '',
      orgName: row.type === 'HOSTER' ? (row.source as Hoster).orgName ?? '' : '',
      hospitalName: row.type === 'HOSPITAL' ? (row.source as Hospital).hospitalName ?? '' : '',
      address: row.type === 'HOSPITAL' ? (row.source as Hospital).address ?? '' : '',
    })
    setFormError(null)
  }, [row])

  if (!row) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    // Anything left empty is simply not sent, and the backend keeps whatever it already had.
    // The username goes only when it actually changed: the backend rejects any username that is
    // already registered without exempting this account, so resending the current one is a conflict.
    const nextUsername = form.username.trim()
    const common = { id: row.id, username: nextUsername && nextUsername !== row.username ? nextUsername : undefined, phoneNum: form.phoneNum.trim() || undefined, email: form.email.trim() || undefined, password: form.password || undefined }
    setSaving(true)
    try {
      if (row.type === 'DONOR') await authApi.editDonor({ ...common, f_Name: form.firstName.trim() || undefined, l_Name: form.lastName.trim() || undefined, nic: form.nic.trim() || undefined, bloodType: form.bloodType || undefined, dob: form.dob || undefined })
      else if (row.type === 'HOSTER') await authApi.editHoster({ ...common, orgName: form.orgName.trim() || undefined })
      else if (row.type === 'HOSPITAL') await authApi.editHospital({ ...common, hospitalName: form.hospitalName.trim() || undefined, address: form.address.trim() || undefined })
      else await authApi.editAdmin(common)
      showToast('Account updated.')
      onSaved()
    } catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Modal open title={`Edit ${SINGULAR[row.type]}`} description="Leave a field blank to keep what the account already has." onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      {row.type === 'DONOR' && <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" id="edit-first-name" value={form.firstName} onChange={set('firstName')} />
          <Input label="Last name" id="edit-last-name" value={form.lastName} onChange={set('lastName')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="NIC" id="edit-nic" value={form.nic} onChange={set('nic')} />
          <Select label="Blood type" id="edit-blood-type" value={form.bloodType} onChange={set('bloodType')}>
            <option value="">Keep current</option>
            {BLOOD_TYPES.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </div>
        <Input label="Date of birth" id="edit-dob" type="date" value={form.dob} onChange={set('dob')} />
      </>}
      {row.type === 'HOSTER' && <Input label="Organization" id="edit-org-name" value={form.orgName} onChange={set('orgName')} />}
      {row.type === 'HOSPITAL' && <>
        <Input label="Hospital name" id="edit-hospital-name" value={form.hospitalName} onChange={set('hospitalName')} />
        <Input label="Address" id="edit-hospital-address" value={form.address} onChange={set('address')} />
      </>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" id="edit-email" type="email" placeholder="Unchanged" value={form.email} onChange={set('email')} />
        <Input label="Phone" id="edit-phone" value={form.phoneNum} onChange={set('phoneNum')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Username" id="edit-username" value={form.username} onChange={set('username')} />
        <Input label="New password" id="edit-password" type="password" placeholder="Unchanged" value={form.password} onChange={set('password')} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" className="bg-slate-600 hover:bg-slate-700" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
      </div>
    </form>
  </Modal>
}
