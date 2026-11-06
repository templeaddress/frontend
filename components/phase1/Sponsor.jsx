'use client'

// Sponsorship and subscription checkout (BRD 2.1, 2.2): plans and packages come from the backend; GST and totals are
// computed by the server. Online payment uses TempleAddress Razorpay; bank transfer, cheque and UPI QR are confirmed by
// the accounts team.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Check, Globe2, Landmark, PenLine, QrCode, Search, ShieldCheck, Upload, Zap } from 'lucide-react'
import { Field, Input, PublicShell } from '@/components/ui'
import { clientApi, isVerifiedUser, readAuth, requireAuth } from '@/lib/client-api'
import { sponsorReturnPath } from '@/lib/partner'
import { SITE } from '@/lib/site'

const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const METHODS = { razorpay: 'Pay online (UPI, card, net banking)', bank_transfer: 'Bank transfer (NEFT / IMPS)', cheque: 'Cheque', upi_qr: 'UPI QR (offline confirmation)' }
const STATUS = { payment_pending: 'Payment pending', awaiting_offline_payment: 'Awaiting payment confirmation', paid: 'Paid · active' }
const Card = ({ children, className = '' }) => <section className={`rounded-2xl border border-brown-100 bg-white p-5 ${className}`}>{children}</section>

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = resolve; script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.')); document.head.appendChild(script) })
}

const PAYMENT_TILES = [
  ['omniware', 'Omniware / Federal Bank', ShieldCheck], ['razorpay', 'Razorpay', Zap], ['stripe', 'Stripe', Globe2],
  ['upi_qr', 'UPI / QR', QrCode], ['bank_transfer', 'Bank Transfer', Landmark], ['cheque', 'Cheque', PenLine],
]
const PAY_LABEL = { razorpay: 'Pay full amount via Razorpay', upi_qr: 'Place order · pay by UPI QR', bank_transfer: 'Place order · pay by bank transfer', cheque: 'Place order · pay by cheque' }

// Plans and sponsor packages as one comparison list (BRD 2.1): annual packages first, one-time purchases last.
function catalogueItems(catalogue) {
  const packages = (catalogue?.sponsor_packages || []).map(row => ({ ...row, kind: 'package', unit: row.duration_days === 365 ? '/yr' : row.duration_days ? `/${row.duration_days} days` : '' }))
  const plans = (catalogue?.plans || []).map(row => ({ ...row, kind: 'plan', unit: row.one_time ? '/one time' : row.validity_days === 365 ? '/yr' : `/${row.validity_days} days` }))
  return [...packages, ...plans.filter(row => !row.one_time), ...plans.filter(row => row.one_time)]
}

