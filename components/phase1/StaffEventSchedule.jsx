'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { clientApi } from '@/lib/client-api'
import { Field, Input } from '@/components/ui'
import StaffEventDetails from './StaffEventDetails'

export default function StaffEventSchedule({ events, reload, initialSelected = '' }) {
  const [selected, setSelected] = useState(initialSelected), [media, setMedia] = useState([])
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const event = events.find(row => row.uuid === selected)
  useEffect(() => {
    if (!selected) return
    clientApi(`staff/events/${selected}/media`).then(setMedia).catch(err => setError(err.message))
  }, [selected])
  async function action(work) {
    if (busy) return
    setBusy(true); setError('')
    try { await work(); await reload(); if (selected) setMedia(await clientApi(`staff/events/${selected}/media`)) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  async function download(row) {
    await action(async () => {
      const blob = await clientApi(`staff/events/${selected}/media/${row.uuid}/file`, { responseType: 'blob' })
      const url = URL.createObjectURL(blob), link = document.createElement('a')
      link.href = url; link.download = `${event.code}-image`; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }
  return <section className="space-y-4"><h2 className="text-xl font-semibold">Schedule, registrations and images</h2>{events.length > 1 && <Field label="Event"><select className="input" value={selected} onChange={e => { setSelected(e.target.value); setMedia([]) }}><option value="">Choose an event</option>{events.map(row => <option key={row.uuid} value={row.uuid}>{row.code} · {row.name_en}</option>)}</select></Field>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    {event && <div className="space-y-5">{event.publication_status === 'published' && <Link href={`/events/${event.slug}`} className="text-sm text-saffron-700" target="_blank" rel="noopener noreferrer">View public event</Link>}
      <StaffEventDetails key={event.uuid} event={event} reload={reload}/>
      <div className="space-y-3"><h3 className="font-semibold">Occurrences</h3>{event.occurrences.map(row => <div key={row.uuid} className="rounded-xl border p-3"><p className="text-sm">{row.date} · {row.start_time} · {row.status}</p>{row.status === 'scheduled' && <form className="mt-2 flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); action(() => clientApi(`staff/events/${selected}/occurrences/${row.uuid}`, { method: 'PATCH', body: { capacity: Number(new FormData(e.currentTarget).get('capacity')) } })) }}><Field label="Capacity"><Input name="capacity" type="number" min="1" defaultValue={row.capacity} required/></Field><button className="btn-g" disabled={busy}>Save capacity</button><button type="button" className="btn-g" disabled={busy} onClick={() => action(() => clientApi(`staff/events/${selected}/occurrences/${row.uuid}`, { method: 'DELETE' }))}>Withdraw</button></form>}</div>)}</div>
      <form className="grid gap-3 md:grid-cols-4" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; action(async () => { const values = Object.fromEntries(new FormData(form)); if (!values.end_time) delete values.end_time; await clientApi(`staff/events/${selected}/occurrences`, { method: 'POST', body: values }); form.reset() }) }}><Field label="New date"><Input type="date" name="date" required/></Field><Field label="Start time"><Input type="time" name="start_time" required/></Field><Field label="End time"><Input type="time" name="end_time"/></Field><Field label="Capacity"><Input type="number" name="capacity" min="1" defaultValue="50" required/></Field><button className="btn-g md:col-span-4" disabled={busy}>Add occurrence</button></form>
      <div className="space-y-2"><h3 className="font-semibold">Event images</h3>{media.map(row => <div key={row.uuid} className="flex flex-wrap items-center gap-2 text-sm"><span>{row.caption || 'Image'} · {row.publication_state}</span>{row.preview_path && <button className="btn-g" disabled={busy} onClick={() => download(row)}>Download preview</button>}{row.publication_state === 'draft' && <button className="btn-g" disabled={busy} onClick={() => action(() => clientApi(`staff/events/${selected}/media/${row.uuid}/approve`, { method: 'POST', body: {} }))}>Approve image</button>}</div>)}<form className="flex flex-wrap items-center gap-3" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; action(async () => { await clientApi(`staff/events/${selected}/media`, { method: 'POST', body: new FormData(form) }); form.reset() }) }}><input type="file" name="file" accept="image/jpeg,image/png,image/webp" required/><Input name="caption" placeholder="Caption"/><button className="btn-g" disabled={busy}>Upload image for review</button></form></div>
    </div>}
  </section>
}
