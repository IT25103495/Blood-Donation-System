import type { ReactNode } from 'react'
import { Check, HeartPulse } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

type Props = {
  /** Which half the brand panel sits on at desktop width. */
  panel: 'left' | 'right'
  headline: ReactNode
  body?: ReactNode
  points?: string[]
  /** Register needs more room than sign-in for its two-column rows. */
  formWidth?: 'md' | 'lg'
  children: ReactNode
}

// Two halves: a brand panel and the form, side by side on desktop and stacked on a phone. Sign-in
// and registration mirror each other, so the panel can take either side.
export function AuthSplitLayout({ panel, headline, body, points, formWidth = 'md', children }: Props) {
  // The panel is pinned to the viewport on desktop. Letting it grow with the page instead would
  // strand the headline in the middle of a very tall column whenever the form is a long one.
  return <div className="min-h-screen items-start bg-slate-50 lg:grid lg:grid-cols-2">
    <aside className={`relative overflow-hidden flex flex-col bg-gradient-to-br from-red-950 via-red-900 to-slate-950 px-6 py-6 text-white sm:px-10 sm:py-8 lg:sticky lg:top-0 lg:h-screen lg:px-14 lg:py-14 ${panel === 'right' ? 'lg:order-2' : ''}`}>
      <div className="absolute top-0 right-0 h-[40rem] w-[40rem] rounded-full bg-red-600/10 blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 h-[30rem] w-[30rem] rounded-full bg-red-800/20 blur-[80px] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Link to="/" className="inline-flex w-fit items-center gap-3 relative z-10 hover:scale-105 transition-transform">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-white shadow-lg sm:h-10 sm:w-10"><HeartPulse size={20} aria-hidden="true" /></span>
          <span className="app-title text-lg font-bold sm:text-xl">Lifeline</span>
        </Link>
      </motion.div>
      <div className="flex min-h-0 flex-1 items-end pt-5 sm:pt-8 lg:items-center lg:pt-0 relative z-10">
        <motion.div className="max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h2 className="app-title text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl">{headline}</h2>
          {body && <p className="mt-3 text-sm text-white/70 sm:mt-5 sm:text-base">{body}</p>}
          {/* The checklist is a nice-to-have on desktop; on a phone it just delays reaching the form. */}
          {points && <ul className="mt-6 hidden space-y-4 sm:block lg:mt-8">
            {points.map((point, index) => (
              <motion.li key={point} className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm"><Check size={16} aria-hidden="true" /></span>
                <span className="text-white/90 font-medium">{point}</span>
              </motion.li>
            ))}
          </ul>}
        </motion.div>
      </div>
    </aside>

    {/* Only once the two halves are side by side does a full-height column make sense. Stacked on a
        phone it would add a whole empty screen below the panel before the form began. */}
    <main className={`flex items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:min-h-screen lg:py-14 ${panel === 'right' ? 'lg:order-1' : ''}`}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className={`w-full ${formWidth === 'lg' ? 'max-w-lg' : 'max-w-md'} rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50`}>
        {children}
      </motion.div>
    </main>
  </div>
}
