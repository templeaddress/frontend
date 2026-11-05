'use client'

// Vendor portal (BRD 2.9-2.12): one shell for temple committees (/vendor), festival committees (/festival-admin) and
// service providers (/service-admin). Access follows the signed-in user's active listing memberships; every API
// re-checks membership server-side.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { CalendarCheck, ClipboardList, ListOrdered, Gift, Landmark, Settings, Database, PenLine, Truck, CalendarClock, MessageSquare, Star, UserCog, Sparkles, Users, Download, ExternalLink, LogOut, Menu, X, ArrowRight } from 'lucide-react'
import { Logo, PublicShell } from '@/components/ui'
import { clientApi, logout, requireAuth } from '@/lib/client-api'
import { ListingQrPreview } from '@/components/ListingQr'
import { listingPath } from '@/lib/catalogue'
import { vendorBases as BASES, vendorKind as kindOf, canManageVendor, selectVendorListing, downloadVendorFile } from '@/lib/vendor'
import { useVendorQuery, VendorManageOnly } from './VendorUI'
import { VendorBookingReport, VendorChartReport, VendorPayoutReport, VendorDeliveryReport, VendorExportReport } from './VendorReports'
import VendorCatalogue from './VendorCatalogue'
import { VendorContentEditor, VendorFinancialProfile, VendorAppointments, VendorAvailability, VendorEnquiryReport, VendorReviewReport } from './VendorWorkspace'
import { staffDownload } from './StaffData'
import { StaffDetails, StaffEmpty, StaffNotice, StaffStatus, money, staffDate, titleCase } from './StaffUI'

const STORE = 'ta-vendor-listing'
const NAV = {
  temple: [['', 'Dashboard', CalendarCheck], ['/bookings', 'Bookings', ListOrdered], ['/charts', 'Daily charts', ClipboardList], ['/poojas', 'Pooja management', Sparkles], ['/donations', 'Donations', Gift], ['/deliveries', 'Prasadam delivery', Truck], ['/payouts', 'Payouts', Landmark], ['/editor', 'Listing management', PenLine], ['/data', 'Reports & exports', Database], ['/settings', 'Settings', Settings]],
  festival: [['', 'Dashboard', CalendarCheck], ['/programme', 'Programme', CalendarClock], ['/offerings', 'Offerings', Sparkles], ['/bookings', 'Day sheets', ClipboardList], ['/sponsors', 'Sponsors', Users], ['/charts', 'Daily charts', ClipboardList], ['/donations', 'Donations', Gift], ['/deliveries', 'Prasadam delivery', Truck], ['/payouts', 'Payouts', Landmark], ['/data', 'Reports & exports', Database], ['/profile', 'Festival page editor', PenLine], ['/settings', 'Settings', Settings]],
  service: [['', 'Dashboard', CalendarCheck], ['/appointments', 'Appointments', CalendarClock], ['/services', 'Services', Sparkles], ['/enquiries', 'Enquiries', MessageSquare], ['/reviews', 'Reviews', Star], ['/profile', 'Provider profile', UserCog]],
}
const VendorContext = createContext(null)
export const useVendor = () => useContext(VendorContext)
const Heading = ({ title, text, action }) => <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-3xl font-semibold text-brown-900">{title}</h1>{text && <p className="mt-1 text-sm text-brown-500">{text}</p>}</div>{action && <div className="flex flex-wrap gap-2">{action}</div>}</div>
const Stat = ({ value, label, note, href }) => { const body = <><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-sm text-brown-500">{label}</p>{note && <p className="mt-1 text-xs font-semibold text-emerald-700">{note}</p>}</>; return href ? <Link href={href} className="rounded-2xl border border-brown-100 bg-white p-5 transition hover:border-saffron-400">{body}</Link> : <div className="rounded-2xl border border-brown-100 bg-white p-5">{body}</div> }
const Table = ({ head, children }) => <div className="overflow-x-auto rounded-2xl border border-brown-100 bg-white"><table className="w-full text-sm"><thead><tr>{head.map(label => <th key={label} className="th">{label}</th>)}</tr></thead><tbody>{children}</tbody></table></div>

export function VendorArea({ children }) {
  const router = useRouter(), pathname = usePathname()
  const [listings, setListings] = useState(null), [selected, setSelected] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    if (!requireAuth(router, pathname)) return
    let active = true
    clientApi('me/managed-listings').then(rows => {
      if (!active) return
      setListings(rows)
      const kind = Object.entries(BASES).find(([, base]) => pathname === base || pathname.startsWith(`${base}/`))?.[0] || 'temple'
      let saved = null
      try { saved = window.localStorage.getItem(STORE) } catch {}
      const selected = selectVendorListing(rows, kind, saved)
      if (!selected && rows.length) { router.replace(BASES[kindOf(rows[0])]); return }
      setSelected(selected)
    }).catch(err => { if (active) setError(err.message) })
    return () => { active = false }
  }, [router, pathname])
  const choose = useCallback(uuid => {
    const listing = listings.find(row => row.uuid === uuid)
    if (!listing) return
    try { window.localStorage.setItem(STORE, uuid) } catch {}
    setSelected(listing)
    router.push(BASES[kindOf(listing)])
  }, [listings, router])
  if (error) return <PublicShell><main className="mx-auto max-w-xl p-10"><p role="alert" className="text-red-700">{error}</p></main></PublicShell>
  if (!listings) return <PublicShell><p role="status" className="p-10">Loading your listings…</p></PublicShell>
  if (!selected) return <PublicShell><main className="mx-auto max-w-xl space-y-4 p-10"><h1 className="text-2xl font-semibold">No managed listings yet</h1><p className="text-brown-500">The vendor dashboard opens once TempleAddress staff approve you as the owner or administrator of a published temple, festival or service listing. You can claim an existing temple from its public page.</p><Link className="btn-p" href="/temples">Find your temple</Link><Link className="btn-g" href="/account/listings">My submitted listings</Link></main></PublicShell>
  const routeKind = Object.entries(BASES).find(([, base]) => pathname === base || pathname.startsWith(`${base}/`))?.[0]
  if (routeKind !== kindOf(selected)) return <p role="status" className="p-8">Opening your vendor workspace…</p>
  return <VendorContext.Provider key={selected.uuid} value={{ listing: selected, listings, choose, base: BASES[kindOf(selected)], kind: kindOf(selected), manage: canManageVendor(selected) }}>{children}</VendorContext.Provider>
}

