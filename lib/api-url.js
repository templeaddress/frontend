/**
 * Return the Django API root for either an origin or an already-versioned URL.
 * Amplify environments may use https://host or https://host/api/v1.
 */
export function apiRoot(origin) {
  const base = String(origin || '').trim().replace(/\/+$/, '')
  if (!base) throw new Error('TEMPLEADDRESS_API_URL is required.')
  return /\/api\/v1$/i.test(base) ? base : `${base}/api/v1`
}

export function apiUrl(origin, path = '') {
  const suffix = String(path).replace(/^\/+/, '')
  return suffix ? `${apiRoot(origin)}/${suffix}` : apiRoot(origin)
}

export function browserApiRoot(origin) {
  const base = String(origin || '').trim().replace(/\/+$/, '')
  if (!base) return '/api/backend'
  return base.startsWith('/') ? base : apiRoot(base)
}
