'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpDown, Eye, ArchiveRestore } from 'lucide-react'
import { clientApi } from '@/lib/client-api'
import { canUseStaff } from '@/lib/staff-access'
import StaffShell, { useStaffUser } from './StaffShell'
import StaffRecordDetail from './StaffRecordDetail'
import { useStaffQuery } from './StaffData'
import { StaffEmpty, StaffModal, StaffNotice, StaffPageHeading, StaffPager, StaffSearch, StaffStatus, money, staffDate, titleCase } from './StaffUI'

const configs = {
  bookings: { title: 'Bookings', description: 'Find a booking by ID, devotee, temple, pooja or payment reference.', path: 'staff/bookings', columns: [['Booking', 'code'], ['Devotee / contact', 'contact_name'], ['Temple / listing', 'listing__name_en'], ['Pooja / donation', null], ['Created', 'created_at'], ['Amount', 'amount_total'], ['Status', 'status']], order: '-created_at', statuses: ['created', 'payment_pending', 'confirmed', 'completed', 'expired'] },
  users: { title: 'Users', description: 'Search registered users and inspect their contact details and account status.', path: 'staff/users', columns: [['Name', 'name'], ['Mobile', null], ['Email', null], ['Joined', 'date_joined'], ['Status', null]], order: '-date_joined', statuses: [] },
  transactions: { title: 'Transactions', description: 'Inspect payments, orders, processing events and payment exceptions.', path: 'staff/payment-attempts', columns: [['Transaction / booking', 'provider_payment_id'], ['Type', null], ['User / guest', 'booking__contact_name'], ['Listing', 'booking__listing__name_en'], ['Date / method', 'created_at'], ['Amount', 'authorised_amount'], ['Status', 'status']], order: '-created_at', statuses: ['authorized', 'capture_pending', 'captured', 'failed', 'exception', 'released'], types: ['booking', 'donation'] },
  listings: { title: 'All listings', description: 'Find published profiles, saved drafts, disabled and archived listings.', path: 'staff/listings', columns: [['Listing / ID', 'name_en'], ['Type', 'listing_type'], ['Creator', null], ['Created / updated', 'created_at'], ['Status', 'publication_status']], order: '-created_at', statuses: ['draft', 'review', 'published', 'disabled', 'archived'], types: ['temple', 'festival', 'service'] },
}