export function VendorShell({ children }) {
  const { listing, listings, choose, base, kind, manage } = useVendor(), pathname = usePathname(), router = useRouter()
  const [open, setOpen] = useState(false)
  const links = NAV[kind].filter(([path]) => manage || !['/poojas', '/offerings', '/services', '/payouts', '/deliveries', '/editor', '/programme', '/profile'].includes(path)).map(([path, label, Icon]) => [`${base}${path}`, label, Icon])
  async function signOut() { try { await logout() } finally { router.replace('/login') } }
  return <div className="min-h-screen bg-brown-50"><header className="sticky top-0 z-40 border-b border-saffron-500/60 bg-brown-900 text-white"><div className="mx-auto flex min-h-16 max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3"><button className="rounded-lg p-2 hover:bg-white/10 md:hidden" aria-expanded={open} aria-label="Toggle vendor navigation" onClick={() => setOpen(v => !v)}>{open ? <X size={20}/> : <Menu size={20}/>}</button><Logo light markSize={30}/><span className="hidden rounded-full bg-gold-300/15 px-3 py-1 text-xs font-semibold text-gold-300 sm:inline-flex">Vendor · {titleCase(kind === 'service' ? 'Service provider' : kind)}</span><div className="flex-1"/>
    {listings.length > 1 ? <select aria-label="Choose listing" className="order-last w-full min-w-0 sm:order-none sm:w-auto sm:max-w-[260px] rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white" value={listing.uuid} onChange={e => choose(e.target.value)}>{listings.map(row => <option className="text-brown-900" key={row.uuid} value={row.uuid}>{row.code} · {row.name_en}</option>)}</select> : <span className="hidden text-sm md:block">{listing.code} · {listing.name_en}</span>}
    <Link href="/account" className="hidden text-xs text-brown-100 hover:text-white md:block">My account</Link><button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20" onClick={signOut}><LogOut size={15}/><span className="hidden sm:inline">Logout</span></button></div></header>
    <div className="mx-auto grid grid-cols-1 max-w-[1500px] md:grid-cols-[240px_minmax(0,1fr)]"><aside className={`${open ? 'block' : 'hidden'} border-r border-brown-100 bg-white p-3 md:sticky md:top-16 md:block md:h-[calc(100vh-64px)] md:w-auto md:shadow-none`}><p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-wider text-brown-500">{listing.code}</p><nav aria-label="Vendor navigation" className="space-y-1">{links.map(([href, label, Icon]) => { const active = pathname === href || (href !== base && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? 'bg-saffron-50 text-saffron-700' : 'text-brown-700 hover:bg-brown-50'}`}><Icon size={17}/>{label}</Link> })}</nav><Link href={listingPath(listing)} className="mt-4 flex items-center gap-2 px-3 text-xs text-brown-500 hover:text-saffron-700"><ExternalLink size={13}/>View public page</Link></aside>
      <main className="min-w-0 p-4 sm:p-6 xl:p-8">{children}</main></div></div>
}

