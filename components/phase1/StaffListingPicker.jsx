'use client'

import { useEffect, useState } from 'react'
import { clientApi } from '@/lib/client-api'

const defaultTypes = ['temple', 'festival', 'service']
export default function StaffListingPicker({ name, types = defaultTypes, onChange }) {
  const [query, setQuery] = useState({ search: '', type: types[0], page: '1' })
  const [payload, setPayload] = useState(null), [selected, setSelected] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setPayload(null)
    const timer = window.setTimeout(() => clientApi(`staff/listings?${new URLSearchParams({ ...query, status: 'published' })}`).then(data => { if (active) { setPayload(data); setError('') } }).catch(err => { if (active) setError(err.message) }), 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [query])
  const rows = payload?.results || []
  return <div className="space-y-2"><input aria-label="Find listing by name or code" className="input" placeholder="Find name or code" value={query.search} onChange={e => setQuery(q => ({ ...q, search: e.target.value, page: '1' }))} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}/><select aria-label="Listing type for selection" className="input" value={query.type} onChange={e => setQuery(q => ({ ...q, type: e.target.value, page: '1' }))}>{types.map(type => <option key={type}>{type}</option>)}</select><select aria-label="Select published listing" className="input" name={name} value={selected?.uuid || ''} required onChange={e => { const row = rows.find(row => row.uuid === e.target.value) || (selected?.uuid === e.target.value ? selected : null); setSelected(row); onChange?.(row) }}><option value="">Choose a listing</option>{selected && !rows.some(row => row.uuid === selected.uuid) && <option value={selected.uuid}>{selected.name_en} ({selected.code})</option>}{rows.map(row => <option key={row.uuid} value={row.uuid}>{row.name_en} ({row.code})</option>)}</select>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex items-center gap-2 text-xs"><button type="button" className="btn-g" disabled={!payload?.previous} onClick={() => setQuery(q => ({ ...q, page: String(Number(q.page) - 1) }))}>Previous</button><span>Page {query.page} · {payload?.count || 0} matches</span><button type="button" className="btn-g" disabled={!payload?.next} onClick={() => setQuery(q => ({ ...q, page: String(Number(q.page) + 1) }))}>Next</button></div></div>
}
