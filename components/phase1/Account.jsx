'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PublicShell, Field, Input } from '@/components/ui'
import { canLinkGoogle, canLinkMobile, clientApi, logout, readAuth, requireAuth, saveAuth } from '@/lib/client-api'
import ListingRevisionEditor from './ListingRevisionEditor'
import EventEditor from './EventEditor'
import PoojaCatalogue from './PoojaCatalogue'
import AccountFeatures from './AccountFeatures'
import BookingCorrection from './BookingCorrection'
import { apiCollection } from '@/lib/catalogue'
import { indiaDate } from '@/lib/booking-dates'
import styles from './Template.module.css'
import PublicText from '@/components/PublicText'

const Wrap = ({ children }) => <main className="mx-auto max-w-5xl px-4 py-9">{children}</main>
const ErrorBox = ({ value }) => value ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{value}</p> : null
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

// Links Google to the signed-in mobile account; the server refuses a Google account already used elsewhere.
function LinkGoogle({ onLinked }) {
  const button = useRef(null)
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    const setup = () => {
      if (!window.google?.accounts?.id || !button.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setBusy(true); setError('')
          try {
            const result = await clientApi('auth/google', { method: 'POST', body: { provider: 'google', credential } })
            if (result.user?.uuid !== readAuth()?.user?.uuid) throw new Error('Your session changed. Please sign in again.')
            saveAuth(result); onLinked(result.user)
          } catch (err) { setError(err.message) } finally { setBusy(false) }
        },
      })
      button.current.replaceChildren()
      window.google.accounts.id.renderButton(button.current, { theme: 'outline', size: 'large', width: 280, shape: 'pill', text: 'continue_with', locale: 'en' })
    }
    if (window.google?.accounts?.id) return setup()
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client?hl=en'; script.async = true; script.defer = true; script.onload = setup
    document.head.appendChild(script)
    return () => script.remove()
  }, [onLinked])
  if (!GOOGLE_CLIENT_ID) return null
  return <section className="card mt-5 space-y-3 p-5"><h2 className="text-xl font-semibold"><PublicText>Link Google</PublicText></h2><p className={styles.hint}><PublicText>Sign in with Google or your mobile OTP to reach this same account.</PublicText></p><div ref={button} aria-busy={busy}/>{busy && <p role="status" className={styles.hint}>Linking…</p>}<ErrorBox value={error}/></section>
}

