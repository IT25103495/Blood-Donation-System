import { forwardRef, type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, id, ...props }, ref) { return <label htmlFor={id} className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">{label}</span><input ref={ref} id={id} {...props} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100" />{error && <span className="block text-sm text-red-700">{error}</span>}</label> })