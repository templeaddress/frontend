import { listingPath } from './catalogue.js'

export function normalizePartnerApplication(value) {
  // The existing API represents an absent application as an empty object.
  if (value == null || (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)) return null
  return { ...value, documents: Array.isArray(value.documents) ? value.documents : [], history: Array.isArray(value.history) ? value.history : [] }
}

export function partnerSharePath(code, listing, destination = 'sponsor') {
  const query = new URLSearchParams({ ref: code })
  if (destination === 'signup') {
    if (listing) query.set('next', `${listingPath(listing)}?${new URLSearchParams({ ref: code })}`)
    return `/register?${query}`
  }
  if (destination === 'listing' && listing) return `${listingPath(listing)}?${query}`
  if (listing) query.set('slug', listing.slug)
  return `/sponsor?${query}`
}

export function sponsorReturnPath(queryString, listing, referral, kind, checkout = {}) {
  const query = new URLSearchParams(queryString)
  if (listing?.slug) { query.set('slug', listing.slug); query.delete('listing') }
  else if (listing?.uuid) query.set('listing', listing.uuid)
  if (referral.trim()) query.set('ref', referral.trim())
  else query.delete('ref')
  query.set('kind', kind)
  if (checkout.product) query.set('product', checkout.product)
  if (checkout.method) query.set('method', checkout.method)
  return `/sponsor?${query}`
}

export function downloadPartnerFile(blob, filename) {
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadPartnerId(profile) {
  // Build text nodes so names and codes cannot inject SVG markup into a downloaded card.
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('xmlns', ns); svg.setAttribute('viewBox', '0 0 900 480')
  function node(tag, attributes, text) {
    const element = document.createElementNS(ns, tag)
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
    if (text) element.textContent = text
    svg.appendChild(element)
  }
  node('rect', { width: 900, height: 480, rx: 24, fill: '#2e2019' })
  const rows = ['TempleAddress', 'FIELD PARTNER', profile.name, `Partner ID: ${profile.code}`, `Status: ${profile.status}`, `Dealer: ${profile.dealer_code || 'Direct partner'}`, `KYC: ${profile.kyc_status}`]
  rows.forEach((text, index) => node('text', { x: 45, y: 65 + index * 54, fill: index === 0 || index === 2 ? '#ffffff' : '#e4c77a', 'font-family': 'sans-serif', 'font-size': index === 0 ? 34 : 23 }, text))
  downloadPartnerFile(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }), `TempleAddress-${profile.code}-ID.svg`)
}