function PackageCard({ row, active, disabled, featured, onChoose }) {
  return <button type="button" onClick={onChoose} disabled={disabled} aria-pressed={active}
    className={`relative flex h-full flex-col rounded-2xl border bg-white p-5 text-left transition ${active ? 'border-saffron-500 ring-2 ring-saffron-500/30' : featured ? 'border-saffron-400' : 'border-brown-100 hover:border-brown-300'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
    {featured && <span className="pill mb-2 w-fit bg-saffron-50 text-saffron-700">Most chosen</span>}
    <h3 className="text-lg font-semibold leading-snug">{row.name}</h3>
    <p className="mt-1"><b className="font-display text-2xl text-brown-900">{money(row.price)}</b><small className="text-saffron-700">{row.unit}</small></p>
    <ul className="mt-3 space-y-1.5 text-sm text-brown-600">{row.benefits.map(text => <li key={text} className="flex gap-1.5"><Check size={15} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true"/>{text}</li>)}</ul>
    {disabled && <small className="mt-auto pt-3 text-xs text-brown-500">Self sponsorship only</small>}
    {active && <span className="absolute right-3 top-3 rounded-full bg-saffron-500 p-1 text-white"><Check size={13} aria-hidden="true"/></span>}
  </button>
}

export function SponsorCheckout() {
  const router = useRouter(), params = useSearchParams()
  const [catalogue, setCatalogue] = useState(null), [kind, setKind] = useState('self'), [listing, setListing] = useState(null)
  const [query, setQuery] = useState(''), [results, setResults] = useState([]), [choice, setChoice] = useState('')
  const [referral, setReferral] = useState(''), [referralState, setReferralState] = useState(null), [sponsor, setSponsor] = useState({ name: '', gstin: '', message: '' })
  const [method, setMethod] = useState('razorpay'), [busy, setBusy] = useState(false), [error, setError] = useState('')
  useEffect(() => { clientApi('plans', { auth: false }).then(setCatalogue).catch(err => setError(err.message)) }, [])
  const queryString = params.toString()
  useEffect(() => {
    const query = new URLSearchParams(queryString), uuid = query.get('listing'), slug = query.get('slug')
    if (uuid && readAuth()?.access) clientApi('me/managed-listings').then(rows => { const row = rows.find(item => item.uuid === uuid); if (row) setListing(row) }).catch(() => null)
    if (slug) clientApi(`listings/${slug}`, { auth: false }).then(setListing).catch(() => null)
    if (query.get('kind') === 'third_party') setKind('third_party')
    // Partner share links carry ?ref=<partner code>; prefill it so the sale is credited to that partner.
    if (query.get('ref')) { setReferral(query.get('ref').toUpperCase()); clientApi(`referrals/${encodeURIComponent(query.get('ref'))}`, { auth: false }).then(setReferralState).catch(() => setReferralState({ valid: false })) }
  }, [queryString])
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const timer = window.setTimeout(() => clientApi(`listings?type=temple&search=${encodeURIComponent(query.trim())}&page_size=6`, { auth: false }).then(data => setResults(data.results || data)).catch(() => setResults([])), 300)
    return () => window.clearTimeout(timer)
  }, [query])
  const items = catalogueItems(catalogue)
  const allowed = row => kind === 'self' || row.kind === 'package'
  // One "Most chosen" badge: the admin's featured item, else the Patron tier.
  const featuredItem = items.find(row => row.featured) || items.find(row => row.tier === 'patron')
  // Patron is preselected, as in the approved prototype, once the catalogue arrives.
  const selected = items.find(row => row.code === choice && allowed(row)) || (!choice && featuredItem && allowed(featuredItem) ? featuredItem : null)
  const subtotal = selected ? Number(selected.price) : 0, gst = subtotal * Number(catalogue?.gst_percent || 18) / 100
  const methods = catalogue?.payment_methods || ['razorpay'], open = Boolean(catalogue?.commerce_enabled)
  async function checkReferral() { if (!referral.trim()) return setReferralState(null); try { setReferralState(await clientApi(`referrals/${encodeURIComponent(referral.trim())}`, { auth: false })) } catch { setReferralState({ valid: false }) } }
  async function pay(event) {
    event.preventDefault(); setError('')
    if (!open) return setError(`Online sponsorship opens soon. Write to ${SITE.email} or WhatsApp ${SITE.whatsappDisplay} to sponsor a temple today.`)
    if (!requireAuth(router, sponsorReturnPath(queryString, listing, referral, kind))) return
    if (!isVerifiedUser(readAuth()?.user)) return setError('Sign in with mobile OTP or Google to continue.')
    if (!listing) return setError('Choose the temple to sponsor.')
    if (!selected) return setError(kind === 'self' ? 'Choose a plan or package.' : 'Choose a sponsor package.')
    if (kind === 'third_party' && !sponsor.name.trim()) return setError('Enter the sponsor name.')
    setBusy(true)
    try {
      const order = await clientApi('me/sale-orders', { method: 'POST', body: { listing_uuid: listing.uuid, kind, plan_code: selected.kind === 'plan' ? selected.code : '', package_code: selected.kind === 'package' ? selected.code : '', referral_code: referralState?.valid ? referral.trim() : '', payment_method: method, sponsor: kind === 'third_party' ? sponsor : {} } })
      if (method === 'razorpay' && order.payment_order?.provider_order_id) {
        await loadRazorpay()
        await new Promise((resolve, reject) => {
          const checkout = new window.Razorpay({ key: order.payment_order.key_id, order_id: order.payment_order.provider_order_id, amount: Math.round(Number(order.total) * 100), currency: order.currency, name: 'TempleAddress', description: `Sponsorship ${order.code}`, handler: resolve, modal: { ondismiss: () => reject(new Error('Payment window closed. You can retry from your order page.')) } })
          checkout.on('payment.failed', response => reject(new Error(response.error?.description || 'Payment failed.')))
          checkout.open()
        }).catch(err => setError(err.message))
        await clientApi(`me/sale-orders/${order.code}/payment-check`, { method: 'POST', body: {} }).catch(() => null)
      }
      router.push(`/sponsor/orders/${order.code}`)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <PublicShell><main className="mx-auto max-w-6xl px-4 py-10">
    <form onSubmit={pay} className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Sponsor a temple&apos;s online presence</h1>
        <p className="mt-3 max-w-2xl text-brown-600">Fund a temple directly as its committee, or support it as a third-party sponsor with optional branding. The temple gets its website, WhatsApp bookings and paperless receipts.</p>
        {!catalogue && !error && <p role="status" className="mt-8 text-sm text-brown-500">Loading packages…</p>}
        {catalogue && !items.length && <p className="mt-8 rounded-2xl border border-brown-100 bg-white p-5 text-sm text-brown-600">Sponsorship packages are being finalised. Write to <a className="text-saffron-700 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> to sponsor a temple.</p>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(row => <PackageCard key={`${row.kind}-${row.code}`} row={row} active={selected?.code === row.code && selected?.kind === row.kind} disabled={!allowed(row)} featured={row === featuredItem} onChoose={() => setChoice(row.code)}/>)}</div>
        {items.length > 0 && <p className="mt-4 text-xs text-brown-500">Prices exclude GST at {catalogue?.gst_percent || 18}%. Sponsorships receive a GST tax invoice, not an 80G receipt.</p>}
        {kind === 'third_party' && <Card className="mt-6"><h2 className="mb-3 text-lg font-semibold">Sponsor details</h2><div className="grid gap-3 sm:grid-cols-2">
          <Field label="Sponsor or organisation name"><Input value={sponsor.name} onChange={e => setSponsor(s => ({ ...s, name: e.target.value }))} maxLength={160}/></Field>
          <Field label="GSTIN (if registered)"><Input value={sponsor.gstin} onChange={e => setSponsor(s => ({ ...s, gstin: e.target.value.toUpperCase() }))} maxLength={15}/></Field>
          <div className="sm:col-span-2"><Field label="Sponsor message (optional)"><Input value={sponsor.message} onChange={e => setSponsor(s => ({ ...s, message: e.target.value }))} maxLength={200}/></Field></div>
        </div><p className="mt-3 flex items-center gap-1.5 text-xs text-brown-500"><Upload size={13} aria-hidden="true"/>You can upload the logo and advertisement banner after payment.</p></Card>}
      </section>
      <aside className="h-fit min-w-0 rounded-2xl border border-brown-100 bg-white p-5 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold">Sponsor now</h2>
        <p className="mt-4 text-sm font-semibold">Sponsorship type</p>
        <div className="mt-2 grid grid-cols-2 gap-2">{[['self', 'Self sponsorship', 'Temple committee pays · no sponsor branding'], ['third_party', 'Third-party sponsor', 'Sponsor identity and advertising options']].map(([value, title, text]) =>
          <label key={value} className={`cursor-pointer rounded-xl border p-3 text-sm ${kind === value ? 'border-saffron-500 bg-saffron-50' : 'border-brown-100'}`}><span className="flex items-center gap-2"><input type="radio" name="kind" checked={kind === value} onChange={() => setKind(value)} className="accent-saffron-600"/><b>{title}</b></span><small className="mt-1 block text-xs text-brown-500">{text}</small></label>)}</div>
        <p className="mt-5 text-sm font-semibold">Partner code (optional)</p>
        <div className="mt-2 flex gap-2"><Input value={referral} onChange={e => { setReferral(e.target.value.toUpperCase()); setReferralState(null) }} placeholder="e.g. P00124" aria-label="Partner code"/><button type="button" className="btn-g shrink-0" onClick={checkReferral}>Validate</button></div>
        <p className={`mt-1 text-xs ${referralState?.valid ? 'text-emerald-700' : referralState ? 'text-red-700' : 'text-saffron-700'}`}>{referralState?.valid ? `Valid partner code · ${referralState.name || referralState.code}` : referralState ? 'This partner code is not valid.' : 'Referred by a TempleAddress partner? Validate their code to credit the sale.'}</p>
        <p className="mt-5 text-sm font-semibold">Temple to sponsor</p>
        {!listing && <div className="relative mt-2"><Search size={16} className="absolute left-3 top-3 text-brown-400" aria-hidden="true"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, place or code…" className="input pl-9" aria-label="Search temples to sponsor"/>
          {results.length > 0 && <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-brown-100 bg-white shadow-soft">{results.map(row => <li key={row.uuid}><button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-brown-50" onClick={() => { setListing(row); setQuery(''); setResults([]) }}><b>{row.name_en}</b><small className="block text-brown-500">{row.code} · {row.district?.name_en || row.address}</small></button></li>)}</ul>}</div>}
        {listing && <div className="mt-2 flex items-center gap-3 rounded-xl border border-brown-100 p-2.5">
          {listing.cover ? <img src={listing.cover} alt="" className="h-11 w-11 rounded-lg object-cover"/> : <span className="photo h-11 w-11 shrink-0 rounded-lg"/>}
          <span className="min-w-0 flex-1"><b className="block truncate text-sm">{listing.name_en}</b><small className="block truncate text-xs text-brown-500">{listing.code} · {listing.district?.name_en || listing.address || ''}</small></span>
          <select className="input !w-auto !py-1.5 text-sm" aria-label="Plan for this temple" value={selected ? selected.code : ''} onChange={e => setChoice(e.target.value)}>{items.filter(allowed).map(row => <option key={`${row.kind}-${row.code}`} value={row.code}>{row.name}</option>)}</select>
          <button type="button" className="text-xs text-brown-500 underline" onClick={() => setListing(null)}>Change</button>
        </div>}
        <p className="mt-5 text-sm font-semibold">Payment method</p>
        <div className="mt-2 grid grid-cols-3 gap-2">{PAYMENT_TILES.map(([value, label, Icon]) => { const enabled = methods.includes(value); return <button key={value} type="button" disabled={!enabled} onClick={() => setMethod(value)} aria-pressed={method === value}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-center text-xs font-medium ${method === value ? 'border-saffron-500 bg-saffron-50 text-saffron-800' : 'border-brown-100'} ${enabled ? 'hover:border-brown-300' : 'cursor-not-allowed opacity-50'}`}><Icon size={17} aria-hidden="true"/>{label}{!enabled && <small className="text-[10px] text-brown-400">Coming soon</small>}</button> })}</div>
        <dl className="mt-5 space-y-2 rounded-xl bg-brown-50 p-4 text-sm">
          <div className="flex justify-between"><dt>Selected plan{listing ? ' (1 temple)' : ''}{selected ? ` · ${selected.name}` : ''}</dt><dd>{money(subtotal)}</dd></div>
          <div className="flex justify-between border-t border-brown-100 pt-2"><dt>GST {catalogue?.gst_percent || 18}%</dt><dd>{money(gst)}</dd></div>
          <div className="flex justify-between border-t border-brown-100 pt-2 text-base font-bold"><dt>Total</dt><dd>{money(subtotal + gst)}</dd></div>
        </dl>
        {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="btn-p mt-4 w-full !py-3" disabled={busy || !items.length}>{busy ? 'Please wait…' : open ? PAY_LABEL[method] || 'Continue' : 'Sponsorship opens soon'}</button>
        <p className="mt-2 text-xs text-saffron-700">{method === 'razorpay' ? 'Gateway-confirmed payments activate immediately and issue a final GST tax invoice.' : 'Offline payments are confirmed by our accounts team before the plan activates.'}</p>
        {!open && catalogue && <p className="mt-2 text-xs text-brown-500">Online checkout is not open yet. To sponsor now, write to <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or WhatsApp {SITE.whatsappDisplay}.</p>}
        <Link href="/sponsor/orders" className="mt-4 block text-center text-sm font-semibold text-saffron-700">My sponsorships →</Link>
      </aside>
    </form>
  </main></PublicShell>
}

