import { forwardRef, type SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, children, id, ...props }, ref) { return <label htmlFor={id} className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">{label}</span><select ref={ref} id={id} {...props} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100">{children}</select></label> })