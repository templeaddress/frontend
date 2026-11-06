'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PublicShell, Field, Input, TempleMark } from '@/components/ui'
import { canLinkMobile, clientApi, readAuth, safeNextPath, saveAuth } from '@/lib/client-api'
import OtpInput from './OtpInput'
import styles from './Template.module.css'
import { cleanMobile, mobileError, mobileLimits, validMobile } from '@/lib/auth-phone'
import { signupReferralCode } from '@/lib/referral'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
import { rolesFor, staffNext } from '@/lib/staff-access'

const countryOptions = ['+91', '+971', '+968', '+1', '+44']

function mobileIdentifier(countryCode, value) {
  return `${countryCode}${value}`
}

// The original Login/Register panel uses the current verified-login API for account creation.
// Staff password challenges and CAPTCHA requirements are always decided by the server.
export default function Phase1Login({ initialMode = 'login' }) {
  const router = useRouter()
  const params = useSearchParams()
  const googleButton = useRef(null)
  const recaptchaBox = useRef(null)
  const recaptchaWidget = useRef(null)
  const recaptchaPolicy = useRef(null)
  const [mode, setMode] = useState(initialMode)
  const [step, setStep] = useState('identify')
  const [countryCode, setCountryCode] = useState('+91')
  const [identifier, setIdentifier] = useState('')
  const [activeIdentifier, setActiveIdentifier] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginChallenge, setLoginChallenge] = useState('')
  const [otpChallenge, setOtpChallenge] = useState(null)
  const [code, setCode] = useState('')
  const [googleSignup, setGoogleSignup] = useState(null)
  const [pendingSession, setPendingSession] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [recaptchaRequired, setRecaptchaRequired] = useState(null)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const destination = safeNextPath(params.get('next') || params.get('redirect'), '/account')
  const referralCode = signupReferralCode(params.toString())
  const switchQuery = new URLSearchParams({ ...(destination !== '/account' ? { next: destination } : {}), ...(referralCode ? { ref: referralCode } : {}) }).toString()
  const linkRequested = params.get('link') === 'mobile'
  const linkingMobile = step === 'google_mobile' || step === 'google_mobile_otp'
  const verifyingOtp = step === 'otp' || step === 'google_mobile_otp'
  const showCaptcha = step === 'identify' && recaptchaRequired === true
  const phoneValid = validMobile(identifier, countryCode)
  const phoneLimits = mobileLimits(countryCode)

  // Google sign-in completes on its own. The mobile step only runs when a Google devotee asks to add one (/login?link=mobile).
  const finish = useCallback((result, { linkMobile = false } = {}) => {
    saveAuth(result)
    if (linkMobile && canLinkMobile(result.user)) {
      setName(result.user.name || ''); setEmail(result.user.email || '')
      const mobileCountry = countryOptions.find(code => result.user.mobile_e164?.startsWith(code)) || '+91'
      setCountryCode(mobileCountry); setIdentifier(cleanMobile(result.user.mobile_e164 || '', mobileCountry)); setActiveIdentifier('')
      setOtpChallenge(null); setCode(''); setStep('google_mobile')
      setRecaptchaRequired(false); setRecaptchaToken(''); setNotice('')
      return
    }
    if (!result.user?.name && !rolesFor(result.user).length && !result.user?.is_staff) { setPendingSession(result); setEmail(result.user?.email || ''); setStep('profile'); return }
    router.replace(rolesFor(result.user).length ? staffNext(result.user, destination) : destination)
    router.refresh()
  }, [destination, router])

  function reset() {
    setStep('identify'); setError(''); setNotice(''); setPassword('')
    setLoginChallenge(''); setOtpChallenge(null); setCode(''); setGoogleSignup(null)
    setRecaptchaRequired(recaptchaPolicy.current); setRecaptchaToken('')
    if (recaptchaWidget.current !== null) window.grecaptcha?.reset(recaptchaWidget.current)
  }

  useEffect(() => {
    const session = readAuth()
    if (session?.access) finish(session, { linkMobile: linkRequested })
  }, [finish, linkRequested])

  useEffect(() => {
    let active = true
    clientApi('config', { auth: false }).then(config => {
      if (!active) return
      const required = typeof config.auth_recaptcha_required === 'boolean' ? config.auth_recaptcha_required : Boolean(RECAPTCHA_SITE_KEY)
      recaptchaPolicy.current = required
      setRecaptchaRequired(required)
    }).catch(() => { if (active) setError('Could not load sign-in verification. Please refresh and try again.') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!seconds) return
    const timer = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [seconds])

  useEffect(() => {
    if (!showCaptcha || !RECAPTCHA_SITE_KEY || !recaptchaBox.current) return
    let active = true
    const render = () => window.grecaptcha?.ready(() => {
      if (!active || !recaptchaBox.current || recaptchaWidget.current !== null) return
      recaptchaWidget.current = window.grecaptcha.render(recaptchaBox.current, { sitekey: RECAPTCHA_SITE_KEY, callback: token => setRecaptchaToken(token), 'expired-callback': () => setRecaptchaToken(''), 'error-callback': () => setRecaptchaToken('') })
    })
    let script
    if (window.grecaptcha) render()
    else {
      script = document.createElement('script')
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'; script.async = true; script.defer = true; script.onload = render
      document.head.appendChild(script)
    }
    return () => { active = false; script?.remove(); recaptchaWidget.current = null }
  }, [showCaptcha])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || step !== 'identify') return
    const setup = () => {
      if (!window.google?.accounts?.id || !googleButton.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setBusy(true); setError('')
          try {
            const result = await clientApi('auth/google', { method: 'POST', auth: false, body: { provider: 'google', credential, ...(referralCode ? { referral_code: referralCode } : {}) } })
            if (result.profile_completion_required) {
              setGoogleSignup(result); setName(result.google_profile?.name || ''); setEmail(result.google_profile?.email || ''); setIdentifier(''); setStep('google_profile')
            } else finish(result)
          } catch (err) { setError(err.message) } finally { setBusy(false) }
        },
      })
      googleButton.current.replaceChildren()
      window.google.accounts.id.renderButton(googleButton.current, { theme: 'outline', size: 'large', width: 280, shape: 'pill', text: mode === 'register' ? 'signup_with' : 'signin_with', locale: 'en' })
    }
    if (window.google?.accounts?.id) setup()
    else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client?hl=en'; script.async = true; script.defer = true; script.onload = setup
      document.head.appendChild(script)
      return () => script.remove()
    }
  }, [finish, step, mode, referralCode])

  async function requestOtp({ staffPassword = '', channel = '' } = {}) {
    if (busy) return
    if (step === 'identify') {
      if (!phoneValid) { setError(mobileError(countryCode)); return }
      if (recaptchaRequired === null || (recaptchaRequired && !recaptchaToken)) return
    }
    setBusy(true); setError(''); setNotice('')
    try {
      const normalized = activeIdentifier || mobileIdentifier(countryCode, identifier)
      const result = await clientApi('auth/otp/request', {
        method: 'POST', auth: false,
        body: { identifier: normalized, country_code: countryCode, password: staffPassword || undefined, login_challenge_token: loginChallenge || undefined, recaptcha_token: recaptchaToken, ...(channel ? { channel } : {}), ...(referralCode ? { referral_code: referralCode } : {}) },
      })
      if (result.recaptcha_required) { recaptchaPolicy.current = true; setRecaptchaRequired(true); setStep('identify'); setNotice('Complete reCAPTCHA, then continue.'); return }
      if (result.password_required) { setRecaptchaRequired(false); setRecaptchaToken(''); setActiveIdentifier(normalized); setLoginChallenge(result.login_challenge_token); setStep('password'); return }
      if (result.otp_sent) {
        setRecaptchaRequired(false); setRecaptchaToken('')
        setActiveIdentifier(result.identifier || normalized); setOtpChallenge(result); setCode(result.debug_otp || ''); setStep('otp'); setSeconds(30)
        if (channel) setNotice(`OTP sent via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}.`)
      }
    } catch (err) {
      setError(err.message)
      if (recaptchaWidget.current !== null) window.grecaptcha?.reset(recaptchaWidget.current)
      setRecaptchaToken('')
    } finally { setBusy(false) }
  }

  async function verify(event) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await clientApi(linkingMobile ? 'auth/mobile-link/verify' : 'auth/otp/verify', {
        method: 'POST', auth: linkingMobile,
        body: { identifier: activeIdentifier, otp: code, challenge_uuid: otpChallenge?.challenge_uuid, country_code: countryCode, ...(!linkingMobile && !loginChallenge && mode === 'register' ? { profile: { name: name.trim(), ...(email ? { email: email.trim() } : {}) } } : {}) },
      })
      if (linkingMobile) {
        const session = readAuth()
        if (!session?.access || session.user?.uuid !== result.uuid) throw new Error('Your session changed. Please sign in again.')
        finish({ ...session, user: result })
      } else finish(result)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function saveProfile(event) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const user = await clientApi('me', { method: 'PATCH', body: { name: name.trim(), ...(email ? { email } : {}) } })
      finish({ ...pendingSession, user: { ...pendingSession.user, ...user } })
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function requestMobile(event) {
    event?.preventDefault()
    if (!phoneValid) { setError(mobileError(countryCode)); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await clientApi('auth/mobile-link/request', { method: 'POST', body: { mobile_number: identifier, country_code: countryCode } })
      setActiveIdentifier(result.identifier); setOtpChallenge(result); setCode(result.debug_otp || '')
      setStep('google_mobile_otp'); setSeconds(30)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function completeGoogle(event) {
    event.preventDefault()
    if (!phoneValid) { setError(mobileError(countryCode)); return }
    setBusy(true); setError('')
    try { finish(await clientApi('auth/google', { method: 'POST', auth: false, body: { provider: 'google', signup_token: googleSignup.signup_token, country_code: countryCode, mobile_number: identifier, ...(referralCode ? { referral_code: referralCode } : {}) } })) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  function resend(channel = '') {
    if (seconds) return
    if (linkingMobile) return requestMobile()
    return requestOtp({ staffPassword: loginChallenge ? password : '', channel })
  }

  const submit = step === 'profile' ? saveProfile : verifyingOtp ? verify : step === 'google_mobile' ? requestMobile : step === 'google_profile' ? completeGoogle
    : event => { event.preventDefault(); requestOtp({ staffPassword: step === 'password' ? password : '' }) }
  function updateMobile(value) { setIdentifier(cleanMobile(value, countryCode)); setActiveIdentifier('') }
  const mobileField = <div className="flex items-end gap-2"><Field label="Country code" className="w-24 shrink-0"><select aria-label="Country code" className="input" value={countryCode} onChange={event => { setCountryCode(event.target.value); setIdentifier(cleanMobile(identifier, event.target.value)); setActiveIdentifier('') }} disabled={verifyingOtp || busy}>{countryOptions.map(value => <option key={value}>{value}</option>)}</select></Field><Field label="Mobile number" className="min-w-0 flex-1" hint={identifier && !phoneValid && !verifyingOtp ? mobileError(countryCode) : undefined}><Input type="tel" value={verifyingOtp ? identifier || activeIdentifier : identifier} onChange={event => updateMobile(event.target.value)} onPaste={event => { event.preventDefault(); updateMobile(event.clipboardData.getData('text')) }} inputMode="numeric" autoComplete="tel-national" minLength={phoneLimits.min} maxLength={phoneLimits.max} pattern={`[0-9]{${phoneLimits.min},${phoneLimits.max}}`} placeholder="Mobile number" required disabled={verifyingOtp || busy}/></Field></div>

  return <PublicShell><main className={styles.authPage}>
    <div className={styles.authPanel}>
    <header className={styles.authHeader}><h1>{step === 'profile' ? 'Welcome to TempleAddress' : linkingMobile ? 'Add your mobile' : step === 'google_profile' ? 'Complete Google sign-in' : 'Please login to continue'}</h1><TempleMark size={32}/></header>
    <div className={styles.authBody}>
    {step === 'identify' && <nav className={styles.authToggle} aria-label="Account access">{['login', 'register'].map(value => <a key={value} href={`/${value}${switchQuery ? `?${switchQuery}` : ''}`} aria-current={mode === value ? 'page' : undefined} className={mode === value ? styles.selected : undefined} onClick={event => { event.preventDefault(); reset(); setMode(value); setName(''); setEmail('') }}>{value === 'login' ? 'Login' : 'Register'}</a>)}</nav>}
    <form onSubmit={submit} className="space-y-4">
      {step === 'identify' && <p className={styles.hint}>{mode === 'register' ? 'Create account and verify with OTP.' : 'Use your mobile number to receive OTP.'}</p>}
      {step === 'identify' && mode === 'register' && <Field label="Full name"><Input value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={160} autoComplete="name" placeholder="Enter your name" required disabled={busy}/></Field>}
      {step === 'profile' && <><p className="text-sm text-brown-500">{pendingSession?.user?.mobile_verified_at ? 'Your mobile is verified.' : 'You are signed in with Google.'} Tell us your name once; it is used as the devotee name for your bookings and can be changed later.</p><Field label="Your name"><Input value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={160} required autoFocus/></Field><Field label="Email" hint="Optional, for receipts"><Input type="email" value={email} onChange={event => setEmail(event.target.value)}/></Field></>}
      {(step === 'identify' || step === 'otp') && mobileField}
      {step === 'identify' && mode === 'register' && <Field label="Email (optional)"><Input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={busy}/></Field>}
      {(step === 'google_profile' || step === 'google_mobile' || step === 'google_mobile_otp') && <>{linkingMobile ? <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">Signed in with Google as {email || name}. Add a mobile number to receive booking updates by WhatsApp and SMS. It is optional.</p> : <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800"><b>{name}</b><br/>{email}<br/><span className="text-xs">Add a mobile number for bookings and account recovery.</span></div>}{mobileField}</>}
      {step === 'password' && <><p className="text-sm text-brown-500">{activeIdentifier}</p><Field label="Staff password" hint="Staff accounts need a password and an OTP."><Input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required autoFocus/></Field></>}
      {verifyingOtp && <OtpInput value={code} onChange={setCode} disabled={busy} label="Enter the 6-digit code" hint={otpChallenge?.debug_otp ? `Local test OTP: ${otpChallenge.debug_otp}` : `Sent to ${otpChallenge?.destination || activeIdentifier}`}/>}
      {step === 'identify' && recaptchaRequired === null && <p role="status" className={styles.hint}>Loading verification…</p>}
      {showCaptcha && <div><div ref={recaptchaBox}/>{!RECAPTCHA_SITE_KEY && <p role="alert" className="text-sm text-red-700">reCAPTCHA site key is not configured.</p>}</div>}
      {notice && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{notice}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy || (step === 'identify' && (!phoneValid || recaptchaRequired === null || (recaptchaRequired && !recaptchaToken))) || ((step === 'google_profile' || step === 'google_mobile') && !phoneValid) || (verifyingOtp && code.length !== 6)} className="btn-p w-full">{busy ? 'Please wait…' : step === 'profile' ? 'Save and continue' : verifyingOtp ? 'Verify & continue' : step === 'google_mobile' ? 'Send OTP' : step === 'password' ? 'Continue to OTP' : step === 'google_profile' ? 'Complete sign-in' : 'Continue'}</button>
      {verifyingOtp && <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><button type="button" disabled={busy} onClick={() => { if (linkingMobile) { setStep('google_mobile'); setCode(''); setError('') } else reset() }} className="text-saffron-700 underline">Change number</button>
        {seconds ? <span className="text-brown-500">Resend in {seconds}s</span> : <span className="flex gap-3"><button type="button" disabled={busy} onClick={() => resend()} className="text-saffron-700 underline">Resend</button>{!linkingMobile && <button type="button" disabled={busy} onClick={() => resend('whatsapp')} className="text-saffron-700 underline">Send via WhatsApp</button>}</span>}</div>}
      {(step === 'password' || step === 'google_profile') && <button type="button" onClick={reset} className="btn-g w-full">Back</button>}
      {step === 'google_mobile' && <button type="button" disabled={busy} onClick={() => { router.replace(destination); router.refresh() }} className="btn-g w-full">Skip for now</button>}
      {step === 'identify' && GOOGLE_CLIENT_ID && <><div className="flex items-center gap-3 text-xs text-brown-400"><span className="h-px flex-1 bg-brown-100"/>OR<span className="h-px flex-1 bg-brown-100"/></div><div className={styles.googleCard}><p className={styles.hint}>Use Google as an alternative to phone OTP {mode === 'register' ? 'signup' : 'login'}.</p><div className="flex justify-center" ref={googleButton}/></div></>}
    </form>
    {step === 'identify' && <div className="mt-5 space-y-3 text-center text-sm"><Link href="/staff/login" className="block text-saffron-700 underline">Staff sign in</Link><p className={styles.hint}>Submitting a temple&apos;s basic details? <Link href="/submit-temple" className="text-saffron-700 underline">Use the public form</Link>.</p></div>}
    </div></div>
    <p className="mt-5 text-center text-sm"><Link href="/temples" className="text-saffron-700">Continue browsing without login</Link></p>
  </main></PublicShell>
}
//