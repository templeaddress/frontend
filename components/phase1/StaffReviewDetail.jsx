'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, RotateCcw, X } from 'lucide-react'
import { clientApi } from '@/lib/client-api'
import StaffShell from './StaffShell'
import StaffListingPreview from './StaffListingPreview'
import StaffListingTools from './StaffListingTools'
import { useStaffQuery } from './StaffData'
import { StaffDetails, StaffModal, StaffNotice, StaffPageHeading, StaffStatus, staffDate, titleCase } from './StaffUI'

export function SubmittedFields({ value }) {
  if (Array.isArray(value)) return value.length ? <div className="space-y-3">{value.map((item, index) => <div key={index} className="rounded-lg border border-brown-100 p-3"><SubmittedFields value={item}/></div>)}</div> : <span className="text-brown-500">None supplied</span>
  if (value && typeof value === 'object') return <dl className="grid gap-4 sm:grid-cols-2">{Object.entries(value).filter(([key]) => !key.startsWith('_')).map(([key, item]) => <div key={key} className={typeof item === 'object' ? 'sm:col-span-2' : ''}><dt className="mb-1 text-xs font-semibold text-brown-500">{titleCase(key.replace(/_en$/, '').replace(/_ml$/, ' (Malayalam)'))}</dt><dd className="whitespace-pre-wrap break-words text-sm"><SubmittedFields value={item}/></dd></div>)}</dl>
  return <span>{value == null || value === '' ? 'Not supplied' : typeof value === 'boolean' ? value ? 'Yes' : 'No' : String(value)}</span>
}

export default function StaffReviewDetail() {
  const { revision } = useParams(), params = useSearchParams()
  const { data: row, error, loading, reload } = useStaffQuery(`staff/listing-revisions/${revision}`)
  const [tab, setTab] = useState(params.get('view') === 'preview' ? 'preview' : 'details'), [decision, setDecision] = useState(''), [busy, setBusy] = useState(false), [actionError, setActionError] = useState(''), [notice, setNotice] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const reason = new FormData(event.currentTarget).get('reason') || ''
    setBusy(true); setActionError('')
    try { await clientApi(`staff/listing-revisions/${revision}/${decision}`, { method: 'POST', body: { reason } }); setNotice(decision === 'approve' ? 'Listing approved and published.' : 'Review feedback saved.'); setDecision(''); reload() } catch (err) { setActionError(err.message) } finally { setBusy(false) }
  }
  return <StaffShell><Link className="mb-5 inline-flex items-center gap-2 text-sm text-brown-500 hover:text-saffron-700" href="/staff/reviews"><ArrowLeft size={16}/>Back to listing review</Link><StaffPageHeading title={row?.name_en || 'Listing submission'} description={row ? `${row.code} · ${titleCase(row.listing_type)} · ${row.creator || 'Creator not recorded'}` : 'Loading the selected submission…'} action={row && <StaffStatus value={row.status}/>}/><StaffNotice error={error}/><StaffNotice>{notice}</StaffNotice>
    {loading && !row && <p role="status">Loading submission…</p>}{row && <><div className="mb-5 rounded-2xl border border-brown-100 bg-white p-5"><StaffDetails values={[["Created", staffDate(row.created_at)], ['Updated', staffDate(row.updated_at)], ['Submitted', staffDate(row.submitted_at)], ['Review status', <StaffStatus key="status" value={row.status}/>]]}/>{row.review_notes && <p className="mt-4 border-t border-brown-100 pt-4 text-sm"><b>Review feedback:</b> {row.review_notes}</p>}</div><div className="mb-5 flex flex-wrap gap-2">{[['details', 'Submitted details'], ['preview', 'Public-page preview'], ['documents', 'Documents & access']].map(([key, label]) => <button type="button" className={tab === key ? 'btn-p !py-2 text-sm' : 'btn-g !py-2 text-sm'} aria-pressed={tab === key} key={key} onClick={() => setTab(key)}>{label}</button>)}</div>
      {tab === 'details' && <div className="rounded-2xl border border-brown-100 bg-white p-5 sm:p-6"><SubmittedFields value={row.snapshot}/></div>}{tab === 'preview' && <><p className="mb-4 text-sm text-brown-500">Preview of this submission. Bookings are unavailable in this preview.</p><StaffListingPreview key={revision} row={row}/></>}{tab === 'documents' && <div className="rounded-2xl border border-brown-100 bg-white p-5"><StaffListingTools listing={{ uuid: row.listing_uuid, listing_type: row.listing_type, publication_status: row.publication_status }} hideVisibility/></div>}
      {row.status === 'submitted' && <div className="sticky bottom-3 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brown-100 bg-white/95 p-4 shadow-lg backdrop-blur"><p className="text-sm text-brown-500">Review all submitted details before deciding.</p><div className="flex flex-wrap gap-2"><button className="btn-g !py-2" onClick={() => { setActionError(''); setDecision('request-changes') }}><RotateCcw size={15}/>Request changes</button><button className="btn-g !py-2 text-red-700" onClick={() => { setActionError(''); setDecision('reject') }}><X size={15}/>Reject</button><button className="btn-p !py-2" onClick={() => { setActionError(''); setDecision('approve') }}><Check size={15}/>Approve listing</button></div></div>}</>}
    {decision && <StaffModal title={decision === 'approve' ? 'Approve and publish listing' : decision === 'reject' ? 'Reject submission' : 'Request changes'} onClose={() => { if (!busy) setDecision('') }}><form onSubmit={submit} className="space-y-4"><p className="text-sm text-brown-500">{row?.name_en} · {row?.code}{decision === 'approve' ? ' will become publicly available.' : ' — explain what the creator needs to change.'}</p><label className="block text-sm font-medium">{decision === 'approve' ? 'Review note (optional)' : 'Reason / feedback'}<textarea className="input mt-2" name="reason" rows={4} required={decision !== 'approve'} maxLength={2000}/></label><StaffNotice error={actionError}/><div className="flex justify-end gap-2"><button type="button" className="btn-g" disabled={busy} onClick={() => setDecision('')}>Cancel</button><button className="btn-p" disabled={busy}>{busy ? 'Saving…' : decision === 'approve' ? 'Approve and publish' : 'Save decision'}</button></div></form></StaffModal>}
  </StaffShell>
}
