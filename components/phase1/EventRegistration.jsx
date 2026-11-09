'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { clientApi, requireAuth } from '@/lib/client-api'
import { Field, Input, PublicShell } from '@/components/ui'

export default function EventRegistration({ event }) {
  const router = useRouter()
  const [occurrenceId, setOccurrenceId] = useState(event.occurrences.find(row => row.status === 'scheduled')?.uuid || '')
  const [attendees, setAttendees] = useState(1), [error, setError] = useState(''), [result, setResult] = useState(null), [busy, setBusy] = useState(false)
  const requestKey = useRef(null)
  const upcoming = event.occurrences.filter(row => row.status === 'scheduled')
  async function register(e) {
    e.preventDefault()
    if (!requireAuth(router, `/events/${event.slug}`, { verified: true })) return
    if (!requestKey.current || requestKey.current.occurrenceId !== occurrenceId) requestKey.current = { occurrenceId, key: crypto.randomUUID() }
    setBusy(true); setError('')
    try { setResult(await clientApi(`events/${event.uuid}/occurrences/${occurrenceId}/registrations`, { method: 'POST', headers: { 'Idempotency-Key': requestKey.current.key }, body: { attendees } })) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <PublicShell><main className="mx-auto max-w-4xl space-y-6 px-4 py-9"><Link className="text-saffron-700" href={`/t/${event.host_listing.slug}`}>← {event.host_listing.name_en}</Link>
    <div><p className="text-sm text-brown-500">{event.kind === 'special_pooja' ? 'Special pooja' : 'Free event'}</p><h1 className="mt-2 text-3xl font-semibold">{event.name_en}</h1>{event.name_ml && <p className="ml text-brown-600">{event.name_ml}</p>}<p className="mt-3 whitespace-pre-wrap">{event.description_en}</p></div>
    {event.media?.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{event.media.map(row => <img key={row.uuid} src={row.url} alt={row.caption || event.name_en} className="w-full rounded-xl object-cover"/>)}</div>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    {result && <p role="status" className="rounded-xl bg-emerald-50 p-3">Registered {result.attendees} attendee(s) under {result.attendee_name}.</p>}
    {event.registration_mode === 'free_registration' ? <form onSubmit={register} className="card space-y-4 p-5"><h2 className="text-xl font-semibold">Free registration</h2><p className="text-sm text-brown-500">Sign in with a verified mobile. Your account name and mobile are used for the attendee list.</p><Field label="Date and time"><select className="input" value={occurrenceId} onChange={e => { setOccurrenceId(e.target.value); setResult(null) }} required>{upcoming.map(row => <option key={row.uuid} value={row.uuid}>{row.date} · {row.start_time} · {row.location_override || event.host_listing.name_en}</option>)}</select></Field><Field label="Attendees"><Input type="number" min="1" max="100" value={attendees} onChange={e => setAttendees(Number(e.target.value))} required/></Field><button className="btn-p" disabled={busy || !occurrenceId}>{busy ? 'Registering…' : 'Register'}</button></form> : <div className="card space-y-3 p-5"><h2 className="text-xl font-semibold">Priced special pooja · ₹{event.price}</h2>{upcoming.map(row => <div key={row.uuid} className="flex flex-wrap items-center justify-between gap-3"><span>{row.date} · {row.start_time}</span><Link className="btn-p" href={`/book/${event.host_listing.slug}?event=${row.uuid}`}>Book this occurrence</Link></div>)}</div>}
  </main></PublicShell>
}
