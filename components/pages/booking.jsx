'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { CalendarDays, Check, Gift, HeartHandshake, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { temples } from '@/lib/data'
import { PublicShell, Field, Input, Money } from '@/components/ui'
import { bookingKey, readBookings, indiaDate, bookingCartIssue, bookingReceiptRows, upsertBookingItem } from '@/lib/booking'

const stars = ['Aswathi','Bharani','Karthika','Rohini','Makayiram','Thiruvathira','Punartham','Pooyam','Ayilyam','Makam','Pooram','Uthram','Atham','Chithira','Chothi','Vishakham','Anizham','Thrikketta','Moolam','Pooradam','Uthradam','Thiruvonam','Avittam','Chathayam','Pooruruttathi','Uthrattathi','Revathi']
const rashis = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena']
const Wrap = ({children}) => <div translate="no" className="notranslate mx-auto max-w-3xl space-y-5 px-4 py-8">{children}</div>
const Amount = ({label,value}) => <div className="flex justify-between gap-4 border-b border-brown-100 py-2"><span>{label}</span><Money v={value}/></div>

const purposeCards = [
  { id: 'all', label: 'All Poojas' },
  { id: 'health', label: 'Health', Icon: HeartHandshake },
  { id: 'wealth', label: 'Wealth', Icon: Sparkles },
  { id: 'other', label: 'Other', Icon: Gift },
]

const purposeOf = (pooja) => {
  const text = `${pooja.name} ${pooja.purpose}`.toLowerCase()
  if (/health|protection|longevity|illness|wellbeing|peace|clarity/.test(text)) return 'health'
  if (/prosperity|fortune|wealth|good luck/.test(text)) return 'wealth'
  return 'other'
}

const filterTypeOf = (pooja) => {
  if (pooja.live) return 'live'
  if (pooja.bookingType === 'Offline') return 'special'
  if (pooja.category === 'Seva' || pooja.category === 'Neivedyam') return 'other'
  return 'daily'
}

const formatPrice = value => `\u20B9${Number(value).toFixed(2)}`

