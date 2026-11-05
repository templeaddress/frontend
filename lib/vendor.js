export const vendorBases = { temple: '/vendor', festival: '/festival-admin', service: '/service-admin' }
export const vendorKind = listing => ['festival', 'service'].includes(listing?.listing_type) ? listing.listing_type : 'temple'
export const canManageVendor = listing => Boolean(listing?.can_manage_content || ['owner', 'admin'].includes(listing?.membership_role))

export function vendorLanding(rows, saved) {
  if (!Array.isArray(rows)) return null
  const listings = rows.filter(row => row?.uuid && vendorBases[row.listing_type])
  const selected = listings.find(row => row.uuid === saved) || listings[0]
  return selected ? vendorBases[selected.listing_type] : null
}

export function selectVendorListing(rows, kind, saved) {
  const matches = rows.filter(row => vendorKind(row) === kind)
  return matches.find(row => row.uuid === saved) || matches[0] || null
}

export function reportQuery(values, page = 1) {
  return new URLSearchParams({ ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '' && value != null)), page: String(page), page_size: '25' })
}

export function istDateTime(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Enter a valid date and time in IST.')
  const date = new Date(`${value}:00+05:30`)
  if (Number.isNaN(date.getTime())) throw new Error('Enter a valid date and time in IST.')
  return date.toISOString()
}

export function availabilityDraft(data) {
  return { days: Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => [day, (data.days[day] || []).map(window => [...window])])), slot_minutes: data.slot_minutes, modes: [...data.modes] }
}

export function downloadVendorFile(blob, filename) {
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
