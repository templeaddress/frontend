'use client'

import { useEffect, useState } from 'react'
import { clientApi } from '@/lib/client-api'
import { Field, Input } from '@/components/ui'

export default function StaffListingTools({ listing, onChange, hideVisibility = false }) {
  const [documents, setDocuments] = useState([]), [beneficiary, setBeneficiary] = useState(null), [members, setMembers] = useState([])
  const [users, setUsers] = useState([]), [search, setSearch] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const root = `staff/listings/${listing.uuid}`
  useEffect(() => {
    let active = true
    Promise.all([clientApi(`me/listings/${listing.uuid}/documents`), clientApi(`me/listings/${listing.uuid}/kyc`), clientApi(`${root}/event-editors`)]).then(([docs, kyc, memberships]) => { if (active) { setDocuments(docs); setBeneficiary(kyc); setMembers(memberships) } }).catch(err => { if (active) setError(err.message) })
    return () => { active = false }
  }, [listing.uuid, root])
  async function run(work) {
    if (busy) return
    setBusy(true); setError('')
    try { await work(); await onChange?.() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  function reason(label) { return window.prompt(label)?.trim() }
  async function review(doc, status) {
    const note = reason(`Reason to mark this document ${status}:`)
    if (!note) return
    await run(async () => { await clientApi(`${root}/documents/${doc.uuid}/review`, { method: 'POST', body: { status, reason: note } }); setDocuments(await clientApi(`me/listings/${listing.uuid}/documents`)) })
  }
  async function download(doc) {
    await run(async () => {
      const blob = await clientApi(`me/listings/${listing.uuid}/documents/${doc.uuid}/file`, { responseType: 'blob' })
      const url = URL.createObjectURL(blob), link = document.createElement('a')
      link.href = url; link.download = `listing-${doc.kind}`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }
  const canManage = listing.publication_status === 'published' && ['temple', 'service'].includes(listing.listing_type)
  return <section className="mt-5 space-y-4 border-t pt-5"><h3 className="text-xl font-semibold">Documents and access</h3>{error && <p role="alert" className="text-red-700">{error}</p>}
    {beneficiary?.uuid && <div className="rounded-xl bg-cream-50 p-3"><b>Beneficiary details</b><p>{beneficiary.beneficiary_name} · {beneficiary.registration_number || 'No registration number'} · {beneficiary.status}</p>{beneficiary.review_note && <p>{beneficiary.review_note}</p>}</div>}
    {!documents.length && <p className="text-sm text-brown-500">No supporting documents submitted.</p>}{documents.map(doc => <div key={doc.uuid} className="flex flex-wrap items-center gap-3 rounded-xl border p-3"><span className="capitalize">{doc.kind.replaceAll('_', ' ')} · {doc.review_status}</span>{doc.review_note && <p>{doc.review_note}</p>}<button className="btn-g" disabled={busy} onClick={() => download(doc)}>Download</button>{doc.review_status === 'submitted' && <><button className="btn-g" disabled={busy} onClick={() => review(doc, 'verified')}>Verify document</button><button className="btn-g" disabled={busy} onClick={() => review(doc, 'rejected')}>Reject document</button></>}</div>)}
    {!hideVisibility && ['published', 'disabled'].includes(listing.publication_status) && <button className="btn-g" disabled={busy} onClick={() => { const status = listing.publication_status === 'published' ? 'disabled' : 'published'; const note = reason(`Reason to ${status === 'disabled' ? 'disable' : 'republish'} this approved listing:`); if (note) run(() => clientApi(`${root}/visibility`, { method: 'POST', body: { status, reason: note } })) }}>{listing.publication_status === 'published' ? 'Disable public listing' : 'Republish approved listing'}</button>}
    <h4 className="font-semibold">Event Editor access</h4><p className="text-sm text-brown-500">Event Editor access is limited to free events on a published Temple or Service listing.</p>{members.map(member => <div key={member.uuid} className="flex flex-wrap items-center gap-3"><span>{member.name} · {member.status}{member.end_reason ? ` · ${member.end_reason}` : ''}</span>{member.status === 'active' && <button className="btn-g" disabled={busy} onClick={() => { const note = reason(`Reason to end ${member.name}'s Event Editor access:`); if (note) run(async () => { await clientApi(`${root}/memberships/${member.uuid}/end`, { method: 'POST', body: { reason: note } }); setMembers(await clientApi(`${root}/event-editors`)) }) }}>End access</button>}</div>)}
    {canManage && <><form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); run(async () => setUsers((await clientApi(`staff/users?search=${encodeURIComponent(search)}`)).results)) }}><Field label="Find registered user"><Input value={search} required minLength={2} onChange={e => setSearch(e.target.value)} placeholder="Name or mobile"/></Field><button className="btn-g" disabled={busy}>Find user</button></form>{users.map(user => <div key={user.uuid} className="flex flex-wrap items-center gap-3"><span>{user.name || user.username} · {user.mobile_e164}</span><button className="btn-g" disabled={busy || !user.is_active} onClick={() => { const note = reason(`Verification reason for granting Event Editor to ${user.name || user.username}:`); if (note) run(async () => { await clientApi(`${root}/memberships`, { method: 'POST', body: { user_uuid: user.uuid, role: 'event_editor', reason: note } }); setMembers(await clientApi(`${root}/event-editors`)); setUsers([]) }) }}>Grant Event Editor</button></div>)}</>}
  </section>
}
