'use client'

// Vendor portal (BRD 2.9-2.12): one shell for temple committees (/vendor), festival committees (/festival-admin) and
// service providers (/service-admin). Access follows the signed-in user's active listing memberships; every API
// re-checks membership server-side.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { CalendarCheck, ClipboardList, ListOrdered, Gift, Landmark, Settings, Database, PenLine, Truck, CalendarClock, MessageSquare, Star, UserCog, Sparkles, Users, Download, ExternalLink, LogOut, Menu, X, ArrowRight } from 'lucide-react'
import { Logo, PublicShell } from '@/components/ui'
import { clientApi, logout, requireAuth } from '@/lib/client-api'
import { ListingQrPreview } from '@/components/ListingQr'
import PoojaCatalogue from './PoojaCatalogue'
import { staffDownload } from './StaffData'
import { StaffDetails, StaffEmpty, StaffModal, StaffNotice, StaffSearch, StaffStatus, money, staffDate, titleCase } from './StaffUI'

const STORE = 'ta-vendor-listing'
const BASES = { temple: '/vendor', festival: '/festival-admin', service: '/service-admin' }
const NAV = {
  temple: [['', 'Dashboard', CalendarCheck], ['/bookings', 'Bookings', ListOrdered], ['/charts', 'Daily charts', ClipboardList], ['/poojas', 'Pooja management', Sparkles], ['/donations', 'Donations', Gift], ['/deliveries', 'Prasadam delivery', Truck], ['/payouts', 'Payouts', Landmark], ['/editor', 'Listing management', PenLine], ['/data', 'Reports & exports', Database], ['/settings', 'Settings', Settings]],
  festival: [['', 'Dashboard', CalendarCheck], ['/programme', 'Programme', CalendarClock], ['/offerings', 'Offerings', Sparkles], ['/bookings', 'Day sheets', ClipboardList], ['/sponsors', 'Sponsors', Users], ['/profile', 'Festival page editor', PenLine], ['/settings', 'Settings', Settings]],
  service: [['', 'Dashboard', CalendarCheck], ['/appointments', 'Appointments', CalendarClock], ['/services', 'Services', Sparkles], ['/enquiries', 'Enquiries', MessageSquare], ['/reviews', 'Reviews', Star], ['/profile', 'Provider profile', UserCog]],
}
const VendorContext = createContext(null)
export const useVendor = () => useContext(VendorContext)
const kindOf = listing => ['festival', 'service'].includes(listing?.listing_type) ? listing.listing_type : 'temple'
const Heading = ({ title, text, action }) => <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-3xl font-semibold text-brown-900">{title}</h1>{text && <p className="mt-1 text-sm text-brown-500">{text}</p>}</div>{action && <div className="flex flex-wrap gap-2">{action}</div>}</div>
const Stat = ({ value, label, note, href }) => { const body = <><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-sm text-brown-500">{label}</p>{note && <p className="mt-1 text-xs font-semibold text-emerald-700">{note}</p>}</>; return href ? <Link href={href} className="rounded-2xl border border-brown-100 bg-white p-5 transition hover:border-saffron-400">{body}</Link> : <div className="rounded-2xl border border-brown-100 bg-white p-5">{body}</div> }
const Table = ({ head, children }) => <div className="overflow-x-auto rounded-2xl border border-brown-100 bg-white"><table className="w-full text-sm"><thead><tr>{head.map(label => <th key={label} className="th">{label}</th>)}</tr></thead><tbody>{children}</tbody></table></div>

function useVendorQuery(path) {
  const [state, setState] = useState({ data: null, loading: true, error: '' }), [version, setVersion] = useState(0)
  useEffect(() => {
    if (!path) return
    let active = true
    setState(s => ({ ...s, loading: true, error: '' }))
    clientApi(path).then(data => active && setState({ data, loading: false, error: '' })).catch(err => active && setState({ data: null, loading: false, error: err.message }))
    return () => { active = false }
  }, [path, version])
  return { ...state, reload: useCallback(() => setVersion(v => v + 1), []) }
}

export function VendorArea({ children }) {
  const router = useRouter(), pathname = usePathname()
  const [listings, setListings] = useState(null), [selected, setSelected] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    if (!requireAuth(router, pathname)) return
    clientApi('me/managed-listings').then(rows => {
      setListings(rows)
      const kind = Object.entries(BASES).find(([, base]) => pathname === base || pathname.startsWith(`${base}/`))?.[0] || 'temple'
      let saved = null
      try { saved = window.localStorage.getItem(STORE) } catch {}
      const ofKind = rows.filter(row => kindOf(row) === kind)
      setSelected(ofKind.find(row => row.uuid === saved) || ofKind[0] || rows.find(row => row.uuid === saved) || rows[0] || null)
    }).catch(err => setError(err.message))
  }, [router, pathname])
  const choose = useCallback(uuid => {
    const listing = listings.find(row => row.uuid === uuid)
    try { window.localStorage.setItem(STORE, uuid) } catch {}
    setSelected(listing)
    router.push(BASES[kindOf(listing)])
  }, [listings, router])
  if (error) return <PublicShell><main className="mx-auto max-w-xl p-10"><p role="alert" className="text-red-700">{error}</p></main></PublicShell>
  if (!listings) return <PublicShell><p role="status" className="p-10">Loading your listings…</p></PublicShell>
  if (!selected) return <PublicShell><main className="mx-auto max-w-xl space-y-4 p-10"><h1 className="text-2xl font-semibold">No managed listings yet</h1><p className="text-brown-500">The vendor dashboard opens once TempleAddress staff approve you as the owner or administrator of a published temple, festival or service listing. You can claim an existing temple from its public page.</p><Link className="btn-p" href="/temples">Find your temple</Link><Link className="btn-g" href="/account/listings">My submitted listings</Link></main></PublicShell>
  return <VendorContext.Provider value={{ listing: selected, listings, choose, base: BASES[kindOf(selected)], kind: kindOf(selected), manage: ['owner', 'admin'].includes(selected.membership_role) }}>{children}</VendorContext.Provider>
}

