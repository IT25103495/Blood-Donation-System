import { Modal } from './Modal'
import { StatusBadge } from './StatusBadge'
import type { BloodRequest } from '../types/api'
import { BLOOD_TYPES } from '../utils/constants'
import { quantitiesToMap } from '../utils/bloodTypes'

type Props = { request: BloodRequest | null; onClose: () => void }

// Read-only look at one blood request, shared by the admin and staff dashboards.
export function RequestDetailsModal({ request, onClose }: Props) {
  const quantities = request ? quantitiesToMap(request.quantities) : null
  const total = request ? request.quantities.reduce((sum, value) => sum + value, 0) : 0
  return <Modal open={request !== null} title={request ? `Request #${request.reqID}` : 'Request'} description="Blood request details" onClose={onClose}>
    {request && quantities && <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-slate-500">Hospital</dt><dd className="font-semibold text-slate-950">{request.hospitalName}</dd></div>
        <div><dt className="text-slate-500">Status</dt><dd className="mt-0.5"><StatusBadge status={request.status} /></dd></div>
        <div><dt className="text-slate-500">Deadline</dt><dd className="font-semibold text-slate-950">{request.deadline}</dd></div>
        <div><dt className="text-slate-500">Total units</dt><dd className="font-semibold text-slate-950">{total}</dd></div>
      </dl>
      <div>
        <p className="mb-2 text-sm text-slate-500">Units by blood type</p>
        <div className="grid grid-cols-4 gap-2">{BLOOD_TYPES.map((type) => <div key={type} className={`rounded-md border px-2 py-2 text-center ${quantities[type] > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50 text-slate-400'}`}><div className="text-xs font-semibold">{type}</div><div className="text-lg font-bold">{quantities[type]}</div></div>)}</div>
      </div>
    </div>}
  </Modal>
}
