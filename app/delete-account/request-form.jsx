'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/client-api'

export default function DeleteAccountForm() {
  const [mobile, setMobile] = useState('')
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [challenge, setChallenge] = useState(null)
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (!challenge) {
        const result = await clientApi('account-deletion/otp', { method: 'POST', auth: false, body: { identifier: mobile } })
        setChallenge(result.challenge_uuid)
      } else {
        await clientApi('account-deletion/request', { method: 'POST', auth: false, body: { identifier: mobile, challenge_uuid: challenge, otp, name, reason, confirm: confirmed } })
        setDone(true)
      }
    } catch (err) { setError(err.message || 'Unable to submit. Please try again.') }
    finally { setBusy(false) }
  }

  if (done) return <p className="mt-6" role="status">If an account matches this number, your request has been recorded for review.</p>
  return <form className="mt-8 space-y-4" onSubmit={submit}>
    <label className="block">Registered mobile number with country code<input className="input mt-1 w-full" type="tel" required placeholder="+919876543210" value={mobile} onChange={e => { setMobile(e.target.value); setChallenge(null); setOtp('') }} /></label>
    <label className="block">Account holder name (optional)<input className="input mt-1 w-full" maxLength={160} value={name} onChange={e => setName(e.target.value)} /></label>
    <label className="block">Reason for deletion (optional)<textarea className="input mt-1 w-full" maxLength={4000} value={reason} onChange={e => setReason(e.target.value)} /></label>
    <label className="flex items-start gap-2"><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> I confirm that I want to request deletion of my account.</label>
    {challenge && <label className="block">Verification code<input className="input mt-1 w-full" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value)} /></label>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <button className="btn-p" disabled={busy} type="submit">{busy ? 'Please wait…' : challenge ? 'Submit Request' : 'Send verification code'}</button>
  </form>
}
