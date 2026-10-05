import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical, type LucideIcon } from 'lucide-react'

export type MenuAction = {
  label: string
  icon: LucideIcon
  onClick: () => void
  tone?: 'danger'
  /** Puts a rule above this item, to set a destructive action apart from the rest. */
  separated?: boolean
  disabled?: boolean
  title?: string
}

const MENU_WIDTH = 224
const ITEM_HEIGHT = 38
const EDGE_GAP = 8

// Row actions behind one button. A row can carry several things to do without spreading them across
// the width, and the destructive one sits apart from the rest instead of beside them.
//
// The panel is portalled to <body> and positioned fixed rather than absolutely inside the row: the
// table it sits in is a scroll container (overflow-auto for the sticky header), which would
// otherwise clip the menu to the row it opened from.
export function ActionMenu({ label, actions }: { label: string; actions: MenuAction[] }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  const place = useCallback(() => {
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    const height = actions.length * ITEM_HEIGHT + 16
    // Flip above the button when there is no room beneath it.
    const top = window.innerHeight - rect.bottom < height && rect.top > height ? rect.top - height - 4 : rect.bottom + 4
    const left = Math.max(EDGE_GAP, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - EDGE_GAP))
    setPosition({ top, left })
  }, [actions.length])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (!trigger.current?.contains(target) && !panel.current?.contains(target)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    // Capture catches scrolling in the table's own container, not just the page.
    const reposition = () => place()
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, place])

  const toggle = () => {
    if (!open) place()
    setOpen((current) => !current)
  }

  return <>
    <button
      ref={trigger}
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={toggle}
      className="rounded-md p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
    ><MoreVertical size={16} aria-hidden="true" /></button>

    {open && position && createPortal(
      <div ref={panel} role="menu" style={{ top: position.top, left: position.left, width: MENU_WIDTH }} className="fixed z-50 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
        {actions.map((action) => <Fragment key={action.label}>
          {action.separated && <div className="my-1 border-t border-slate-100" aria-hidden="true" />}
          <button
            role="menuitem"
            type="button"
            disabled={action.disabled}
            title={action.title}
            onClick={() => { setOpen(false); action.onClick() }}
            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${action.tone === 'danger' ? 'text-red-700 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <action.icon size={16} aria-hidden="true" />{action.label}
          </button>
        </Fragment>)}
      </div>,
      document.body,
    )}
  </>
}
