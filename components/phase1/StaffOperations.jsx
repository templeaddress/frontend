'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { clientApi } from '@/lib/client-api'
import StaffShell from './StaffShell'
import { useStaffQuery } from './StaffData'
import { StaffDetails, StaffEmpty, StaffModal, StaffNotice, StaffPageHeading, StaffPager, StaffSearch, StaffStatus, staffDate, titleCase } from './StaffUI'

const statuses = ['new', 'in_progress', 'resolved', 'closed']
export default function StaffOperations({ kind }) {
  const audit = kind === 'audit', leads = kind === 'leads', root = `staff/${kind}`, requestId = useRef(0)
  const [query, setQuery] = useState({ search: '', status: '', page: '1', date_from: '', date_to: '', target_uuid: '' }), [search, setSearch] = useState('')
  const { data, loading, error, reload } = useStaffQuery(`${root}?${new URLSearchParams(query)}`)
  const [selected, setSelected] = useState(null), [actionError, setActionError] = useState(''), [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  useEffect(() => { const timer = window.setTimeout(() => setQuery(q => ({ ...q, search, page: '1' })), 300); return () => window.clearTimeout(timer) }, [search])
  useEffect(() => () => { requestId.current++ }, [])
  function filter(key, value) { setQuery(q => ({ ...q, [key]: value, page: '1' })) }
  async function inspect(row) {
    const id = ++requestId.current
    setActionError('')
    try { const record = await clientApi(`${root}/${row.uuid}`); if (id === requestId.current) setSelected(record) } catch (err) { if (id === requestId.current) setActionError(err.message) }
  }
  async function save(event) {
    event.preventDefault()
    if (busy) return
    const body = Object.fromEntries(new FormData(event.currentTarget))
    setBusy(true); setActionError('')
    try { await clientApi(`${root}/${selected.uuid}`, { method: 'PATCH', body }); setSelected(null); setQuery(q => ({ ...q, page: '1' })); reload(); setNotice('Handling status and audit reason saved.') } catch (err) { setActionError(err.message) } finally { setBusy(false) }
  }
  const columns = audit ? ['When', 'Staff / actor', 'Action', 'Target', 'Reason', 'Request'] : leads ? ['Suggested listing', 'Type / district', 'Contact', 'Created', 'Status', 'Details'] : ['Visitor', 'Listing', 'Enquiry', 'Created', 'Status', 'Details']
  return <StaffShell><StaffPageHeading title={audit ? 'Activity & audit history' : leads ? 'Listing suggestions' : 'Enquiries & leads'} description={audit ? 'Read-only history of recorded staff and system actions. Filter by actor, action, target or date.' : 'Review contact requests and public listing suggestions, then record follow-up and handling status.'}/>
    {!audit && <div className="mb-5 flex gap-2"><Link className={leads ? 'btn-g !py-2' : 'btn-p !py-2'} href="/staff/enquiries">Listing enquiries</Link><Link className={leads ? 'btn-p !py-2' : 'btn-g !py-2'} href="/staff/enquiries?view=leads">Public suggestions</Link></div>}
    <div className="mb-4 space-y-3 rounded-xl border border-brown-100 bg-white p-4"><div className="flex flex-wrap gap-3"><StaffSearch value={search} onChange={setSearch} placeholder={audit ? 'Action, actor, target or reason' : 'Name, contact or listing'}/>{!audit && <select className="input sm:max-w-[180px]" aria-label="Handling status" value={query.status} onChange={e => filter('status', e.target.value)}><option value="">All statuses</option>{statuses.map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select>}{audit && <input aria-label="Exact target identifier" className="input sm:max-w-[300px]" value={query.target_uuid} placeholder="Exact target UUID / identifier" onChange={e => filter('target_uuid', e.target.value)}/>}</div><div className="flex flex-wrap gap-3">{['date_from', 'date_to'].map(key => <label className="text-xs text-brown-500" key={key}>{key === 'date_from' ? 'From' : 'To'}<input type="date" className="input mt-1" value={query[key]} onChange={e => filter(key, e.target.value)}/></label>)}</div></div>
    <StaffNotice error={error || (!selected ? actionError : '')}/><StaffNotice>{notice}</StaffNotice><div className="overflow-x-auto rounded-2xl border border-brown-100 bg-white"><table className="w-full text-sm"><thead><tr>{columns.map(label => <th key={label} className="th">{label}</th>)}</tr></thead><tbody>{!loading && data?.results.map(row => <tr key={row.uuid || row.id} className="hover:bg-brown-50/50">{audit ? <><td className="td whitespace-nowrap">{staffDate(row.created_at)}</td><td className="td">{row.actor_name || 'System'}</td><td className="td font-medium">{row.action}</td><td className="td"><span className="block">{row.target_type}</span><small className="block max-w-[220px] break-all text-brown-500">{row.target_uuid}</small></td><td className="td max-w-sm whitespace-pre-wrap">{row.reason || '-'}</td><td className="td max-w-[180px] break-all text-xs text-brown-500">{row.request_id || '-'}</td></> : <><td className="td font-semibold">{row.name}</td><td className="td">{leads ? <>{titleCase(row.listing_type)}<small className="block text-brown-500">{row.district_text}</small></> : <>{row.listing_name}<small className="block text-brown-500">{row.listing_code}</small></>}</td><td className="td max-w-sm">{leads ? <>{row.contact_name}<small className="block text-brown-500">{row.contact_mobile}</small></> : <p className="line-clamp-2">{row.message}</p>}</td><td className="td whitespace-nowrap">{staffDate(row.created_at)}</td><td className="td"><StaffStatus value={row.handling_status || row.status}/></td><td className="td"><button className="btn-g !px-3 !py-2 text-xs" onClick={() => inspect(row)}><Eye size={14}/>View</button></td></>}</tr>)}{(loading || !data?.results.length) && <StaffEmpty columns={columns.length} loading={loading}/>}</tbody></table></div><StaffPager payload={data} loading={loading} page={query.page} onChange={page => setQuery(q => ({ ...q, page: String(page) }))}/>
    {selected && <StaffModal title={selected.name} onClose={() => { if (!busy) { requestId.current++; setSelected(null) } }}><StaffDetails values={[["Contact", leads ? selected.contact_name : selected.name], ['Mobile', leads ? selected.contact_mobile : selected.mobile], ['Email', leads ? selected.contact_email : selected.email], ['Created', staffDate(selected.created_at)], ['Listing', leads ? selected.name : `${selected.listing_name} (${selected.listing_code})`], ['Status', <StaffStatus key="status" value={selected.handling_status || selected.status}/>]]}/><h3 className="mb-2 mt-5 font-semibold">{leads ? 'Suggestion notes' : 'Enquiry message'}</h3><p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message || selected.notes || 'No notes supplied.'}</p><form className="mt-5 space-y-4 border-t border-brown-100 pt-5" onSubmit={save}><label className="block text-sm">Handling status<select name="status" className="input mt-2" defaultValue={selected.handling_status || selected.status}>{statuses.map(status => <option key={status} value={status}>{titleCase(status)}</option>)}</select></label><label className="block text-sm">Follow-up reason<textarea name="reason" className="input mt-2" required maxLength={2000} rows={3}/></label><StaffNotice error={actionError}/><button className="btn-p" disabled={busy}>{busy ? 'Saving...' : 'Save handling status'}</button></form></StaffModal>}
  </StaffShell>
}