export function VendorShell({ children }) {
  const { listing, listings, choose, base, kind } = useVendor(), pathname = usePathname(), router = useRouter()
  const [open, setOpen] = useState(false)
  const links = NAV[kind].map(([path, label, Icon]) => [`${base}${path}`, label, Icon])
  async function signOut() { try { await logout() } finally { router.replace('/login') } }
  return <div className="min-h-screen bg-brown-50"><header className="sticky top-0 z-40 border-b border-saffron-500/60 bg-brown-900 text-white"><div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4"><button className="rounded-lg p-2 hover:bg-white/10 md:hidden" aria-label="Toggle vendor navigation" onClick={() => setOpen(v => !v)}>{open ? <X size={20}/> : <Menu size={20}/>}</button><Logo light markSize={30}/><span className="hidden rounded-full bg-gold-300/15 px-3 py-1 text-xs font-semibold text-gold-300 sm:inline-flex">Vendor · {titleCase(kind === 'service' ? 'Service provider' : kind)}</span><div className="flex-1"/>
    {listings.length > 1 ? <select aria-label="Choose listing" className="max-w-[260px] rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white" value={listing.uuid} onChange={e => choose(e.target.value)}>{listings.map(row => <option className="text-brown-900" key={row.uuid} value={row.uuid}>{row.code} · {row.name_en}</option>)}</select> : <span className="hidden text-sm md:block">{listing.code} · {listing.name_en}</span>}
    <Link href="/account" className="hidden text-xs text-brown-100 hover:text-white md:block">My account</Link><button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20" onClick={signOut}><LogOut size={15}/><span className="hidden sm:inline">Logout</span></button></div></header>
    <div className="mx-auto grid max-w-[1500px] md:grid-cols-[240px_minmax(0,1fr)]"><aside className={`${open ? 'fixed inset-y-16 left-0 z-30 w-[260px] shadow-xl' : 'hidden'} border-r border-brown-100 bg-white p-3 md:sticky md:top-16 md:block md:h-[calc(100vh-64px)] md:w-auto md:shadow-none`}><p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-wider text-brown-500">{listing.code}</p><nav aria-label="Vendor navigation" className="space-y-1">{links.map(([href, label, Icon]) => { const active = pathname === href || (href !== base && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? 'bg-saffron-50 text-saffron-700' : 'text-brown-700 hover:bg-brown-50'}`}><Icon size={17}/>{label}</Link> })}</nav><Link href={`/t/${listing.slug}`} className="mt-4 flex items-center gap-2 px-3 text-xs text-brown-500 hover:text-saffron-700"><ExternalLink size={13}/>View public page</Link></aside>
      <main className="min-w-0 p-4 sm:p-6 xl:p-8">{children}</main></div></div>
}

const Page = ({ children }) => <VendorShell>{children}</VendorShell>