export function Booking() {
  const {slug} = useParams(); const query = useSearchParams(); const router = useRouter(); const navigate = (path, opts) => router.push(path, opts)
  const temple = temples.find(t => t.slug === slug)
  const [code,setCode] = useState(query.get('pooja') || '')
  const [activeCode,setActiveCode] = useState(query.get('pooja') || '')
  const [selectedBookings,setSelectedBookings] = useState([]), [editingId,setEditingId] = useState(null), [showSelected,setShowSelected] = useState(false)
  const [step,setStep] = useState(0), [date,setDate] = useState(''), [quantity,setQuantity] = useState(1)
  const [recurring,setRecurring] = useState(false), [nextDate,setNextDate] = useState('')
  const [name,setName] = useState(''), [kind,setKind] = useState('Nakshatra'), [ritual,setRitual] = useState(stars[0])
  const [contactName,setContactName] = useState('')
  const [prasadCollection,setPrasadCollection] = useState('Collect at Counter')
  const [mobile,setMobile] = useState(''), [country,setCountry] = useState('+91'), [donation,setDonation] = useState('0'), [notes,setNotes] = useState('')
  const [otp,setOtp] = useState(''), [cooldown,setCooldown] = useState(0), [sentAt,setSentAt] = useState(0)
  const [error,setError] = useState(''), [gateway,setGateway] = useState('Razorpay'), [outcome,setOutcome] = useState('success'), [gatewayOpen,setGatewayOpen] = useState(false), [processing,setProcessing] = useState(false), [result,setResult] = useState('')
  const [search,setSearch] = useState(''), [purposeFilter,setPurposeFilter] = useState('all'), [typeFilter,setTypeFilter] = useState('all')
  const [bookingCode] = useState(() => `TPB-${crypto.randomUUID()}`)
  const timer = useRef(); const busy = useRef(false)
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => { if (!cooldown) return; const id = setTimeout(() => setCooldown(cooldown - 1),1000); return () => clearTimeout(id) },[cooldown])

  if (!temple) return <PublicShell booking><Wrap><h1>Temple not found</h1><Link href="/temples" className="btn-p">Browse temples</Link></Wrap></PublicShell>

  const pooja = temple.poojas.find(p => p.code === code)
  const dates = recurring ? [date,nextDate] : [date]
  const donationValue = Number(donation)
  const subtotal = selectedBookings.reduce((sum,item) => sum + (temple.poojas.find(candidate => candidate.code === item.code)?.price || 0) * item.quantity * item.dates.length, 0)
  const total = subtotal + (Number.isFinite(donationValue) ? donationValue : 0)
  const fee = Math.round(total * 0.02 * 100) / 100, feeTax = Math.round(fee * 0.18 * 100) / 100
  const draft = {id: editingId || 'draft', code, name, kind, ritual, prasadCollection, date, quantity, recurring, nextDate, dates}
  const blocked = pooja ? bookingCartIssue(temple, [draft, ...selectedBookings.filter(item => item.id !== editingId)], readBookings())?.reason || '' : 'Select a pooja to continue.'
  const draftIssue = blocked || (!name.trim() ? 'Enter a devotee name to add this pooja.' : !ritual.trim() ? `Select or enter ${kind} to add this pooja.` : '')
  const cartIssue = () => bookingCartIssue(temple, selectedBookings, readBookings())
  const queryText = search.trim().toLowerCase()
  const filteredPoojas = temple.poojas.filter(item => {
    const matchesSearch = !queryText || `${item.name} ${item.purpose} ${item.category} ${item.bookingType}`.toLowerCase().includes(queryText)
    const matchesPurpose = purposeFilter === 'all' || purposeOf(item) === purposeFilter
    const matchesType = typeFilter === 'all' || filterTypeOf(item) === typeFilter
    return matchesSearch && matchesPurpose && matchesType
  })
  const addBooking = () => {
    if (!pooja || draftIssue) return false
    const item = {...draft, id: editingId || crypto.randomUUID(), name: name.trim(), ritual: ritual.trim(), dates: [...dates]}
    setSelectedBookings(current => upsertBookingItem(current, item, editingId))
    setEditingId(null)
    setActiveCode('')
    setError('')
    return true
  }
  const openSelectedBookings = () => {
    if (activeCode && !addBooking()) {
      setError(`Finish adding ${pooja?.name || 'this pooja'}: ${draftIssue}`)
      window.requestAnimationFrame(() => document.querySelector('.booking-pooja-card.is-selected')?.scrollIntoView({block: 'center'}))
      return
    }
    setShowSelected(true)
  }
  const loadDraft = item => {
    if (!filteredPoojas.some(candidate => candidate.code === item.code)) {setSearch('');setPurposeFilter('all');setTypeFilter('all')}
    setCode(item.code);setName(item.name);setKind(item.kind);setRitual(item.ritual)
    setDate(item.date);setQuantity(item.quantity);setRecurring(item.recurring);setNextDate(item.nextDate);setPrasadCollection(item.prasadCollection)
    setEditingId(item.id);setActiveCode(item.code)
  }
  const continueBooking = () => {
    if (!selectedBookings.length) return
    const issue = cartIssue()
    if (issue) {setShowSelected(false);setError(issue.reason);loadDraft(selectedBookings.find(item => item.id === issue.id));return}
    setContactName(current => current || selectedBookings[0].name)
    setShowSelected(false);setError('');setStep(1)
    window.scrollTo({top: 0, behavior: 'auto'})
  }
  const sendOtp = e => {
    e?.preventDefault()
    if (!selectedBookings.length) return setStep(0)
    if (!contactName.trim()) return setError('Enter a contact name.')
    const valid = country === '+91' ? /^\d{10}$/.test(mobile) : /^\d{7,12}$/.test(mobile)
    if (!valid) return setError('Enter a valid mobile number without the country code.')
    if (!Number.isFinite(donationValue) || donationValue < 0) return setError('Enter a valid donation amount.')
    setError(''); setOtp(''); setSentAt(Date.now()); setCooldown(30); setStep(2)
  }
  const pay = () => {
    if (busy.current || !selectedBookings.length) return
    const issue = cartIssue(); if (issue) {setGatewayOpen(false); setError(issue.reason); setStep(0); loadDraft(selectedBookings.find(item => item.id === issue.id)); return}
    busy.current = true; setProcessing(true)
    timer.current = setTimeout(() => {
      busy.current = false; setProcessing(false); setGatewayOpen(false)
      if (outcome !== 'success') {setResult(outcome); return}
      const items = selectedBookings.map(item => {
        const selectedPooja = temple.poojas.find(candidate => candidate.code === item.code)
        return {...item, pooja: selectedPooja.name, poojaCode: item.code, unitPrice: selectedPooja.price, slot: `${selectedPooja.startTime} - ${selectedPooja.endTime} IST`}
      })
      const first = items[0]
      const record = {bookingCode,status:'paid',createdAt:new Date().toISOString(),temple:temple.name,templeCode:temple.code,slug:temple.slug,address:temple.address,pooja:first.pooja,poojaCode:first.code,unitPrice:first.unitPrice,quantity:first.quantity,dates:first.dates,slot:first.slot,name:first.name,mobile:`${country}${mobile}`,kind:first.kind,ritual:first.ritual,contactName,items,donation:donationValue,notes,subtotal,total,gateway,fee,feeTax,paid:Math.round((total+fee+feeTax)*100)/100,transactionId:`demo_${crypto.randomUUID()}`}
      try { const existing = readBookings(); sessionStorage.setItem(bookingKey,JSON.stringify([...existing.filter(r => r.bookingCode !== bookingCode),record])); navigate(`/receipt/${bookingCode}`) } catch {setError('Unable to save this demo receipt. Enable session storage and retry. No real payment was taken.')}
    },1200)
  }

  return <PublicShell booking hideChatbot><div className="booking-page">
    <div className="booking-wrap">
      <div className="booking-page-header"><div><h1 className="booking-page-title">{temple.name}</h1><p className="booking-page-subtitle">{step === 0 ? 'Select Poojas' : step === 1 ? 'Contact details' : step === 2 ? 'Verify mobile' : 'Payment'}</p><p className="booking-temple-code">{temple.code}</p></div></div>
      <ol className="booking-stepper" aria-label="Booking progress">{['Pooja','Contact','Verify','Summary'].map((label,index) => <li key={label} className="booking-step-item"><span className={`booking-step-dot ${index <= step ? 'is-active' : ''}`}>{index < step ? <Check size={15}/> : index + 1}</span>{index < 3 && <span className={`booking-step-line ${index < step ? 'is-done' : ''}`}/>}<span className="sr-only">{label}</span></li>)}</ol>
      {error && <p role="alert" className="booking-alert">{error}</p>}

      {step === 0 && <section className="booking-section">
        <h2 className="booking-section-title">Available Poojas</h2>
        <div className="booking-search-wrap"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pooja name" aria-label="Search pooja name"/></div>
        <div className="booking-purpose-row">{purposeCards.map(({id,label,Icon}) => <button type="button" key={id} className={`booking-purpose-card ${purposeFilter === id ? 'is-active' : ''}`} onClick={() => setPurposeFilter(id)}>{Icon && <span className="booking-purpose-icon"><Icon size={28}/></span>}<span>{label}</span></button>)}</div>
        <div className="booking-filter-row">{[['all','All Poojas'],['daily','Daily Poojas'],['live','Live Poojas'],['special','Special Poojas'],['other','Others']].map(([id,label]) => <button type="button" key={id} className={`booking-filter-button ${typeFilter === id ? 'is-active' : ''}`} onClick={() => setTypeFilter(id === 'other' ? 'other' : id)}>{label}</button>)}</div>
        <p className="booking-results-count">Showing {filteredPoojas.length} of {temple.poojas.length} poojas</p>
        <div className="booking-pooja-list">{filteredPoojas.map(item => {
          const isActive = item.code === activeCode
          const addedCount = selectedBookings.filter(selected => selected.code === item.code).length
          return <article key={item.code} className={`booking-pooja-card ${isActive ? 'is-selected' : ''}`}>
            <div className="booking-pooja-top-row">
              <div className="booking-pooja-identity"><span className="booking-pooja-thumb"><Gift size={26}/></span><div><h3>{item.name}</h3><p>{item.purpose || item.name}</p></div></div>
              <div className="booking-pooja-meta">{item.live && <span className="booking-chip booking-chip-live">Live</span>}<span className="booking-chip booking-chip-purpose">{item.category}</span><span className="booking-chip">Type: {item.bookingType === 'Online & Offline' ? 'online/offline' : item.bookingType}</span>{item.startTime && item.endTime && <span className="booking-chip">Hours: {item.startTime} - {item.endTime}</span>}</div>
              <div className="booking-pooja-action"><span className="booking-price">{formatPrice(item.price)}</span>{addedCount > 0 && <span className="booking-added-count">{addedCount} added</span>}{!isActive && <button type="button" className={`booking-add-button ${addedCount ? 'is-selected' : ''}`} onClick={() => {
                setCode(item.code);setActiveCode(item.code);setError('')
                setName('');setDate(item.live ? indiaDate() : '');setQuantity(1);setRecurring(false);setNextDate('');setKind('Nakshatra');setRitual(stars[0]);setPrasadCollection('Collect at Counter');setEditingId(null)
              }}><Plus size={18}/>{addedCount ? 'Add another' : 'Add'}</button>}</div>
            </div>
            {isActive && <div className="booking-inline-form">
              <div className="booking-inline-grid">
                <label><span>Devotee Name *</span><input type="text" placeholder="Enter devotee name" value={name} onChange={e => setName(e.target.value)} maxLength="120"/></label>
                <fieldset className="booking-ritual-field"><legend>Ritual information *</legend><div className="booking-ritual-choices">{['Nakshatra','Gothra','Rashi'].map(option => <label key={option}><input type="radio" name="booking-ritual-kind" checked={kind === option} onChange={() => {setKind(option);setRitual(option === 'Nakshatra' ? stars[0] : '')}}/>{option}</label>)}</div><label><span>{kind === 'Nakshatra' ? 'Nakshatra (Star)' : kind} *</span>{kind === 'Gothra' ? <input type="text" value={ritual} onChange={e => setRitual(e.target.value)} placeholder="Enter Gothra" maxLength="120"/> : <select value={ritual} onChange={e => setRitual(e.target.value)}><option value="">Select {kind}</option>{(kind === 'Nakshatra' ? stars : rashis).map(option => <option key={option}>{option}</option>)}</select>}</label></fieldset>
                <label><span>Pooja Date *</span><input type="date" min={indiaDate()} value={date} onChange={e => setDate(e.target.value)}/></label>
                <label><span>Prasad Collection *</span><select value={prasadCollection} onChange={e => setPrasadCollection(e.target.value)}><option>Collect at Counter</option><option disabled>Home Delivery (not available now)</option></select></label>
              </div>
              <details className="booking-options"><summary>Quantity and recurring options</summary><div className="booking-options-content"><label className="booking-next-date"><span>Quantity</span><input type="number" min="1" max="100" step="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))}/></label><label className="booking-recurring-field"><input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)}/> Recurring booking</label>{recurring && <label className="booking-next-date"><span>Next recurring date</span><input type="date" required min={date} value={nextDate} onChange={e => setNextDate(e.target.value)}/><small>One additional occurrence is included in this demo payment. No automatic debit.</small></label>}</div></details>
              {draftIssue && <p className="booking-inline-error" role="status">{draftIssue}</p>}
              <div className="booking-inline-actions"><button type="button" className="booking-inline-add" disabled={!!draftIssue} onClick={addBooking}><Plus size={18}/>{editingId ? 'Update Booking' : 'Add to Booking'}</button><button type="button" className="booking-inline-cancel" onClick={() => {setActiveCode('');setEditingId(null);setError('')}}>Cancel</button></div>
            </div>}
          </article>
        })}</div>
        {!filteredPoojas.length && <div className="booking-empty-state">No poojas match your search or filters.</div>}
      </section>}

      {step === 0 && selectedBookings.length > 0 && <div className="booking-summary-bar"><div><strong>{selectedBookings.length} {selectedBookings.length === 1 ? 'Pooja' : 'Poojas'} added</strong><span>Total {formatPrice(subtotal)}</span>{activeCode && <small>{pooja?.name} is not added yet</small>}</div><button type="button" className="booking-summary-action" onClick={openSelectedBookings}>Continue Booking <span aria-hidden="true">→</span></button></div>}

      {step === 0 && showSelected && selectedBookings.length > 0 && <div className="booking-modal-overlay" role="presentation" onClick={() => setShowSelected(false)}><div className="booking-modal-panel" role="dialog" aria-modal="true" aria-labelledby="selected-poojas-title" onClick={event => event.stopPropagation()}><div className="booking-modal-header"><h2 id="selected-poojas-title">Selected Poojas</h2><button type="button" aria-label="Close selected poojas" onClick={() => setShowSelected(false)}><X size={18}/></button></div><div className="booking-modal-list">{selectedBookings.map(item => { const selectedPooja = temple.poojas.find(candidate => candidate.code === item.code); return <div key={item.id} className="booking-modal-item"><div><strong>{selectedPooja?.name} - {formatPrice((selectedPooja?.price || 0) * item.quantity * item.dates.length)}</strong><p>{item.name} | {item.kind}: {item.ritual} | {item.dates.join(', ')} | Qty {item.quantity}</p></div><div className="booking-modal-item-actions"><button type="button" className="booking-modal-edit" onClick={() => {loadDraft(item);setShowSelected(false)}}>Edit</button><button type="button" className="booking-modal-remove" aria-label={`Remove ${selectedPooja?.name} for ${item.name}`} onClick={() => {const remaining = selectedBookings.filter(selected => selected.id !== item.id);setSelectedBookings(remaining);if (!remaining.length) setShowSelected(false);if (editingId === item.id) {setActiveCode('');setEditingId(null)}}}><Trash2 size={17}/></button></div></div> })}</div><div className="booking-modal-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div><div className="booking-modal-actions"><button type="button" onClick={continueBooking}>Continue booking</button></div></div></div>}

      {step === 1 && <form onSubmit={sendOtp} className="booking-form-card card space-y-4 p-6"><h2 className="booking-form-title">Contact details</h2><Field label="Contact full name"><Input required value={contactName} onChange={e => setContactName(e.target.value)} maxLength={120}/></Field><div className="grid gap-3 sm:grid-cols-[160px_1fr]"><Field label="Country code"><select className="input" value={country} onChange={e => setCountry(e.target.value)}>{['+91','+971','+968','+1','+44'].map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Mobile number (OTP required)"><Input required type="tel" inputMode="numeric" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,''))} maxLength={12}/></Field></div><Field label="Temple donation (optional)"><Input type="number" min="0" max="1000000" step="0.01" value={donation} onChange={e => setDonation(e.target.value)}/></Field><Field label="Special instructions (optional)"><textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} maxLength={1000}/></Field><Amount label="Pooja total" value={subtotal}/><Amount label="Donation" value={donationValue || 0}/><Amount label="Booking total" value={total}/><div className="flex gap-2"><button type="button" className="btn-g" onClick={() => setStep(0)}>Back</button><button className="btn-p">Verify phone with OTP</button></div></form>}
      {step === 2 && <form className="booking-form-card card space-y-4 p-6" onSubmit={e => {e.preventDefault();if (otp !== '123456' || Date.now()-sentAt > 300000) return setError('Incorrect or expired OTP. Request a new demo code.');setError('');setStep(3)}}><h2 className="booking-form-title">Verify your mobile</h2><p>Verify {country} ••••••{mobile.slice(-4)}. Demo OTP: <b>123456</b> (valid for 5 minutes).</p><Field label="6-digit OTP"><Input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={otp} onChange={e => setOtp(e.target.value)}/></Field><button className="btn-p">Verify &amp; continue</button><button type="button" className="btn-g ml-2" disabled={cooldown > 0} onClick={() => sendOtp()}>{cooldown ? `Resend in ${cooldown}s` : 'Resend OTP'}</button><button type="button" className="block underline" onClick={() => {setError('');setStep(1)}}>Change details</button></form>}
      {step === 3 && <div className="booking-form-card card space-y-4 p-6"><h2 className="booking-form-title">Booking summary</h2><p className="break-all text-sm">Booking number: {bookingCode}</p><p>{temple.name} · {temple.code}</p><p>Contact: {contactName}<br/>{country}{mobile} · Verified in demo</p>{selectedBookings.map(item => {const selectedPooja = temple.poojas.find(candidate => candidate.code === item.code);return <div key={item.id}><p>{item.name} · {item.kind}: {item.ritual}</p>{item.dates.map(bookingDate => <Amount key={bookingDate} label={`${selectedPooja.name} x ${item.quantity} · ${bookingDate} · ${selectedPooja.startTime}-${selectedPooja.endTime} IST`} value={selectedPooja.price * item.quantity}/>)}</div>})}{notes && <p>Instructions: {notes}</p>}<Amount label="Donation" value={donationValue}/><Amount label="Booking total" value={total}/><p className="text-sm text-brown-500">Gateway processing charges are shown separately inside the gateway checkout.</p><Field label="Payment gateway"><select className="input" value={gateway} onChange={e => setGateway(e.target.value)}>{['Razorpay','Omniware / Federal Bank','Stripe'].map(g => <option key={g}>{g}</option>)}</select></Field>{result && <div role="alert" className="rounded-xl bg-red-50 p-4"><b>{result === 'failed' ? 'Payment failed' : 'Gateway timed out'}</b><p>No booking is confirmed. This is a simulation; no money was taken. Retry the same booking below.</p></div>}<div className="flex gap-2"><button className="btn-g" onClick={() => {setResult('');setStep(1)}}>Edit details</button><button className="btn-p" onClick={() => {const issue = cartIssue();if(issue){setError(issue.reason);setStep(0);loadDraft(selectedBookings.find(item => item.id === issue.id))}else setGatewayOpen(true)}}>{result ? 'Retry payment' : `Pay \u20B9${total}`}</button></div></div>}
      {gatewayOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Simulated payment gateway"><div className="card w-full max-w-lg space-y-4 p-6"><h2 className="text-xl font-semibold">{gateway} · Test mode</h2><p>No real card or bank details required.</p><Amount label="Booking amount" value={total}/><Amount label="Demo gateway fee (2%)" value={fee}/><Amount label="GST on gateway fee (18%)" value={feeTax}/><Amount label="Total charged by gateway" value={Math.round((total + fee + feeTax)*100)/100}/><Field label="Simulate outcome"><select disabled={processing} className="input" value={outcome} onChange={e => setOutcome(e.target.value)}><option value="success">Success</option><option value="failed">Payment failed</option><option value="timeout">Gateway timeout</option></select></Field><button className="btn-p" disabled={processing} onClick={pay}>{processing ? 'Processing...' : 'Simulate payment'}</button><button className="btn-g ml-2" disabled={processing} onClick={() => setGatewayOpen(false)}>Cancel</button></div></div>}
    </div>
  </div></PublicShell>
}

export function BookingReceipt() {
  const {bookingCode} = useParams(); const record = readBookings().find(r => r.bookingCode === bookingCode && r.status === 'paid')
  if (!record) return <PublicShell><Wrap><h1>Receipt unavailable</h1><p>Only successful demo payments have receipts, saved in this browser session.</p><Link href="/temples">Browse temples</Link></Wrap></PublicShell>
  const Row = ({label,value}) => <Amount label={label} value={value}/>
  const items = bookingReceiptRows(record)
  return <PublicShell hideChatbot><Wrap>
    <div className="print:hidden flex gap-3"><button className="btn-p" onClick={() => window.print()}>Print / Save PDF</button><Link className="btn-g" href={`/book/${record.slug}`}>Book again</Link></div>
    <article id="booking-receipt" className="card space-y-4 p-6">
      <p className="font-bold text-emerald-700">CONFIRMED · DEMO RECEIPT</p><h1 className="text-2xl font-semibold">{record.temple}</h1><p>{record.address}</p>
      <h2 className="text-xl">Booking receipt</h2><p className="break-all">Booking number: {record.bookingCode}</p>
      <p>Temple code: {record.templeCode}<br/>Booked: {new Date(record.createdAt).toLocaleString()}<br/>Booked by: {record.contactName || record.name}<br/>Mobile: {record.mobile}</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr>{['Pooja','Devotee','Star / ritual','Booking date / time','Prasad','Qty','Amount'].map(h => <th className="th" key={h}>{h}</th>)}</tr></thead><tbody>{items.map(item => <tr key={item.id}><td className="td">{item.pooja}</td><td className="td">{item.devoteeName}</td><td className="td">{item.ritual}</td><td className="td">{item.bookingDate}<br/>{item.slot}</td><td className="td">{item.delivery}</td><td className="td">{item.quantity}</td><td className="td"><Money v={item.amount}/></td></tr>)}</tbody></table></div>
      <Row label="Pooja subtotal" value={record.subtotal}/><Row label="Temple donation" value={record.donation}/><Row label="Temple booking total" value={record.total}/><Row label="Gateway fee" value={record.fee}/><Row label="GST on gateway fee" value={record.feeTax}/><Row label="Total simulated payment" value={record.paid}/>
      <p className="break-all">Gateway: {record.gateway}<br/>Transaction ID: {record.transactionId}</p>{record.notes && <p>Instructions: {record.notes}</p>}
      <p className="text-sm text-brown-500">No real payment collected. Not a tax invoice or an 80G certificate. Notifications are not sent in this demo.</p>
    </article>
  </Wrap></PublicShell>
}
