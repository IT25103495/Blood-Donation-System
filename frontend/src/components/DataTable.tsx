import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePagination } from '../hooks/usePagination'

export type TableColumn<T> = { key: string; header: string; render: (row: T) => ReactNode; searchable?: boolean }

// Row actions are text links in a table row, where they sit in their own column and the pointer is
// precise. In a card on a phone they need a real tap target, so they pick up a border and padding
// below md. Shared here so every admin table's actions behave the same way.
export const rowActionClass = 'inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 md:rounded-none md:border-0 md:px-0 md:py-0'
type Props<T> = { rows: T[]; columns: TableColumn<T>[]; getRowKey: (row: T) => string | number; searchPlaceholder?: string; statusOptions?: string[]; getStatus?: (row: T) => string; actions?: (row: T) => ReactNode; emptyMessage?: string }

export function DataTable<T>({ rows, columns, getRowKey, searchPlaceholder = 'Search', statusOptions = [], getStatus, actions, emptyMessage = 'No records found.' }: Props<T>) {
  const [search, setSearch] = useState(''); const [debounced, setDebounced] = useState(''); const [status, setStatus] = useState('ALL')
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(search), 400); return () => window.clearTimeout(timer) }, [search])
  const filtered = useMemo(() => rows.filter((row) => { const text = columns.filter((column) => column.searchable !== false).map((column) => String(column.render(row))).join(' ').toLowerCase(); return text.includes(debounced.toLowerCase()) && (status === 'ALL' || getStatus?.(row) === status) }), [columns, debounced, getStatus, rows, status])
  const pagination = usePagination(filtered)

  // Card layout below md. The first column is what identifies the row, so it becomes the card
  // title; a "status" column is pulled out to sit beside it, the way it reads in a table header
  // row; everything else becomes a labelled line. Anything narrower than this and a table can only
  // be read by dragging it sideways.
  const [titleColumn, ...otherColumns] = columns
  const statusColumn = otherColumns.find((column) => column.key === 'status')
  const detailColumns = otherColumns.filter((column) => column !== statusColumn)

  return <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
      <input aria-label={searchPlaceholder} placeholder={searchPlaceholder} value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-100" />
      {statusOptions.length > 0 && <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="ALL">All statuses</option>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select>}
    </div>

    <ul className="divide-y divide-slate-100 md:hidden">
      {pagination.items.map((row) => <li key={getRowKey(row)} className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 break-words font-semibold text-slate-950">{titleColumn?.render(row)}</p>
          {statusColumn && <div className="shrink-0">{statusColumn.render(row)}</div>}
        </div>
        {detailColumns.length > 0 && <dl className="mt-3 space-y-1.5 text-sm">
          {detailColumns.map((column) => <div key={column.key} className="flex justify-between gap-4">
            <dt className="shrink-0 text-slate-500">{column.header}</dt>
            <dd className="min-w-0 break-words text-right text-slate-800">{column.render(row)}</dd>
          </div>)}
        </dl>}
        {actions && <div className="mt-4 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-3">{actions(row)}</div>}
      </li>)}
      {pagination.items.length === 0 && <li className="px-4 py-12 text-center text-slate-500">{emptyMessage}</li>}
    </ul>

    <div className="hidden max-h-[32rem] overflow-auto md:block">
      <table className="min-w-full text-left text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold">{column.header}</th>)}{actions && <th className="sticky right-0 bg-slate-50 px-4 py-3 text-right">Actions</th>}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {pagination.items.map((row) => <tr key={getRowKey(row)} className="hover:bg-slate-50">{columns.map((column) => <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700">{column.render(row)}</td>)}{actions && <td className="sticky right-0 bg-white px-4 py-3 text-right">{actions(row)}</td>}</tr>)}
          {pagination.items.length === 0 && <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-slate-500">{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>

    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
      <span>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
      <div className="flex gap-2">
        <button type="button" disabled={pagination.page === 1} onClick={() => pagination.setPage(pagination.page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
        <span className="px-2 py-1">{pagination.page} / {pagination.pageCount}</span>
        <button type="button" disabled={pagination.page === pagination.pageCount} onClick={() => pagination.setPage(pagination.page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
      </div>
    </div>
  </div>
}
