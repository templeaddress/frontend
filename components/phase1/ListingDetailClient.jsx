'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  BadgeCheck, BarChart3, CalendarDays, Clock3, ExternalLink, Gift, Landmark,
  Mail, MapPin, MessageCircle, Phone, Share2, ShieldCheck, Sparkles, UserRound,
} from 'lucide-react'

import { clientApi, readAuth } from '@/lib/client-api'
import { PublicShell } from '@/components/ui'
import { useDemoPortals } from '@/components/DemoPortalGate'
import { listingPath } from '@/lib/catalogue'
import { AppointmentPanel, ClaimPanel, SponsorPanel } from './ListingPhase2'

const tabs = ['Basic Info', 'Details', 'Contact', 'Donations', 'Poojas']

function openingText(periods = []) {
  if (!periods.length) return 'Timings not published'
  return periods.map(period => `${period.label}: ${period.opens}–${period.closes}`).join(' · ')
}

function Fact({ label, value }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">{label}</dt><dd className="mt-1 font-semibold text-brown-900">{value || 'Not published'}</dd></div>
}

function Metric({ label, value }) {
  return <div className="rounded-xl bg-brown-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-brown-500">{label}</p><p className="mt-1 text-xl font-bold">{value ?? 0}</p></div>
}

function ContactPanel({ listing }) {
  const [contact, setContact] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    setAuthenticated(Boolean(readAuth()?.access))
  }, [])

  async function reveal() {
    setLoading(true)
    setError('')
    try {
      setContact(await clientApi(`listings/${listing.slug}/contact-reveals`, { method: 'POST', body: {} }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <div className="card p-5">
    <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-600"/><h3 className="font-semibold">Official contact</h3></div>
    {!contact && <>
      {(listing.contact?.phone || listing.contact?.whatsapp || listing.contact?.email) && <ul className="mt-3 space-y-1 text-sm font-medium">
        {listing.contact.phone && <li className="flex items-center gap-2"><Phone size={15}/>{listing.contact.phone}</li>}
        {listing.contact.whatsapp && <li className="flex items-center gap-2"><MessageCircle size={15}/>{listing.contact.whatsapp}</li>}
        {listing.contact.email && <li className="flex items-center gap-2"><Mail size={15}/>{listing.contact.email}</li>}
      </ul>}
      <p className="mt-2 text-sm text-brown-500">Contact details are protected from bots. Sign in with a verified mobile or Google account to reveal the approved phone, WhatsApp or email.</p>
      {authenticated
        ? <button type="button" onClick={reveal} disabled={loading} className="btn-g mt-4 w-full">{loading ? 'Checking…' : 'Reveal contact'}</button>
        : <Link href={`/login?next=/t/${listing.slug}`} className="btn-g mt-4 w-full">Login to reveal</Link>}
    </>}
    {contact && <div className="mt-4 space-y-2 text-sm">
      {contact.phone && <a className="btn-g w-full" href={`tel:${contact.phone}`}><Phone size={16}/>{contact.phone}</a>}
      {contact.whatsapp && <a className="btn-wa w-full" href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/>WhatsApp</a>}
      {contact.email && <a className="btn-g w-full" href={`mailto:${contact.email}`}><Mail size={16}/>{contact.email}</a>}
      {!contact.phone && !contact.whatsapp && !contact.email && <p className="rounded-xl bg-brown-50 p-3 text-brown-500">The listing has not published an official contact yet.</p>}
    </div>}
    {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
  </div>
}

function EnquiryForm({ listing }) {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' })
  const [status, setStatus] = useState('')

  async function submit(event) {
    event.preventDefault()
    setStatus('Sending…')
    try {
      await clientApi(`listings/${listing.slug}/enquiries`, { method: 'POST', auth: false, body: { ...form, source: 'listing_page' } })
      setForm({ name: '', mobile: '', email: '', message: '' })
      setStatus('Enquiry sent successfully.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  return <form onSubmit={submit} className="card space-y-3 p-5">
    <h3 className="font-semibold">Quick enquiry</h3>
    <p className="text-sm text-brown-500">Send a message to the listing team. This does not create a paid service booking.</p>
    <div className="grid gap-3 sm:grid-cols-2"><input required className="input" aria-label="Your name" placeholder="Your name" value={form.name} onChange={event => setForm({...form, name: event.target.value})}/><input required className="input" aria-label="Mobile number" placeholder="Mobile number" value={form.mobile} onChange={event => setForm({...form, mobile: event.target.value})}/></div>
    <input className="input" type="email" aria-label="Email" placeholder="Email (optional)" value={form.email} onChange={event => setForm({...form, email: event.target.value})}/>
    <textarea required rows={3} className="input" aria-label="Message" placeholder={`I have an enquiry about ${listing.name_en}.`} value={form.message} onChange={event => setForm({...form, message: event.target.value})}/>
    <button className="btn-p" type="submit">Send enquiry</button>
    {status && <p className="text-sm text-brown-600" role="status">{status}</p>}
  </form>
}

export default function ListingDetailClient({ listing }) {
  const demoPortals = useDemoPortals()
  const [tab, setTab] = useState(0)
  const gallery = listing.gallery || []
  const hero = listing.cover || gallery[0]?.url
  const profile = listing.temple_profile || {}
  const periods = profile.opening_periods || listing.opening_periods || []
  const mapQuery = listing.latitude && listing.longitude ? `${listing.latitude},${listing.longitude}` : `${listing.name_en}, ${listing.address}`
  const mapsSearch = listing.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const pageUrl = `https://templeaddress.com${listingPath(listing)}`
  const listingLabel = listing.listing_type === 'service' ? 'Service' : listing.listing_type === 'festival' ? 'Festival' : 'Temple'
  const onlinePoojas = (listing.poojas || []).filter(item => item.booking_mode === 'online')
  const canBook = listing.booking_enabled && (onlinePoojas.length > 0 || (listing.events || []).some(event => event.registration_mode === 'paid_booking'))
  const canDonate = listing.donation_enabled && (listing.donation_purposes || []).length > 0

  async function share() {
    await clientApi(`listings/${listing.slug}/share`, { method: 'POST', auth: false, body: {} }).catch(() => null)
    if (navigator.share) await navigator.share({ title: listing.name_en, url: pageUrl }).catch(() => null)
    else await navigator.clipboard?.writeText(pageUrl)
  }

  return <PublicShell><main className="mx-auto max-w-6xl px-4 py-6">
    <section className="relative min-h-[330px] overflow-hidden rounded-3xl bg-temple-grad text-white">
      {hero && <Image src={hero} alt={listing.name_en} fill priority sizes="(max-width: 1200px) 100vw, 1152px" className="object-cover"/>}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20"/>
      <div className="relative flex min-h-[330px] flex-col justify-end p-6 md:p-10">
        <div className="flex flex-wrap gap-2"><span className="pill bg-emerald-50 text-emerald-700"><BadgeCheck size={12}/>Verified</span><span className="pill bg-white/90 text-brown-900">{listing.code}</span>{listing.category?.name_en && <span className="pill bg-blue-50 text-blue-800">{listing.category.name_en}</span>}</div>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold md:text-5xl">{listing.name_en}</h1>
        {listing.name_ml && <p className="ml mt-2 text-xl text-white/90">{listing.name_ml}</p>}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/90"><span className="flex items-center gap-1.5"><MapPin size={15}/>{listing.address}</span><span className="flex items-center gap-1.5"><Clock3 size={15}/>{openingText(periods)}</span></div>
      </div>
    </section>

    <nav className="sticky top-16 z-20 -mx-4 mt-4 overflow-x-auto bg-brown-50/95 px-4 py-3 backdrop-blur" aria-label="Listing sections"><div className="flex min-w-max gap-2">{tabs.map((name, index) => <button type="button" key={name} onClick={() => setTab(index)} className={`btn !rounded-full !py-2 ${tab === index ? 'bg-brown-900 text-white' : 'border border-brown-200 bg-white text-brown-800'}`}>{name}</button>)}</div></nav>

    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        {tab === 0 && <>
          <section className="card p-5"><h2 className="text-xl font-semibold">About</h2><p className="mt-2 leading-7 text-brown-700">{listing.description_en || listing.short_description_en || 'Information will be published after verification.'}</p></section>
          {listing.service_profile && <section className="card p-5"><h2 className="text-xl font-semibold">Service provider</h2><dl className="mt-3 grid gap-4 sm:grid-cols-2"><Fact label="Profession" value={listing.service_profile.profession}/><Fact label="Experience (years)" value={listing.service_profile.experience_years}/><Fact label="Qualifications" value={listing.service_profile.qualifications}/><Fact label="Languages" value={listing.service_profile.languages?.join(', ')}/></dl><h3 className="mt-5 font-semibold">Services offered</h3>{listing.service_offerings?.map(row => <div className="mt-3 border-t pt-3" key={row.name_en}><b>{row.name_en}</b><p>{row.description_en}</p><p className="text-sm text-brown-500">{row.indicative_price_text} · {row.duration_text} · {row.availability_text}</p></div>)}<p className="mt-4 text-sm text-brown-500">Contact the provider with an enquiry for availability.</p></section>}
          {listing.festival_profile && <section className="card p-5"><h2 className="text-xl font-semibold">Festival details</h2><dl className="mt-3 grid gap-4 sm:grid-cols-2"><Fact label="Organiser" value={listing.festival_profile.organiser}/><Fact label="Venue" value={listing.festival_profile.venue}/><Fact label="Starts" value={listing.festival_profile.start_date}/><Fact label="Ends" value={listing.festival_profile.end_date}/></dl><h3 className="mt-5 font-semibold">Programme</h3>{listing.programmes?.map((row, index) => <p key={index} className="mt-3 border-t pt-3">{row.date} {row.start_time} · {row.name_en} {row.performer}</p>)}</section>}
          <section className="card p-5"><h2 className="font-semibold">Basic details</h2><dl className="mt-4 grid gap-5 sm:grid-cols-2"><Fact label="Name (English)" value={listing.name_en}/><Fact label="Name (Malayalam)" value={listing.name_ml}/><Fact label={`${listingLabel} code`} value={listing.code}/><Fact label="Category" value={listing.category?.name_en}/><Fact label="Main deity" value={profile.main_deity || listing.main_deity}/><Fact label="District" value={listing.district?.name_en}/><Fact label="Opening hours" value={openingText(periods)}/><Fact label="Pincode" value={listing.pincode}/></dl></section>
          {(listing.speciality || listing.guidelines) && <section className="grid gap-4 sm:grid-cols-2">{listing.speciality && <div className="card p-5"><h3 className="font-semibold">Speciality</h3><p className="mt-2 text-sm leading-6 text-brown-700">{listing.speciality}</p></div>}{listing.guidelines && <div className="card p-5"><h3 className="font-semibold">Visitor guidelines</h3><p className="mt-2 text-sm leading-6 text-brown-700">{listing.guidelines}</p></div>}</section>}
          <section className={`grid gap-6 ${demoPortals ? 'sm:grid-cols-2' : ''}`}><div className="card p-5"><h3 className="font-semibold">Deities</h3><div className="mt-3 flex flex-wrap gap-2">{(listing.deities || []).map(deity => <span key={deity.code} className={`pill ${deity.is_primary ? 'bg-saffron-50 text-saffron-700' : 'bg-brown-100 text-brown-700'}`}>{deity.name_en}{deity.is_primary ? ' · main' : ''}</span>)}</div></div>{demoPortals && <div className="card p-5"><h3 className="font-semibold">Nearby places</h3>{listing.nearby_places?.length ? <ul className="mt-3 space-y-2 text-sm">{listing.nearby_places.map(place => <li key={place.name_en} className="flex gap-2"><MapPin size={14} className="mt-1 shrink-0 text-saffron-600"/><span>{place.name_en}{place.distance_km ? ` · ${place.distance_km} km` : ''}</span></li>)}</ul> : <p className="mt-2 text-sm text-brown-500">Nearby places have not been published.</p>}</div>}</section>
          <section className="card p-5"><h3 className="font-semibold">Gallery</h3>{gallery.length ? <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{gallery.map((image, index) => <figure key={image.uuid} className={`relative overflow-hidden rounded-xl bg-brown-100 ${index === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}><Image src={image.url} alt={image.caption || `${listing.name_en} photo ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-300 hover:scale-105"/></figure>)}</div> : <p className="mt-2 text-sm text-brown-500">Verified gallery images have not been published.</p>}</section>
        </>}

        {tab === 1 && <section className="card space-y-6 p-5"><div><h2 className="text-xl font-semibold">Story and significance</h2><p className="mt-2 leading-7 text-brown-700">{listing.description_en || 'No story has been published.'}</p></div><div><h3 className="font-semibold">History</h3><p className="mt-2 leading-7 text-brown-700">{listing.history || 'No verified history has been published.'}</p></div><div><h3 className="font-semibold">Remarks</h3><p className="mt-2 leading-7 text-brown-700">{listing.remarks || 'No additional remarks.'}</p></div>{profile.management && <p className="flex items-center gap-2 rounded-xl bg-brown-50 p-3 text-sm"><Landmark size={16}/>Managed by <b>{profile.management}</b></p>}{profile.chief_priest && <p className="flex items-center gap-2 rounded-xl bg-brown-50 p-3 text-sm"><UserRound size={16}/>Chief priest <b>{profile.chief_priest}</b></p>}</section>}

        {tab === 2 && <><section className="card p-5"><h2 className="text-xl font-semibold">Contact and directions</h2><p className="mt-2 text-brown-700">{listing.address}</p><div className="mt-4 flex flex-wrap gap-2"><a className="btn-g" href={mapsSearch} target="_blank" rel="noreferrer"><MapPin size={16}/>Open in Maps</a>{listing.website && <a className="btn-g" href={listing.website} target="_blank" rel="noreferrer"><ExternalLink size={16}/>Official website</a>}<button type="button" onClick={share} className="btn-g"><Share2 size={16}/>Share</button></div><iframe title={`Map of ${listing.name_en}`} loading="lazy" referrerPolicy="no-referrer" src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} className="mt-5 h-72 w-full rounded-xl border-0"/></section><EnquiryForm listing={listing}/></>}

        {tab === 3 && <section className="card p-5"><div className="flex items-center gap-2"><Gift size={19} className="text-saffron-600"/><h2 className="text-xl font-semibold">Donation purposes</h2></div>{listing.donation_purposes?.length ? <div className="mt-4 space-y-3">{listing.donation_purposes.map(purpose => <div key={purpose.uuid} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brown-100 p-4"><div><b>{purpose.name_en}</b><p className="text-sm text-brown-500">{purpose.description_en || 'Official payment receipt.'}</p></div>{canDonate ? <Link className="btn-p" href={`/donate/${listing.slug}?purpose=${purpose.uuid}`}>Donate</Link> : <span className="pill bg-brown-100 text-brown-600">Currently unavailable</span>}</div>)}</div> : <p className="mt-3 text-brown-500">Donation details are currently unavailable for this listing.</p>}</section>}

        {tab === 4 && <><section className="card p-5"><h2 className="text-xl font-semibold">Poojas</h2>{listing.poojas?.length ? <div className="mt-4 space-y-3">{listing.poojas.map(pooja => <div key={pooja.uuid} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brown-100 p-4"><div><div className="flex flex-wrap items-center gap-2"><b>{pooja.name_en}</b>{pooja.is_live && <span className="pill bg-red-50 text-red-700">Live today</span>}</div>{pooja.name_ml && <p className="ml text-sm text-brown-500">{pooja.name_ml}</p>}<p className="mt-1 text-sm text-brown-500">{pooja.start_time ? `Starts ${pooja.start_time}` : 'Time published during booking'} · book {pooja.lead_time_hours} hours ahead</p></div><div className="text-right"><b className="text-lg">₹{pooja.price}</b>{pooja.booking_mode === 'online' && listing.booking_enabled ? <Link className="btn-p ml-3" href={`/book/${listing.slug}?pooja=${pooja.uuid}`}>Book</Link> : <p className="text-xs text-brown-500">Display only</p>}</div></div>)}</div> : <p className="mt-3 text-brown-500">Online poojas are not currently published for this listing.</p>}</section>{listing.events?.length > 0 && <section className="card p-5"><h2 className="text-xl font-semibold">Events and special poojas</h2><div className="mt-4 space-y-3">{listing.events.map(event => <div key={event.uuid} className="rounded-xl border border-brown-100 p-4"><b>{event.name_en}</b><p className="text-sm text-brown-500">{event.registration_mode === 'paid_booking' ? `Priced special pooja · ₹${event.price}` : 'Free registration'}</p>{event.occurrences?.map(occurrence => <p key={occurrence.uuid} className="mt-2 flex items-center gap-2 text-sm"><CalendarDays size={15}/>{occurrence.date} · {occurrence.start_time}</p>)}</div>)}</div></section>}</>}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
        <div className="card space-y-2 p-5">{canBook ? <Link className="btn-p w-full" href={`/book/${listing.slug}`}>Book pooja</Link> : <span className="btn-s w-full cursor-not-allowed">Booking currently unavailable</span>}{canDonate ? <Link className="btn-g w-full" href={`/donate/${listing.slug}`}>Donate</Link> : <span className="btn-g w-full cursor-not-allowed opacity-60">Donations unavailable</span>}<Link className="btn-wa w-full" href="/whatsapp"><MessageCircle size={16}/>Ask on WhatsApp</Link><p className="pt-2 text-xs text-brown-500">TempleAddress convenience fee is ₹0. Razorpay may show its processing charge inside checkout.</p></div>
        {listing.listing_type === 'service' && <AppointmentPanel listing={listing}/>}
        <ContactPanel listing={listing}/>
        <SponsorPanel listing={listing}/>
        <div className="card p-5"><h3 className="font-semibold">Quick info</h3><dl className="mt-4 grid gap-4"><Fact label={`${listingLabel} code`} value={listing.code}/><Fact label="Main deity" value={profile.main_deity || listing.main_deity}/><Fact label="Location" value={listing.district?.name_en}/><Fact label="Opening" value={openingText(periods)}/></dl></div>
        <div className="card p-5"><div className="flex items-center gap-2"><BarChart3 size={17}/><h3 className="font-semibold">Listing activity</h3></div><div className="mt-3 grid grid-cols-2 gap-2"><Metric label="Views" value={listing.analytics?.views}/><Metric label="Shares" value={listing.analytics?.shares}/><Metric label="Contacts" value={listing.analytics?.contact_reveals}/><Metric label="Enquiries" value={listing.analytics?.enquiries}/></div></div>
        <div className="card p-5 text-center"><div className="mx-auto w-fit rounded-xl border-4 border-brown-900 bg-white p-2"><QRCodeSVG value={pageUrl} size={112}/></div><p className="mt-3 text-sm font-semibold">{listingLabel} QR code</p><p className="text-xs text-brown-500">Scan to open this verified page.</p></div>
        <ClaimPanel listing={listing}/>
      </aside>
    </div>
  </main></PublicShell>
}