export function VendorDashboard() {
  const { listing, base, kind } = useVendor()
  const { data, error, loading } = useVendorQuery(`vendor/listings/${listing.uuid}/dashboard`)
  const n = value => loading ? '…' : value
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/t/${listing.slug}` : ''
  return <Page><Heading title={listing.name_en} text={`Listing ID ${listing.code} · ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}${data?.subscription ? ` · ${data.subscription.plan} plan` : ''}`} action={kind !== 'service' && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data?.collection === 'temple_gateway' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{data?.collection === 'temple_gateway' ? 'Payments settle to your own gateway' : 'Payments via TempleAddress'}</span>}/><StaffNotice error={error}/>
    {kind === 'service' ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat value={n(data?.appointments.requested)} label="appointment requests" href={`${base}/appointments?view=requested`}/><Stat value={n(data?.appointments.today)} label="appointments today" href={`${base}/appointments?view=today`}/><Stat value="Offline" label="payment collected directly"/><Stat value={listing.publication_status === 'published' ? 'Live' : titleCase(listing.publication_status)} label="profile status"/></div>
      : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat value={n(data?.today.items)} label={`bookings today · ${n(money(data?.today.amount))}`} href={`${base}/bookings`}/><Stat value={n(data?.upcoming_items)} label="upcoming bookings"/><Stat value={n(money(data?.month_amount))} label="collected this month"/><Stat value={n(money(data?.payouts.pending))} label="payout pending" note={data ? `${money(data.payouts.paid)} paid so far` : ''} href={kind === 'temple' ? `${base}/payouts` : undefined}/></div>}
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-5">
      {kind !== 'service' && <section className="rounded-2xl border border-brown-100 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Latest daily chart</h2>{data?.latest_chart && <StaffStatus value={data.latest_chart.status}/>}</div>{data?.latest_chart ? <p className="mt-2 text-sm">{data.latest_chart.code} · {staffDate(data.latest_chart.business_date, false)} · <Link className="font-semibold text-saffron-700" href={`${base}/charts/${data.latest_chart.uuid}`}>View chart</Link></p> : <p className="mt-2 text-sm text-brown-500">{loading ? 'Loading…' : 'Charts are prepared automatically at 8:00 PM for the next day’s bookings.'}</p>}</section>}
      <section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Quick actions</h2><div className="grid gap-3 sm:grid-cols-2">{(kind === 'service' ? [['/appointments', 'Review appointment requests'], ['/profile', 'Working hours & blocked dates'], ['/services', 'Update services and charges'], ['/enquiries', 'Reply to enquiries']] : kind === 'festival' ? [['/bookings', 'Download day sheets'], ['/programme', 'Update programme'], ['/offerings', 'Manage offerings'], ['/sponsors', 'View sponsors']] : [['/bookings', 'Today’s bookings'], ['/poojas', 'Edit poojas, prices and limits'], ['/deliveries', `Prasadam to dispatch (${n(data?.deliveries_pending)})`], ['/data', 'Download reports']]).map(([path, label]) => <Link key={path} href={`${base}${path}`} className="flex items-center justify-between rounded-xl border border-brown-100 p-3 text-sm font-semibold hover:border-saffron-400">{label}<ArrowRight size={14}/></Link>)}</div></section>
    </div><aside className="rounded-2xl border border-brown-100 bg-white p-5 text-center"><h2 className="font-semibold">Listing QR</h2><div className="mt-3 flex justify-center">{publicUrl && <ListingQrPreview value={publicUrl} size={180}/>}</div><p className="mt-2 break-all text-xs text-brown-500">{publicUrl}</p><p className="mt-2 text-xs text-brown-500">Print this for the counter so devotees can book and donate.</p></aside></div>
  </Page>
}

function BookingReport({ type = '', title, text }) {
  const { listing } = useVendor()
  const [query, setQuery] = useState({ type, status: '', from: '', to: '', search: '', page: '1' }), [search, setSearch] = useState(''), [error, setError] = useState('')
  useEffect(() => { const t = window.setTimeout(() => setQuery(q => q.search === search ? q : { ...q, search, page: '1' }), 300); return () => window.clearTimeout(t) }, [search])
  const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v))
  const { data, loading, error: loadError } = useVendorQuery(`vendor/listings/${listing.uuid}/bookings?${params}`)
  const [selected, setSelected] = useState(null)
  async function exportCsv() { setError(''); try { const p = new URLSearchParams(params); p.delete('page'); p.set('export', 'csv'); await staffDownload(`vendor/listings/${listing.uuid}/bookings?${p}`, `${listing.code}-${type || 'bookings'}.csv`) } catch (err) { setError(err.message) } }
  return <Page><Heading title={title} text={text} action={<button className="btn-g" onClick={exportCsv}><Download size={15}/>Export CSV</button>}/>
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-brown-100 bg-white p-4"><StaffSearch value={search} onChange={setSearch} placeholder="Booking code, devotee or pooja"/>{!type && <select aria-label="Type" className="input max-w-[170px]" value={query.type} onChange={e => setQuery(q => ({ ...q, type: e.target.value, page: '1' }))}><option value="">All types</option><option value="pooja">Poojas</option><option value="special_pooja">Special poojas</option></select>}<select aria-label="Status" className="input max-w-[160px]" value={query.status} onChange={e => setQuery(q => ({ ...q, status: e.target.value, page: '1' }))}><option value="">Any status</option>{['confirmed', 'scheduled', 'performed', 'completed', 'pending'].map(v => <option key={v} value={v}>{titleCase(v)}</option>)}</select><label className="text-xs text-brown-500">From<input type="date" className="input mt-1" value={query.from} onChange={e => setQuery(q => ({ ...q, from: e.target.value, page: '1' }))}/></label><label className="text-xs text-brown-500">To<input type="date" className="input mt-1" value={query.to} onChange={e => setQuery(q => ({ ...q, to: e.target.value, page: '1' }))}/></label></div>
    <StaffNotice error={loadError || error}/>{data && <p className="mb-2 text-sm text-brown-500">{data.count} record(s) · {money(data.amount_total)}</p>}
    <Table head={['Booking', type === 'donation' ? 'Purpose' : 'Pooja', type === 'donation' ? 'Donor' : 'Devotee / star', 'Date', 'Qty', 'Amount', 'Status', '']}>{!loading && data?.results.map(row => <tr key={row.uuid}><td className="td font-semibold">{row.booking_code}{row.recurring && <small className="block text-blue-700">Recurring</small>}</td><td className="td">{row.item_name}{row.prasadam?.method === 'home_delivery' && <small className="block text-saffron-700">Home delivery</small>}</td><td className="td">{type === 'donation' ? row.contact_name : row.devotee_name}<small className="block text-brown-500">{row.star}</small></td><td className="td">{staffDate(type === 'donation' ? row.created_at : row.service_date, type === 'donation')}</td><td className="td">{row.quantity}</td><td className="td">{money(row.amount)}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td"><button className="btn-g !py-1.5 text-xs" onClick={() => setSelected(row)}>View</button></td></tr>)}{(loading || !data?.results.length) && <StaffEmpty columns={8} loading={loading} text="No records for these filters."/>}</Table>
    <div className="mt-3 flex justify-end gap-2"><button className="btn-g !py-2" disabled={!data?.previous} onClick={() => setQuery(q => ({ ...q, page: String(data.previous) }))}>Previous</button><button className="btn-g !py-2" disabled={!data?.next} onClick={() => setQuery(q => ({ ...q, page: String(data.next) }))}>Next</button></div>
    {selected && <StaffModal title={`${selected.booking_code} · ${selected.item_name}`} onClose={() => setSelected(null)}><StaffDetails values={[['Devotee', selected.devotee_name], ['Nakshatra', selected.star], ['Service date', staffDate(selected.service_date, false)], ['Quantity', selected.quantity], ['Amount', money(selected.amount)], ['Status', titleCase(selected.status)], ['Contact', `${selected.contact_name} · ${selected.contact_mobile || '—'}`], ['Receipt', selected.receipt_number], ['Prasadam', selected.prasadam?.method ? titleCase(selected.prasadam.method) : '—'], ['Funds', selected.funds_destination === 'listing' ? 'Settled to your gateway' : 'Via TempleAddress payout']]}/></StaffModal>}
  </Page>
}
export const VendorBookings = () => { const { kind } = useVendor(); return <BookingReport title={kind === 'festival' ? 'Day sheets' : 'Bookings'} text={kind === 'festival' ? 'Ritual-wise bookings with devotee names. Export for the committee.' : 'Booking records, devotee details, poojas, dates and status.'}/> }
export const VendorDonations = () => <BookingReport type="donation" title="Donations" text="Donation records, donor details, amounts and receipts."/>

export function VendorCharts() {
  const { listing, base } = useVendor(), { data, loading, error } = useVendorQuery(`vendor/listings/${listing.uuid}/charts`)
  return <Page><Heading title="Daily charts" text="Prepared automatically at 8:00 PM for the next day and sent to your registered WhatsApp and email."/><StaffNotice error={error}/>
    <Table head={['Chart ID', 'Date', 'Lines', 'Total', 'Payable via TempleAddress', 'Status', 'Payout', '']}>{!loading && data?.map(row => <tr key={row.uuid}><td className="td font-semibold">{row.code}</td><td className="td">{staffDate(row.business_date, false)}</td><td className="td">{row.lines}</td><td className="td">{money(row.total)}</td><td className="td">{money(row.payable)}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td">{row.payout_status ? <StaffStatus value={row.payout_status}/> : '—'}</td><td className="td"><Link className="btn-g !py-1.5 text-xs" href={`${base}/charts/${row.uuid}`}>View</Link></td></tr>)}{(loading || !data?.length) && <StaffEmpty columns={8} loading={loading} text="No charts yet."/>}</Table></Page>
}

export function VendorChartDetail() {
  const { listing } = useVendor(), { chartId } = useParams(), [error, setError] = useState('')
  const { data, loading, error: loadError } = useVendorQuery(`vendor/listings/${listing.uuid}/charts/${chartId}`)
  return <Page><Heading title={data ? `${data.code}` : 'Chart'} text={data ? `${staffDate(data.business_date, false)} · ${data.lines.length} line(s) · payable ${money(data.payable)}` : ''} action={data && <button className="btn-g" onClick={() => staffDownload(`vendor/listings/${listing.uuid}/charts/${chartId}?export=pdf`, `${data.code}.pdf`).catch(err => setError(err.message))}><Download size={15}/>PDF</button>}/><StaffNotice error={loadError || error}/>
    <Table head={['#', 'Pooja / item', 'Devotee', 'Date', 'Type', 'Amount']}>{!loading && data?.lines.map((line, index) => <tr key={index}><td className="td">{index + 1}</td><td className="td">{line.item_name}<small className="block text-brown-500">{line.item_code}</small></td><td className="td">{line.devotee_name || '—'}</td><td className="td">{staffDate(line.service_date, false)}</td><td className="td">{titleCase(line.kind)}</td><td className="td">{money(line.amount)}</td></tr>)}{(loading || !data?.lines.length) && <StaffEmpty columns={6} loading={loading}/>}</Table></Page>
}

export function VendorPayouts() {
  const { listing } = useVendor(), { data, loading, error } = useVendorQuery(`vendor/listings/${listing.uuid}/payouts`), [downloadError, setDownloadError] = useState('')
  return <Page><Heading title="Payouts" text="Daily NEFT settlement per chart. Payments through your own gateway settle to you directly and are listed separately." action={<button className="btn-g" onClick={() => staffDownload(`vendor/listings/${listing.uuid}/payouts?export=csv`, `${listing.code}-payouts.csv`).catch(err => setDownloadError(err.message))}><Download size={15}/>Export CSV</button>}/><StaffNotice error={error || downloadError}/>
    {data?.direct_settlement?.enabled && <p className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><b>Direct settlement:</b> {data.direct_settlement.items} booking item(s), {money(data.direct_settlement.amount)} paid straight to your gateway account. These never appear in TempleAddress payouts.</p>}
    <Table head={['Chart', 'Date', 'Amount', 'Status', 'Bank transaction', 'Paid']}>{!loading && data?.results.map(row => <tr key={row.uuid}><td className="td font-semibold">{row.chart_code}</td><td className="td">{staffDate(row.business_date, false)}</td><td className="td">{money(row.amount)}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td">{row.bank_transaction_id || '—'}</td><td className="td">{staffDate(row.paid_at)}</td></tr>)}{(loading || !data?.results.length) && <StaffEmpty columns={6} loading={loading} text="No payouts yet."/>}</Table></Page>
}

export function VendorDeliveries() {
  const { listing, manage } = useVendor(), [status, setStatus] = useState('pending')
  const { data, loading, error, reload } = useVendorQuery(`vendor/listings/${listing.uuid}/deliveries${status ? `?status=${status}` : ''}`)
  const [selected, setSelected] = useState(null), [busy, setBusy] = useState(false), [actionError, setActionError] = useState('')
  async function save(event) { event.preventDefault(); setBusy(true); setActionError(''); try { await clientApi(`vendor/listings/${listing.uuid}/booking-items/${selected.uuid}/dispatch`, { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) }); setSelected(null); reload() } catch (err) { setActionError(err.message) } finally { setBusy(false) } }
  return <Page><Heading title="Prasadam delivery" text="Home-delivery bookings to pack and dispatch. The devotee is notified when you mark them dispatched or delivered."/><div className="mb-4 flex flex-wrap gap-2">{[['pending', 'To dispatch'], ['packed', 'Packed'], ['dispatched', 'Dispatched'], ['delivered', 'Delivered'], ['', 'All']].map(([value, label]) => <button key={value} aria-pressed={status === value} onClick={() => setStatus(value)} className={`rounded-full px-4 py-1.5 text-sm ${status === value ? 'bg-brown-900 text-white' : 'border border-brown-200 bg-white'}`}>{label}</button>)}</div><StaffNotice error={error}/>
    <Table head={['Booking', 'Pooja', 'Recipient', 'Address', 'Date', 'Status', '']}>{!loading && data?.map(row => <tr key={row.uuid}><td className="td font-semibold">{row.booking_code}</td><td className="td">{row.item_name} × {row.quantity}</td><td className="td">{row.prasadam.recipient_name}<small className="block text-brown-500">{row.prasadam.mobile}</small></td><td className="td max-w-xs">{row.prasadam.address}, {row.prasadam.pincode}</td><td className="td">{staffDate(row.service_date, false)}</td><td className="td"><StaffStatus value={row.prasadam.status}/>{row.prasadam.tracking_number && <small className="block">{row.prasadam.courier} {row.prasadam.tracking_number}</small>}</td><td className="td">{manage && <button className="btn-g !py-1.5 text-xs" onClick={() => setSelected(row)}>Update</button>}</td></tr>)}{(loading || !data?.length) && <StaffEmpty columns={7} loading={loading} text="Nothing in this list."/>}</Table>
    {selected && <StaffModal title={`${selected.booking_code} · dispatch`} onClose={() => !busy && setSelected(null)}><form onSubmit={save} className="space-y-4"><label className="block text-sm font-medium">Status<select name="status" className="input mt-1" defaultValue={selected.prasadam.status === 'pending' ? 'packed' : selected.prasadam.status}>{['packed', 'dispatched', 'delivered', 'returned'].map(v => <option key={v} value={v}>{titleCase(v)}</option>)}</select></label><label className="block text-sm font-medium">Courier<input name="courier" className="input mt-1" defaultValue={selected.prasadam.courier} placeholder="India Post, DTDC…"/></label><label className="block text-sm font-medium">Tracking number<input name="tracking_number" className="input mt-1" defaultValue={selected.prasadam.tracking_number}/></label><StaffNotice error={actionError}/><button className="btn-p" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></form></StaffModal>}
  </Page>
}

export function VendorData() {
  const { listing } = useVendor(), { data, loading, error, reload } = useVendorQuery(`vendor/listings/${listing.uuid}/exports`), [downloadError, setDownloadError] = useState('')
  const download = (path, name) => staffDownload(`vendor/listings/${listing.uuid}/${path}`, `${listing.code}-${name}.csv`).then(reload).catch(err => setDownloadError(err.message))
  return <Page><Heading title="Reports & exports" text="Download your records. Every export is logged with date and user."/><StaffNotice error={error || downloadError}/>
    <div className="mb-6 grid gap-3 sm:grid-cols-3">{[['bookings?export=csv&type=pooja', 'poojas', 'Pooja bookings'], ['bookings?export=csv&type=donation', 'donations', 'Donations'], ['payouts?export=csv', 'payouts', 'Payout history']].map(([path, name, label]) => <button key={name} className="flex items-center justify-between rounded-2xl border border-brown-100 bg-white p-4 text-left text-sm font-semibold hover:border-saffron-400" onClick={() => download(path, name)}>{label}<Download size={16}/></button>)}</div>
    <h2 className="mb-3 text-lg font-semibold">Export history</h2><Table head={['Report', 'Rows', 'By', 'Date']}>{!loading && data?.map((row, index) => <tr key={index}><td className="td">{titleCase(row.report)}</td><td className="td">{row.rows ?? '—'}</td><td className="td">{row.by || '—'}</td><td className="td">{staffDate(row.created_at)}</td></tr>)}{(loading || !data?.length) && <StaffEmpty columns={4} loading={loading} text="No exports yet."/>}</Table></Page>
}

export function VendorSettings() {
  const { listing } = useVendor(), { data, loading, error } = useVendorQuery(`vendor/listings/${listing.uuid}/settings`)
  return <Page><Heading title="Settings" text="Payment setup, team and subscription."/><StaffNotice error={error}/>{loading && <p role="status">Loading…</p>}
    {data && <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Payment collection</h2><StaffDetails values={[['Collection', data.payment.collection === 'temple_gateway' ? 'Your own gateway (direct settlement)' : 'TempleAddress Razorpay · daily NEFT payout'], ['Provider', titleCase(data.payment.provider)], ['Merchant key', data.payment.merchant_key_id || '—']]}/><p className="mt-3 text-xs text-brown-500">{data.payment.note} Contact support to switch to your own Razorpay account.</p></section>
      <section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Team</h2><ul className="space-y-2 text-sm">{data.team.map((row, index) => <li key={index} className="flex justify-between rounded-xl bg-brown-50 px-3 py-2"><span>{row.name}</span><StaffStatus value={row.role}/></li>)}</ul></section>
      <section className="rounded-2xl border border-brown-100 bg-white p-5 lg:col-span-2"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Subscription</h2><Link className="btn-p !py-2" href={`/sponsor?listing=${listing.uuid}`}>Plans & sponsorship</Link></div>{data.subscriptions.length ? <Table head={['Plan', 'From', 'Until', 'Status']}>{data.subscriptions.map((row, index) => <tr key={index}><td className="td">{row.plan}</td><td className="td">{staffDate(row.starts_at, false)}</td><td className="td">{staffDate(row.ends_at, false)}</td><td className="td"><StaffStatus value={row.status}/></td></tr>)}</Table> : <p className="text-sm text-brown-500">No active plan. The free listing stays live; a plan adds the temple website, WhatsApp bookings and paperless receipts.</p>}</section></div>}</Page>
}

export function VendorPoojas() {
  const { listing, kind: vendorKind } = useVendor(), kind = listing.listing_type === 'service' ? 'service-offerings' : 'poojas'
  const { data, loading, error, reload } = useVendorQuery(`me/managed-listings/${listing.uuid}/${kind}`)
  const [busy, setBusy] = useState(false), [actionError, setActionError] = useState('')
  async function add(event) { event.preventDefault(); const form = event.currentTarget; setBusy(true); setActionError(''); try { await clientApi(`me/managed-listings/${listing.uuid}/${kind}`, { method: 'POST', body: Object.fromEntries(new FormData(form)) }); form.reset(); reload() } catch (err) { setActionError(err.message) } finally { setBusy(false) } }
  const service = kind === 'service-offerings'
  return <Page><Heading title={service ? 'Services' : vendorKind === 'festival' ? 'Offerings' : 'Pooja management'} text={service ? 'Services, charges and duration. Payment is collected directly by you.' : 'Pooja details, prices, availability and daily booking limits.'}/><StaffNotice error={error}/>
    <form onSubmit={add} className="mb-5 grid gap-3 rounded-2xl border border-brown-100 bg-white p-5 sm:grid-cols-4"><input name="name_en" className="input sm:col-span-2" placeholder={service ? 'Service name' : 'Pooja name'} required/>{service ? <><input name="indicative_price_text" className="input" placeholder="Charge, e.g. ₹500"/><input name="duration_text" className="input" placeholder="Duration, e.g. 45 min"/></> : <><input name="price" type="number" min="1" step="0.01" className="input" placeholder="Price ₹" required/><input name="daily_capacity" type="number" min="1" className="input" placeholder="Daily limit" defaultValue="20"/></>}<div className="sm:col-span-4"><StaffNotice error={actionError}/><button className="btn-p" disabled={busy}>{busy ? 'Adding…' : `Add ${service ? 'service' : 'pooja'}`}</button></div></form>
    {loading ? <p role="status">Loading…</p> : service ? <Table head={['Service', 'Charge', 'Duration', 'Active']}>{(data || []).map(row => <tr key={row.id || row.uuid || row.name_en}><td className="td">{row.name_en}</td><td className="td">{row.indicative_price_text || '—'}</td><td className="td">{row.duration_text || '—'}</td><td className="td">{row.is_active ? 'Yes' : 'No'}</td></tr>)}{!data?.length && <StaffEmpty columns={4} text="No services yet."/>}</Table> : <PoojaCatalogue listing={listing} poojas={data || []} reload={reload}/>}</Page>
}

export function VendorEditor() {
  const { listing } = useVendor()
  return <Page><Heading title="Listing management" text="Basic details, history, guidelines, deities, nearby places and photos. Changes go to TempleAddress staff for approval; the current page stays live until approved."/><div className="rounded-2xl border border-brown-100 bg-white p-6"><p className="text-sm text-brown-700">The page editor also holds beneficiary KYC, bank account and events.</p><div className="mt-4 flex flex-wrap gap-2"><Link className="btn-p" href={`/account/listings/${listing.uuid}/manage`}>Open page editor<ArrowRight size={15}/></Link><Link className="btn-g" href={`/t/${listing.slug}`}>View public page</Link></div></div></Page>
}

export function VendorSponsors() {
  const { listing } = useVendor(), { data, loading, error } = useVendorQuery(`listings/${listing.slug}/sponsors`)
  return <Page><Heading title="Sponsors" text="Approved sponsor branding shown on your public page." action={<Link className="btn-p" href={`/sponsor?listing=${listing.uuid}`}>Invite a sponsor</Link>}/><StaffNotice error={error}/>
    <Table head={['Sponsor', 'Package', 'From', 'Until']}>{!loading && data?.sponsors.map(row => <tr key={row.uuid}><td className="td font-semibold">{row.title}</td><td className="td">{row.package_name}</td><td className="td">{staffDate(row.starts_at, false)}</td><td className="td">{staffDate(row.ends_at, false)}</td></tr>)}{(loading || !data?.sponsors.length) && <StaffEmpty columns={4} loading={loading} text="No active sponsors."/>}</Table></Page>
}

export function VendorProgramme() {
  const { listing } = useVendor()
  return <Page><Heading title="Programme" text="Day-wise events, timings and status. Events are reviewed by TempleAddress staff before they appear publicly."/><div className="rounded-2xl border border-brown-100 bg-white p-6"><Link className="btn-p" href={`/account/listings/${listing.uuid}/manage`}>Open programme & events editor<ArrowRight size={15}/></Link></div></Page>
}

// ----- service provider -----
export function ServiceAppointments() {
  const { listing, manage } = useVendor(), [view, setView] = useState('upcoming')
  useEffect(() => { const v = new URLSearchParams(window.location.search).get('view'); if (v) setView(v) }, [])
  const { data, loading, error, reload } = useVendorQuery(`vendor/listings/${listing.uuid}/appointments?view=${view}`)
  const [busy, setBusy] = useState(''), [actionError, setActionError] = useState('')
  async function decide(row, status) { setBusy(row.uuid); setActionError(''); try { await clientApi(`vendor/listings/${listing.uuid}/appointments/${row.uuid}`, { method: 'POST', body: { status } }); reload() } catch (err) { setActionError(err.message) } finally { setBusy('') } }
  const actions = { requested: [['confirmed', 'Confirm'], ['declined', 'Decline']], confirmed: [['completed', 'Mark completed'], ['no_show', 'No-show'], ['cancelled', 'Cancel']] }
  return <Page><Heading title="Appointments" text="Requests arrive without online payment; the customer pays you directly."/><div className="mb-4 flex flex-wrap gap-2">{[['requested', 'Requests'], ['today', 'Today'], ['upcoming', 'Upcoming'], ['past', 'Past'], ['cancelled', 'Cancelled']].map(([value, label]) => <button key={value} aria-pressed={view === value} onClick={() => setView(value)} className={`rounded-full px-4 py-1.5 text-sm ${view === value ? 'bg-brown-900 text-white' : 'border border-brown-200 bg-white'}`}>{label}</button>)}</div><StaffNotice error={error || actionError}/>
    <Table head={['When', 'Customer', 'Service · mode', 'Message', 'Status', 'Actions']}>{!loading && data?.map(row => <tr key={row.uuid}><td className="td">{staffDate(row.starts_at)}</td><td className="td"><b>{row.customer.name}</b><small className="block text-brown-500">{row.customer.mobile || row.customer.email}</small></td><td className="td">{row.service || '—'}<small className="block text-brown-500">{titleCase(row.mode)}</small></td><td className="td max-w-xs">{row.message || '—'}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td"><div className="flex flex-wrap gap-1.5">{manage && (actions[row.status] || []).map(([status, label]) => <button key={status} disabled={busy === row.uuid} className={`btn-g !px-2.5 !py-1 text-xs ${status === 'confirmed' ? 'text-emerald-700' : ''}`} onClick={() => decide(row, status)}>{label}</button>)}{row.customer.mobile && <a className="btn-g !px-2.5 !py-1 text-xs" href={`tel:${row.customer.mobile}`}>Call</a>}</div></td></tr>)}{(loading || !data?.length) && <StaffEmpty columns={6} loading={loading} text="No appointments here."/>}</Table></Page>
}

const DAYS = [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']]
export function ServiceProfile() {
  const { listing } = useVendor(), { data, loading, error, reload } = useVendorQuery(`vendor/listings/${listing.uuid}/availability`)
  const [plan, setPlan] = useState(null), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [actionError, setActionError] = useState('')
  useEffect(() => { if (data) setPlan({ days: Object.fromEntries(DAYS.map(([d]) => [d, data.days[d]?.[0] || ['', '']])), slot_minutes: data.slot_minutes, modes: data.modes }) }, [data])
  async function save(event) { event.preventDefault(); setBusy(true); setActionError(''); setNotice(''); try { await clientApi(`vendor/listings/${listing.uuid}/availability`, { method: 'PUT', body: { slot_minutes: plan.slot_minutes, modes: plan.modes, days: Object.fromEntries(Object.entries(plan.days).map(([d, w]) => [d, w[0] && w[1] ? [w] : []])) } }); setNotice('Working hours saved.'); reload() } catch (err) { setActionError(err.message) } finally { setBusy(false) } }
  async function block(event) { event.preventDefault(); const form = new FormData(event.currentTarget); setActionError(''); try { await clientApi(`vendor/listings/${listing.uuid}/availability`, { method: 'POST', body: { starts_at: new Date(form.get('starts_at')).toISOString(), ends_at: new Date(form.get('ends_at')).toISOString(), reason: form.get('reason') } }); event.currentTarget.reset(); reload() } catch (err) { setActionError(err.message) } }
  async function unblock(id) { try { await clientApi(`vendor/listings/${listing.uuid}/availability?id=${id}`, { method: 'DELETE' }); reload() } catch (err) { setActionError(err.message) } }
  return <Page><Heading title="Provider profile & availability" text="Working hours, slot length, consultation modes and blocked dates." action={<Link className="btn-g" href={`/account/listings/${listing.uuid}/manage`}>Edit profile details</Link>}/><StaffNotice error={error || actionError}/><StaffNotice>{notice}</StaffNotice>{loading && <p role="status">Loading…</p>}
    {plan && <form onSubmit={save} className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Working hours</h2><div className="space-y-2">{DAYS.map(([day, label]) => <div key={day} className="grid grid-cols-[110px_1fr_1fr] items-center gap-2 text-sm"><span>{label}</span><input type="time" aria-label={`${label} opens`} className="input" value={plan.days[day][0]} onChange={e => setPlan(p => ({ ...p, days: { ...p.days, [day]: [e.target.value, p.days[day][1]] } }))}/><input type="time" aria-label={`${label} closes`} className="input" value={plan.days[day][1]} onChange={e => setPlan(p => ({ ...p, days: { ...p.days, [day]: [p.days[day][0], e.target.value] } }))}/></div>)}</div><p className="mt-2 text-xs text-brown-500">Leave both times empty for a day off.</p>
      <div className="mt-4 flex flex-wrap items-end gap-4"><label className="text-sm font-medium">Slot length (minutes)<input type="number" min="10" max="240" className="input mt-1 w-32" value={plan.slot_minutes} onChange={e => setPlan(p => ({ ...p, slot_minutes: Number(e.target.value) }))}/></label><fieldset className="flex flex-wrap gap-3 text-sm"><legend className="mb-1 font-medium">Consultation modes</legend>{['in_person', 'online', 'phone'].map(mode => <label key={mode} className="flex items-center gap-1.5"><input type="checkbox" checked={plan.modes.includes(mode)} onChange={e => setPlan(p => ({ ...p, modes: e.target.checked ? [...p.modes, mode] : p.modes.filter(m => m !== mode) }))}/>{titleCase(mode)}</label>)}</fieldset></div><button className="btn-p mt-4" disabled={busy}>{busy ? 'Saving…' : 'Save working hours'}</button></form>}
    <section className="mt-5 rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Blocked dates</h2><form onSubmit={block} className="grid gap-3 sm:grid-cols-4"><input name="starts_at" type="datetime-local" className="input" required aria-label="Blocked from"/><input name="ends_at" type="datetime-local" className="input" required aria-label="Blocked until"/><input name="reason" className="input" placeholder="Reason (optional)"/><button className="btn-g">Block</button></form><ul className="mt-3 space-y-2 text-sm">{data?.blocked.map(row => <li key={row.id} className="flex items-center justify-between rounded-xl bg-brown-50 px-3 py-2"><span>{staffDate(row.starts_at)} → {staffDate(row.ends_at)} {row.reason && `· ${row.reason}`}</span><button className="text-xs text-red-700 underline" onClick={() => unblock(row.id)}>Remove</button></li>)}{!data?.blocked.length && <li className="text-brown-500">No blocked dates.</li>}</ul></section></Page>
}

export function VendorEnquiries() {
  const { listing } = useVendor(), { data, loading, error } = useVendorQuery(`vendor/listings/${listing.uuid}/enquiries`)
  return <Page><Heading title="Enquiries" text="Customer enquiries from your public page."/><StaffNotice error={error}/><Table head={['From', 'Contact', 'Message', 'Received', 'Status']}>{!loading && data?.map(row => <tr key={row.uuid}><td className="td font-semibold">{row.name}</td><td className="td">{row.mobile ? <a className="text-saffron-700" href={`tel:${row.mobile}`}>{row.mobile}</a> : row.email}</td><td className="td max-w-sm">{row.message}</td><td className="td">{staffDate(row.created_at)}</td><td className="td"><StaffStatus value={row.status}/></td></tr>)}{(loading || !data?.length) && <StaffEmpty columns={5} loading={loading} text="No enquiries yet."/>}</Table></Page>
}

export function VendorReviews() {
  const { listing, manage } = useVendor(), { data, loading, error, reload } = useVendorQuery(`vendor/listings/${listing.uuid}/reviews`), [actionError, setActionError] = useState('')
  async function reply(event, id) { event.preventDefault(); try { await clientApi(`vendor/listings/${listing.uuid}/reviews`, { method: 'POST', body: { id, reply: new FormData(event.currentTarget).get('reply') } }); reload() } catch (err) { setActionError(err.message) } }
  return <Page><Heading title="Reviews" text={data?.average ? `Average rating ${data.average} / 5` : 'Customer ratings and feedback.'}/><StaffNotice error={error || actionError}/>{loading && <p role="status">Loading…</p>}<div className="space-y-3">{data?.results.map(row => <article key={row.id} className="rounded-2xl border border-brown-100 bg-white p-4"><div className="flex justify-between text-sm"><b>{'★'.repeat(row.rating)}{'☆'.repeat(5 - row.rating)} · {row.by || 'Devotee'}</b><span className="text-brown-500">{staffDate(row.created_at, false)}</span></div><p className="mt-2 text-sm">{row.body}</p>{manage && <form onSubmit={e => reply(e, row.id)} className="mt-3 flex gap-2"><input name="reply" className="input" defaultValue={row.reply} placeholder="Reply publicly"/><button className="btn-g">Save</button></form>}</article>)}{!loading && !data?.results.length && <p className="text-sm text-brown-500">No reviews yet.</p>}</div></Page>
}