export function Phase1Account() {
  const router = useRouter(); const [me, setMe] = useState(null); const [bookings, setBookings] = useState([]); const [error, setError] = useState(''); const [loggingOut, setLoggingOut] = useState(false)
  const [filter, setFilter] = useState('all'), [query, setQuery] = useState(''), [loading, setLoading] = useState(true)
  const reloadBookings = () => apiCollection('me/bookings', clientApi).then(setBookings)
  useEffect(() => {
    if (!requireAuth(router, '/account')) return
    Promise.all([clientApi('me'), apiCollection('me/bookings', clientApi)]).then(([user, rows]) => { setMe(user); setBookings(rows) }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [router])
  async function signOut() { setLoggingOut(true); try { await logout() } finally { router.replace('/login'); router.refresh() } }
  const upcoming = row => row.items.some(item => item.status === 'confirmed' && item.service_date >= indiaDate())
  const matches = row => filter === 'all' || (filter === 'upcoming' ? upcoming(row) : filter === 'incomplete' ? row.status === 'payment_pending' : Boolean(row.receipt_number))
  const visible = bookings.filter(row => matches(row) && `${row.code} ${row.listing.name_en} ${row.items.map(item => `${item.item_name_en} ${item.devotee_name}`).join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  return <PublicShell><main className={styles.accountPage}>
    <section className={styles.profileBanner}><div className={styles.profileIdentity}><div className={styles.avatar} aria-hidden="true">{me?.name?.trim().charAt(0).toUpperCase() || 'U'}</div><div><h1>{me?.name || <PublicText>My account</PublicText>}</h1><p className={styles.profileContact}>{me?.mobile_e164 || (canLinkMobile(me) && <Link href="/login?link=mobile&next=/account" className="font-semibold text-white underline"><PublicText>Add mobile number</PublicText></Link>)}</p>{me?.email && <p className={styles.profileContact}>{me.email}</p>}</div></div><div className="flex flex-wrap gap-2"><Link href="/partner/profile" className="btn-g"><PublicText>Become a Partner</PublicText></Link><Link href="/account/listings" className="btn-g"><PublicText>My listings</PublicText></Link><button className="btn-g" disabled={loggingOut} onClick={signOut}>{loggingOut ? 'Signing out…' : 'Logout'}</button></div></section><ErrorBox value={error}/>
    {canLinkGoogle(me) && <LinkGoogle onLinked={setMe}/>}
    <div className={styles.stats}>{[['all', 'Total bookings', bookings.length], ['upcoming', 'Upcoming', bookings.filter(upcoming).length], ['incomplete', 'Incomplete', bookings.filter(row => row.status === 'payment_pending').length], ['receipts', 'Receipts', bookings.filter(row => row.receipt_number).length]].map(([value, label, count]) => <button key={value} className={styles.stat} aria-label={`Show ${label.toLowerCase()}`} onClick={() => { setFilter(value); document.getElementById('account-bookings')?.scrollIntoView({ behavior: 'smooth' }) }}><span><PublicText>{label}</PublicText></span><strong>{loading ? '—' : count}</strong></button>)}</div>
    <section className={styles.quickActions}><h2><PublicText>Book Poojas & Services</PublicText></h2><p className={styles.hint}><PublicText>Find temples and services for your next booking.</PublicText></p><div className="mt-3 flex flex-wrap gap-2"><Link href="/temples" className="btn-p"><PublicText>Book a pooja</PublicText></Link><Link href="/services" className="btn-g"><PublicText>Explore services</PublicText></Link><Link href="/temples" className="btn-g"><PublicText>Explore temples</PublicText></Link></div></section>
    <section id="account-bookings" className="mt-7 scroll-mt-24"><h2 className="text-2xl font-semibold"><PublicText>My Bookings & Donations</PublicText></h2>
      <div className={styles.filters}>{[['all', 'All'], ['upcoming', 'Upcoming'], ['incomplete', 'Incomplete'], ['receipts', 'With receipts']].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}><PublicText>{label}</PublicText></button>)}</div>
      <Input type="search" aria-label="Search bookings" placeholder="Search booking code, temple, pooja or devotee" value={query} onChange={event => setQuery(event.target.value)}/>
      <div className="mt-3 space-y-3">{loading ? <p role="status" className="card p-5">Loading bookings…</p> : !visible.length && !error && <div className="card p-5">{bookings.length ? <PublicText>No bookings match your search.</PublicText> : <PublicText>No bookings yet.</PublicText>} <Link className="text-saffron-600" href="/temples"><PublicText>Browse temples</PublicText></Link></div>}
      {visible.map(row => { const payable = row.status === 'payment_pending' && new Date(row.payment_deadline_at) > new Date(); const donation = row.items.every(item => item.item_type === 'donation'); return <article className={styles.bookingRecord} key={row.uuid}>
        <div className={styles.recordTop}><div><b>{row.listing.name_en}</b><p className={styles.hint}><PublicText values={{ code: row.code }}>{'Booking code: {code}'}</PublicText></p></div><span className={styles.status}><PublicText>{row.status.replaceAll('_', ' ')}</PublicText></span></div>
        <div className={styles.recordItems}>{row.items.map(item => <div key={item.uuid} className={styles.recordItem}><div><b>{item.item_name_en}</b><p className={styles.hint}>{[item.devotee_name, item.star_value, item.service_date, item.service_time?.slice(0, 5)].filter(Boolean).join(' · ')}</p></div><span>Qty {item.quantity} · ₹{item.amount}</span></div>)}</div>
        <div className={styles.recordTop}><b>Total: ₹{row.amount_total}</b><div className={styles.recordActions}>{row.receipt_number ? <Link className="btn-p" href={`/receipt/${row.code}`}><PublicText>View receipt</PublicText></Link> : payable ? <Link className="btn-p" href={`/${donation ? 'donate' : 'book'}/${row.listing.slug}?resume=${row.code}`}><PublicText>Continue payment</PublicText></Link> : <span className="pill bg-stone-100 text-stone-600"><PublicText>No receipt</PublicText></span>}</div></div><BookingCorrection booking={row} onSaved={reloadBookings}/>
      </article> })}</div></section>
    {me && <AccountFeatures me={me}/>}
  </main></PublicShell>
}

export function MyListings() {
  const router = useRouter(); const [rows, setRows] = useState([]); const [error, setError] = useState('')
  useEffect(() => { if (!requireAuth(router, '/account/listings')) return; Promise.all([clientApi('me/listings'), clientApi('me/managed-listings')]).then(([own, managed]) => setRows([...own, ...managed.filter(item => !own.some(row => row.uuid === item.uuid))])).catch(err => setError(err.message)) }, [router])
  return <PublicShell><Wrap><div className="flex items-end justify-between"><div><h1 className="text-3xl font-semibold"><PublicText>My listing submissions</PublicText></h1><p className="text-sm text-brown-500"><PublicText>Submission does not grant operational ownership; staff grants memberships after verification.</PublicText></p></div><Link className="btn-p" href="/account/listings/new"><PublicText>Create listing</PublicText></Link></div><ErrorBox value={error}/><div className="mt-6 grid gap-4">{rows.map(row => <div className="card flex flex-wrap items-center justify-between gap-3 p-5" key={row.uuid}><div><b>{row.name_en}</b><p className="text-sm text-brown-500">{row.listing_type} · {row.code} · {row.publication_status}</p></div><div className="flex gap-2">{row.publication_status === 'published' && <Link className="btn-g" href={`/t/${row.slug}`}><PublicText>Public page</PublicText></Link>}<Link className="btn-p" href={`/account/listings/${row.uuid}/manage`}><PublicText>Manage submission</PublicText></Link></div></div>)}</div></Wrap></PublicShell>
}

export function CreateListing() {
  const router = useRouter(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); if (!requireAuth(router, '/account/listings/new')) return; setBusy(true); setError('')
    const form = Object.fromEntries(new FormData(event.currentTarget))
    form.sections_completed = ['basics', 'contact']
    try { const result = await clientApi('me/listings', { method: 'POST', body: form }); router.push(`/account/listings/${result.listing.uuid}/manage`) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <PublicShell><Wrap><h1 className="text-3xl font-semibold"><PublicText>Create a listing submission</PublicText></h1><p className="mt-2 text-brown-500"><PublicText>You can list a temple, festival or service. Events are created beneath an approved listing.</PublicText></p><form onSubmit={submit} className="card mt-6 grid gap-4 p-6 md:grid-cols-2"><Field label="Listing type"><select name="listing_type" className="input" defaultValue="temple"><option value="temple"><PublicText>Temple</PublicText></option><option value="festival"><PublicText>Festival</PublicText></option><option value="service"><PublicText>Service person/provider</PublicText></option></select></Field><Field label="English name"><Input name="name_en" required/></Field><Field label="Malayalam name"><Input name="name_ml"/></Field><Field label="Address"><Input name="address" required/></Field><Field label="Pincode"><Input name="pincode"/></Field><Field label="Official phone"><Input name="phone"/></Field><Field label="Official email"><Input type="email" name="email"/></Field><Field label="Payout notification email"><Input type="email" name="payout_email"/></Field><Field label="Short description" className="md:col-span-2"><textarea name="short_description_en" className="input" rows={3}/></Field><div className="md:col-span-2"><ErrorBox value={error}/><button disabled={busy} className="btn-p">{busy ? 'Creating…' : 'Create draft'}</button></div></form></Wrap></PublicShell>
}

export function ManageListing() {
  const [revision, setRevision] = useState(null)
  const { slug: uuid } = useParams(); const router = useRouter(); const [listing, setListing] = useState(null); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [catalogue, setCatalogue] = useState([]); const [events, setEvents] = useState([])
  const load = useCallback(async () => {
    const [owned, managed] = await Promise.all([clientApi('me/listings'), clientApi('me/managed-listings')])
    const own = owned.find(row => row.uuid === uuid), member = managed.find(row => row.uuid === uuid)
    const item = own || member ? { ...own, ...member, is_submitter: Boolean(own) } : null
    setListing(item)
    if (item?.is_submitter || item?.can_manage_content) { try { setRevision(await clientApi(`me/listings/${uuid}/revision`)) } catch (err) { if (err.status !== 404) throw err; setRevision(null) } } else setRevision(null)
    if (item?.publication_status === 'published' && item.can_manage_content) {
      const kind = item.listing_type === 'service' ? 'service-offerings' : 'poojas'
      clientApi(`me/managed-listings/${uuid}/${kind}`).then(setCatalogue).catch(() => {})
    }
    if (item?.publication_status === 'published' && item.can_manage_events) clientApi(`me/managed-listings/${uuid}/events`).then(setEvents).catch(() => {})
  }, [uuid])
  useEffect(() => { if (!requireAuth(router, `/account/listings/${uuid}/manage`)) return; load().catch(err => setError(err.message)) }, [router, uuid, load])
  async function action(path, body, method = 'POST') { setError(''); setMessage(''); try { const result = await clientApi(path, { method, body }); setMessage('Saved successfully.'); await load(); return result } catch (err) { setError(err.message); throw err } }
  async function submitKyc(event) { event.preventDefault(); try { await action(`me/listings/${uuid}/kyc`, Object.fromEntries(new FormData(event.currentTarget)), 'PUT') } catch {} }
  async function submitBank(event) { event.preventDefault(); try { await action(`me/listings/${uuid}/bank-accounts`, Object.fromEntries(new FormData(event.currentTarget))) } catch {} }
  async function addCatalogue(event) { event.preventDefault(); const kind = listing.listing_type === 'service' ? 'service-offerings' : event.currentTarget.dataset.kind; try { await action(`me/managed-listings/${uuid}/${kind}`, Object.fromEntries(new FormData(event.currentTarget))) } catch {} }
  if (!listing) return <PublicShell><Wrap><h1>Loading listing…</h1><ErrorBox value={error}/></Wrap></PublicShell>
  return <PublicShell><Wrap><div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-3xl font-semibold">{listing.name_en}</h1><p className="text-sm text-brown-500">{listing.code} · {listing.listing_type} · {listing.publication_status}</p></div>{listing.publication_status === 'published' && <Link className="btn-g" href={`/t/${listing.slug}`}><PublicText>View public page</PublicText></Link>}</div>{message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"><PublicText>{message}</PublicText></p>}<ErrorBox value={error}/>
    {(listing.is_submitter || listing.can_manage_content) && <ListingRevisionEditor listing={listing} revision={revision} onChange={load}/>}
    {revision?.can_access_private && <div className="mt-6 grid gap-5 lg:grid-cols-2"><form onSubmit={submitKyc} className="card space-y-3 p-5"><h2 className="text-xl font-semibold"><PublicText>Beneficiary KYC</PublicText></h2><Field label="Beneficiary name"><Input name="beneficiary_name" required/></Field><Field label="Registration number"><Input name="registration_number"/></Field><Field label="PAN"><Input name="pan"/></Field><button className="btn-p"><PublicText>Submit KYC</PublicText></button></form><form onSubmit={submitBank} className="card space-y-3 p-5"><h2 className="text-xl font-semibold"><PublicText>Bank account version</PublicText></h2><Field label="Beneficiary name"><Input name="beneficiary_name" required/></Field><Field label="Account number"><Input name="account_number" required/></Field><Field label="IFSC"><Input name="ifsc" required/></Field><Field label="Bank name"><Input name="bank_name" required/></Field><button className="btn-p"><PublicText>Submit for verification</PublicText></button></form></div>}
    {listing.publication_status === 'published' && listing.can_manage_content && <><section className="mt-7"><h2 className="text-2xl font-semibold"><PublicText>Catalogue</PublicText></h2><div className="mt-3 grid gap-4 lg:grid-cols-2"><form data-kind={listing.listing_type === 'service' ? 'service-offerings' : 'poojas'} onSubmit={addCatalogue} className="card space-y-3 p-5"><h3 className="font-semibold">Add {listing.listing_type === 'service' ? 'service offering' : 'pooja'}</h3><Field label={<PublicText>Name</PublicText>}><Input name="name_en" required/></Field>{listing.listing_type === 'service' ? <><Field label="Indicative price text"><Input name="indicative_price_text" placeholder="Contact for details"/></Field><Field label={<PublicText>Duration</PublicText>}><Input name="duration_text"/></Field><Field label={<PublicText>Availability</PublicText>}><Input name="availability_text"/></Field></> : <><Field label="Price ₹"><Input type="number" name="price" min="0.01" step="0.01" required/></Field><Field label={<PublicText>Lead time hours</PublicText>}><Input type="number" name="lead_time_hours" defaultValue="8"/></Field><Field label={<PublicText>Daily capacity</PublicText>}><Input type="number" name="daily_capacity" defaultValue="10"/></Field><Field label={<PublicText>Start time</PublicText>}><Input type="time" name="start_time" required/></Field></>}<button className="btn-p"><PublicText>Add</PublicText></button></form>{listing.listing_type !== 'service' && <form data-kind="donation-purposes" onSubmit={addCatalogue} className="card space-y-3 p-5"><h3 className="font-semibold"><PublicText>Add donation purpose</PublicText></h3><Field label={<PublicText>Name</PublicText>}><Input name="name_en" required/></Field><Field label="Suggested amount ₹"><Input type="number" name="suggested_amount" min="0.01" step="0.01"/></Field><button className="btn-p"><PublicText>Add</PublicText></button></form>}</div><div className="mt-3 text-sm text-brown-500">{catalogue.map(row => row.name_en).join(' · ') || 'No catalogue entries yet.'}</div>{listing.listing_type !== 'service' && <PoojaCatalogue listing={listing} poojas={catalogue} reload={load}/>}</section>
    </>}
    {listing.publication_status === 'published' && listing.can_manage_events && ['temple', 'service'].includes(listing.listing_type) && <EventEditor listing={listing} events={events} reload={load}/>}
  </Wrap></PublicShell>
}
