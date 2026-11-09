import test from 'node:test'
import assert from 'node:assert/strict'
import { filterListings, listingFacets } from './listing-search.js'

const listings = [
  { code: 'T2', name_en: 'Shiva Temple', name_ml: 'ശിവ ക്ഷേത്രം', address: 'Kannur', main_deity: 'Shiva', district: { name_en: 'Kannur' }, category: { name_en: 'Temple' }, booking_enabled: false },
  { code: 'T1', name_en: 'Vishnu Temple', address: 'Kozhikode', main_deity: 'Vishnu', district: { name_en: 'Kozhikode' }, category: { name_en: 'Temple' }, booking_enabled: true },
]

test('listing search covers names, codes, address, deity and district', () => {
  assert.equal(filterListings(listings, { query: 'T1' })[0].name_en, 'Vishnu Temple')
  assert.equal(filterListings(listings, { query: 'kannur' })[0].name_en, 'Shiva Temple')
  assert.equal(filterListings(listings, { query: 'Vishnu' })[0].code, 'T1')
})

test('listing filters and ordering are deterministic', () => {
  assert.deepEqual(filterListings(listings, { bookable: true }).map(row => row.code), ['T1'])
  assert.deepEqual(filterListings(listings, { district: 'Kannur' }).map(row => row.code), ['T2'])
  assert.deepEqual(filterListings(listings, { sort: 'name_desc' }).map(row => row.code), ['T1', 'T2'])
  assert.deepEqual(listingFacets(listings, 'district'), ['Kannur', 'Kozhikode'])
})
