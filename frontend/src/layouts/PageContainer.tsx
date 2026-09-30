import { Outlet } from 'react-router-dom'

/** Padded content wrapper for authenticated pages rendered inside PublicLayout (donor, hoster). */
export function PageContainer() {
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><Outlet /></div>
}
