import { useEffect, useState } from 'react'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { authApi, bloodBanksApi, getErrorMessage } from '../../api'
import { Button } from '../../components/Button'
import { ActionMenu } from '../../components/ActionMenu'
import { Card } from '../../components/Card'
import { DataTable,  type TableColumn } from '../../components/DataTable'
import { ErrorState } from '../../components/ErrorState'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { Select } from '../../components/Select'
import { Skeleton } from '../../components/Skeleton'
import { WizardNav } from '../../components/Stepper'
import { useToast } from '../../context/ToastContext'
import type { Admin, Bank } from '../../types/api'

// A bank's manager comes back either as a full object or as a bare id, depending on what else is in
// the response, so read the id off whichever shape arrived.
export function bankManagerId(bank: Bank) {
  const manager = bank.manager as Admin | number | null
  return typeof manager === 'number' ? manager : manager?.id ?? null
}
function bankManagerName(bank: Bank, admins: Admin[]) {
  const id = bankManagerId(bank)
  return admins.find((admin) => admin.id === id)?.username ?? 'Unassigned'
}


function LoadingPage() {
  return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-64" /></div>
}

/* ------------------------------------------------------------------ */
/* Bank list                                                           */
/* ------------------------------------------------------------------ */

export function BanksAdminPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [banks, setBanks] = useState<Bank[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([bloodBanksApi.getAll(), authApi.getAdmins()])
      .then(([bankRows, adminRows]) => { setBanks(bankRows); setAdmins(adminRows) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const remove = async (bank: Bank) => {
    if (!window.confirm(`Delete "${bank.name}"? This cannot be undone.`)) return
    try { await bloodBanksApi.remove(bank.bankID); showToast('Blood bank deleted.'); load() }
    catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }

  const columns: TableColumn<Bank>[] = [
    { key: 'name', header: 'Bank', render: (row) => row.name },
    { key: 'address', header: 'Address', render: (row) => row.address },
    { key: 'manager', header: 'Manager', render: (row) => bankManagerName(row, admins) },
  ]

  if (loading) return <LoadingPage />
  if (error) return <ErrorState message={error} retry={load} />
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">Administration</p>
        <h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Blood banks</h1>
        <p className="mt-2 text-slate-600">Where collected blood is stored, and who runs each one.</p>
      </div>
      <Button type="button" onClick={() => setCreateOpen(true)} className="inline-flex shrink-0 items-center gap-2"><Plus size={16} />Create bank</Button>
    </div>

    <DataTable
      rows={banks}
      columns={columns}
      getRowKey={(row) => row.bankID}
      searchPlaceholder="Search blood banks"
      emptyMessage="No blood banks yet. Create one to get started."
      actions={(row) => <div className="flex justify-end">
        <ActionMenu label={`Actions for ${row.name}`} actions={[
          { label: 'Edit bank', icon: Pencil, onClick: () => navigate(`/admin/banks/${row.bankID}`) },
          { label: 'Delete', icon: Trash2, tone: 'danger', separated: true, onClick: () => remove(row) },
        ]} />
      </div>}
    />

    <CreateBankDialog open={createOpen} admins={admins} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load() }} />
  </div>
}

function CreateBankDialog({ open, admins, onClose, onCreated }: { open: boolean; admins: Admin[]; onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [managerID, setManagerID] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Only a MANAGER admin can run a bank, so the picker never offers the other admin types.
  const managers = admins.filter((admin) => admin.type === 'MANAGER')

  useEffect(() => { if (open) { setName(''); setAddress(''); setManagerID(''); setFormError(null) } }, [open])

  const submit = async () => {
    setFormError(null)
    if (!name.trim() || !address.trim()) return setFormError('Enter the bank name and address.')
    if (!managerID) return setFormError('Choose the manager who runs this bank.')
    setSaving(true)
    try { await bloodBanksApi.create({ name: name.trim(), address: address.trim(), managerID: Number(managerID) }); showToast('Blood bank created.'); onCreated() }
    catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Modal open={open} title="Create blood bank" description="Somewhere to store what campaigns collect." onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); submit() }} className="space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      <Input label="Bank name" id="create-bank-name" value={name} onChange={(event) => setName(event.target.value)} />
      <Input label="Address" id="create-bank-address" value={address} onChange={(event) => setAddress(event.target.value)} />
      <Select label="Manager" id="create-bank-manager" value={managerID} onChange={(event) => setManagerID(event.target.value)}>
        <option value="">{managers.length === 0 ? 'No manager accounts exist yet' : 'Select a manager'}</option>
        {managers.map((admin) => <option key={admin.id} value={admin.id}>{admin.username}</option>)}
      </Select>
      <WizardNav onPrevious={onClose} previousLabel="Cancel" previousIcon={false} onNext={submit} nextLabel={saving ? 'Creating...' : 'Create bank'} busy={saving} />
    </form>
  </Modal>
}