export default function StaffDirectory({ kind }) {
  const config = configs[kind], me = useStaffUser(), params = useSearchParams(), requestId = useRef(0)
  const [search, setSearch] = useState(params.get('search') || '')
  const [query, setQuery] = useState({ search: params.get('search') || '', status: params.get('status') || '', type: '', active: '', ordering: config.order, page: '1', date_from: '', date_to: '' })
  const { data, loading, error, reload } = useStaffQuery(`${config.path}?${new URLSearchParams(query)}`)
  const [selected, setSelected] = useState(null), [detailOpen, setDetailOpen] = useState(false), [detailLoading, setDetailLoading] = useState(false), [actionError, setActionError] = useState(''), [archiving, setArchiving] = useState(false), [busy, setBusy] = useState(false)
  useEffect(() => { const timer = window.setTimeout(() => setQuery(q => ({ ...q, search, page: '1' })), 300); return () => window.clearTimeout(timer) }, [search])
  useEffect(() => () => { requestId.current++ }, [])
  function filter(key, value) { setQuery(q => ({ ...q, [key]: value, page: '1' })) }
  async function inspect(row) {
    const id = ++requestId.current
    setDetailOpen(true); setDetailLoading(true); setActionError(''); setSelected(null)
    try { const key = kind === 'bookings' ? row.code : row.uuid; const record = await clientApi(`${config.path}/${key}`); if (id === requestId.current) setSelected(record) }
    catch (err) { if (id === requestId.current) setActionError(err.message) }
    finally { if (id === requestId.current) setDetailLoading(false) }
  }
  function close() { if (busy) return; requestId.current++; setDetailOpen(false); setSelected(null); setArchiving(false) }
  async function saved() {
    const key = kind === 'bookings' ? selected.code : selected.uuid
    setSelected(await clientApi(`${config.path}/${key}`)); reload()
  }
  async function archive(event) {
    event.preventDefault()
    if (busy) return
    const reason = new FormData(event.currentTarget).get('reason'), action = selected.publication_status === 'archived' ? 'restore' : 'archive'
    setBusy(true); setActionError('')
    try { await clientApi(`staff/listings/${selected.uuid}/${action}`, { method: 'POST', body: { reason } }); setDetailOpen(false); setArchiving(false); setSelected(null); reload() } catch (err) { setActionError(err.message) } finally { setBusy(false) }
  }
  function cells(row) {
    if (kind === 'bookings') return [<b key="code">{row.code}</b>, row.items.map(item => item.devotee_name).filter(Boolean).join(', ') || row.contact_name, <span key="listing">{row.listing.name_en}<small className="block text-brown-500">{row.listing.code}</small></span>, <span key="items">{row.items.map(item => <span className="block" key={item.uuid}>{item.item_name_en} x {item.quantity}<small className="block text-brown-500">{staffDate(item.service_date, false)}</small></span>)}</span>, staffDate(row.created_at), money(row.amount_total), <StaffStatus key="status" value={row.status}/>]
    if (kind === 'users') return [<span key="name"><b>{row.name || row.username}</b><small className="block text-brown-500">{row.username}</small></span>, row.mobile_e164 || '-', row.email || '-', staffDate(row.date_joined), <StaffStatus key="status" value={row.is_active ? 'active' : 'disabled'}/>]
    if (kind === 'listings') return [<span key="name"><b>{row.name_en}</b><small className="block text-brown-500">{row.code}</small></span>, titleCase(row.listing_type), row.creator || '-', <span key="date">{staffDate(row.created_at)}<small className="block text-brown-500">Updated {staffDate(row.updated_at)}</small></span>, <StaffStatus key="status" value={row.publication_status}/>]
    return [<span key="id"><b className="break-all">{row.provider_payment_id || 'Awaiting payment'}</b><small className="block text-brown-500">{row.booking_code || '-'}</small></span>, titleCase(row.transaction_type), row.user_name || '-', <span key="listing">{row.listing_name || '-'}<small className="block text-brown-500">{row.listing_code}</small></span>, <span key="date">{staffDate(row.created_at)}<small className="block text-brown-500">{row.method || 'Method not recorded'}</small></span>, money(row.payer_total ?? row.authorised_amount), <StaffStatus key="status" value={row.status}/>]
  }
  return <StaffShell><StaffPageHeading title={config.title} description={config.description} action={kind === 'listings' && <Link className="btn-p" href="/staff/reviews">Review submissions</Link>}/><div className="mb-4 space-y-3 rounded-xl border border-brown-100 bg-white p-4"><div className="flex flex-wrap gap-3"><StaffSearch value={search} onChange={setSearch} placeholder={kind === 'transactions' ? 'Payment, booking, user, listing or gateway' : 'Search name, code or contact'}/>{config.statuses.length > 0 && <select aria-label="Filter status" className="input sm:max-w-[180px]" value={query.status} onChange={e => filter('status', e.target.value)}><option value="">All statuses</option>{config.statuses.map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select>}{config.types && <select aria-label="Filter type" className="input sm:max-w-[160px]" value={query.type} onChange={e => filter('type', e.target.value)}><option value="">All types</option>{config.types.map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select>}{kind === 'users' && <select aria-label="Account status" className="input sm:max-w-[180px]" value={query.active} onChange={e => filter('active', e.target.value)}><option value="">All accounts</option><option value="true">Active accounts</option><option value="false">Inactive accounts</option></select>}</div><div className="flex flex-wrap items-end gap-3">{['date_from', 'date_to'].map(key => <label className="text-xs text-brown-500" key={key}>{key === 'date_from' ? 'From' : 'To'}<input type="date" className="input mt-1" value={query[key]} onChange={e => filter(key, e.target.value)}/></label>)}<button className="btn-g !py-2 text-xs" onClick={() => { setSearch(''); setQuery({ search: '', status: '', type: '', active: '', ordering: config.order, page: '1', date_from: '', date_to: '' }) }}>Clear filters</button><span className="text-xs text-brown-500">Select a column heading to sort.</span></div></div><StaffNotice error={error}/><div className="overflow-x-auto rounded-2xl border border-brown-100 bg-white"><table className="w-full text-sm"><thead><tr>{config.columns.map(([label, order]) => <th className="th" key={label}>{order ? <button className={`inline-flex items-center gap-2 text-left ${query.ordering.replace(/^-/, '') === order ? 'text-saffron-700' : ''}`} onClick={() => filter('ordering', query.ordering === order ? `-${order}` : order)}>{label}<ArrowUpDown size={12}/></button> : label}</th>)}<th className="th">Details</th></tr></thead><tbody>{!loading && data?.results.map(row => <tr className="cursor-pointer hover:bg-brown-50/50" key={row.uuid} tabIndex={0} onClick={e => { if (!e.target.closest('button,a')) inspect(row) }} onKeyDown={e => { if (e.target === e.currentTarget && ['Enter', ' '].includes(e.key)) { e.preventDefault(); inspect(row) } }}>{cells(row).map((value, index) => <td className="td max-w-sm" key={index}>{value}</td>)}<td className="td"><button className="btn-g !px-3 !py-2 text-xs" onClick={() => inspect(row)}><Eye size={14}/>View</button></td></tr>)}{(loading || !data?.results.length) && <StaffEmpty loading={loading} columns={config.columns.length + 1}/>}</tbody></table></div><StaffPager payload={data} page={query.page} loading={loading} onChange={page => setQuery(q => ({ ...q, page: String(page) }))}/>
    {detailOpen && <StaffModal wide title={selected?.code || selected?.name || selected?.name_en || selected?.provider_payment_id || 'Record details'} onClose={close}><StaffNotice error={actionError}/>{detailLoading && <p role="status">Loading selected record...</p>}{selected && <><StaffRecordDetail kind={kind} record={selected} onSaved={saved}/>{kind === 'listings' && canUseStaff(me, 'portal admin') && <div className="mt-6 border-t border-brown-100 pt-5"><button className="btn-g" onClick={() => setArchiving(value => !value)}><ArchiveRestore size={16}/>{selected.publication_status === 'archived' ? 'Restore listing' : 'Archive listing'}</button>{archiving && <form className="mt-4 space-y-3" onSubmit={archive}><label className="block text-sm">Reason<textarea name="reason" className="input mt-2" required maxLength={2000}/></label><button className="btn-p" disabled={busy}>{busy ? 'Saving...' : 'Confirm action'}</button></form>}</div>}</>}</StaffModal>}
  </StaffShell>
}
