import { API_ORIGIN } from './api.js'

const TOKEN_KEY = 'ta-phase1-auth'
let refreshPromise = null

export function readAuth() {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(window.localStorage.getItem(TOKEN_KEY) || 'null') } catch { return null }
}

export function hasAuthSession() {
  return Boolean(readAuth()?.access)
}

export function subscribeAuth(listener) {
  const onStorage = event => {
    if (event.key === TOKEN_KEY || event.key === null) listener()
  }
  window.addEventListener('ta:auth', listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('ta:auth', listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function saveAuth(auth) {
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(auth))
  window.dispatchEvent(new Event('ta:auth'))
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event('ta:auth'))
}

export function safeNextPath(value, fallback = '/account') {
  // Browsers read a backslash as a slash, so /\\evil.com would leave the site.
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !/[\\\s\u0000-\u001f]/.test(value) ? value : fallback
}

function messageFrom(payload, status) {
  const source = payload?.error?.fields || payload
  if (typeof payload?.error?.message === 'string') return payload.error.message
  if (typeof payload?.detail === 'string') return payload.detail
  if (typeof source === 'object' && source) {
    const value = Object.values(source).flat(Infinity).find(item => typeof item === 'string')
    if (value) return value
  }
  return `Request failed (${status})`
}

async function request(path, options, access) {
  const { method = 'GET', body, headers = {}, auth = true } = options
  let device = ''
  if (typeof window !== 'undefined') {
    device = window.localStorage.getItem('ta-device-id') || crypto.randomUUID()
    window.localStorage.setItem('ta-device-id', device)
  }
  return fetch(`${API_ORIGIN.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(device ? { 'X-Device-ID': device } : {}),
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(auth && access ? { Authorization: `Bearer ${access}` } : {}),
      ...headers,
    },
    body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    cache: 'no-store',
  })
}

async function refreshAccess() {
  if (refreshPromise) return refreshPromise
  const session = readAuth()
  refreshPromise = (async () => {
    if (!session?.refresh) throw new Error('Your session has expired. Please sign in again.')
    const response = await request('auth/token/refresh', { method: 'POST', auth: false, body: { refresh: session.refresh } })
    const payload = await response.json().catch(() => null)
    const data = payload?.data ?? payload
    if (!response.ok || !data?.access) throw new Error('Your session has expired. Please sign in again.')
    if (readAuth()?.refresh !== session.refresh) throw new Error('The session changed. Please sign in again.')
    const updated = { ...session, ...data, access: data.access, refresh: data.refresh || session.refresh }
    saveAuth(updated)
    return updated.access
  })().catch(error => { if (readAuth()?.refresh === session?.refresh) clearAuth(); throw error }).finally(() => { refreshPromise = null })
  return refreshPromise
}

export async function clientApi(path, options = {}) {
  const auth = options.auth !== false
  let session = readAuth()
  let response = await request(path, options, session?.access)
  if (auth && response.status === 401 && session?.refresh) {
    const access = await refreshAccess()
    response = await request(path, options, access)
  }
  if (options.responseType === 'blob' && response.ok) return response.blob()
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(messageFrom(payload, response.status))
    error.status = response.status
    error.fields = payload?.error?.fields || {}
    throw error
  }
  return payload?.data ?? payload
}

export async function logout() {
  const session = readAuth()
  try {
    if (session?.access) await clientApi('auth/logout', { method: 'POST', body: { refresh: session.refresh } })
  } finally {
    clearAuth()
  }
}

// Google and mobile OTP are independent sign-in factors; a Google devotee may add a mobile later from the account page.
export function canLinkMobile(user) {
  return Boolean(user?.google_verified_at && !user.mobile_verified_at && !user.is_staff)
}

// A mobile-OTP devotee may also link Google, so either factor signs in to the same account.
export function canLinkGoogle(user) {
  return Boolean(user?.mobile_verified_at && !user.google_verified_at && !user.is_staff)
}

export function isVerifiedUser(user) {
  return Boolean(user?.mobile_verified_at || user?.google_verified_at)
}

export function requireAuth(router, next, { verified = false } = {}) {
  const auth = readAuth()
  if (!auth?.access || (verified && !isVerifiedUser(auth.user))) {
    router.push(`/login?next=${encodeURIComponent(next || window.location.pathname)}`)
    return null
  }
  return auth
}
