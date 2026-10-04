import { Fragment } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from './Button'

// Progress header for a multi-step form: a numbered circle per step, joined by a connector that
// fills in as the person advances, with the step name underneath. Finished steps show a tick so
// the state of each one is readable at a glance rather than only by position.
export function Stepper({ steps, current, onStepSelect }: { steps: string[]; current: number; onStepSelect?: (index: number) => void }) {
  return <ol className="flex items-start justify-center overflow-x-auto pb-1" aria-label="Progress">
    {steps.map((label, index) => {
      const done = index < current
      const active = index === current
      // Only a step already completed can be jumped back to; later ones are not filled in yet.
      const selectable = done && Boolean(onStepSelect)
      const circle = done ? 'bg-red-700 text-white' : active ? 'border-2 border-red-700 bg-white text-red-700' : 'bg-slate-100 text-slate-400'
      return <Fragment key={label}>
        <li className="flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
          <button
            type="button"
            disabled={!selectable}
            onClick={() => onStepSelect?.(index)}
            aria-current={active ? 'step' : undefined}
            aria-label={`Step ${index + 1}: ${label}${done ? ' (completed)' : ''}`}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${circle} ${selectable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
          >
            {done ? <Check size={18} aria-hidden="true" /> : index + 1}
          </button>
          <span className={`text-center text-xs ${active ? 'font-semibold text-slate-900' : done ? 'text-slate-600' : 'text-slate-400'}`}>{label}</span>
        </li>
        {/* Sits level with the middle of the 40px circles rather than with the labels below them. */}
        {index < steps.length - 1 && <li aria-hidden="true" className={`mt-5 h-0.5 w-8 shrink-0 sm:w-16 ${done ? 'bg-red-700' : 'bg-slate-200'}`} />}
      </Fragment>
    })}
  </ol>
}

type NavProps = {
  onPrevious?: () => void
  onNext?: () => void
  previousLabel?: string
  /** Off when the left button is not a step back - a dialog's Cancel, say. */
  previousIcon?: boolean
  nextLabel?: string
  nextDisabled?: boolean
  busy?: boolean
}

// The footer that goes at the bottom of a wizard card: back on the left, forward on the right, so
// the forward action always sits in the same place no matter which step is open.
export function WizardNav({ onPrevious, onNext, previousLabel = 'Previous', previousIcon = true, nextLabel = 'Next', nextDisabled, busy }: NavProps) {
  return <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
    {onPrevious
      ? <button type="button" onClick={onPrevious} disabled={busy} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{previousIcon && <ArrowLeft size={16} aria-hidden="true" />}{previousLabel}</button>
      : <span />}
    {onNext && <Button type="button" onClick={onNext} disabled={nextDisabled || busy} className="inline-flex items-center gap-2">{nextLabel}<ArrowRight size={16} aria-hidden="true" /></Button>}
  </div>
}
