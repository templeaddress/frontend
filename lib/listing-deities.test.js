import test from 'node:test'
import assert from 'node:assert/strict'
import { listingDeities } from './listing-deities.js'

const masters = [{ code: 'SHIVA', name_en: 'Lord Shiva', name_ml: 'ശിവൻ' }]

test('main deity is linked and selected sub-deities retain their order', () => {
  assert.deepEqual(listingDeities('Lord Shiva', [{ code: 'GANESH' }, { custom_name: 'Local deity' }], masters), [
    { code: 'SHIVA', is_primary: true, sort_order: 0 },
    { code: 'GANESH', is_primary: false, sort_order: 1 },
    { custom_name: 'Local deity', is_primary: false, sort_order: 2 },
  ])
})

test('main deity matches Malayalam and is removed from sub-deities', () => {
  assert.deepEqual(listingDeities('ശിവൻ', [{ code: 'SHIVA' }], masters), [{ code: 'SHIVA', is_primary: true, sort_order: 0 }])
})

test('free-text main deity uses the existing approval contract', () => {
  assert.deepEqual(listingDeities(' Local   deity ', [{ custom_name: 'Local deity' }], masters), [{ custom_name: 'Local deity', is_primary: true, sort_order: 0 }])
})
