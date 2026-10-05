import { Link } from 'react-router-dom'

type Action = { label: string; to: string } | { label: string; onClick: () => void }

export function EmptyState({ title, description, action }: { title: string; description: string; action?: Action }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
    <p className="font-semibold text-slate-800">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    {action && ('to' in action
      ? <Link to={action.to} className="mt-4 inline-flex rounded-md bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800">{action.label}</Link>
      : <button type="button" onClick={action.onClick} className="mt-4 inline-flex rounded-md bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800">{action.label}</button>)}
  </div>
}
