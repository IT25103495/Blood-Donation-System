import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'
import { AlertCircle, Check, Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { LABEL_CLASS, MESSAGE_CLASS, fieldClass, toneOf } from './fieldStyles'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  /** Shows the confirmed state: green border and a tick. */
  valid?: boolean
  /** Sits inside the left of the field, e.g. a magnifier on a search box. */
  icon?: LucideIcon
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, valid, icon: Icon, hint, id, type = 'text', className = '', ...props },
  ref,
) {
  const [revealed, setRevealed] = useState(false)
  const fallbackId = useId()
  const fieldId = id ?? fallbackId
  const messageId = `${fieldId}-message`

  // A password field carries its own reveal toggle rather than every form building one.
  const isPassword = type === 'password'
  const resolvedType = isPassword && revealed ? 'text' : type
  const tone = toneOf(error, valid)
  const hasTrailing = isPassword || Boolean(error) || Boolean(valid)

  return <div className="space-y-1.5">
    <label htmlFor={fieldId} className={`block ${LABEL_CLASS}`}>{label}</label>
    <div className="relative">
      {Icon && <Icon size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        ref={ref}
        id={fieldId}
        type={resolvedType}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={fieldClass(tone, `${Icon ? 'pl-9' : ''} ${hasTrailing ? 'pr-10' : ''} ${className}`)}
        {...props}
      />
      {isPassword
        ? <button type="button" onClick={() => setRevealed((current) => !current)} aria-label={revealed ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900">
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        : error
          ? <AlertCircle size={18} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />
          : valid
            ? <Check size={18} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
            : null}
    </div>
    {error
      ? <span id={messageId} className={MESSAGE_CLASS}>{error}</span>
      : hint
        ? <span id={messageId} className="block text-xs text-slate-500">{hint}</span>
        : null}
  </div>
})
