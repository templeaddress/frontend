import { apiUrl, browserApiRoot } from './api-url.js'

const serverOrigin = process.env.TEMPLEADDRESS_API_URL || 'http://127.0.0.1:8000'

export const API_ORIGIN = typeof window === 'undefined'
  ? serverOrigin
  : browserApiRoot(process.env.NEXT_PUBLIC_API_URL)

// Server-only: all page renders come from one address, so they identify themselves instead of sharing a rate limit.
const ssrHeaders = () => (typeof window === 'undefined' && process.env.SSR_API_KEY ? { 'X-SSR-Key': process.env.SSR_API_KEY } : {})

export async function apiFetch(path, options = {}) {
  const url = typeof window === 'undefined'
    ? apiUrl(API_ORIGIN, path)
    : `${API_ORIGIN.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...ssrHeaders(), ...options.headers },
    next: options.next ?? { revalidate: 300 },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(body?.error?.message || `TempleAddress API returned ${response.status}`)
    error.status = response.status
    error.payload = body
    throw error
  }
  return body?.data ?? body
}

export const getPublishedListings = (params = '') => apiFetch(`listings${params ? `?${params}` : ''}`)
export const getListing = (slug) => apiFetch(`listings/${encodeURIComponent(slug)}`)
