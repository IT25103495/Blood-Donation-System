import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'

type Props = { children: ReactNode }
type State = { hasError: boolean }
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(): State { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Unhandled application error', error, info) }
  render() { if (this.state.hasError) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><div className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center"><h1 className="text-2xl font-bold text-slate-950">Something went wrong</h1><p className="mt-2 text-slate-600">The page could not be displayed. Reload to try again.</p><Button type="button" className="mt-5" onClick={() => window.location.reload()}>Reload page</Button></div></main>; return this.props.children }
}