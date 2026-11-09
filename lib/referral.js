import { safeNextPath } from './client-api.js'

const normalizeCode = value => {
  const code = typeof value === 'string' ? value.trim().toUpperCase() : ''
  return code.length <= 30 && !/[\u0000-\u001f\u007f]/.test(code) ? code : ''
}

export function signupReferralCode(queryString) {
  const query = new URLSearchParams(queryString)
  const destination = safeNextPath(query.get('next') || query.get('redirect'), '')
  return normalizeCode(query.get('ref')) || normalizeCode(new URLSearchParams(destination.split('?')[1] || '').get('ref'))
}

export function referralLoginPath(pathname, queryString) {
  const query = new URLSearchParams(queryString), code = signupReferralCode(queryString)
  if (!code) return '/login'
  const next = ['/login', '/register'].includes(pathname)
    ? safeNextPath(query.get('next') || query.get('redirect'), '/account')
    : safeNextPath(`${pathname}${query.size ? `?${query}` : ''}`, '/account')
  return `/login?${new URLSearchParams({ ref: code, next })}`
}
