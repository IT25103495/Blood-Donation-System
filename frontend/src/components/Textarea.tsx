import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { LABEL_CLASS, MESSAGE_CLASS, fieldClass, toneOf } from './fieldStyles'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, rows = 4, className = '', ...props },
  ref,
) {
  const fallbackId = useId()
  const fieldId = id ?? fallbackId
  const messageId = `${fieldId}-message`

  return <div className="space-y-1.5">
    <label htmlFor={fieldId} className={`block ${LABEL_CLASS}`}>{label}</label>
    <textarea
      ref={ref}
      id={fieldId}
      rows={rows}
      aria-invalid={error ? true : undefined}
      aria-describedby={error || hint ? messageId : undefined}
      className={fieldClass(toneOf(error), className)}
      {...props}
    />
    {error
      ? <span id={messageId} className={MESSAGE_CLASS}>{error}</span>
      : hint
        ? <span id={messageId} className="block text-xs text-slate-500">{hint}</span>
        : null}
  </div>
})
