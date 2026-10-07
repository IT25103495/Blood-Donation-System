import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getErrorMessage, requestsApi } from '../../api'
import { ActionMenu } from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import { DataTable, type TableColumn } from '../../components/DataTable'
import { ErrorState } from '../../components/ErrorState'
import { Input } from '../../components/Input'
import { LABEL_CLASS } from '../../components/fieldStyles'
import { Modal } from '../../components/Modal'
import { Skeleton } from '../../components/Skeleton'
import { StatusBadge } from '../../components/StatusBadge'
import { WizardNav } from '../../components/Stepper'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'
import type { BloodRequest } from '../../types/api'
import { BLOOD_TYPES } from '../../utils/constants'
import { emptyQuantityMap, mapToQuantities, quantitiesToMap, type QuantityMap } from '../../utils/bloodTypes'

const today = () => new Date().toISOString().slice(0, 10)
const futureDate = () => { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10) }
const totalOf = (quantities: QuantityMap) => Object.values(quantities).reduce((sum, value) => sum + value, 0)

// "A+ x2 · O- x1", so the table says what was asked for without a row of chips in every cell.
function describeUnits(request: BloodRequest) {
  const map = quantitiesToMap(request.quantities)
  const parts = BLOOD_TYPES.filter((type) => map[type] > 0).map((type) => type + ' x' + map[type])
  return parts.length > 0 ? parts.join(' · ') : 'None'
}

export function HospitalPage() {
  const { userId } = useAuth()
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    if (userId === null) { setLoading(false); setError('Your account ID is missing from the login token. Contact support.'); return }
    setLoading(true)
    setError(null)
    requestsApi.getMine()
      .then((items) => setRequests(items))
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [userId])

  // The backend only lets a hospital withdraw a request while it is still PENDING.
  const cancel = async (request: BloodRequest) => {
    if (!await confirm('Withdraw request #' + request.reqID + '? This cannot be undone.')) return
    try { await requestsApi.cancelMine(request.reqID); showToast('Request withdrawn.'); load() }
    catch (err: unknown) { showToast(getErrorMessage(err), 'error') }
  }

  const columns: TableColumn<BloodRequest>[] = [
    { key: 'id', header: 'Request', render: (row) => '#' + row.reqID },
    { key: 'types', header: 'Blood types', render: (row) => describeUnits(row) },
    { key: 'units', header: 'Units', render: (row) => row.quantities.reduce((sum, value) => sum + value, 0) },
    { key: 'deadline', header: 'Deadline', render: (row) => row.deadline },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} />, searchable: false },
  ]

  if (loading) return <div className="space-y-5"><Skeleton className="h-12 w-64" /><Skeleton className="h-64" /></div>
  if (error) return <ErrorState message={error} retry={load} />

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">Hospital account</p>
        <h1 className="app-title mt-2 text-4xl font-bold text-slate-950">Blood requests</h1>
        <p className="mt-2 text-slate-600">Request the blood units your patients need and track progress.</p>
      </div>
      <Button type="button" onClick={() => setCreateOpen(true)} className="inline-flex shrink-0 items-center gap-2"><Plus size={16} />New request</Button>
    </div>

    <DataTable
      rows={requests}
      columns={columns}
      getRowKey={(row) => row.reqID}
      searchPlaceholder="Search your requests"
      statusOptions={['PENDING', 'APPROVED', 'REJECTED', 'COMPLETE', 'EXPIRED']}
      getStatus={(row) => row.status}
      emptyMessage="No blood requests yet. Create one to begin tracking supply needs."
      actions={(row) => <div className="flex justify-end">
        <ActionMenu label={'Actions for request #' + row.reqID} actions={[
          { label: 'Withdraw request', icon: Trash2, tone: 'danger', disabled: row.status !== 'PENDING', onClick: () => cancel(row) },
        ]} />
      </div>}
    />

    <CreateRequestDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load() }} />
  </div>
}

function CreateRequestDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast()
  const [quantities, setQuantities] = useState<QuantityMap>(emptyQuantityMap())
  const [deadline, setDeadline] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const totalUnits = totalOf(quantities)

  useEffect(() => { if (open) { setQuantities(emptyQuantityMap()); setDeadline(''); setFormError(null) } }, [open])

  const submit = async () => {
    setFormError(null)
    if (totalUnits < 1) return setFormError('Request at least one unit of blood.')
    if (!deadline || deadline <= today()) return setFormError('Choose a future deadline.')
    setSaving(true)
    try { await requestsApi.create({ quantities: mapToQuantities(quantities), deadline }); showToast('Blood request submitted.'); onCreated() }
    catch (err: unknown) { setFormError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return <Modal open={open} title="New blood request" description="Say what your patients need and by when." onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); submit() }} className="space-y-4">
      {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</div>}
      <fieldset>
        <legend className={LABEL_CLASS}>Units requested</legend>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BLOOD_TYPES.map((bloodType) => <Input
            key={bloodType}
            label={bloodType}
            type="number"
            min="0"
            step="1"
            value={quantities[bloodType]}
            onChange={(event) => setQuantities((current) => ({ ...current, [bloodType]: Math.max(0, Number(event.target.value)) }))}
          />)}
        </div>
        <p className="mt-2 text-xs text-slate-500">{totalUnits} unit{totalUnits === 1 ? '' : 's'} requested</p>
      </fieldset>
      <Input label="Deadline" id="create-request-deadline" type="date" min={futureDate()} value={deadline} onChange={(event) => setDeadline(event.target.value)} />
      <WizardNav onPrevious={onClose} previousLabel="Cancel" previousIcon={false} onNext={submit} nextLabel={saving ? 'Submitting...' : 'Submit request'} busy={saving} />
    </form>
  </Modal>
}