export function SponsorOrders() {
  const router = useRouter(), [rows, setRows] = useState(null), [error, setError] = useState('')
  useEffect(() => { if (!requireAuth(router, '/sponsor/orders')) return; clientApi('me/sale-orders').then(setRows).catch(err => setError(err.message)) }, [router])
  return <PublicShell><main className="mx-auto max-w-3xl px-4 py-10"><div className="flex items-center justify-between"><h1 className="font-display text-3xl font-semibold">My sponsorships</h1><Link className="btn-p" href="/sponsor">New sponsorship</Link></div>{error && <p role="alert" className="mt-4 text-red-700">{error}</p>}<div className="mt-6 space-y-3">{rows?.map(row => <Link key={row.code} href={`/sponsor/orders/${row.code}`} className="block rounded-2xl border border-brown-100 bg-white p-4 hover:border-saffron-400"><div className="flex justify-between"><b>{row.listing?.name_en}</b><span className="text-sm">{STATUS[row.status] || row.status}</span></div><p className="text-sm text-brown-500">{row.code} · {row.lines.map(line => line.description).join(', ')} · {money(row.total)}</p></Link>)}{rows && !rows.length && <p className="text-brown-500">No sponsorships yet.</p>}{!rows && !error && <p role="status">Loading…</p>}</div></main></PublicShell>
}

