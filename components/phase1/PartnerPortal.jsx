'use client'

// Partner and dealer portals (BRD 3.1-3.3): wallet, pending earnings, affiliate points, withdrawals, listings,
// referral sharing, KYC application, dealer territory and partner management. Every API re-checks the role.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Wallet, UserRound, ListChecks, Share2, PlusCircle, ShieldCheck, Map, Users, LogOut, Power } from 'lucide-react'
import { Logo } from '@/components/ui'
import { clientApi, logout, readAuth, requireAuth } from '@/lib/client-api'
import { PartnerWalletContent, PartnerProfileContent, PartnerShareContent, PartnerListingsContent, PartnerSubmitContent } from './PartnerFeatures'
import { StaffDetails, StaffEmpty, StaffModal, StaffNotice, StaffStatus, money, staffDate, titleCase } from './StaffUI'

const NAV = {
  partner: [['/partner', 'Wallet', Wallet], ['/partner/profile', 'Profile & KYC', UserRound], ['/partner/listings', 'My listings', ListChecks], ['/partner/share', 'Share', Share2], ['/partner/submit', 'Add listing', PlusCircle], ['/partner/submissions', 'Submissions', ShieldCheck]],
  dealer: [['/dealer', 'Territory', Map], ['/dealer/wallet', 'My wallet', Wallet], ['/dealer/profile', 'Profile & KYC', UserRound], ['/dealer/partners', 'Partners', Users]],
}
const Table = ({ head, children }) => <div className="overflow-x-auto rounded-2xl border border-brown-100 bg-white"><table className="w-full text-sm"><thead><tr>{head.map(label => <th key={label} className="th">{label}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
const Stat = ({ value, label, note }) => <div className="rounded-2xl border border-brown-100 bg-white p-5"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-sm text-brown-500">{label}</p>{note && <p className="mt-1 text-xs text-brown-500">{note}</p>}</div>
const Heading = ({ title, text, action }) => <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-3xl font-semibold">{title}</h1>{text && <p className="mt-1 text-sm text-brown-500">{text}</p>}</div>{action}</div>

function useApi(path) {
  const [state, setState] = useState({ data: null, error: '', loading: true }), [version, setVersion] = useState(0)
  useEffect(() => { let active = true; setState(s => ({ ...s, loading: true })); clientApi(path).then(data => active && setState({ data, error: '', loading: false })).catch(err => active && setState({ data: null, error: err.message, loading: false, status: err.status })); return () => { active = false } }, [path, version])
  return { ...state, reload: () => setVersion(v => v + 1) }
}

function Shell({ kind, children }) {
  const pathname = usePathname(), router = useRouter(), [ready, setReady] = useState(false)
  useEffect(() => { if (requireAuth(router, pathname)) setReady(true) }, [router, pathname])
  if (!ready) return null
  return <div className="min-h-screen bg-brown-50"><header className="sticky top-0 z-40 border-b border-saffron-500/60 bg-brown-900 text-white"><div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4"><Logo light markSize={30}/><span className="rounded-full bg-gold-300/15 px-3 py-1 text-xs font-semibold text-gold-300">{kind === 'partner' ? 'Partner' : 'Dealer'}</span><div className="flex-1"/><span className="hidden text-sm md:block">{readAuth()?.user?.name}</span><button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold" onClick={async () => { try { await logout() } finally { router.replace('/login') } }}><LogOut size={15}/>Logout</button></div></header>
    <div className={`mx-auto grid max-w-[1500px] ${kind === 'partner' ? 'grid-cols-1' : ''} md:grid-cols-[230px_minmax(0,1fr)]`}><aside className="border-r border-brown-100 bg-white p-3 md:sticky md:top-16 md:h-[calc(100vh-64px)]"><p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-wider text-brown-500">{kind}</p><nav className="flex gap-1 overflow-x-auto md:block md:space-y-1">{NAV[kind].map(([href, label, Icon]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${pathname === href ? 'bg-saffron-50 text-saffron-700' : 'text-brown-700 hover:bg-brown-50'}`}><Icon size={17}/>{label}</Link>)}</nav></aside><main className="min-w-0 p-4 sm:p-6 xl:p-8">{children}</main></div></div>
}

function NotApproved({ kind, error }) {
  return <div className="max-w-xl rounded-2xl border border-brown-100 bg-white p-6"><h1 className="text-2xl font-semibold">{kind === 'partner' ? 'Become a TempleAddress partner' : 'Dealer access required'}</h1><p className="mt-2 text-sm text-brown-600">{error}</p>{kind === 'partner' ? <Link className="btn-p mt-4" href="/partner/profile">Apply or view application</Link> : <p className="mt-3 text-sm text-brown-500">Dealers are appointed by TempleAddress. Contact support to apply.</p>}</div>
}

function WalletPanel({ balances, transactions, onChange }) {
  const [withdrawing, setWithdrawing] = useState(false), points = useApi('me/points'), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  async function act(work, message) { setBusy(true); setError(''); setNotice(''); try { await work(); setNotice(message); onChange(); points.reload(); setWithdrawing(false) } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <><div className="grid gap-4 md:grid-cols-4"><Stat value={money(balances.available)} label="available"/><Stat value={money(balances.pending_earnings)} label="pending approval" note="Released after the hold period"/><Stat value={money(balances.withdrawn)} label="withdrawn so far" note={Number(balances.withdrawals_in_progress) ? `${money(balances.withdrawals_in_progress)} in progress` : ''}/><Stat value={points.data?.balance ?? '…'} label="affiliate points" note={points.data?.rate ? `${Number(points.data.rate.points_per_rupee)} point(s) = ₹1` : 'Conversion not open'}/></div>
    <StaffNotice error={error}/><StaffNotice>{notice}</StaffNotice>
    <div className="mt-4 flex flex-wrap gap-2"><button className="btn-p" onClick={() => setWithdrawing(true)}><Wallet size={15}/>Withdraw</button>{points.data?.rate && points.data.balance >= points.data.minimum && <button className="btn-g" disabled={busy} onClick={() => act(() => clientApi('me/points', { method: 'POST', body: { points: points.data.balance } }), 'Points converted to wallet balance.')}>Convert {points.data.balance} points</button>}</div>
    <section className="mt-6"><h2 className="mb-3 text-lg font-semibold">Wallet transactions</h2><Table head={['Date', 'Type', 'Reference', 'Amount']}>{transactions.map(row => <tr key={row.source_key}><td className="td">{staffDate(row.created_at)}</td><td className="td">{titleCase(row.type)}</td><td className="td text-xs">{row.note || row.reference_type}</td><td className={`td font-semibold ${Number(row.amount) < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{money(row.amount)}</td></tr>)}{!transactions.length && <StaffEmpty columns={4} text="No transactions yet."/>}</Table></section>
    {withdrawing && <StaffModal title="Withdraw to bank" onClose={() => setWithdrawing(false)}><form className="space-y-3" onSubmit={event => { event.preventDefault(); act(() => clientApi('me/withdrawals', { method: 'POST', body: { amount: new FormData(event.currentTarget).get('amount') } }), 'Withdrawal requested. TempleAddress accounts will pay it by NEFT.') }}><p className="text-sm text-brown-600">Available {money(balances.available)}. TDS is deducted when the payment is made.</p><label className="block text-sm font-medium">Amount ₹<input name="amount" type="number" min="1" step="0.01" max={balances.available} className="input mt-1" required/></label><StaffNotice error={error}/><button className="btn-p" disabled={busy}>Request withdrawal</button></form></StaffModal>}</>
}

export function PartnerWallet() {
  return <Shell kind="partner"><PartnerWalletContent/></Shell>
}

export function PartnerListings() {
  return <Shell kind="partner"><PartnerListingsContent/></Shell>
}

export function PartnerSubmissions() {
  return <Shell kind="partner"><PartnerListingsContent submissions/></Shell>
}

export function PartnerSubmit() {
  return <Shell kind="partner"><PartnerSubmitContent/></Shell>
}

export function PartnerShare() {
  return <Shell kind="partner"><PartnerShareContent/></Shell>
}

export function PartnerProfile() {
  return <Shell kind="partner"><PartnerProfileContent/></Shell>
}

// ----- dealer -----
export function DealerTerritory() {
  const { data, error, loading } = useApi('me/dealer')
  return <Shell kind="dealer">{loading ? <p role="status">Loading…</p> : !data ? <NotApproved kind="dealer" error={error}/> : <><Heading title={data.dealer.territory || data.dealer.code} text={`${data.dealer.pincodes ? `Pincodes ${data.dealer.pincodes} · ` : ''}${data.dealer.partner_count} partners`} action={<Link className="btn-p" href="/dealer/wallet">My wallet · {money(data.balances.available)}</Link>}/>
    <div className="grid gap-4 md:grid-cols-4"><Stat value={data.live_listings} label="listings live"/><Stat value={data.paying_listings} label="paying / sponsored"/><Stat value={money(data.override_month)} label="override this month"/><Stat value={data.pending_requests.length} label="pending partner requests"/></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><section><h2 className="mb-3 text-lg font-semibold">Partners</h2><Table head={['Partner', 'Listings', 'Verified', 'Sales', 'This month ₹']}>{data.partners.filter(row => row.status === 'active').map(row => <tr key={row.uuid}><td className="td">{row.name} ({row.code})</td><td className="td">{row.listings}</td><td className="td">{row.verified}</td><td className="td">{row.sales}</td><td className="td">{money(row.earned_month)}</td></tr>)}{!data.partners.length && <StaffEmpty columns={5} text="No partners yet."/>}</Table></section>
      <aside className="space-y-4"><section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="font-semibold">Expiring in 30 days</h2><ul className="mt-2 space-y-1 text-sm">{data.expiring.map((row, index) => <li key={index}>{row.listing} — {row.plan} ({staffDate(row.ends_at, false)})</li>)}{!data.expiring.length && <li className="text-brown-500">Nothing expiring.</li>}</ul></section><section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="font-semibold">Pending partner requests</h2><p className="text-sm text-brown-500">{data.pending_requests.length} waiting for TempleAddress KYC · <Link className="text-saffron-700" href="/dealer/partners">Review</Link></p></section></aside></div></>}</Shell>
}

export function DealerWallet() {
  const { data, error, loading, reload } = useApi('me/dealer')
  return <Shell kind="dealer">{loading ? <p role="status">Loading…</p> : !data ? <NotApproved kind="dealer" error={error}/> : <><Heading title="Dealer wallet" text={`Dealer ID ${data.dealer.code}`}/><p className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900"><b>Dealer income rule:</b> each partner earning creates a separate linked dealer credit under the dealer-override commission rule (default 10%), with the originating partner transaction kept for audit.</p><WalletPanel balances={data.balances} transactions={data.transactions} onChange={reload}/></>}</Shell>
}

export function DealerPartners() {
  const { data, error, loading, reload } = useApi('me/dealer'), [busy, setBusy] = useState(false), [actionError, setActionError] = useState(''), [inviting, setInviting] = useState(false), [notice, setNotice] = useState('')
  async function act(work, message) { setBusy(true); setActionError(''); try { await work(); setNotice(message); reload(); setInviting(false) } catch (err) { setActionError(err.message) } finally { setBusy(false) } }
  return <Shell kind="dealer"><Heading title="Partners" text="Only enabled partners can use partner tools, submit listings or earn." action={<button className="btn-p" onClick={() => setInviting(true)}>Invite user as partner</button>}/><StaffNotice error={error || actionError}/><StaffNotice>{notice}</StaffNotice>{loading ? <p role="status">Loading…</p> : data && <>
    <div className="mb-5 grid gap-4 md:grid-cols-3"><Stat value={data.partners.filter(row => row.status === 'active').length} label="enabled · can work"/><Stat value={data.partners.filter(row => row.status === 'disabled').length} label="disabled · access blocked"/><Stat value={data.pending_requests.length} label="invites / approvals pending"/></div>
    <Table head={['Partner', 'Joined', 'Listings', 'Earned', 'Access', 'Action']}>{data.partners.filter(row => ['active', 'disabled'].includes(row.status)).map(row => <tr key={row.uuid}><td className="td font-semibold">{row.name}<small className="block text-brown-500">{row.code}</small></td><td className="td">{staffDate(row.joined, false)}</td><td className="td">{row.listings}</td><td className="td">{money(row.earned_total)}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td"><button className={`btn-g !px-2.5 !py-1 text-xs ${row.status === 'active' ? 'text-red-700' : 'text-emerald-700'}`} disabled={busy} onClick={() => act(() => clientApi(`me/dealer/partners/${row.uuid}`, { method: 'POST', body: { action: row.status === 'active' ? 'disable' : 'enable' } }), 'Partner access updated.')}><Power size={13}/>{row.status === 'active' ? 'Disable' : 'Enable'}</button></td></tr>)}</Table>
    <h2 className="mb-3 mt-6 text-lg font-semibold">Pending partner requests</h2><Table head={['User', 'Contact', 'Requested', 'KYC']}>{data.pending_requests.map(row => <tr key={row.uuid}><td className="td">{row.name} · {row.code}</td><td className="td">{row.mobile}</td><td className="td">{staffDate(row.requested, false)}</td><td className="td">{titleCase(row.kyc)} · reviewed by TempleAddress</td></tr>)}{!data.pending_requests.length && <StaffEmpty columns={4} text="No pending requests."/>}</Table></>}
    {inviting && <StaffModal title="Invite user as partner" onClose={() => setInviting(false)}><form className="space-y-3" onSubmit={event => { event.preventDefault(); act(() => clientApi('me/dealer/partners/invite', { method: 'POST', body: { mobile_e164: new FormData(event.currentTarget).get('mobile') } }), 'Invite created. They complete KYC from their partner profile.') }}><label className="block text-sm font-medium">Mobile number<input name="mobile" className="input mt-1" placeholder="+919876543210" required/></label><p className="text-xs text-brown-500">They must have signed in to TempleAddress once with this number.</p><StaffNotice error={actionError}/><button className="btn-p" disabled={busy}>Send invite</button></form></StaffModal>}
  </Shell>
}

export function DealerProfile() {
  const { data, error, loading } = useApi('me/dealer'), bank = useApi('me/bank-account'), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [actionError, setActionError] = useState('')
  return <Shell kind="dealer"><Heading title="Dealer profile & KYC"/>{loading ? <p role="status">Loading…</p> : !data ? <NotApproved kind="dealer" error={error}/> : <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-brown-100 bg-white p-5"><StaffDetails values={[['Dealer ID', data.dealer.code], ['Name', data.dealer.name], ['Territory', data.dealer.territory], ['Pincodes', data.dealer.pincodes], ['Partners', data.dealer.partner_count]]}/></section>
    <section className="rounded-2xl border border-brown-100 bg-white p-5"><h2 className="font-semibold">Settlement account</h2>{bank.data ? <p className="mt-1 text-sm">{bank.data.beneficiary_name} · {bank.data.bank_name} ••••{bank.data.account_last_four} · <StaffStatus value={bank.data.status}/></p> : <p className="mt-1 text-sm text-brown-500">No account yet.</p>}<StaffNotice error={actionError}/><StaffNotice>{notice}</StaffNotice><form className="mt-3 grid gap-2 sm:grid-cols-2" onSubmit={async event => { event.preventDefault(); setBusy(true); setActionError(''); try { await clientApi('me/bank-account', { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) }); setNotice('Submitted for verification.'); bank.reload() } catch (err) { setActionError(err.message) } finally { setBusy(false) } }}><input name="beneficiary_name" className="input" placeholder="Account holder" required/><input name="account_number" className="input" placeholder="Account number" required/><input name="ifsc" className="input" placeholder="IFSC" required/><input name="bank_name" className="input" placeholder="Bank" required/><button className="btn-g sm:w-fit" disabled={busy}>{bank.data ? 'Change account' : 'Add account'}</button></form></section></div>}</Shell>
}

