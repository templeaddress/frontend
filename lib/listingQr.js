// QR records live in browser localStorage — all functions are browser-only.
// Guards added so this file can be imported server-side without crashing
// (e.g. for SSG pages that conditionally call these at runtime).
export const LISTING_QR_PREFIX = 'ta:listing-qr:v1:'

export function listingQrKey(code) {
  if (typeof code !== 'string' || !code.trim()) throw new Error('A listing code is required.')
  return `${LISTING_QR_PREFIX}${code}`
}

/**
 * Build the canonical public URL for a temple.
 * In Next.js we use real path routing (no hash), so the URL is /t/<slug>.
 */
export function templePageUrl(temple, baseUrl = typeof window !== 'undefined' ? `${window.location.origin}` : 'https://templeaddress.com') {
  if (!temple?.slug) throw new Error('A public temple page is required.')
  const url = new URL(baseUrl)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Open the hosted website to generate a temple QR.')
  url.pathname = `/t/${encodeURIComponent(temple.slug)}`
  return url.href
}

export function readListingQr(code, storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage) return null
  const saved = storage.getItem(listingQrKey(code))
  if (saved === null) return null
  const record = JSON.parse(saved)
  const url = new URL(record.targetUrl)
  if (record.version !== 1 || record.listingCode !== code || !['http:', 'https:'].includes(url.protocol) || !Number.isFinite(Date.parse(record.generatedAt))) {
    throw new Error('The saved listing QR is invalid. It cannot be replaced automatically.')
  }
  return record
}

// Repeated requests return the original record even if the listing slug has changed.
// Never replace an existing record or claim success when browser storage fails.
export function generateListingQr(temple, storage = typeof window !== 'undefined' ? window.localStorage : null, baseUrl = undefined) {
  if (!storage) return null
  const existing = readListingQr(temple.code, storage)
  if (existing) return existing
  const record = {
    version: 1,
    listingCode: temple.code,
    targetUrl: templePageUrl(temple, baseUrl),
    generatedAt: new Date().toISOString(),
  }
  storage.setItem(listingQrKey(temple.code), JSON.stringify(record))
  return record
}