/* ------------------------------------------------------------------ */
/* Bank edit                                                           */
/* ------------------------------------------------------------------ */

export function BankEditPage() {
  const { bankID } = useParams()
  const id = Number(bankID)
  const { showToast } = useToast()
  const [bank, setBank] = useState<Bank | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    if (!Number.isInteger(id)) { setLoading(false); setError('That blood bank address is not valid.'); return }
    setLoading(true)
    setError(null)
    Promise.all([bloodBanksApi.getById(id), authApi.getAdmins()])
      .then(([bankRow, adminRows]) => { setBank(bankRow); setAdmins(adminRows) })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [id])

  if (loading) return <LoadingPage />
  if (error || !bank) return <div className="space-y-6">
    <Link to="/admin/banks" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />Blood banks</Link>
    <ErrorState message={error ?? 'That blood bank could not be loaded.'} retry={load} />
  </div>

  return <div className="space-y-6">
    <div>
      <Link to="/admin/banks" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />Blood banks</Link>
      <h1 className="app-title mt-3 text-4xl font-bold text-slate-950">{bank.name}</h1>
      <p className="mt-2 text-slate-600">{bank.address}</p>
    </div>
    <BankDetailsSection bank={bank} admins={admins} onSaved={load} showToast={showToast} />
  </div>
}

function BankDetailsSection({ bank, admins, onSaved, showToast }: { bank: Bank; admins: Admin[]; onSaved: () => void; showToast: (message: string, tone?: 'success' | 'error') => void }) {
  const [name, setName] = useState(bank.name)
  const [address, setAddress] = useState(bank.address)
  const [managerID, setManagerID] = useState(String(bankManagerId(bank) ?? ''))
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const managers = admins.filter((admin) => admin.type === 'MANAGER')

  const reset = () => { setName(bank.name); setAddress(bank.address); setManagerID(String(bankManagerId(bank) ?? '')); setFormError(null) }
  useEffect(reset, [bank])
  const dirty = name !== bank.name || address !== bank.address || managerID !== String(bankManagerId(bank) ?? '')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!name.trim() || !address.trim()) return setFormError('Enter the bank name and address.')
    const manager = managers.find((admin) => admin.id === Number(managerID))
    if (!manager) return setFormError('Choose the manager who runs this bank.')
    setSaving(true)
    // The update endpoint replaces the whole record, so the manager goes back in full.
    try { await bloodBanksApi.update(bank.bankID, { ...bank, name: name.trim(), address: address.trim(), manager }); showToast('Blood bank saved.'); onSaved() }
    catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Card>
    <h2 className="text-xl font-bold text-slate-950">Bank details</h2>
    <form onSubmit={submit} className="mt-5 space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      <Input label="Bank name" id="bank-name" value={name} onChange={(event) => setName(event.target.value)} />
      <Input label="Address" id="bank-address" value={address} onChange={(event) => setAddress(event.target.value)} />
      <Select label="Manager" id="bank-manager" value={managerID} onChange={(event) => setManagerID(event.target.value)}>
        <option value="">Select a manager</option>
        {managers.map((admin) => <option key={admin.id} value={admin.id}>{admin.username}</option>)}
      </Select>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving || !dirty}>{saving ? 'Saving...' : 'Save changes'}</Button>
        <Button type="button" className="bg-slate-600 hover:bg-slate-700" disabled={saving || !dirty} onClick={reset}>Cancel</Button>
      </div>
    </form>
  </Card>
}
