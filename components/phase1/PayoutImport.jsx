'use client'

import { useRef, useState } from 'react'
import { clientApi } from '@/lib/client-api'

export default function PayoutImport({ exports, onApplied, initialCode = '', initialPreview = null, showUpload = true }) {
  const [code, setCode] = useState(initialCode), [preview, setPreview] = useState(initialPreview), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const pending = useRef(false)
  async function upload(event) {
    event.preventDefault()
    if (pending.current) return
    pending.current = true; setBusy(true); setError(''); setPreview(null)
    const body = new FormData(event.currentTarget)
    try {
      const result = await clientApi(`finance/payout-exports/${code}/imports`, { method: 'POST', body })
      setPreview(await clientApi(`finance/payout-imports/${result.uuid}`))
    } catch (error) { setError(error.message) } finally { pending.current = false; setBusy(false) }
  }
  async function apply() {
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    try {
      await clientApi(`finance/payout-imports/${preview.uuid}/apply`, { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() }, body: {} })
      setPreview(await clientApi(`finance/payout-imports/${preview.uuid}`)); await onApplied()
    } catch (error) { setError(error.message) } finally { pending.current = false; setBusy(false) }
  }
  return <section className="card mt-8 p-5"><h2 className="text-2xl font-semibold">Import bank results</h2>{showUpload && <><p className="mt-3 text-sm text-brown-500">Upload the same exported workbook after filling in Bank Transaction ID and Journal Number. Keep all other cells and worksheets unchanged. Rows without both references remain unsettled.</p><form onSubmit={upload} className="mt-4 flex flex-wrap items-center gap-3"><select required disabled={busy} aria-label="Export workbook" className="input sm:max-w-xs" value={code} onChange={event => { setCode(event.target.value); setPreview(null) }}><option value="">Choose export</option>{code && !exports.some(row => row.code === code) && <option value={code}>{code}</option>}{exports.map(row => <option key={row.uuid} value={row.code}>{row.code}</option>)}</select><input required disabled={busy} aria-label="Completed FedOne workbook" type="file" name="file" accept=".xlsx"/><button className="btn-g" disabled={busy}>Upload and preview</button></form></>}{error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
    {preview && <div className="mt-5"><p>{preview.export_code} · {preview.status} · {preview.rows.filter(row => row.result_code === 'ready').length} ready · {preview.summary.applied || 0} applied · {preview.rows.filter(row => !['ready', 'applied'].includes(row.result_code)).length} not applied</p><div className="mt-3 overflow-x-auto"><table className="w-full"><thead><tr>{['Row', 'Chart', 'Bank transaction', 'Journal', 'Result', 'Reason'].map(value => <th key={value} className="th">{value}</th>)}</tr></thead><tbody>{preview.rows.map(row => <tr key={row.row_number}><td className="td">{row.row_number}</td><td className="td">{row.redacted_cells.chart_id}</td><td className="td">{row.transaction_id_normalized || '—'}</td><td className="td">{row.journal_number_normalized || '—'}</td><td className="td">{row.result_code === 'applied' ? 'Applied' : row.result_code === 'ready' ? 'Ready' : 'Not applied'}</td><td className="td">{row.result_message || '—'}</td></tr>)}</tbody></table></div><p className="mt-4 text-sm text-brown-500">Confirm only bank-processed transfers. Applying valid rows marks their payouts Paid and matching charts Completed.</p><button className="btn-p mt-4" disabled={busy || !preview.signature_valid || preview.status === 'applied' || !preview.rows.some(row => row.result_code === 'ready')} onClick={apply}>{busy ? 'Applying…' : 'Apply valid bank results'}</button></div>}
  </section>
}
