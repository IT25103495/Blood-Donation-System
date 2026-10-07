import { Outlet } from 'react-router-dom'
import { WorkspaceNav } from '../components/WorkspaceNav'

import { PageTransition } from '../components/PageTransition'

/** Padded content wrapper for authenticated pages rendered inside PublicLayout (donor, hoster). */
export function PageContainer() {
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <WorkspaceNav />
    <PageTransition>
      <Outlet />
    </PageTransition>
  </div>
}
