import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

type Options = { title?: string; confirmLabel?: string; danger?: boolean }
type Pending = Options & { message: string }
type Confirm = (message: string, options?: Options) => Promise<boolean>

const ConfirmContext = createContext<Confirm | null>(null)

// Replaces the browser's window.confirm with a small in-app dialog. Call sites just
// `if (!(await confirm('Delete this?'))) return`. The first word of the message
// ("Delete", "Remove", "Withdraw", "Cancel") becomes the button label unless given.
const DESTRUCTIVE = /^(delete|remove|withdraw)/i

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)

  const confirm = useCallback<Confirm>((message, options = {}) => new Promise<boolean>((resolve) => {
    resolver.current?.(false)
    resolver.current = resolve
    setPending({ message, ...options })
  }), [])

  const close = useCallback((value: boolean) => { resolver.current?.(value); resolver.current = null; setPending(null) }, [])

  useEffect(() => {
    if (!pending) return
    cancelButton.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pending, close])

  const danger = pending ? (pending.danger ?? DESTRUCTIVE.test(pending.message)) : false
  const label = pending?.confirmLabel ?? pending?.message.split(' ')[0].replace(/[^A-Za-z]/g, '') ?? 'Confirm'

  return <ConfirmContext.Provider value={confirm}>
    {children}
    {pending && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
      <button type="button" tabIndex={-1} aria-label="Dismiss" onClick={() => close(false)} className="fixed inset-0 -z-10 cursor-default" />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}><AlertTriangle size={18} aria-hidden="true" /></span>
          <div>
            <h2 id="confirm-title" className="font-bold text-slate-950">{pending.title ?? 'Are you sure?'}</h2>
            <p id="confirm-message" className="mt-1 text-sm text-slate-600">{pending.message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button ref={cancelButton} type="button" onClick={() => close(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300">Go back</button>
          <button type="button" onClick={() => close(true)} className={`rounded-md px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-1 ${danger ? 'bg-red-700 hover:bg-red-800 focus:ring-red-300' : 'bg-slate-800 hover:bg-slate-900 focus:ring-slate-400'}`}>{label}</button>
        </div>
      </div>
    </div>}
  </ConfirmContext.Provider>
}

export function useConfirm() { const context = useContext(ConfirmContext); if (!context) throw new Error('useConfirm must be used inside ConfirmProvider'); return context }
