import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { LABEL_CLASS, MESSAGE_CLASS, fieldClass, toneOf } from './fieldStyles'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, children, id, className = '', ...props },
  ref,
) {
  const fallbackId = useId()
  const fieldId = id ?? fallbackId
  const messageId = `${fieldId}-message`

  return <div className="space-y-1.5">
    <label htmlFor={fieldId} className={`block ${LABEL_CLASS}`}>{label}</label>
    <div className="relative">
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        // appearance-none so the chevron matches the one used elsewhere instead of the browser's.
        className={fieldClass(toneOf(error), `appearance-none pr-10 ${className}`)}
        {...props}
      >{children}</select>
      <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
    {error
      ? <span id={messageId} className={MESSAGE_CLASS}>{error}</span>
      : hint
        ? <span id={messageId} className="block text-xs text-slate-500">{hint}</span>
        : null}
  </div>
})
