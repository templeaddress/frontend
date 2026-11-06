'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/client-api'
import StaffShell from './StaffShell'
import { useStaffQuery } from './StaffData'
import { StaffEmpty, StaffModal, StaffNotice, StaffPageHeading, StaffStatus, staffDate } from './StaffUI'
import { Table } from './StaffModeration'

export default function SponsorCreativeReview() {
  const [page, setPage] = useState(1), [status, setStatus] = useState('pending_review'), [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const query = `staff/advertisements?page=${page}&page_size=20${status ? `&status=${status}` : ''}`
  const { data, loading, error: loadError, reload } = useStaffQuery(query)
  async function decide(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget), decision = event.nativeEvent.submitter.value
    try {
      await clientApi(`staff/advertisements/${selected.uuid}/${decision}`, { method: 'POST', body: { note: form.get('note') } })
      setSelected(null); setNotice(decision === 'approve' ? 'Sponsor artwork approved.' : 'Returned to the sponsor for correction.'); reload()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <StaffShell><StaffPageHeading eyebrow="Moderation" title="Sponsor artwork" description="Review paid sponsor artwork before it appears on the listing and other package placements."/>
    <StaffNotice error={loadError || error}/><StaffNotice>{notice}</StaffNotice>
    <label className="mb-4 block text-sm">Status <select className="input mt-1 max-w-xs" value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="pending_review">Awaiting review</option><option value="awaiting_creative">Awaiting artwork</option><option value="active">Approved</option><option value="">All</option></select></label>
    <Table head={['Sponsor', 'Listing', 'Package', 'Ends', 'Status', '']}>{(data?.results || []).map(row => <tr key={row.uuid}><td className="td">{row.title}</td><td className="td">{row.listing_name}<small className="block">{row.listing_code}</small></td><td className="td">{row.package_name}</td><td className="td">{staffDate(row.ends_at, false)}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td"><button className="btn-g" onClick={() => { setError(''); setSelected(row) }}>Review</button></td></tr>)}{(loading || !data?.results?.length) && <StaffEmpty columns={6} loading={loading} text="No sponsor artwork in this queue."/>}</Table>
    <div className="mt-4 flex items-center justify-between gap-3"><button className="btn-g" disabled={loading || page === 1} onClick={() => setPage(value => value - 1)}>Previous</button><p className="text-sm">Page {page} · {data?.count || 0} placements</p><button className="btn-g" disabled={loading || !data?.next} onClick={() => setPage(value => value + 1)}>Next</button></div>
    {selected && <StaffModal title={selected.title} onClose={() => { if (!busy) setSelected(null) }}><p className="text-sm">{selected.listing_name} · {selected.package_name}</p>{selected.media_url && <img src={selected.media_url} alt={`${selected.title} sponsor artwork`} className="mt-3 max-h-80 w-full rounded-xl object-contain"/>}{selected.message && <p className="mt-3 text-sm">{selected.message}</p>}{selected.click_url && <a className="mt-2 block break-all text-sm underline" href={selected.click_url} target="_blank" rel="noopener noreferrer">{selected.click_url}</a>}{selected.review_note && <p className="mt-3 text-sm">Previous feedback: {selected.review_note}</p>}<StaffNotice error={error}/>{selected.status === 'pending_review' && <form onSubmit={decide} className="mt-4 space-y-3"><label className="block text-sm">Review note (required when returning)<textarea name="note" className="input mt-1" rows={3}/></label><div className="flex gap-2"><button value="approve" className="btn-p" disabled={busy}>Approve</button><button value="reject" className="btn-g" disabled={busy}>Return for correction</button></div></form>}</StaffModal>}
  </StaffShell>
}