const Page = ({ children }) => <VendorShell>{children}</VendorShell>

export function VendorDashboard() {
  const { listing, base, kind, manage } = useVendor()
  const { data, error, loading } = useVendorQuery(`vendor/listings/${listing.uuid}/dashboard`)
  const chart = useVendorQuery(data?.latest_chart ? `vendor/listings/${listing.uuid}/charts/${data.latest_chart.uuid}` : null)
  const n = value => loading ? '…' : data ? value : '—'
  const qr = useRef(null)
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}${listingPath(listing)}` : ''
  return <Page><Heading title={listing.name_en} text={`Listing ID ${listing.code} · ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}${data?.subscription ? ` · ${data.subscription.plan} plan` : ''}`} action={kind !== 'service' && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data?.collection === 'temple_gateway' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{data?.collection === 'temple_gateway' ? 'Payments settle to your own gateway' : 'Payments via TempleAddress'}</span>}/><StaffNotice error={error}/>
    {kind === 'service' ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat value={n(data?.appointments.requested)} label="appointment requests" href={`${base}/appointments?view=requested`}/><Stat value={n(data?.appointments.today)} label="appointments today" href={`${base}/appointments?view=today`}/><Stat value="Offline" label="payment collected directly"/><Stat value={listing.publication_status === 'published' ? 'Live' : titleCase(listing.publication_status)} label="profile status"/></div>
      : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat value={n(data?.today.items)} label={`bookings today · ${n(money(data?.today.amount))}`} href={`${base}/bookings`}/><Stat value={n(data?.upcoming_items)} label="upcoming bookings"/><Stat value={n(money(data?.month_amount))} label="collected this month"/><Stat value={n(money(data?.payouts.pending))} label="payout pending" note={data ? `${money(data.payouts.paid)} paid so far` : ''} href={manage ? `${base}/payouts` : undefined}/></div>}
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="min-w-0 space-y-5">
      {kind !== 'service' && <section className="rounded-2xl border border-brown-100 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Latest daily chart</h2>{data?.latest_chart && <StaffStatus value={data.latest_chart.status}/>}</div>{data?.latest_chart ? <p className="mt-2 text-sm">{data.latest_chart.code} · {staffDate(data.latest_chart.business_date, false)} · <Link className="font-semibold text-saffron-700" href={`${base}/charts/${data.latest_chart.uuid}`}>View chart</Link></p> : <p className="mt-2 text-sm text-brown-500">{loading ? 'Loading…' : 'Charts appear after the configured preparation job runs.'}</p>}</section>}
      <StaffNotice error={chart.error}/>{chart.data && <section className="min-w-0 rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Latest chart snapshot</h2><Table head={['Item', 'Devotee', 'Type', 'Amount']}>{chart.data.lines.slice(0, 8).map((row, index) => <tr key={index}><td className="td">{row.item_name}</td><td className="td">{row.devotee_name || '—'}</td><td className="td">{titleCase(row.kind)}</td><td className="td">{money(row.amount)}</td></tr>)}</Table><Link className="mt-3 inline-block text-sm font-semibold text-saffron-700 underline" href={`${base}/charts/${data.latest_chart.uuid}`}>Full chart · {chart.data.lines.length} lines · {money(chart.data.payable)} payable</Link></section>}
      <section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Quick actions</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{(kind === 'service' ? [['/appointments', 'Review appointment requests'], ['/profile', 'Working hours & blocked dates'], ['/services', 'Update services and charges'], ['/enquiries', 'View enquiries and contact details']] : kind === 'festival' ? [['/bookings', 'Download day sheets'], ['/programme', 'Update programme'], ['/offerings', 'Manage offerings'], ['/sponsors', 'View sponsors']] : [['/bookings', 'Booking records'], ['/poojas', 'Edit poojas, prices and limits'], ['/deliveries', `Prasadam to dispatch (${n(data?.deliveries_pending)})`], ['/data', 'Download reports']]).filter(([path]) => manage || !['/profile', '/services', '/programme', '/offerings', '/poojas', '/deliveries'].includes(path)).map(([path, label]) => <Link key={path} href={`${base}${path}`} className="flex items-center justify-between rounded-xl border border-brown-100 p-3 text-sm font-semibold hover:border-saffron-400">{label}<ArrowRight size={14}/></Link>)}</div></section>
    </div><aside className="rounded-2xl border border-brown-100 bg-white p-5 text-center"><h2 className="font-semibold">Listing QR</h2><div className="mt-3 flex justify-center">{publicUrl && <ListingQrPreview value={publicUrl} size={180} svgRef={qr}/>}</div><p className="mt-2 break-all text-xs text-brown-500">{publicUrl}</p><button className="btn-g mt-3" onClick={() => { if (qr.current) downloadVendorFile(new Blob([new XMLSerializer().serializeToString(qr.current)], { type: 'image/svg+xml;charset=utf-8' }), `${listing.code}-qr.svg`) }}><Download size={15}/>Download QR</button><p className="mt-3 text-xs text-brown-500">Scan to open this public listing.</p></aside></div>
  </Page>
}

export function VendorBookings() {
  const { listing, kind } = useVendor()
  return <Page><VendorBookingReport listing={listing} title={kind === 'festival' ? 'Day sheets' : 'Bookings'} text="Booking records, devotee details, dates, amounts and status."/></Page>
}
export function VendorDonations() {
  const { listing, manage } = useVendor()
  return <Page><VendorBookingReport listing={listing} type="donation" title="Donations" text="Donation records, donors and receipts."/>{manage && <div className="mt-8"><VendorCatalogue listing={listing} kind="donation-purposes"/></div>}</Page>
}
export function VendorCharts() {
  const { listing, base } = useVendor()
  return <Page><VendorChartReport listing={listing} base={base}/></Page>
}

export function VendorChartDetail() {
  const { listing, base } = useVendor(), { chartId } = useParams(), [error, setError] = useState('')
  const { data, loading, error: loadError } = useVendorQuery(`vendor/listings/${listing.uuid}/charts/${chartId}`)
  return <Page><Heading title={data ? `${data.code}` : 'Chart'} text={data ? `${staffDate(data.business_date, false)} · ${data.lines.length} line(s) · payable ${money(data.payable)}` : ''} action={data && <button className="btn-g" onClick={() => staffDownload(`vendor/listings/${listing.uuid}/charts/${chartId}?export=pdf`, `${data.code}.pdf`).catch(err => setError(err.message))}><Download size={15}/>PDF</button>}/><StaffNotice error={loadError || error}/>
    {data && <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">{[['Poojas', data.totals?.poojas], ['Events', data.totals?.events], ['Donations', data.totals?.donations], ['Platform payable', data.payable]].map(([label, value]) => <Stat key={label} label={label} value={money(value)}/>)}</div>}
    <Link className="btn-g mb-4" href={`${base}/charts`}>All charts</Link>
    <Table head={['#', 'Pooja / item', 'Devotee', 'Date', 'Type', 'Amount']}>{!loading && data?.lines.map((line, index) => <tr key={index}><td className="td">{index + 1}</td><td className="td">{line.item_name}<small className="block text-brown-500">{line.item_code}</small></td><td className="td">{line.devotee_name || '—'}</td><td className="td">{staffDate(line.service_date, false)}</td><td className="td">{titleCase(line.kind)}</td><td className="td">{money(line.amount)}</td></tr>)}{(loading || !data?.lines.length) && <StaffEmpty columns={6} loading={loading}/>}</Table></Page>
}

export function VendorPayouts() {
  const { listing, base, manage } = useVendor()
  return <Page><VendorManageOnly manage={manage}><VendorPayoutReport listing={listing} base={base}/></VendorManageOnly></Page>
}
export function VendorDeliveries() {
  const { listing, manage } = useVendor()
  return <Page><VendorManageOnly manage={manage}><VendorDeliveryReport listing={listing}/></VendorManageOnly></Page>
}
export function VendorData() {
  const { listing, manage } = useVendor()
  return <Page><VendorExportReport listing={listing} manage={manage}/></Page>
}

export function VendorSettings() {
  const { listing, manage } = useVendor(), { data, loading, error } = useVendorQuery(`vendor/listings/${listing.uuid}/settings`)
  return <Page><Heading title="Settings" text="Payment setup, team and subscription."/><StaffNotice error={error}/>{loading && <p role="status">Loading…</p>}
    {data && <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Payment collection</h2><StaffDetails values={[['Collection', data.payment.collection === 'temple_gateway' ? 'Your own gateway (direct settlement)' : 'TempleAddress Razorpay · daily NEFT payout'], ['Provider', titleCase(data.payment.provider)], ['Merchant key', data.payment.merchant_key_id || '—']]}/><p className="mt-3 text-xs text-brown-500">{data.payment.note} Contact support to switch to your own Razorpay account.</p></section>
      <section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="mb-3 text-lg font-semibold">Team</h2><ul className="space-y-2 text-sm">{data.team.map((row, index) => <li key={index} className="flex justify-between rounded-xl bg-brown-50 px-3 py-2"><span>{row.name}</span><StaffStatus value={row.role}/></li>)}</ul></section>
      <section className="rounded-2xl border border-brown-100 bg-white p-5 lg:col-span-2"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Subscription</h2><Link className="btn-p !py-2" href={`/sponsor?listing=${listing.uuid}`}>Plans & sponsorship</Link></div>{data.subscriptions.length ? <Table head={['Plan', 'From', 'Until', 'Status']}>{data.subscriptions.map((row, index) => <tr key={index}><td className="td">{row.plan}</td><td className="td">{staffDate(row.starts_at, false)}</td><td className="td">{staffDate(row.ends_at, false)}</td><td className="td"><StaffStatus value={row.status}/></td></tr>)}</Table> : <p className="text-sm text-brown-500">No active plan. The free listing stays live; a plan adds the temple website, WhatsApp bookings and paperless receipts.</p>}</section></div>}<VendorFinancialProfile listing={listing} manage={manage}/></Page>
}

export function VendorPoojas() {
  const { listing, manage } = useVendor()
  return <Page><VendorManageOnly manage={manage}><VendorCatalogue listing={listing} kind={listing.listing_type === 'service' ? 'service-offerings' : 'poojas'}/></VendorManageOnly></Page>
}
export function VendorEditor() {
  const { listing, manage } = useVendor()
  return <Page><VendorContentEditor listing={listing} manage={manage}/></Page>
}

export function VendorSponsors() {
  const { listing } = useVendor(), { data, loading, error } = useVendorQuery(`listings/${listing.slug}/sponsors`)
  return <Page><Heading title="Sponsors" text="Approved sponsor branding shown on your public page." action={<Link className="btn-p" href={`/sponsor?listing=${listing.uuid}`}>Invite a sponsor</Link>}/><StaffNotice error={error}/>
    <Table head={['Sponsor', 'Package', 'From', 'Until']}>{!loading && data?.sponsors.map(row => <tr key={row.uuid}><td className="td font-semibold">{row.title}</td><td className="td">{row.package_name}</td><td className="td">{staffDate(row.starts_at, false)}</td><td className="td">{staffDate(row.ends_at, false)}</td></tr>)}{(loading || !data?.sponsors.length) && <StaffEmpty columns={4} loading={loading} text="No active sponsors."/>}</Table></Page>
}

export function VendorProgramme() {
  const { listing, manage } = useVendor()
  return <Page><VendorContentEditor listing={listing} manage={manage} programme/></Page>
}
export function ServiceAppointments() {
  const { listing, manage } = useVendor()
  return <Page><VendorAppointments listing={listing} manage={manage}/></Page>
}
export function ServiceProfile() {
  const { listing, manage } = useVendor()
  return <Page><VendorAvailability listing={listing} manage={manage}/><div className="mt-8"><VendorContentEditor listing={listing} manage={manage}/></div><VendorFinancialProfile listing={listing} manage={manage}/></Page>
}
export function VendorEnquiries() {
  const { listing } = useVendor()
  return <Page><VendorEnquiryReport listing={listing}/></Page>
}
export function VendorReviews() {
  const { listing, manage } = useVendor()
  return <Page><VendorReviewReport listing={listing} manage={manage}/></Page>
}
