'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Field, Input, PublicShell, TempleMark } from '@/components/ui'
import { clientApi, saveAuth } from '@/lib/client-api'
import { canUseStaff, staffNext, staffRoles } from '@/lib/staff-access'
import OtpInput from './OtpInput'
import styles from './Template.module.css'

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
const countryOptions = ['+91', '+971', '+968', '+1', '+44']
export default function StaffLogin() {
  const router = useRouter(), params = useSearchParams(), captchaBox = useRef(null)
  const captchaWidget = useRef(null), passwordChallenge = useRef(''), captchaPolicy = useRef(null)
  const verificationPending = useRef(false)
  const [countryCode, setCountryCode] = useState('+91')
  const [role, setRole] = useState('moderator'), [identifier, setIdentifier] = useState(''), [password, setPassword] = useState('')
  const [method, setMethod] = useState('otp'), [challenge, setChallenge] = useState(null), [code, setCode] = useState('')
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [seconds, setSeconds] = useState(0)
  const [captchaRequired, setCaptchaRequired] = useState(null), [captchaToken, setCaptchaToken] = useState('')
  useEffect(() => {
    let active = true
    clientApi('config', { auth: false }).then(config => {
      if (!active) return
      const required = typeof config.auth_recaptcha_required === 'boolean' ? config.auth_recaptcha_required : Boolean(siteKey)
      captchaPolicy.current = required
      setCaptchaRequired(required)
    }).catch(() => { if (active) setError('Could not load sign-in verification. Please refresh and try again.') })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!seconds) return
    const timer = window.setTimeout(() => setSeconds(value => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds])
  useEffect(() => {
    if (!captchaRequired || !siteKey) return
    let active = true
    const render = () => window.grecaptcha?.ready(() => {
      if (!active || !captchaBox.current || captchaWidget.current !== null) return
      captchaWidget.current = window.grecaptcha.render(captchaBox.current, { sitekey: siteKey, callback: setCaptchaToken, 'expired-callback': () => setCaptchaToken(''), 'error-callback': () => setCaptchaToken('') })
    })
    let script
    if (window.grecaptcha) render()
    else { script = document.createElement('script'); script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'; script.async = true; script.onload = render; document.head.appendChild(script) }
    return () => { active = false; script?.remove(); captchaWidget.current = null }
  }, [captchaRequired])
  function resetProof() {
    passwordChallenge.current = ''
    setCaptchaToken('')
    if (captchaWidget.current !== null) window.grecaptcha?.reset(captchaWidget.current)
  }
  async function start(event) {
    event?.preventDefault()
    if (busy) return
    if (!challenge && (captchaRequired === null || (captchaRequired && !captchaToken))) return
    setBusy(true); setError(''); setNotice('')
    try {
      const body = { identifier: identifier.trim(), country_code: countryCode, role, mfa_method: method, recaptcha_token: captchaToken, ...(passwordChallenge.current ? { password, login_challenge_token: passwordChallenge.current } : {}) }
      let result = await clientApi('auth/staff/login', { method: 'POST', auth: false, body })
      if (result.recaptcha_required) { captchaPolicy.current = true; setChallenge(null); setCaptchaRequired(true); setNotice('Complete reCAPTCHA, then continue.'); return }
      if (result.password_required) {
        passwordChallenge.current = result.login_challenge_token
        setCaptchaRequired(false); setCaptchaToken('')
        result = await clientApi('auth/staff/login', { method: 'POST', auth: false, body: { ...body, password, login_challenge_token: result.login_challenge_token } })
      }
      if (!result.otp_sent && !result.mfa_required) throw new Error('Could not start verification. Please try again.')
      setCaptchaRequired(false); setCaptchaToken('')
      setChallenge(result); setCode(''); setSeconds(60)
      setNotice(method === 'totp' ? 'Enter the code from your enrolled authenticator.' : result.debug_otp ? 'Development mode: no SMS or WhatsApp was sent.' : 'Enter the code sent to your registered mobile.')
    } catch (err) {
      setError(err.message); setCaptchaToken('')
      if (captchaWidget.current !== null) window.grecaptcha?.reset(captchaWidget.current)
    } finally { setBusy(false) }
  }
  async function verify(event) {
    event.preventDefault()
    if (busy || verificationPending.current) return
    // Keep the one-time challenge locked until navigation unmounts this form.
    verificationPending.current = true
    setBusy(true); setError('')
    try {
      const result = await clientApi('auth/staff/mfa', { method: 'POST', auth: false, body: { identifier: challenge.identifier || identifier.trim(), otp: code, challenge_uuid: challenge.challenge_uuid, mfa_method: method, login_challenge_token: challenge.login_challenge_token } })
      if (!canUseStaff(result.user, role)) throw new Error('This account is not assigned the selected staff role.')
      saveAuth(result); setPassword('')
      router.replace(staffNext(result.user, params.get('next') || (role === 'accountant' ? '/staff/payouts' : '/staff'))); router.refresh()
    } catch (err) { verificationPending.current = false; setBusy(false); setError(err.message) }
  }
  return <PublicShell><main className={styles.authPage}><div className={styles.authPanel}>
    <header className={styles.authHeader}><h1>{challenge ? 'Verify your identity' : 'Staff sign in'}</h1><TempleMark size={32}/></header>
    <div className={`${styles.authBody} space-y-4`}>
    <p className={styles.hint}>{challenge ? method === 'totp' ? 'Use the code from your enrolled authenticator app.' : challenge.debug_otp ? 'Enter the development test code shown below.' : 'Enter the 6-digit code sent to your registered mobile.' : 'Use your mobile number or email and password to continue.'}</p>
    <form onSubmit={challenge ? verify : start} className="space-y-4">
    {!challenge ? <>
      <div className="flex items-end gap-2"><Field label="Country code" className="w-24 shrink-0"><select aria-label="Country code" className="input" disabled={busy} value={countryCode} onChange={event => { setCountryCode(event.target.value); resetProof() }}>{countryOptions.map(value => <option key={value}>{value}</option>)}</select></Field><Field label="Mobile number or email" className="min-w-0 flex-1"><Input autoComplete="username" required disabled={busy} value={identifier} onChange={event => { setIdentifier(event.target.value); resetProof() }} placeholder="Registered mobile number or email"/></Field></div>
      <Field label="Password"><Input type="password" autoComplete="current-password" required disabled={busy} value={password} onChange={event => setPassword(event.target.value)}/></Field>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Role"><select className="input capitalize" disabled={busy} value={role} onChange={event => { setRole(event.target.value); resetProof() }}>{staffRoles.map(value => <option key={value} value={value}>{value}</option>)}</select></Field><Field label="Verification method"><select className="input" disabled={busy} value={method} onChange={event => { setMethod(event.target.value); resetProof() }}><option value="otp">Mobile OTP</option><option value="totp">Authenticator app</option></select></Field></div>
    </> : <OtpInput value={code} onChange={setCode} disabled={busy} label={method === 'totp' ? 'Authenticator code' : 'Enter the 6-digit code'} hint={method === 'otp' && challenge.debug_otp ? `Development test code: ${challenge.debug_otp}` : undefined}/>}
    {captchaRequired === null && !challenge && <p role="status" className={styles.hint}>Loading verification…</p>}
    {captchaRequired === true && !challenge && <div><div ref={captchaBox}/>{!siteKey && <p role="alert" className="text-sm text-red-700">reCAPTCHA site key is not configured.</p>}</div>}
    {notice && <p role="status" className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{notice}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button className="btn-p w-full" disabled={busy || (challenge ? code.length !== 6 : !identifier.trim() || !password || captchaRequired === null || (captchaRequired && !captchaToken))}>{busy ? 'Please wait…' : challenge ? 'Verify & continue' : 'Continue'}</button></form>
    {challenge && <div className="flex flex-wrap justify-between gap-3 text-sm">{method === 'otp' && <button className="text-saffron-700 underline disabled:opacity-50" disabled={busy || seconds > 0} onClick={start}>{seconds ? `Resend in ${seconds}s` : 'Resend code'}</button>}<button className="text-saffron-700 underline" disabled={busy} onClick={() => { setChallenge(null); setCode(''); setError(''); setNotice(''); setPassword(''); setCaptchaRequired(captchaPolicy.current); resetProof() }}>Back</button></div>}
    <Link className="block text-center text-sm text-saffron-700 underline" href="/login">Devotee sign in</Link>
    </div></div><p className="mt-5 text-center text-sm"><Link href="/temples" className="text-saffron-700">Continue browsing without login</Link></p>
  </main></PublicShell>
}
