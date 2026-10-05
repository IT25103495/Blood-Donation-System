/**
 * One set of rules for every form control, so an input, a select and a textarea are the same height,
 * sit on the same border and react to focus, validation and disabling in the same way.
 */
export const FIELD_BASE = 'w-full rounded-md border bg-white px-3 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 read-only:bg-slate-50 read-only:text-slate-600'

export type FieldTone = 'default' | 'error' | 'valid'

export const FIELD_TONE: Record<FieldTone, string> = {
  default: 'border-slate-300 focus:border-red-700 focus:ring-red-100',
  error: 'border-red-500 focus:border-red-600 focus:ring-red-100',
  valid: 'border-green-600 focus:border-green-700 focus:ring-green-100',
}

export const LABEL_CLASS = 'text-sm font-medium text-slate-700'
export const MESSAGE_CLASS = 'block text-sm text-red-700'

export function fieldClass(tone: FieldTone, extra = '') {
  return `${FIELD_BASE} ${FIELD_TONE[tone]} ${extra}`.trim()
}

export const toneOf = (error?: string, valid?: boolean): FieldTone => (error ? 'error' : valid ? 'valid' : 'default')
