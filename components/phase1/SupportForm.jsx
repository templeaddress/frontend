'use client'

import { useState } from 'react'
import { Field, Input } from '@/components/ui'
import { clientApi, readAuth } from '@/lib/client-api'
import PublicText from '@/components/PublicText'

// Raises a ticket in the staff support queue (website source); signed-in users are prefilled.
export default function SupportForm() {
  const user = typeof window !== 'undefined' ? readAuth()?.user : null
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState('')
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    try { const result = await clientApi('support-tickets', { method: 'POST', auth: Boolean(user), body: { ...Object.fromEntries(new FormData(event.currentTarget)), source: 'contact_form' } }); setDone(result.code) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  if (done) return <p className="rounded-2xl bg-emerald-50 p-5 text-emerald-800"><PublicText values={{ code: done }}>{'Thank you. Your ticket {code} has been raised; our team will contact you.'}</PublicText></p>
  return <form onSubmit={submit} className="card space-y-4 p-6"><div className="grid gap-4 sm:grid-cols-2"><Field label={<PublicText>Your name</PublicText>}><Input name="name" defaultValue={user?.name || ''} required maxLength={160}/></Field><Field label={<PublicText>Mobile number</PublicText>}><Input name="mobile" defaultValue={user?.mobile_e164 || ''} inputMode="tel" maxLength={20}/></Field></div><Field label={<PublicText>Email</PublicText>} hint={<PublicText>Give a mobile number or an email so we can reply.</PublicText>}><Input name="email" type="email" defaultValue={user?.email || ''}/></Field><Field label={<PublicText>How can we help?</PublicText>}><textarea name="message" className="input" rows={5} minLength={10} maxLength={4000} required placeholder="Booking code, temple name and what went wrong"/></Field>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="btn-p" disabled={busy}>{busy ? <PublicText>Sending…</PublicText> : <PublicText>Raise support ticket</PublicText>}</button></form>
}
