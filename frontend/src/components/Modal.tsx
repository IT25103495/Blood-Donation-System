import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode }

// Small dialog for short, self-contained forms (e.g. "Create campaign") so a one-step task
// does not need a page of its own. Longer work gets a real page instead.
export function Modal({ open, title, description, onClose, children }: Props) {
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    panel.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4 sm:items-center">
    <button type="button" aria-label="Close dialog" onClick={onClose} className="fixed inset-0 -z-10 cursor-default" />
    <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id={titleId} className="text-lg font-bold text-slate-950">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X size={18} /></button>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  </div>
}
