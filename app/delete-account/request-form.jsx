'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/client-api'
import PublicText from '@/components/PublicText'

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

  if (done) return <p className="mt-6" role="status"><PublicText>If an account matches this number, your request has been recorded for review.</PublicText></p>
  return <form className="mt-8 space-y-4" onSubmit={submit}>
    <label className="block"><PublicText>Registered mobile number with country code</PublicText><input className="input mt-1 w-full" type="tel" required placeholder="+919876543210" value={mobile} onChange={e => { setMobile(e.target.value); setChallenge(null); setOtp('') }} /></label>
    <label className="block"><PublicText>Account holder name (optional)</PublicText><input className="input mt-1 w-full" maxLength={160} value={name} onChange={e => setName(e.target.value)} /></label>
    <label className="block"><PublicText>Reason for deletion (optional)</PublicText><textarea className="input mt-1 w-full" maxLength={4000} value={reason} onChange={e => setReason(e.target.value)} /></label>
    <label className="flex items-start gap-2"><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> <PublicText>I confirm that I want to request deletion of my account.</PublicText></label>
    {challenge && <label className="block"><PublicText>Verification code</PublicText><input className="input mt-1 w-full" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value)} /></label>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <button className="btn-p" disabled={busy} type="submit">{busy ? <PublicText>Please wait…</PublicText> : challenge ? <PublicText>Submit Request</PublicText> : <PublicText>Send verification code</PublicText>}</button>
  </form>
}
