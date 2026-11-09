'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { directoryHref, EMPTY_FILTERS } from '@/lib/listing-directory'

export function ListingSearchInput({ value, onChange, onSelect, type = 'temple', placeholder = 'Name, code, deity or place', label = 'Search listings' }) {
  const id = useId()
  const [matches, setMatches] = useState({ query: '', rows: [] })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const focused = useRef(false)
  const dismissed = useRef(false)
  const term = value.trim()
  const rows = matches.query === term ? matches.rows : []
  const expanded = open && rows.length > 0

  useEffect(() => {
    if (term.length < 2) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: term, type })
        const data = await apiFetch(`listings/suggestions?${params}`, { signal: controller.signal })
        if (controller.signal.aborted) return
        setMatches({ query: term, rows: data }); setActive(-1)
        setOpen(focused.current && !dismissed.current)
      } catch {
        if (!controller.signal.aborted) { setMatches({ query: term, rows: [] }); setOpen(false) }
      }
    }, 300)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [term, type])

  function choose(row) {
    dismissed.current = true
    setOpen(false); setActive(-1)
    onSelect(row)
  }

  return <span className="relative block" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) { focused.current = false; setOpen(false); setActive(-1) }
  }}>
    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brown-400"/>
    <input className="input !pl-9" role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-suggestions`} aria-activedescendant={expanded && active >= 0 ? `${id}-${active}` : undefined}
      autoComplete="off" value={value} placeholder={placeholder}
      onFocus={() => { focused.current = true; dismissed.current = false; setOpen(true) }}
      onChange={event => { dismissed.current = false; setOpen(false); setActive(-1); onChange(event.target.value) }}
      onKeyDown={event => {
        if (event.key === 'Escape') { dismissed.current = true; setOpen(false); setActive(-1) }
        if (expanded && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
          event.preventDefault()
          setActive(index => event.key === 'ArrowDown' ? Math.min(index + 1, rows.length - 1) : Math.max(index - 1, 0))
        }
        if (event.key === 'Enter' && expanded && active >= 0) { event.preventDefault(); choose(rows[active]) }
      }}/>
    {expanded && <span id={`${id}-suggestions`} role="listbox" aria-label="Suggested listings" className="absolute inset-x-0 top-full z-30 mt-1 max-h-96 overflow-y-auto rounded-xl border border-brown-100 bg-white py-1 text-brown-900 shadow-lg">
      {rows.map((row, index) => <button id={`${id}-${index}`} key={row.uuid} type="button" role="option" aria-selected={active === index}
        className={`block w-full px-4 py-3 text-left text-sm hover:bg-brown-50 ${active === index ? 'bg-brown-50' : ''}`}
        onMouseDown={event => event.preventDefault()} onClick={() => choose(row)}>
        <span className="block font-semibold">{row.name_en}</span>
        <span className="block truncate text-xs text-brown-500">{[row.address || row['district__name_en'], row.code].filter(Boolean).join(', ')}</span>
      </button>)}
    </span>}
  </span>
}

export default function HomeListingSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  function search(value) {
    if (value.trim()) router.push(directoryHref('temple', { ...EMPTY_FILTERS, query: value.trim(), searchScope: 'listing_only' }))
  }
  return <form className="mt-6 flex max-w-2xl items-start gap-2 text-brown-900" onSubmit={event => { event.preventDefault(); search(query) }}>
    <div className="min-w-0 flex-1"><ListingSearchInput value={query} onChange={setQuery} onSelect={row => search(row.name_en)} placeholder="Search temples by name or code…" label="Search temples"/></div>
    <button className="btn-p">Search</button>
  </form>
}
