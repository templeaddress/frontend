'use client'

import { useEffect, useId, useRef } from 'react'
import { X, Search, ChevronLeft, ChevronRight } from 'lucide-react'

export const titleCase = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
export const money = value => Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
export function staffDate(value, time = true) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—'
  return new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}) })
}
export function StaffPageHeading({ title, description, action, eyebrow = 'Staff workspace' }) {
  return <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-saffron-700">{eyebrow}</p><h1 className="font-display text-3xl font-semibold text-brown-900">{title}</h1>{description && <p className="mt-2 max-w-3xl text-sm text-brown-500">{description}</p>}</div>{action && <div className="flex flex-wrap gap-2">{action}</div>}</div>
}
export function StaffNotice({ error, children }) {
  const message = error || children
  return message ? <p role={error ? 'alert' : 'status'} className={`my-4 rounded-xl border p-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{message}</p> : null
}
export function StaffStatus({ value }) {
  const tone = ['approved', 'published', 'confirmed', 'captured', 'paid', 'completed', 'verified', 'resolved', 'active'].includes(value) ? 'bg-emerald-50 text-emerald-700' : ['rejected', 'failed', 'expired', 'exception', 'disabled'].includes(value) ? 'bg-red-50 text-red-700' : ['submitted', 'review', 'pending', 'payment_pending', 'on_hold', 'retry_required', 'changes_requested'].includes(value) ? 'bg-amber-50 text-amber-800' : 'bg-brown-100 text-brown-700'
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{titleCase(value) || 'Not recorded'}</span>
}
export function StaffSearch({ value, onChange, placeholder = 'Search records', label = 'Search records' }) {
  return <div className="relative min-w-[200px] flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-3.5 text-brown-500"/><input aria-label={label} className="input !pl-10" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></div>
}
export function StaffPager({ payload, page, onChange, loading = false }) {
  return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-brown-500">{payload ? `${payload.count.toLocaleString('en-IN')} record(s)` : loading ? 'Loading…' : '—'}</span><div className="flex items-center gap-3"><button type="button" className="btn-g !px-3 !py-2" disabled={loading || !payload?.previous} onClick={() => onChange(Number(page) - 1)}><ChevronLeft size={15}/>Previous</button><span>Page {page}</span><button type="button" className="btn-g !px-3 !py-2" disabled={loading || !payload?.next} onClick={() => onChange(Number(page) + 1)}>Next<ChevronRight size={15}/></button></div></div>
}
export function StaffEmpty({ loading, text = 'No matching records.', columns = 1 }) {
  return <tr><td colSpan={columns} className="px-5 py-12 text-center text-sm text-brown-500" role="status">{loading ? 'Loading records…' : text}</td></tr>
}
export function StaffDetails({ values }) {
  return <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{values.map(([label, value]) => <div key={label}><dt className="text-xs font-medium uppercase tracking-wide text-brown-500">{label}</dt><dd className="mt-1 break-words text-sm text-brown-900">{value == null || value === '' ? '—' : value}</dd></div>)}</dl>
}
export function StaffModal({ title, children, onClose, wide = false }) {
  const titleId = useId(), panel = useRef(null), close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const previousFocus = document.activeElement, overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector('input, textarea, select, button, a[href]')?.focus()
    const handle = event => {
      if (event.key === 'Escape') { event.preventDefault(); close.current?.(); return }
      if (event.key !== 'Tab') return
      const elements = [...panel.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')]
      if (!elements.length) { event.preventDefault(); return }
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handle)
    return () => { document.removeEventListener('keydown', handle); document.body.style.overflow = overflow; previousFocus?.focus?.() }
  }, [])
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brown-950/60 p-3 sm:p-6" onMouseDown={e => { if (e.target === e.currentTarget) onClose?.() }}><section ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`max-h-[90vh] w-full overflow-auto rounded-2xl bg-white shadow-2xl ${wide ? 'max-w-5xl' : 'max-w-xl'}`}><div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-brown-100 bg-white px-5 py-4"><h2 id={titleId} className="text-xl font-semibold">{title}</h2><button type="button" className="rounded-lg p-2 hover:bg-brown-50" aria-label="Close dialog" onClick={onClose}><X size={19}/></button></div><div className="p-5 sm:p-6">{children}</div></section></div>
}
