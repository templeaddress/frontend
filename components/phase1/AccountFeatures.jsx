'use client'

import { useCallback, useEffect, useState } from 'react'
import { clientApi } from '@/lib/client-api'
import { apiCollection } from '@/lib/catalogue'
import { Field, Input } from '@/components/ui'

export default function AccountFeatures({ me }) {
  const [family, setFamily] = useState([]), [stars, setStars] = useState([]), [receipts, setReceipts] = useState([])
  const [editing, setEditing] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    const [members, values, rows] = await Promise.all([apiCollection('me/family-members', clientApi), clientApi('master-values/star', { auth: false }), apiCollection('me/receipts', clientApi)])
    setFamily(members); setStars(values); setReceipts(rows)
  }, [])
  useEffect(() => { load().catch(error => setError(error.message)) }, [load])
  async function saveFamily(event) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setError(''); setMessage('')
    const body = Object.fromEntries(new FormData(form)); body.star_kind = body.star_value ? (body.star_value === editing?.star_value ? editing.star_kind : 'nakshatra') : ''
    try { await clientApi(`me/family-members${editing ? `/${editing.uuid}` : ''}`, { method: editing ? 'PATCH' : 'POST', body }); setEditing(null); form.reset(); await load(); setMessage('Family member saved.') }
    catch (error) { setError(error.message) } finally { setBusy(false) }
  }
  async function archive(row) {
    try { await clientApi(`me/family-members/${row.uuid}`, { method: 'DELETE' }); await load() } catch (error) { setError(error.message) }
  }
  async function savePreferences(event) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true)
    const data = new FormData(event.currentTarget)
    const notification_preferences = { ...me.notification_preferences, ...Object.fromEntries(['email', 'whatsapp', 'sms'].map(channel => [channel, data.has(channel)])) }
    try { await clientApi('me', { method: 'PATCH', body: { notification_preferences } }); setMessage('Notification preferences saved.') }
    catch (error) { setError(error.message) } finally { setBusy(false) }
  }
  async function download(row) {
    try {
      const blob = await clientApi(`me/receipts/${row.number}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${row.number}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) { setError(error.message) }
  }
  return <div className="mt-8 space-y-6">{error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status" className="text-emerald-700">{message}</p>}<section className="card p-5"><h2 className="text-2xl font-semibold">Family members</h2><div className="mt-3 space-y-2">{family.map(row => <div className="flex flex-wrap items-center gap-3" key={row.uuid}><span className="flex-1">{row.name} · {row.relation} · {row.star_value}</span><button className="btn-g" onClick={() => setEditing(row)}>Edit</button><button className="btn-g" onClick={() => archive(row)}>Archive</button></div>)}</div>
    <form key={editing?.uuid || 'new'} onSubmit={saveFamily} className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Name"><Input name="name" maxLength={160} defaultValue={editing?.name} required/></Field><Field label="Relation"><Input name="relation" maxLength={80} defaultValue={editing?.relation}/></Field><Field label="Nakshatra"><select name="star_value" className="input" defaultValue={editing?.star_value || ''}><option value="">Not specified</option>{editing?.star_value && !stars.some(star => star.code === editing.star_value) && <option value={editing.star_value}>{editing.star_value}</option>}{stars.map(star => <option key={star.code} value={star.code}>{star.name_en}</option>)}</select></Field><div className="flex items-end gap-2"><button className="btn-p" disabled={busy}>{editing ? 'Save family member' : 'Add family member'}</button>{editing && <button type="button" className="btn-g" onClick={() => setEditing(null)}>Cancel</button>}</div></form></section>
    <form onSubmit={savePreferences} className="card p-5"><h2 className="text-2xl font-semibold">Notification preferences</h2><div className="my-4 flex flex-wrap gap-5">{['email', 'whatsapp', 'sms'].map(channel => <label key={channel} className="flex items-center gap-2 capitalize"><input type="checkbox" name={channel} defaultChecked={me.notification_preferences?.[channel] !== false}/>{channel}</label>)}</div><button className="btn-p" disabled={busy}>Save preferences</button></form>
    <section className="card p-5"><h2 className="text-2xl font-semibold">Receipts</h2><div className="mt-3 space-y-2">{receipts.map(row => <div key={row.number} className="flex items-center justify-between gap-3"><span>{row.number} · {row.snapshot.booking_code} · ₹{row.snapshot.amount}</span><button className="btn-g" onClick={() => download(row)}>Download PDF</button></div>)}{!receipts.length && <p>No receipts yet.</p>}</div></section>
  </div>
}
