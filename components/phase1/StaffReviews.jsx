'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, ExternalLink } from 'lucide-react'
import StaffShell from './StaffShell'
import { useStaffQuery } from './StaffData'
import { StaffEmpty, StaffNotice, StaffPageHeading, StaffPager, StaffSearch, StaffStatus, staffDate } from './StaffUI'

export default function StaffReviews() {
  const params = useSearchParams()
  const [query, setQuery] = useState({ q: params.get('search') || '', listing_type: '', status: params.get('status') || 'submitted', page: '1' }), [search, setSearch] = useState(params.get('search') || '')
  useEffect(() => { const timer = window.setTimeout(() => setQuery(q => ({ ...q, q: search.trim(), page: '1' })), 300); return () => window.clearTimeout(timer) }, [search])
  const { data, error, loading } = useStaffQuery(`staff/listing-revisions?${new URLSearchParams(query)}`)
  const { data: overview } = useStaffQuery('staff/overview')
  return <StaffShell><StaffPageHeading title="Listing review" description="Review the selected submission, preview its content, and send an approval or clear feedback to its creator." action={<Link className="btn-g" href="/staff/listing">All listings</Link>}/>
    <div className="mb-5 flex flex-wrap gap-2">{[['submitted', 'Awaiting review', overview?.awaiting_review], ['draft', 'Saved drafts', overview?.draft_revisions], ['changes_requested', 'Changes requested'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([status, label, count]) => <button key={status} type="button" onClick={() => setQuery(q => ({ ...q, status, page: '1' }))} aria-pressed={query.status === status} className={query.status === status ? 'btn-p !py-2 text-sm' : 'btn-g !py-2 text-sm'}>{label}{count != null && <span className="ml-1 rounded-full bg-black/5 px-2 text-xs">{count}</span>}</button>)}</div>
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-brown-100 bg-white p-4"><StaffSearch value={search} onChange={setSearch} placeholder="Listing name, code or creator"/><select className="input sm:max-w-[180px]" aria-label="Listing type" value={query.listing_type} onChange={e => setQuery(q => ({ ...q, listing_type: e.target.value, page: '1' }))}><option value="">All listing types</option><option value="temple">Temple</option><option value="festival">Festival</option><option value="service">Service</option></select></div><StaffNotice error={error}/>
    <div className="overflow-x-auto rounded-2xl border border-brown-100 bg-white"><table className="w-full text-sm"><thead><tr>{['Listing / ID', 'Type', 'Creator', 'Created / updated', 'Status', 'Actions'].map(value => <th className="th" key={value}>{value}</th>)}</tr></thead><tbody>{!loading && data?.results.map(row => <tr key={row.uuid} className="hover:bg-brown-50/50"><td className="td"><b>{row.name_en}</b><small className="mt-1 block text-brown-500">{row.code}</small></td><td className="td capitalize">{row.listing_type}</td><td className="td">{row.creator || row.submitted_by || '—'}</td><td className="td"><span className="whitespace-nowrap">{staffDate(row.created_at)}</span><small className="mt-1 block whitespace-nowrap text-brown-500">Updated {staffDate(row.updated_at)}</small></td><td className="td"><StaffStatus value={row.status}/></td><td className="td"><div className="flex gap-2"><Link className="btn-g !px-3 !py-2 text-xs" href={`/staff/reviews/${row.uuid}`}><Eye size={14}/>View</Link><Link className="btn-g !px-3 !py-2 text-xs" href={`/staff/reviews/${row.uuid}?view=preview`} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/>Preview</Link></div></td></tr>)}{(loading || !data?.results.length) && <StaffEmpty loading={loading} text="No listings in this queue." columns={6}/>}</tbody></table></div><StaffPager payload={data} page={query.page} loading={loading} onChange={page => setQuery(q => ({ ...q, page: String(page) }))}/>
  </StaffShell>
}