export function SponsorOrder() {
  const { code } = useParams(), router = useRouter(), [order, setOrder] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  const load = () => clientApi(`me/sale-orders/${code}`).then(setOrder).catch(err => setError(err.message))
  useEffect(() => { if (!requireAuth(router, `/sponsor/orders/${code}`)) return; load() }, [router, code]) // eslint-disable-line react-hooks/exhaustive-deps
  async function check() { setBusy(true); try { setOrder(await clientApi(`me/sale-orders/${code}/payment-check`, { method: 'POST', body: {} })) } catch (err) { setError(err.message) } finally { setBusy(false) } }
  async function upload(event) { event.preventDefault(); setBusy(true); setError(''); try { const form = new FormData(event.currentTarget); await clientApi(`me/sale-orders/${code}/advertisement`, { method: 'POST', body: form }); setNotice('Banner submitted for review.'); await load() } catch (err) { setError(err.message) } finally { setBusy(false) } }
  if (!order) return <PublicShell><main className="mx-auto max-w-3xl px-4 py-10">{error ? <p role="alert" className="text-red-700">{error}</p> : <p role="status">Loading order…</p>}</main></PublicShell>
  const ad = order.advertisements?.[0]
  return <PublicShell><main className="mx-auto max-w-3xl space-y-5 px-4 py-10"><div><Link className="text-sm text-saffron-700" href="/sponsor/orders">← My sponsorships</Link><h1 className="mt-2 font-display text-3xl font-semibold">{order.listing?.name_en}</h1><p className="text-brown-500">{order.code} · {STATUS[order.status] || order.status}</p></div>
    {notice && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Card><ul className="space-y-2 text-sm">{order.lines.map(line => <li key={line.code} className="flex justify-between"><span>{line.description}</span><b>{money(line.amount)}</b></li>)}</ul><div className="mt-3 space-y-1 border-t pt-3 text-sm"><div className="flex justify-between"><span>GST</span><span>{money(order.tax_total)}</span></div><div className="flex justify-between font-semibold"><span>Total</span><span>{money(order.total)}</span></div></div></Card>
    {order.status === 'payment_pending' && <Card><p className="text-sm">We have not received confirmation from Razorpay yet.</p><button className="btn-g mt-3" disabled={busy} onClick={check}>{busy ? 'Checking…' : 'Check payment status'}</button></Card>}
    {order.status === 'awaiting_offline_payment' && <Card><h2 className="font-semibold">Complete your payment</h2><p className="mt-2 text-sm">Pay {money(order.total)} by {METHODS[order.payment_method] || order.payment_method} and quote <b>{order.code}</b> as the reference. Our accounts team activates the order once the money is received; the invoice then appears on this page.</p><p className="mt-2 text-sm text-brown-500">For bank details, contact TempleAddress support.</p></Card>}
    {order.invoice && <Card><h2 className="font-semibold">Invoice {order.invoice.number}</h2><p className="text-sm text-brown-500">Issued {new Date(order.invoice.issued_at).toLocaleDateString('en-IN')} · payment reference {order.invoice.snapshot.payment_reference}</p></Card>}
    {ad && <Card><h2 className="font-semibold">Sponsor banner</h2><p className="mt-1 text-sm text-brown-500">Status: {ad.status.replaceAll('_', ' ')}{ad.media_url ? '' : ' · no banner uploaded yet'}</p>{ad.media_url && ad.status !== 'awaiting_creative' && <p className="mt-1 text-xs text-brown-500">Shown on the temple page once approved.</p>}{ad.status === 'awaiting_creative' && <form onSubmit={upload} className="mt-3 space-y-3"><Field label="Banner or logo (JPG, PNG or WebP, up to 5 MB)"><input name="media" type="file" accept="image/jpeg,image/png,image/webp" required className="input"/></Field><Field label="Link (optional)"><Input name="click_url" type="url" placeholder="https://"/></Field><button className="btn-p" disabled={busy}><Upload size={15}/>{busy ? 'Uploading…' : 'Submit for approval'}</button></form>}</Card>}
  </main></PublicShell>
}
