'use client'

import { useEffect, useState } from 'react'
import { clientApi } from '@/lib/client-api'
import { Field, Input } from '@/components/ui'

export default function StaffEventDetails({ event, reload }) {
  const [page, setPage] = useState(1), [rows, setRows] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('')
  useEffect(() => {
    let active = true
    clientApi(`staff/events/${event.uuid}/registrations?page=${page}`).then(data => { if (active) setRows(data) }).catch(err => { if (active) setError(err.message) })
    return () => { active = false }
  }, [event.uuid, page])
  async function save(e) {
    e.preventDefault()
    if (busy) return
    const body = Object.fromEntries(new FormData(e.currentTarget))
    setBusy(true); setError('')
    try { await clientApi(`staff/events/${event.uuid}`, { method: 'PATCH', body }); await reload() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="space-y-5">{error && <p role="alert" className="text-red-700">{error}</p>}<form onSubmit={save} className="grid gap-3 sm:grid-cols-2"><h3 className="font-semibold sm:col-span-2">Event content</h3><Field label="English name"><Input name="name_en" defaultValue={event.name_en} required/></Field><Field label="Malayalam name"><Input name="name_ml" defaultValue={event.name_ml}/></Field><Field label="Description"><textarea name="description_en" className="input" defaultValue={event.description_en}/></Field><Field label="Malayalam description"><textarea name="description_ml" className="input" defaultValue={event.description_ml}/></Field><button className="btn-g" disabled={busy}>Save event content</button></form><div className="space-y-3"><h3 className="font-semibold">Free event registrations ({rows?.count || 0})</h3>{rows?.results.map(row => <div key={row.uuid} className="rounded-xl border p-3 text-sm"><b>{row.attendee_name}</b><p>{row.date} · {row.start_time} · {row.attendees} attendee(s) · {row.verified_mobile}</p><small>Registered {new Date(row.registered_at).toLocaleString('en-IN')}</small></div>)}{rows && !rows.count && <p className="text-sm">No free registrations.</p>}<div className="flex items-center gap-3"><button className="btn-g" disabled={!rows?.previous} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page}</span><button className="btn-g" disabled={!rows?.next} onClick={() => setPage(value => value + 1)}>Next</button></div></div></div>
}
