'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Field, Input, PublicShell, Logo } from '@/components/ui'
import { CreditCard, Phone, Download, Printer, Share2 } from 'lucide-react'
import { API_ORIGIN } from '@/lib/api'
import { clientApi, isVerifiedUser, readAuth, requireAuth, saveAuth } from '@/lib/client-api'
import StarSelect from './StarSelect'
import { earliestDate, indiaDate, recurringDates } from '@/lib/booking-dates'
import OtpInput from './OtpInput'
import styles from './Template.module.css'

const Wrap = ({ children }) => <main className="mx-auto max-w-2xl px-4 py-10">{children}</main>

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) { existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', reject, { once: true }); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.dataset.razorpayCheckout = 'true'; script.onload = resolve
    script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.'))
    document.head.appendChild(script)
  })
}

async function openPayment({ booking, config, user, mode }) {
  if (!booking.payment_order?.uuid) throw new Error('Razorpay order was not created.')
  const remainingSeconds = Math.floor((new Date(booking.payment_deadline_at).getTime() - Date.now()) / 1000)
  if (remainingSeconds <= 0) throw new Error('This booking hold has expired. Create a new booking.')
  if (config?.payment_mode === 'mock') {
    return clientApi(`dev/payment-orders/${booking.payment_order.uuid}/authorize`, { method: 'POST', body: { method: 'upi' } })
  }
  if (!(booking.payment_order.key_id || config?.razorpay_key_id) || !booking.payment_order.provider_order_id) throw new Error('Razorpay is not configured.')
  await loadRazorpay()
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: booking.payment_order.key_id || config.razorpay_key_id,
      order_id: booking.payment_order.provider_order_id,
      amount: Math.round(Number(booking.amount_total) * 100),
      currency: booking.currency,
      timeout: remainingSeconds,
      name: 'TempleAddress',
      description: `${mode === 'donation' ? 'Donation' : 'Pooja booking'} ${booking.code}`,
      prefill: { name: user?.name || booking.contact_name, email: user?.email || booking.contact_email, contact: user?.mobile_e164 || booking.contact_mobile },
      notes: { booking_code: booking.code },
      theme: { color: '#c85b20' },
      handler: resolve,
      modal: { ondismiss: () => reject(new Error('Payment window was closed. Your booking remains payable until its hold expires.')) },
    })
    checkout.on('payment.failed', response => reject(new Error(response.error?.description || 'Payment failed. You may retry while the hold is valid.')))
    checkout.open()
  })
}

const STEPS = { booking: ['Pooja', 'Contact', 'Verify', 'Summary'], donation: ['Donation', 'Contact', 'Verify', 'Summary'] }
const deliveryLabel = snapshot => !snapshot?.method ? '—' : snapshot.method === 'collection' ? 'Counter collection' : snapshot.method === 'home_delivery' ? `Home delivery · ${snapshot.status || 'pending'}${snapshot.tracking_number ? ` · ${snapshot.courier} ${snapshot.tracking_number}` : ''}` : 'Not needed'
const FREQUENCIES = [['weekly', 'Every week'], ['monthly', 'Every month'], ['daily', 'Every day']]

// Prasadam choices a pooja offers (prasadam_details): counter collection and, where enabled, paid home delivery.
function prasadamChoices(option) {
  const details = option.prasadam_details || {}, home = details.home_delivery || {}
  return [...(details.collection === false ? [] : [['collection', 'Collect at temple counter']]),
    ...(home.enabled ? [['home_delivery', `Home delivery · ${money(home.charge || 0)} per unit${home.timeframe ? ` · ${home.timeframe}` : ''}`]] : []),
    ['not_applicable', 'Not needed']]
}

const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const localMobile = value => String(value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '')

