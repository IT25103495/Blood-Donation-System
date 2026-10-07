import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { 
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {children}
    </div>
  )
}