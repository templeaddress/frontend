'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/client-api'
import { StaffNotice } from './StaffUI'

export default function PayoutActions({ row, roles = [], actorUuid, onChange }) {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [action, setAction] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const body = Object.fromEntries(new FormData(event.currentTarget))
    setError(''); setBusy(true)
    try { await clientApi(`finance/payouts/${row.uuid}/${action}`, { method: 'POST', body }); setAction(''); await onChange() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const needsApproval = row.status === 'pending' && row.approval_required && !row.approved
  return <div className="space-y-3">
    {needsApproval && <><p className="text-sm text-amber-800">This payout requires an Accountant proposal and approval by a different Portal Admin.</p>{row.proposal && <p className="text-sm text-brown-500">Proposed by {row.proposal.maker_name}. {row.proposal.maker_uuid === actorUuid ? 'Another Portal Admin must approve it.' : ''}</p>}<div className="flex flex-wrap gap-2">{!row.proposal && <button className="btn-g" disabled={busy} onClick={() => setAction('approval')}>Propose export approval</button>}{row.proposal && roles.includes('portal admin') && row.proposal.maker_uuid !== actorUuid && <button className="btn-g" disabled={busy} onClick={() => setAction('approval/approve')}>Approve proposal</button>}</div></>}
    {row.approved && <p className="text-sm text-emerald-700">Different-user approval recorded.</p>}
    {['exported', 'retry_required'].includes(row.status) && <button className="btn-g" disabled={busy} onClick={() => setAction('release-for-retry')}>Review release for retry</button>}
    {action && <form className="space-y-3 rounded-xl border border-brown-100 p-4" onSubmit={submit}><h4 className="font-semibold">{action === 'release-for-retry' ? 'Document bank non-processing' : action === 'approval' ? 'Propose export approval' : 'Approve export proposal'}</h4><label className="block text-sm">Reason<textarea name="reason" className="input mt-2" required maxLength={2000}/></label>{action === 'release-for-retry' && <label className="block text-sm">Bank failure evidence<textarea name="evidence_note" className="input mt-2" placeholder="Evidence confirming the bank did not transfer this payout" required maxLength={2000}/></label>}<StaffNotice error={error}/><div className="flex gap-2"><button className="btn-p" disabled={busy}>{busy ? 'Saving...' : 'Confirm action'}</button><button type="button" className="btn-g" disabled={busy} onClick={() => setAction('')}>Cancel</button></div></form>}
    {!action && <StaffNotice error={error}/>}
  </div>
}
