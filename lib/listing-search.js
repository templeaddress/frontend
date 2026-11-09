function label(value) {
  return typeof value === 'string' ? value : value?.name_en || ''
}

export function listingFacet(listing, key) {
  return label(listing?.[key]).trim()
}

export function listingFacets(listings, key) {
  return [...new Set(listings.map(listing => listingFacet(listing, key)).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right))
}

export function filterListings(listings, filters = {}) {
  const query = String(filters.query || '').trim().toLocaleLowerCase()
  const district = String(filters.district || '')
  const deity = String(filters.deity || '')
  const category = String(filters.category || '')

  const rows = listings.filter(listing => {
    const searchable = [
      listing.name_en, listing.name_ml, listing.code, listing.address,
      listing.main_deity, listingFacet(listing, 'district'), listingFacet(listing, 'category'),
    ].filter(Boolean).join(' ').toLocaleLowerCase()

    return (!query || searchable.includes(query))
      && (!district || listingFacet(listing, 'district') === district)
      && (!deity || String(listing.main_deity || '').trim() === deity)
      && (!category || listingFacet(listing, 'category') === category)
      && (!filters.bookable || listing.booking_enabled)
  })

  return [...rows].sort((left, right) => {
    const order = String(left.name_en || '').localeCompare(String(right.name_en || ''))
    return filters.sort === 'name_desc' ? -order : order
  })
}
