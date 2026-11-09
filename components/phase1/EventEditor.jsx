'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { clientApi } from '@/lib/client-api'
import { Field, Input } from '@/components/ui'

function EventRow({ listing, event, reload }) {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [media, setMedia] = useState([])
  const base = `me/managed-listings/${listing.uuid}/events/${event.uuid}`
  useEffect(() => {
    if (!event.can_edit) return
    clientApi(`${base}/media`).then(setMedia).catch(err => setError(err.message))
  }, [base, event.can_edit])
  async function action(work) {
    if (busy) return
    setBusy(true); setError('')
    try { await work(); await reload() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  async function download(row) {
    await action(async () => {
      const blob = await clientApi(`${base}/media/${row.uuid}/file`, { responseType: 'blob' })
      const url = URL.createObjectURL(blob), link = document.createElement('a')
      link.href = url; link.download = `${event.code}-image`; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }
  return <div className="card space-y-4 p-5">
    <div><h3 className="font-semibold">{event.name_en}</h3><p className="text-sm text-brown-500">{event.code} · {event.publication_status.replaceAll('_', ' ')}</p></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {event.publication_status === 'published' && <Link className="btn-g" href={`/events/${event.slug}`}>Public event page</Link>}
    {event.can_edit && <form className="grid gap-3 md:grid-cols-2" onSubmit={e => { e.preventDefault(); action(() => clientApi(base, { method: 'PATCH', body: Object.fromEntries(new FormData(e.currentTarget)) })) }}>
      <Field label="Event name"><Input name="name_en" defaultValue={event.name_en} required/></Field>
      <Field label="Malayalam name"><Input name="name_ml" defaultValue={event.name_ml || ''}/></Field>
      <Field label="Description"><Input name="description_en" defaultValue={event.description_en || ''}/></Field>
      <Field label="Malayalam description"><Input name="description_ml" defaultValue={event.description_ml || ''}/></Field>
      <Field label="Purpose"><Input name="purpose" defaultValue={event.purpose || ''}/></Field>
      <div className="self-end"><button className="btn-g" disabled={busy}>Save event draft</button></div>
    </form>}
    <div className="space-y-2"><h4 className="font-semibold">Occurrences</h4>{event.occurrences.map(row => <div key={row.uuid} className="flex flex-wrap items-center gap-3 text-sm"><span>{row.date} · {row.start_time} · capacity {row.capacity} · {row.status}</span>{event.can_edit && row.status === 'scheduled' && <button type="button" className="btn-g" disabled={busy} onClick={() => action(() => clientApi(`${base}/occurrences/${row.uuid}`, { method: 'DELETE' }))}>Withdraw</button>}</div>)}</div>
    {event.can_edit && <form className="grid gap-3 md:grid-cols-4" onSubmit={e => { e.preventDefault(); const element = e.currentTarget; action(async () => { const values = Object.fromEntries(new FormData(element)); if (!values.end_time) delete values.end_time; await clientApi(`${base}/occurrences`, { method: 'POST', body: values }); element.reset() }) }}>
      <Field label="Add date"><Input name="date" type="date" required/></Field><Field label="Start time"><Input name="start_time" type="time" required/></Field><Field label="End time"><Input name="end_time" type="time"/></Field><Field label="Capacity"><Input name="capacity" type="number" min="1" defaultValue="50" required/></Field>
      <button className="btn-g md:col-span-4" disabled={busy}>Add occurrence</button>
    </form>}
    {event.can_edit && <><h4 className="font-semibold">Event images · optional</h4>{media.map(row => <div key={row.uuid} className="flex flex-wrap items-center gap-2 text-sm"><span>{row.caption || 'Event image'} · {row.publication_state}</span>{row.preview_path && <button className="btn-g" disabled={busy} onClick={() => download(row)}>Download preview</button>}{row.publication_state === 'draft' && <button className="btn-g" disabled={busy} onClick={() => action(async () => { await clientApi(`${base}/media`, { method: 'DELETE', body: { uuid: row.uuid } }); setMedia(await clientApi(`${base}/media`)) })}>Remove draft</button>}</div>)}
      <form onSubmit={e => { e.preventDefault(); const element = e.currentTarget; action(async () => { await clientApi(`${base}/media`, { method: 'POST', body: new FormData(element) }); element.reset(); setMedia(await clientApi(`${base}/media`)) }) }} className="flex flex-wrap items-center gap-3"><input type="file" name="file" accept="image/jpeg,image/png,image/webp" required/><Input name="caption" placeholder="Caption"/><button className="btn-g" disabled={busy}>Upload draft image</button></form></>}
    {event.can_edit && <button className="btn-p" disabled={busy} onClick={() => action(() => clientApi(`${base}/submit`, { method: 'POST', body: {} }))}>Submit event for staff review</button>}
  </div>
}

export default function EventEditor({ listing, events, reload }) {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const base = `me/managed-listings/${listing.uuid}/events`
  async function create(event) {
    event.preventDefault(); const form = event.currentTarget
    setBusy(true); setError('')
    try {
      const values = Object.fromEntries(new FormData(form))
      if (!values.end_time) delete values.end_time
      await clientApi(base, { method: 'POST', body: values })
      form.reset(); await reload()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <section className="mt-7 space-y-4"><h2 className="text-2xl font-semibold">Free events</h2><p className="text-sm text-brown-500">Event Editors may submit free Temple or Service events. Staff approval makes an event public.</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <form onSubmit={create} className="card grid gap-3 p-5 md:grid-cols-2"><Field label="Event name"><Input name="name_en" required/></Field><Field label="Malayalam name"><Input name="name_ml"/></Field><Field label="Date"><Input name="date" type="date" required/></Field><Field label="Start time"><Input name="start_time" type="time" required/></Field><Field label="End time"><Input name="end_time" type="time"/></Field><Field label="Capacity"><Input name="capacity" type="number" min="1" defaultValue="50" required/></Field><button className="btn-p md:col-span-2" disabled={busy}>Create free event draft</button></form>
    {events.map(row => <EventRow key={row.uuid} event={row} listing={listing} reload={reload}/>)}
  </section>
}
