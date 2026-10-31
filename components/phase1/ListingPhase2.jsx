'use client'

// Phase 2 panels on a public listing page: sponsor branding and slot, listing claim, and service appointment requests.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarClock, ShieldCheck } from 'lucide-react'
import { clientApi, isVerifiedUser, readAuth, requireAuth } from '@/lib/client-api'
import { indiaDate } from '@/lib/booking-dates'

export function SponsorPanel({ listing }) {
  const [data, setData] = useState(null)
  useEffect(() => { clientApi(`listings/${listing.slug}/sponsors`, { auth: false }).then(setData).catch(() => setData(null)) }, [listing.slug])
  if (!data) return null
  return <>
    {data.sponsors.map(row => <div key={row.uuid} className="card p-4"><p className="mb-2 text-xs text-brown-500">Sponsored · {row.title}</p>{row.media_url && <img src={row.media_url} alt={`${row.title} sponsor banner`} className="w-full rounded-xl" loading="lazy"/>}{row.message && <p className="mt-2 text-sm">{row.message}</p>}{/^https?:\/\//.test(row.click_url || '') && <a href={row.click_url} rel="sponsored noopener noreferrer" target="_blank" className="text-sm underline">Visit sponsor</a>}</div>)}
    {data.slot_available && <Link href={`/sponsor?slug=${listing.slug}&kind=third_party`} className="block rounded-2xl border-2 border-dashed border-brown-200 p-4 text-sm hover:bg-white"><b>Sponsor slot available</b><span className="block text-brown-500">Put your name on this {listing.listing_type}’s page, receipts and QR board.</span></Link>}
  </>
}

export function ClaimPanel({ listing }) {
  const router = useRouter(), [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState(false)
  async function submit(event) {
    event.preventDefault()
    if (!requireAuth(router, `/t/${listing.slug}`)) return
    setBusy(true); setError('')
    try { await clientApi(`listings/${listing.slug}/claims`, { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) }); setDone(true) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="rounded-2xl bg-brown-900 p-5 text-white"><ShieldCheck size={20} className="text-gold-300"/><h3 className="mt-2 font-semibold">Are you the {listing.listing_type === 'service' ? 'provider' : 'committee'}?</h3>
    {done ? <p className="mt-2 text-sm text-brown-100">Claim submitted. TempleAddress staff will verify it and contact you.</p> : !open ? <><p className="mt-1 text-sm text-brown-100">Claim this page to manage poojas, bookings, charts and payouts.</p><button type="button" className="btn mt-3 bg-white text-brown-900" onClick={() => { if (requireAuth(router, `/t/${listing.slug}`)) setOpen(true) }}>Claim this listing</button></> :
      <form onSubmit={submit} className="mt-3 space-y-2 text-brown-900"><input name="role" required className="input" placeholder="Your role, e.g. Secretary"/><input name="organisation" className="input" placeholder="Committee / trust name"/><textarea name="message" className="input" rows={2} placeholder="How can we verify you? e.g. committee resolution"/>{error && <p role="alert" className="text-sm text-red-200">{error}</p>}<button className="btn-p w-full" disabled={busy}>{busy ? 'Submitting…' : 'Submit claim'}</button></form>}
  </div>
}

const MODES = { in_person: 'In person', online: 'Online', phone: 'Phone' }
export function AppointmentPanel({ listing }) {
  const router = useRouter(), [day, setDay] = useState(indiaDate()), [data, setData] = useState(null), [slot, setSlot] = useState(''), [mode, setMode] = useState('in_person'), [service, setService] = useState(''), [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState(null)
  useEffect(() => { setSlot(''); clientApi(`listings/${listing.slug}/appointment-slots?date=${day}`, { auth: false }).then(value => { setData(value); setMode(value.modes[0] || 'in_person') }).catch(err => setError(err.message)) }, [listing.slug, day])
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!requireAuth(router, `/t/${listing.slug}`)) return
    if (!isVerifiedUser(readAuth()?.user)) return setError('Sign in with mobile OTP or Google to request an appointment.')
    setBusy(true)
    try { setDone(await clientApi(`listings/${listing.slug}/appointments`, { method: 'POST', body: { starts_at: slot, mode, service, message } })) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const time = value => new Date(value).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
  if (done) return <div className="card p-5"><CalendarClock size={20} className="text-saffron-600"/><h3 className="mt-2 font-semibold">Request sent</h3><p className="mt-1 text-sm text-brown-600">{new Date(done.starts_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} · {MODES[done.mode]}. The provider will confirm; you pay them directly.</p><Link className="mt-3 inline-block text-sm text-saffron-700 underline" href="/account/appointments">My appointments</Link></div>
  return <form onSubmit={submit} className="card space-y-3 p-5"><div className="flex items-center gap-2"><CalendarClock size={18} className="text-saffron-600"/><h3 className="font-semibold">Request an appointment</h3></div><p className="text-xs text-brown-500">{data?.payment || 'No online payment. Pay the provider directly.'}</p>
    <label className="block text-sm">Date<input type="date" className="input mt-1" min={indiaDate()} value={day} onChange={e => setDay(e.target.value)} required/></label>
    <div><p className="text-sm">Time</p><div className="mt-1 flex flex-wrap gap-1.5">{data?.slots.map(value => <button type="button" key={value} aria-pressed={slot === value} onClick={() => setSlot(value)} className={`rounded-lg border px-2.5 py-1 text-xs ${slot === value ? 'border-saffron-600 bg-saffron-50 font-semibold' : 'border-brown-200'}`}>{time(value)}</button>)}{data && !data.slots.length && <p className="text-xs text-brown-500">No free slots on this date.</p>}</div></div>
    {data?.services?.length > 0 && <label className="block text-sm">Service<select className="input mt-1" value={service} onChange={e => setService(e.target.value)}><option value="">General consultation</option>{data.services.map(row => <option key={row.name_en} value={row.name_en}>{row.name_en}{row.price_text ? ` · ${row.price_text}` : ''}</option>)}</select></label>}
    {data?.modes?.length > 1 && <label className="block text-sm">Consultation<select className="input mt-1" value={mode} onChange={e => setMode(e.target.value)}>{data.modes.map(value => <option key={value} value={value}>{MODES[value]}</option>)}</select></label>}
    <label className="block text-sm">Message (optional)<textarea className="input mt-1" rows={2} maxLength={1000} value={message} onChange={e => setMessage(e.target.value)}/></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-2 text-sm text-red-700">{error}</p>}<button className="btn-p w-full" disabled={busy || !slot}>{busy ? 'Sending…' : 'Request appointment'}</button></form>
}


export function MyAppointments() {
  const router = useRouter(), [rows, setRows] = useState(null), [error, setError] = useState('')
  const load = () => clientApi('me/appointments').then(setRows).catch(err => setError(err.message))
  useEffect(() => { if (requireAuth(router, '/account/appointments')) load() }, [router]) // eslint-disable-line react-hooks/exhaustive-deps
  async function cancel(uuid) { setError(''); try { await clientApi(`me/appointments/${uuid}/cancel`, { method: 'POST', body: {} }); load() } catch (err) { setError(err.message) } }
  const upcoming = row => ['requested', 'confirmed'].includes(row.status) && new Date(row.starts_at) > new Date()
  return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="font-display text-3xl font-semibold">My appointments</h1><p className="mt-1 text-sm text-brown-500">Service appointments are paid directly to the provider.</p>{error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    <div className="mt-6 space-y-3">{rows?.map(row => <article key={row.uuid} className="card p-4"><div className="flex flex-wrap justify-between gap-2"><Link className="font-semibold hover:text-saffron-700" href={`/t/${row.listing.slug}`}>{row.listing.name_en}</Link><span className="text-sm capitalize">{row.status.replaceAll('_', ' ')}</span></div><p className="mt-1 text-sm text-brown-600">{new Date(row.starts_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} · {MODES[row.mode] || row.mode}{row.service ? ` · ${row.service}` : ''}</p>{upcoming(row) && <button className="mt-2 text-sm text-red-700 underline" onClick={() => cancel(row.uuid)}>Cancel request</button>}</article>)}{rows && !rows.length && <p className="text-brown-500">No appointments yet.</p>}{!rows && !error && <p role="status">Loading…</p>}</div></main>
}