function Stepper({ labels, step, original = false }) {
  if (original) return <ol className={styles.stepper} aria-label="Booking steps">{labels.map((label, index) => <li key={label} className={styles.step} aria-current={index + 1 === step ? 'step' : undefined} aria-label={`${index + 1}. ${label}`}>
    <span className={`${styles.stepDot} ${index + 1 <= step ? styles.stepActive : ''}`} title={label}>{index + 1}</span>
    {index < labels.length - 1 && <span className={`${styles.stepLine} ${index + 1 < step ? styles.stepDone : ''}`}/>}
  </li>)}</ol>
  return <ol className="mt-5 flex items-center gap-2" aria-label="Booking steps">{labels.map((label, index) => <li key={label} className="flex flex-1 items-center gap-2">
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${index + 1 <= step ? 'bg-saffron-600 text-white' : 'bg-brown-100 text-brown-500'}`} aria-current={index + 1 === step ? 'step' : undefined}>{index + 1 < step ? '✓' : index + 1}</span>
    <span className={`hidden text-sm sm:inline ${index + 1 === step ? 'font-semibold' : 'text-brown-500'}`}>{label}</span>
    {index < labels.length - 1 && <span className={`h-px flex-1 ${index + 1 < step ? 'bg-saffron-600' : 'bg-brown-200'}`}/>}
  </li>)}</ol>
}

// One devotee line for a pooja or special pooja; prefilled from the signed-in profile or a saved family member.
function AddForm({ option, me, family, stars, onAdd, onCancel, busy, error }) {
  const self = { name: me?.name || '', star: me?.default_ritual_details?.star_value || '' }
  const [who, setWho] = useState(me ? 'me' : 'other')
  const [devotee, setDevotee] = useState(self.name)
  const [star, setStar] = useState(self.star)
  const [date, setDate] = useState(option.item_type === 'special_pooja' ? option.occurrence.date : earliestDate(option))
  const [quantity, setQuantity] = useState(1)
  const choices = prasadamChoices(option)
  const [prasadam, setPrasadam] = useState(choices[0][0])
  const [address, setAddress] = useState({ recipient_name: self.name, mobile: localMobile(me?.mobile_e164), address: '', pincode: '' })
  const [repeat, setRepeat] = useState(false), [frequency, setFrequency] = useState('weekly'), [count, setCount] = useState(4)
  const canRepeat = option.item_type === 'pooja' && !option.is_live
  const dates = repeat && date ? recurringDates(date, frequency, Number(count) || 2) : []
  const charge = prasadam === 'home_delivery' ? Number(option.prasadam_details?.home_delivery?.charge || 0) : 0
  const lineTotal = (Number(option.price) + charge) * Number(quantity || 0) * (repeat ? dates.length : 1)
  function choose(value) {
    setWho(value)
    const member = family.find(row => row.uuid === value)
    if (value === 'me') { setDevotee(self.name); setStar(self.star) } else if (member) { setDevotee(member.name); setStar(member.star_value || '') } else { setDevotee(''); setStar('') }
  }
  const chip = (value, label) => <button type="button" key={value} onClick={() => choose(value)} aria-pressed={who === value} className={`rounded-full border px-3 py-1 text-sm ${who === value ? 'border-saffron-600 bg-saffron-50 font-semibold text-saffron-700' : 'border-brown-200'}`}>{label}</button>
  return <form onSubmit={event => { event.preventDefault(); onAdd({ who, devotee_name: devotee.trim(), star_value: star, service_date: date, quantity: Number(quantity), prasadam: prasadam === 'home_delivery' ? { method: prasadam, ...address, mobile: `+91${localMobile(address.mobile)}` } : { method: prasadam }, recurrence: repeat ? { frequency, count: Number(count) } : null, dates }) }} className="mt-4 space-y-4 border-t pt-4">
    <div><p className="text-sm font-semibold">Who is this pooja for?</p><div className="mt-2 flex flex-wrap gap-2">{me && chip('me', `Me${self.name ? ` (${self.name})` : ''}`)}{family.map(row => chip(row.uuid, row.name))}{chip('other', 'Someone else')}</div></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Devotee name"><Input value={devotee} onChange={event => setDevotee(event.target.value)} maxLength={160} required placeholder="Name for the sankalpam"/></Field>
      <Field label="Nakshatra (star)"><StarSelect stars={stars} value={star} onChange={event => setStar(event.target.value)}/></Field>
      {option.item_type === 'special_pooja'
        ? <Field label="Date"><p className="input bg-brown-50">{option.occurrence.date} · {option.occurrence.start_time?.slice(0, 5)}</p></Field>
        : <Field label="Pooja date" hint={option.is_live ? 'Live pooja: today only, until its end time.' : `Book at least ${option.lead_time_hours || 0} hours ahead; tomorrow closes at 7:30 PM.`}><Input type="date" min={earliestDate(option)} max={option.is_live ? indiaDate() : undefined} value={date} onChange={event => setDate(event.target.value)} required/></Field>}
      <Field label="Prasadam"><select className="input" value={prasadam} onChange={event => setPrasadam(event.target.value)}>{choices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      <Field label="Quantity"><Input type="number" min="1" max="20" value={quantity} onChange={event => setQuantity(event.target.value)} required/></Field>
    </div>
    {prasadam === 'home_delivery' && <fieldset className="grid gap-3 rounded-xl border border-brown-100 p-4 sm:grid-cols-2"><legend className="px-1 text-sm font-semibold">Delivery address</legend>
      <Field label="Recipient name"><Input value={address.recipient_name} onChange={e => setAddress(a => ({ ...a, recipient_name: e.target.value }))} maxLength={160} required/></Field>
      <Field label="Mobile number"><Input value={address.mobile} onChange={e => setAddress(a => ({ ...a, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))} inputMode="tel" pattern="[0-9]{10}" required placeholder="98765 43210"/></Field>
      <Field label="Address" className="sm:col-span-2"><textarea className="input" rows={2} value={address.address} onChange={e => setAddress(a => ({ ...a, address: e.target.value }))} maxLength={500} required/></Field>
      <Field label="Pincode"><Input value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} inputMode="numeric" pattern="[0-9]{6}" required/></Field>
      <p className="self-end text-xs text-brown-500">{option.prasadam_details?.home_delivery?.pincodes?.length ? `Delivers to ${option.prasadam_details.home_delivery.pincodes.length} pincode(s); we check yours before payment.` : 'Delivery availability is confirmed before payment.'}</p></fieldset>}
    {canRepeat && <div className="rounded-xl border border-brown-100 p-4"><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={repeat} onChange={e => setRepeat(e.target.checked)}/>Repeat this pooja (pay in advance for all dates)</label>
      {repeat && <><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="How often"><select className="input" value={frequency} onChange={e => setFrequency(e.target.value)}>{FREQUENCIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Number of times" hint="2 to 12, first date included"><Input type="number" min="2" max="12" value={count} onChange={e => setCount(e.target.value)} required/></Field></div>
      <p className="mt-2 text-xs text-brown-500">Dates: {dates.join(', ')}</p></>}</div>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="flex gap-2"><button type="submit" disabled={busy} className="btn-p flex-1">{busy ? 'Checking availability…' : `Add to booking · ${money(lineTotal)}`}</button><button type="button" disabled={busy} onClick={onCancel} className="btn-g flex-1">Cancel</button></div>
  </form>
}

export function Phase1Checkout({ mode = 'booking' }) {
  const { slug } = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const idempotency = useRef(null)
  const requested = mode === 'donation' ? (search.get('purpose') || '') : (search.get('pooja') || search.get('event') || '')
  const resumeCode = search.get('resume')
  const [listing, setListing] = useState(null)
  const [config, setConfig] = useState(null)
  const [me, setMe] = useState(null)
  const [stars, setStars] = useState([])
  const [family, setFamily] = useState([])
  const [pending, setPending] = useState(null)
  const [step, setStep] = useState(1)
  const [cart, setCart] = useState([])
  const [editing, setEditing] = useState(mode === 'booking' ? requested : '')
  const [showSelection, setShowSelection] = useState(false)
  const selectionDialog = useRef(null)
  const [query, setQuery] = useState('')
  const [donation, setDonation] = useState({ purpose: requested, amount: '', name: '' })
  const [contact, setContact] = useState({ name: '', mobile: '', email: '' })
  const [otp, setOtp] = useState({ challenge: null, code: '' })
  const [resendSeconds, setResendSeconds] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const options = useMemo(() => {
    if (mode === 'donation') return (listing?.donation_purposes || []).map(row => ({ ...row, item_type: 'donation', target_uuid: row.uuid }))
    const poojas = (listing?.poojas || []).filter(row => row.booking_mode === 'online').map(row => ({ ...row, item_type: 'pooja', target_uuid: row.uuid }))
    const specials = (listing?.events || []).filter(row => row.registration_mode === 'paid_booking').flatMap(event => (event.occurrences || []).filter(occurrence => occurrence.status === 'scheduled').map(occurrence => ({ ...event, uuid: occurrence.uuid, target_uuid: occurrence.uuid, item_type: 'special_pooja', occurrence, name_en: `${event.name_en} — ${occurrence.date}` })))
    return [...poojas, ...specials]
  }, [listing, mode])
  const visible = options.filter(row => !query || `${row.name_en} ${row.name_ml || ''}`.toLowerCase().includes(query.toLowerCase()))
  const total = cart.reduce((sum, row) => sum + row.amount, 0)
  const verified = isVerifiedUser(me)
  const mobileOptional = verified && !me?.mobile_verified_at
  const labels = mode === 'booking' ? ['Pooja Details', 'Devotee Information', 'Verify Mobile', 'Payment'] : STEPS[mode]
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])
  useEffect(() => {
    const dialog = selectionDialog.current
    if (showSelection && dialog && !dialog.open) dialog.showModal()
    return () => { if (dialog?.open) dialog.close() }
  }, [showSelection])
  useEffect(() => {
    if (mode !== 'booking' || !resendSeconds) return
    const timer = window.setInterval(() => setResendSeconds(value => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [mode, resendSeconds])

  function applyProfile(user) {
    setMe(user)
    if (user) {
      setContact(value => ({ name: value.name || user.name || '', mobile: user.mobile_e164 ? localMobile(user.mobile_e164) : value.mobile, email: value.email || user.email || '' }))
      setDonation(value => ({ ...value, name: value.name || user.name || '' }))
      clientApi('me/family-members').then(data => setFamily(data.results || data)).catch(() => setFamily([]))
    }
  }

  useEffect(() => {
    Promise.all([
      clientApi(`listings/${slug}`, { auth: false }), clientApi('config', { auth: false }), clientApi('master-values/star', { auth: false }).catch(() => []),
      readAuth()?.access ? clientApi('me').catch(() => null) : Promise.resolve(null),
      resumeCode ? clientApi(`me/bookings/${resumeCode}`) : Promise.resolve(null),
    ]).then(([data, platform, starRows, user, resumed]) => {
      setListing(data); setConfig(platform); setStars(starRows); setPending(resumed); applyProfile(user)
      if (mode === 'donation') {
        const purpose = data.donation_purposes?.find(row => row.uuid === requested) || data.donation_purposes?.[0]
        setDonation(value => ({ ...value, purpose: purpose?.uuid || '', amount: purpose?.suggested_amount || '101' }))
      }
    }).catch(err => setError(err.message))
  }, [slug, mode, requested, resumeCode])

  async function addToCart(option, line) {
    setBusy(true); setError('')
    const item = { item_type: option.item_type, target_uuid: option.target_uuid, quantity: line.quantity, devotee_name: line.devotee_name, star_kind: line.star_value ? 'nakshatra' : '', star_value: line.star_value, prasadam: line.prasadam, ...(option.item_type === 'pooja' ? { service_date: line.service_date } : {}), ...(line.recurrence ? { recurrence: line.recurrence } : {}) }
    const key = `${option.target_uuid}:${line.service_date}`
    try {
      if (cart.some(row => row.key === key)) throw new Error('This pooja is already in your booking for that date. Remove it first to change the details.')
      if (line.recurrence && cart.some(row => row.item.target_uuid === option.target_uuid && line.dates.includes(row.date))) throw new Error('One of these dates is already in your booking for this pooja.')
      const quoted = await clientApi('bookings/quote', { method: 'POST', auth: false, body: { listing_uuid: listing.uuid, items: [item] } })
      const date = option.item_type === 'special_pooja' ? option.occurrence.date : line.recurrence ? `${line.dates.length} dates · ${line.dates[0]} to ${line.dates.at(-1)}` : line.service_date
      setCart(rows => [...rows, { key, item, name: option.name_en, date, devotee: line.devotee_name, star: stars.find(row => row.code === line.star_value)?.name_en || '', quantity: line.quantity, amount: Number(quoted.amount_total), delivery: line.prasadam?.method === 'home_delivery' }])
      setEditing('')
      // Remember the devotee's own star the first time they give it, so later bookings are prefilled.
      if (line.who === 'me' && line.star_value && me && !me.default_ritual_details?.star_value) {
        const default_ritual_details = { ...(me.default_ritual_details || {}), star_kind: 'nakshatra', star_value: line.star_value }
        clientApi('me', { method: 'PATCH', body: { default_ritual_details } }).then(setMe).catch(() => null)
      }
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  function continueFromChoice(event) {
    event.preventDefault(); setError('')
    if (mode === 'donation') {
      const purpose = options.find(row => row.uuid === donation.purpose)
      if (!purpose || !(Number(donation.amount) > 0)) return setError('Choose a purpose and enter an amount.')
      setCart([{ key: purpose.uuid, item: { item_type: 'donation', target_uuid: purpose.uuid, amount: String(donation.amount) }, name: purpose.name_en, devotee: donation.name, quantity: 1, amount: Number(donation.amount) }])
      setContact(value => ({ ...value, name: value.name || donation.name }))
    } else if (!cart.length) return setError('Add at least one pooja to continue.')
    setShowSelection(false)
    setStep(2)
  }

  async function continueFromContact(event) {
    event.preventDefault(); setError('')
    if (busy) return
    if (localMobile(contact.mobile).length !== 10 && !(mobileOptional && !contact.mobile)) return setError('Enter a 10-digit mobile number.')
    if (verified) return setStep(4)
    if (mode === 'booking' && !await sendOtp()) return
    setStep(3)
  }

  async function sendOtp() {
    setBusy(true); setError('')
    try {
      const result = await clientApi('auth/otp/request', { method: 'POST', auth: false, body: { identifier: `+91${localMobile(contact.mobile)}`, country_code: '+91' } })
      if (result.password_required || result.recaptcha_required) throw new Error('Please sign in from the login page to continue.')
      setOtp({ challenge: result, code: result.debug_otp || '' })
      if (mode === 'booking') setResendSeconds(30)
      return true
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function verifyOtp(event) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await clientApi('auth/otp/verify', { method: 'POST', auth: false, body: { identifier: otp.challenge.identifier, challenge_uuid: otp.challenge.challenge_uuid, otp: otp.code, profile: { name: contact.name, ...(contact.email ? { email: contact.email } : {}) } } })
      saveAuth(result); applyProfile(result.user); setStep(4)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function pay(booking) {
    if (new Date(booking.payment_deadline_at) <= new Date()) throw new Error('This booking hold has expired. Create a new booking.')
    let payable = booking
    if (booking.payment_order?.status !== 'open' || new Date(booking.payment_order.expires_at) <= new Date()) {
      payable = await clientApi(`me/bookings/${booking.code}/payment-orders`, { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() } })
    }
    await openPayment({ booking: payable, config, user: me, mode })
    await clientApi(`me/bookings/${payable.code}/payment-check`, { method: 'POST', body: {} }).catch(() => null)
    router.push(`/receipt/${payable.code}`)
  }

  async function confirmAndPay() {
    setBusy(true); setError('')
    try {
      if (me && !me.name && contact.name) clientApi('me', { method: 'PATCH', body: { name: contact.name } }).catch(() => null)
      idempotency.current ||= crypto.randomUUID()
      const booking = await clientApi('bookings', {
        method: 'POST', headers: { 'Idempotency-Key': idempotency.current, 'X-Client': 'web' },
        body: { listing_uuid: listing.uuid, contact_name: contact.name, contact_email: contact.email, ...(mobileOptional && contact.mobile ? { contact_mobile: `+91${localMobile(contact.mobile)}` } : {}), items: cart.map(row => row.item) },
      })
      setPending(booking)
      await pay(booking)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function resumePayment() {
    setBusy(true); setError('')
    try { await pay(pending) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const alert = error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
  if (!listing) return <PublicShell booking><Wrap><p>{error || 'Loading…'}</p></Wrap></PublicShell>
  if (pending) return <PublicShell booking><Wrap><p className="text-sm font-semibold uppercase tracking-wide text-saffron-600">Payment pending</p><h1 className="mt-2 text-3xl font-semibold">Booking {pending.code}</h1><div className="card mt-6 space-y-3 p-6"><p>{pending.listing.name_en}</p><p className="text-sm text-brown-500">{pending.items.map(row => row.item_name_en).join(', ')} · {money(pending.amount_total)}</p><p className="text-sm text-brown-500">Complete payment before {new Date(pending.payment_deadline_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.</p>{alert}<button onClick={resumePayment} disabled={busy} className="btn-p w-full">{busy ? 'Opening Razorpay…' : `Continue payment ${money(pending.amount_total)}`}</button><Link href="/account" className="btn-g w-full">Back to account</Link></div></Wrap></PublicShell>

  return <PublicShell booking><main className={mode === 'booking' ? styles.bookingPage : 'mx-auto max-w-3xl px-4 py-8'}>
    <header className={mode === 'booking' ? styles.pageHeader : undefined}><h1 className="text-3xl font-semibold">{listing.name_en}</h1>
    <p className="mt-1 text-sm text-brown-500">{labels[step - 1]} · {listing.code}</p></header>
    <Stepper labels={labels} step={step} original={mode === 'booking'}/>

    {step === 1 && mode === 'booking' && <div className={styles.selectionStage}>
      <section className={styles.section}><h2>Available Poojas</h2><Input placeholder="Search pooja name" value={query} onChange={event => setQuery(event.target.value)} aria-label="Search poojas"/>
        <p className={`${styles.hint} mt-3`}>Showing {visible.length} of {options.length} poojas</p>
      {!options.length && <p className="py-5 text-sm text-brown-500">Online booking is not available for this listing yet.</p>}
      {visible.map(option => <article key={option.uuid} className={`${styles.poojaCard} ${editing === option.uuid ? 'ring-2 ring-saffron-300' : ''}`}>
        <div className={styles.poojaHeader}><div><h3>{option.name_en}</h3>{option.name_ml && <p className="text-sm text-brown-500">{option.name_ml}</p>}
          <div className="mt-2 flex flex-wrap gap-2 text-xs">{option.is_live && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Live today</span>}{option.item_type === 'special_pooja' && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">Special pooja</span>}{option.lead_time_hours > 0 && !option.is_live && <span className="rounded-full bg-brown-100 px-2 py-0.5">Book {option.lead_time_hours}h ahead</span>}</div></div>
          <div className="text-right"><p className={styles.price}>{money(option.price)}</p>{editing !== option.uuid && <button type="button" disabled={busy} className="btn-g mt-2" onClick={() => { setEditing(option.uuid); setError('') }}>+ Add</button>}</div></div>
        {editing === option.uuid && <AddForm option={option} me={me} family={family} stars={stars} busy={busy} error={error} onAdd={line => addToCart(option, line)} onCancel={() => { setEditing(''); setError('') }}/>}
      </article>)}
      {!editing && !showSelection && alert}</section>
      {cart.length > 0 && <button type="button" className={styles.summaryBar} aria-haspopup="dialog" aria-controls="selected-poojas-dialog" aria-expanded={showSelection} onClick={() => setShowSelection(true)}>
        <span className={styles.summaryInfo} aria-live="polite"><strong>{cart.length} Pooja{cart.length > 1 ? 's' : ''} added</strong><span>Total {money(total)}</span></span><span className={styles.summaryContinue}>Continue Booking →</span>
      </button>}
      {showSelection && <dialog id="selected-poojas-dialog" ref={selectionDialog} className={styles.selectionDialog} aria-labelledby="selected-poojas-title" onCancel={() => setShowSelection(false)} onClick={event => { if (event.target === event.currentTarget) setShowSelection(false) }}>
      <form onSubmit={continueFromChoice}>
        <div className={styles.selectionHeader}><h2 id="selected-poojas-title">Selected Poojas</h2><button type="button" className="btn-g" aria-label="Close selected poojas" onClick={() => setShowSelection(false)}>✕</button></div>
        {cart.length ? <ul>{cart.map(row => <li key={row.key} className={styles.summaryItem}><b>{row.name}</b><p>{row.devotee} · {row.star || 'Star not specified'}</p><p>{row.date} · Qty {row.quantity} · {money(row.amount)}</p><div className={styles.summaryActions}><button type="button" className="text-red-700 underline" aria-label={`Remove ${row.name} for ${row.devotee}`} onClick={() => setCart(rows => rows.filter(item => item.key !== row.key))}>Remove</button></div></li>)}</ul> : <p className={styles.hint}>No poojas added yet.</p>}
        <div className={styles.total}><span>Total</span><span>{money(total)}</span></div>
        {alert}<button className="btn-p mt-4 w-full" disabled={!cart.length || busy}>Continue Booking</button>
        <button type="button" className="btn-g mt-2 w-full" onClick={() => setShowSelection(false)}>Add more poojas</button>
        <p className={`${styles.hint} mt-3`}>TempleAddress fee ₹0. Razorpay shows any payment-method charge before you pay.</p>
      </form></dialog>}
    </div>}

    {step === 1 && mode === 'donation' && <form onSubmit={continueFromChoice} className="card mt-6 space-y-4 p-6">
      <Field label="Donation purpose"><select className="input" value={donation.purpose} onChange={event => { const purpose = options.find(row => row.uuid === event.target.value); setDonation(value => ({ ...value, purpose: event.target.value, amount: purpose?.suggested_amount || value.amount })) }} required>{options.map(row => <option key={row.uuid} value={row.uuid}>{row.name_en}</option>)}</select></Field>
      <Field label="Amount ₹"><Input type="number" min="1" step="0.01" value={donation.amount} onChange={event => setDonation(value => ({ ...value, amount: event.target.value }))} required/></Field>
      <div className="flex flex-wrap gap-2">{[101, 251, 501, 1001].map(value => <button type="button" key={value} className="btn-g" onClick={() => setDonation(row => ({ ...row, amount: String(value) }))}>₹{value}</button>)}</div>
      <Field label="Donor name"><Input value={donation.name} onChange={event => setDonation(value => ({ ...value, name: event.target.value }))} maxLength={160} required/></Field>
      <p className="text-xs text-brown-500">TempleAddress fee ₹0. You receive an official payment receipt.</p>
      {alert}<button className="btn-p w-full">Continue · {money(donation.amount)}</button>
    </form>}

    {step === 2 && <form onSubmit={continueFromContact} className={mode === 'booking' ? `${styles.section} ${styles.formCard} space-y-4` : 'card mt-6 space-y-4 p-6'}>
      <h2 className="text-xl font-semibold">{mode === 'booking' ? 'Devotee Information' : 'Contact details'}</h2>
      <p className="text-sm text-brown-500">Your receipt and booking updates go to this contact.</p>
      <Field label="Your name"><Input value={contact.name} onChange={event => setContact(value => ({ ...value, name: event.target.value }))} maxLength={160} disabled={busy} required/></Field>
      <Field label={mobileOptional ? 'Mobile number (optional)' : 'Mobile number'} hint={me?.mobile_verified_at ? 'Verified with OTP' : mobileOptional ? 'Signed in with Google. Add a number for WhatsApp/SMS booking updates.' : 'We will send an OTP to verify this number.'}><div className="flex"><span className="input w-16 shrink-0 rounded-r-none bg-brown-50 text-center">+91</span><Input value={contact.mobile} onChange={event => setContact(value => ({ ...value, mobile: event.target.value.replace(/\D/g, '').slice(0, 10) }))} inputMode="tel" disabled={Boolean(me?.mobile_verified_at) || busy} required={!mobileOptional} placeholder="98765 43210"/></div></Field>
      {(mode !== 'booking' || !me) && <Field label="Email" hint="Optional, for the receipt"><Input type="email" value={contact.email} onChange={event => setContact(value => ({ ...value, email: event.target.value }))} disabled={busy}/></Field>}
      {mode === 'booking' && <div><h2>Order Summary</h2><div className="flex justify-between text-sm"><span>Poojas ({cart.length})</span><span>{money(total)}</span></div><div className={styles.total}><span>Total</span><span>{money(total)}</span></div></div>}
      {alert}<div className="flex gap-2"><button type="button" disabled={busy} className="btn-g flex-1" onClick={() => setStep(1)}>Back</button><button disabled={busy} className="btn-p flex-1">{mode === 'booking' && !verified ? (busy ? 'Sending OTP…' : 'Send OTP & continue') : 'Continue'}</button></div>
    </form>}

    {step === 3 && <form onSubmit={verifyOtp} className={mode === 'booking' ? `${styles.section} ${styles.formCard} ${styles.verify} space-y-4` : 'card mt-6 space-y-4 p-6'}>
      {mode === 'booking' && <div className={styles.centerIcon}><Phone size={42}/></div>}
      <h2 className="text-xl font-semibold">Verify your mobile</h2>
      <p className="text-sm text-brown-500">+91 {contact.mobile} · New devotee accounts are created automatically.</p>
      {otp.challenge && (mode === 'booking' ? <OtpInput value={otp.code} onChange={code => setOtp(value => ({ ...value, code }))} disabled={busy} hint={otp.challenge.debug_otp ? `Local test OTP: ${otp.challenge.debug_otp}` : `Sent to ${otp.challenge.destination}`}/> : <Field label="6-digit OTP" hint={otp.challenge.debug_otp ? `Local test OTP: ${otp.challenge.debug_otp}` : `Sent to ${otp.challenge.destination}`}><Input value={otp.code} onChange={event => setOtp(value => ({ ...value, code: event.target.value.replace(/\D/g, '').slice(0, 6) }))} inputMode="numeric" autoComplete="one-time-code" required autoFocus/></Field>)}
      {alert}
      {otp.challenge ? <button disabled={busy || otp.code.length !== 6} className="btn-p w-full">{busy ? 'Verifying…' : 'Verify & continue'}</button> : <button type="button" onClick={sendOtp} disabled={busy} className="btn-p w-full">{busy ? 'Sending…' : 'Send OTP'}</button>}
      {mode === 'booking' && otp.challenge && <button type="button" disabled={busy || resendSeconds > 0} onClick={sendOtp} className="text-sm text-saffron-700 underline">{resendSeconds ? `Resend OTP in ${resendSeconds}s` : 'Resend OTP'}</button>}
      <button type="button" className="btn-g w-full" onClick={() => { setStep(2); setOtp({ challenge: null, code: '' }) }}>Back</button>
    </form>}

    {step === 4 && <section className={mode === 'booking' ? `${styles.section} ${styles.formCard} space-y-4` : 'card mt-6 space-y-4 p-6'}>
      {mode === 'booking' && <div className="text-center"><div className={styles.centerIcon}><CreditCard size={42}/></div><h2>Complete Payment</h2><p className={styles.hint}>Secure online payment checkout</p></div>}
      <h2 className="text-xl font-semibold">{mode === 'booking' ? 'Order Summary' : 'Summary'}</h2>
      <ul className="divide-y">{cart.map(row => <li key={row.key} className="flex justify-between gap-3 py-3 text-sm"><span><b>{row.name}</b>{mode === 'booking' && <span className="block text-brown-500">{row.date} · {row.devotee}{row.star ? ` · ${row.star}` : ''} · × {row.quantity}</span>}</span><b>{money(row.amount)}</b></li>)}</ul>
      <div className="flex justify-between border-t pt-3 text-lg font-semibold"><span>Total</span><span>{money(total)}</span></div>
      <p className="text-xs text-brown-500">TempleAddress convenience fee ₹0. Razorpay may add a payment-method charge, shown in its secure window before you pay.</p>
      <p className="text-sm">{[contact.name, contact.mobile && `+91 ${contact.mobile}`, contact.email].filter(Boolean).join(' · ')}</p>
      {alert}
      <div className="flex gap-2"><button type="button" className="btn-g flex-1" onClick={() => setStep(2)}>Back</button><button onClick={confirmAndPay} disabled={busy} className="btn-p flex-1">{busy ? 'Opening Razorpay…' : `Pay ${money(total)}`}</button></div>
    </section>}
  </main></PublicShell>
}

export function Phase1Receipt() {
  const { bookingCode } = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const [sharing, setSharing] = useState(false)
  async function shareReceipt() {
    setSharing(true)
    try {
      const blob = await clientApi(`me/receipts/${receipt.number}/pdf`, { responseType: 'blob' })
      const file = new File([blob], `${receipt.number}.pdf`, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: 'TempleAddress Booking Receipt', files: [file] })
      else if (navigator.share) await navigator.share({ title: 'TempleAddress Booking Receipt', text: `Receipt ${receipt.number} · Booking ${receipt.snapshot.booking_code} · ${receipt.snapshot.currency} ${receipt.snapshot.amount}` })
      else await downloadPdf()
    } catch (err) { if (err.name !== 'AbortError') setError(err.message) } finally { setSharing(false) }
  }
  async function downloadPdf() {
    try {
      const response = await fetch(`${API_ORIGIN}/me/receipts/${receipt.number}/pdf`, { headers: { Authorization: `Bearer ${readAuth()?.access}` } })
      if (!response.ok) throw new Error('Could not download the receipt PDF.')
      const url = URL.createObjectURL(await response.blob())
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${receipt.number}.pdf`; anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) { setError(err.message) }
  }
  useEffect(() => {
    if (!requireAuth(router, `/receipt/${bookingCode}`)) return
    let cancelled = false; let timer
    async function load(attempt = 0) {
      try {
        // While unpaid, ask the server to check Razorpay directly; it never trusts the browser's success callback.
        const current = await clientApi(`me/bookings/${bookingCode}`)
        const row = current.status === 'payment_pending' && !current.receipt_number
          ? await clientApi(`me/bookings/${bookingCode}/payment-check`, { method: 'POST', body: {} }).catch(() => current)
          : current
        if (cancelled) return
        setBooking(row)
        if (row.receipt_number) setReceipt(await clientApi(`me/receipts/${row.receipt_number}`))
        else if (attempt < 15) timer = window.setTimeout(() => load(attempt + 1), 2000)
        else if (row.status === 'payment_pending') setError('Payment has not been confirmed. You can continue it from My Account while the hold is valid.')
        else setError('Payment confirmation is still pending. Check My Account shortly.')
      } catch (err) { if (!cancelled) setError(err.message) }
    }
    load()
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [router, bookingCode])
  return <PublicShell><main className={styles.receiptPage}>
    <div className={styles.toolbar}><Link href="/account" className="font-semibold">Back to account</Link>{receipt && <div className="flex flex-wrap gap-2"><button className="btn-g" onClick={downloadPdf}><Download size={16}/>Download PDF</button><button className="btn-g" onClick={() => window.print()}><Printer size={16}/>Print</button><a className="btn-wa" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`TempleAddress Receipt ${receipt.number}\nBooking: ${receipt.snapshot.booking_code}\nPaid: ${receipt.snapshot.currency} ${receipt.snapshot.amount}`)}`}><Share2 size={16}/>WhatsApp</a><button className="btn-g" disabled={sharing} onClick={shareReceipt}>{sharing ? 'Preparing…' : 'Share'}</button></div>}</div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-amber-800">{error}</p>}
    {!receipt && !error && <p className="mt-5">Waiting for Razorpay confirmation…</p>}
    {receipt && <article id="booking-receipt" className={styles.receiptCard}>
      <header className={styles.receiptBrand}><div><Logo/><h1 className="mt-3">Booking Receipt</h1><p className={styles.hint}>Receipt No: {receipt.number}</p><h2 className={styles.templeTitle}>{booking?.listing.name_en}</h2></div><span className={styles.status}>{booking?.status?.replaceAll('_', ' ')}</span></header>
      <div className={styles.meta}><p><b>Booking Code:</b> {receipt.snapshot.booking_code}</p><p><b>Issued:</b> {new Date(receipt.issued_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p><p><b>Name:</b> {booking?.contact_name || '—'}</p><p><b>Mobile:</b> {booking?.contact_mobile || '—'}</p></div>
      <section className={styles.receiptSection}><h2>Temple Receipt</h2><p className={styles.hint}>Booking items and amounts recorded at payment.</p><div className={styles.tableScroll}><table className={styles.itemTable}><thead><tr><th scope="col">Item</th><th scope="col">Code</th><th scope="col">Qty</th><th scope="col">Amount</th></tr></thead><tbody>{receipt.snapshot.items?.map((row, index) => <tr key={`${row.code}:${index}`}><td>{row.name}</td><td>{row.code}</td><td>{row.quantity}</td><td>{receipt.snapshot.currency} {row.amount}</td></tr>)}</tbody></table></div><div className={styles.total}><span>Booking Amount</span><span>{receipt.snapshot.currency} {receipt.snapshot.amount}</span></div></section>
      {booking?.items?.length > 0 && <section className={styles.receiptSection}><h2>Current Booking Details</h2><p className={styles.hint}>Devotee and ritual details include any saved booking corrections.</p><div className={styles.tableScroll}><table className={styles.itemTable}><thead><tr>{['Item', 'Name', 'Star', 'Booking Date', 'Delivery', 'Qty'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{booking.items.map(item => <tr key={item.uuid}><td>{item.item_name_en}</td><td>{item.devotee_name || '—'}</td><td>{item.star_value || '—'}</td><td>{item.service_date || '—'}{item.service_time ? ` ${item.service_time.slice(0, 5)}` : ''}</td><td>{deliveryLabel(item.prasadam_snapshot)}</td><td>{item.quantity}</td></tr>)}</tbody></table></div></section>}
      <section className={styles.receiptSection}><h2>Payment Details</h2><div className={styles.invoiceRow}><span>Payment ID</span><b>{receipt.snapshot.provider_payment_id || '—'}</b></div><div className={styles.invoiceRow}><span>Paid on</span><span>{receipt.snapshot.paid_at ? new Date(receipt.snapshot.paid_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}</span></div><div className={styles.total}><span>Paid Amount</span><span>{receipt.snapshot.currency} {receipt.snapshot.amount}</span></div></section>
      <p className={`${styles.hint} mt-5`}>Official payment receipt issued by TempleAddress.</p>
    </article>}
    {receipt && booking?.listing.slug && <div className="mt-5 flex flex-wrap gap-3"><Link href={`/${booking.items.every(item => item.item_type === 'donation') ? 'donate' : 'book'}/${booking.listing.slug}`} className="btn-p">Book again</Link><Link href="/temples" className="btn-g">View temples</Link></div>}
  </main></PublicShell>
}
