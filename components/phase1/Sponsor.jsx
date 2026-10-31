'use client'

// Sponsorship and subscription checkout (BRD 2.1, 2.2): plans and packages come from the backend; GST and totals are
// computed by the server. Online payment uses TempleAddress Razorpay; bank transfer, cheque and UPI QR are confirmed by
// the accounts team.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Check, Search, Upload } from 'lucide-react'
import { Field, Input, PublicShell } from '@/components/ui'
import { clientApi, isVerifiedUser, readAuth, requireAuth } from '@/lib/client-api'

const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const METHODS = { razorpay: 'Pay online (UPI, card, net banking)', bank_transfer: 'Bank transfer (NEFT / IMPS)', cheque: 'Cheque', upi_qr: 'UPI QR (offline confirmation)' }
const STATUS = { payment_pending: 'Payment pending', awaiting_offline_payment: 'Awaiting payment confirmation', paid: 'Paid · active' }
const Card = ({ children, className = '' }) => <section className={`rounded-2xl border border-brown-100 bg-white p-5 ${className}`}>{children}</section>

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = resolve; script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.')); document.head.appendChild(script) })
}

export function SponsorCheckout() {
  const router = useRouter(), params = useSearchParams()
  const [catalogue, setCatalogue] = useState(null), [kind, setKind] = useState('self'), [listing, setListing] = useState(null)
  const [query, setQuery] = useState(''), [results, setResults] = useState([]), [plan, setPlan] = useState(''), [pkg, setPkg] = useState('')
  const [referral, setReferral] = useState(''), [referralState, setReferralState] = useState(null), [sponsor, setSponsor] = useState({ name: '', gstin: '', message: '' })
  const [method, setMethod] = useState('razorpay'), [busy, setBusy] = useState(false), [error, setError] = useState('')
  useEffect(() => { clientApi('plans', { auth: false }).then(setCatalogue).catch(err => setError(err.message)) }, [])
  const queryString = params.toString()
  useEffect(() => {
    const query = new URLSearchParams(queryString), uuid = query.get('listing'), slug = query.get('slug')
    if (uuid && readAuth()?.access) clientApi('me/managed-listings').then(rows => { const row = rows.find(item => item.uuid === uuid); if (row) setListing(row) }).catch(() => null)
    if (slug) clientApi(`listings/${slug}`, { auth: false }).then(setListing).catch(() => null)
    if (query.get('kind') === 'third_party') setKind('third_party')
  }, [queryString])
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const timer = window.setTimeout(() => clientApi(`listings?search=${encodeURIComponent(query.trim())}&page_size=6`, { auth: false }).then(data => setResults(data.results || data)).catch(() => setResults([])), 300)
    return () => window.clearTimeout(timer)
  }, [query])
  const plans = catalogue?.plans || [], packages = catalogue?.sponsor_packages || []
  const chosen = [...plans.filter(row => row.code === plan), ...packages.filter(row => row.code === pkg)]
  const subtotal = chosen.reduce((sum, row) => sum + Number(row.price), 0), gst = subtotal * Number(catalogue?.gst_percent || 18) / 100
  async function checkReferral() { if (!referral.trim()) return setReferralState(null); try { setReferralState(await clientApi(`referrals/${encodeURIComponent(referral.trim())}`, { auth: false })) } catch { setReferralState({ valid: false }) } }
  async function pay(event) {
    event.preventDefault(); setError('')
    if (!requireAuth(router, `/sponsor${listing ? `?listing=${listing.uuid}` : ''}`)) return
    if (!isVerifiedUser(readAuth()?.user)) return setError('Sign in with mobile OTP or Google to continue.')
    if (!listing) return setError('Choose the temple to sponsor.')
    if (!chosen.length) return setError(kind === 'self' ? 'Choose a plan.' : 'Choose a sponsor package.')
    setBusy(true)
    try {
      const order = await clientApi('me/sale-orders', { method: 'POST', body: { listing_uuid: listing.uuid, kind, plan_code: plan, package_code: pkg, referral_code: referralState?.valid ? referral.trim() : '', payment_method: method, sponsor: kind === 'third_party' ? sponsor : {} } })
      if (method === 'razorpay' && order.payment_order?.provider_order_id) {
        await loadRazorpay()
        await new Promise((resolve, reject) => {
          const checkout = new window.Razorpay({ key: order.payment_order.key_id, order_id: order.payment_order.provider_order_id, amount: Math.round(Number(order.total) * 100), currency: order.currency, name: 'TempleAddress', description: `Sponsorship ${order.code}`, notes: { sale_order: order.code }, theme: { color: '#c85b20' }, handler: resolve, modal: { ondismiss: () => reject(new Error('Payment window was closed. You can pay from the order page.')) } })
          checkout.on('payment.failed', response => reject(new Error(response.error?.description || 'Payment failed.')))
          checkout.open()
        }).catch(err => setError(err.message))
        await clientApi(`me/sale-orders/${order.code}/payment-check`, { method: 'POST', body: {} }).catch(() => null)
      }
      router.push(`/sponsor/orders/${order.code}`)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  if (catalogue && !catalogue.commerce_enabled) return <PublicShell><main className="mx-auto max-w-3xl px-4 py-12"><h1 className="font-display text-4xl font-semibold">Sponsor a temple</h1><p className="mt-3 text-brown-600">Plans and sponsorships open soon. Write to us and we will help you set one up.</p><Link href="/support" className="btn-p mt-6">Contact TempleAddress</Link></main></PublicShell>
  return <PublicShell><main className="mx-auto max-w-5xl px-4 py-10"><h1 className="font-display text-4xl font-semibold">Sponsor a temple</h1><p className="mt-2 text-brown-600">Fund a temple’s annual plan yourself, or sponsor it with your brand on the temple page, receipts and QR boards.</p>
    <form onSubmit={pay} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-5">
      <Card><h2 className="mb-3 text-lg font-semibold">1. Sponsorship type</h2><div className="grid gap-3 sm:grid-cols-2">{[['self', 'Self sponsorship', 'The temple committee pays for its own plan. No sponsor branding.'], ['third_party', 'Third-party sponsor', 'A business or devotee sponsors the temple, with logo and message.']].map(([value, title, text]) => <button type="button" key={value} aria-pressed={kind === value} onClick={() => { setKind(value); setPlan(''); setPkg('') }} className={`rounded-xl border p-4 text-left ${kind === value ? 'border-saffron-500 bg-saffron-50' : 'border-brown-200'}`}><b>{title}</b><p className="mt-1 text-sm text-brown-500">{text}</p></button>)}</div></Card>
      <Card><h2 className="mb-3 text-lg font-semibold">2. Temple</h2>{listing ? <div className="flex items-center justify-between rounded-xl bg-brown-50 p-3"><span><b>{listing.name_en}</b><small className="block text-brown-500">{listing.code} · {listing.district?.name_en || listing.address}</small></span><button type="button" className="text-sm text-saffron-700 underline" onClick={() => setListing(null)}>Change</button></div> : <><div className="relative"><Search size={16} className="absolute left-3 top-3.5 text-brown-400"/><input className="input !pl-9" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by temple name, place or code" aria-label="Search temples"/></div><ul className="mt-2 divide-y">{results.map(row => <li key={row.uuid}><button type="button" className="w-full py-2 text-left text-sm hover:text-saffron-700" onClick={() => { setListing(row); setQuery('') }}><b>{row.name_en}</b> · {row.code} <span className="text-brown-500">{row.district?.name_en}</span></button></li>)}</ul></>}</Card>
      <Card><h2 className="mb-3 text-lg font-semibold">3. {kind === 'self' ? 'Choose a plan' : 'Choose a sponsor package'}</h2><div className="grid gap-3 md:grid-cols-3">{(kind === 'self' ? plans : packages).map(row => { const active = (kind === 'self' ? plan : pkg) === row.code; return <button type="button" key={row.code} aria-pressed={active} onClick={() => kind === 'self' ? setPlan(row.code) : setPkg(row.code)} className={`rounded-xl border p-4 text-left ${active ? 'border-saffron-500 bg-saffron-50' : 'border-brown-200'}`}><b>{row.name}</b><p className="mt-1 text-xl font-semibold">{money(row.price)}</p><p className="text-xs text-brown-500">{row.validity_days || row.duration_days} days + GST</p><ul className="mt-2 space-y-1 text-xs">{(row.benefits || []).map(benefit => <li key={benefit} className="flex gap-1"><Check size={13} className="mt-0.5 shrink-0 text-emerald-600"/>{benefit}</li>)}</ul></button> })}{!(kind === 'self' ? plans : packages).length && <p className="text-sm text-brown-500">{catalogue ? 'No options are published yet.' : 'Loading…'}</p>}</div></Card>
      {kind === 'third_party' && <Card><h2 className="mb-3 text-lg font-semibold">4. Sponsor details</h2><div className="grid gap-3 sm:grid-cols-2"><Field label="Sponsor name"><Input value={sponsor.name} onChange={e => setSponsor(s => ({ ...s, name: e.target.value }))} maxLength={160} required/></Field><Field label="GSTIN (if registered)"><Input value={sponsor.gstin} onChange={e => setSponsor(s => ({ ...s, gstin: e.target.value.toUpperCase() }))} maxLength={15} pattern="[0-9A-Z]{15}"/></Field><Field label="Sponsor message (optional)" className="sm:col-span-2"><textarea className="input" rows={2} maxLength={500} value={sponsor.message} onChange={e => setSponsor(s => ({ ...s, message: e.target.value }))}/></Field></div><p className="mt-2 text-xs text-brown-500">Upload your logo or banner after payment; it appears once TempleAddress approves it.</p></Card>}
      <Card><h2 className="mb-3 text-lg font-semibold">{kind === 'third_party' ? '5' : '4'}. Referral code & payment</h2><div className="flex gap-2"><Input value={referral} onChange={e => { setReferral(e.target.value.toUpperCase()); setReferralState(null) }} placeholder="Partner referral code (optional)" aria-label="Referral code"/><button type="button" className="btn-g" onClick={checkReferral}>Apply</button></div>{referralState && <p className={`mt-1 text-xs ${referralState.valid ? 'text-emerald-700' : 'text-red-700'}`}>{referralState.valid ? `Referred by ${referralState.name || referralState.code}` : 'This referral code is not valid.'}</p>}
        <fieldset className="mt-4 space-y-2">{(catalogue?.payment_methods || ['razorpay']).map(value => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" name="method" checked={method === value} onChange={() => setMethod(value)}/>{METHODS[value] || value}</label>)}</fieldset></Card>
    </div>
    <aside className="h-fit rounded-2xl border border-brown-100 bg-white p-5 lg:sticky lg:top-24"><h2 className="text-lg font-semibold">Payment summary</h2><ul className="mt-3 space-y-2 text-sm">{chosen.map(row => <li key={row.code} className="flex justify-between"><span>{row.name}</span><b>{money(row.price)}</b></li>)}{!chosen.length && <li className="text-brown-500">Nothing selected yet.</li>}</ul><div className="mt-3 space-y-1 border-t pt-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span>GST {catalogue?.gst_percent || 18}%</span><span>{money(gst)}</span></div><div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{money(subtotal + gst)}</span></div></div><p className="mt-2 text-xs text-brown-500">The final amount and invoice are calculated by TempleAddress.</p>{error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="btn-p mt-4 w-full" disabled={busy || !chosen.length || !listing}>{busy ? 'Please wait…' : method === 'razorpay' ? `Pay ${money(subtotal + gst)}` : 'Place order'}</button><Link className="mt-3 block text-center text-sm text-saffron-700" href="/sponsor/orders">My sponsorship orders</Link></aside></form></main></PublicShell>
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
