import test from 'node:test'
import assert from 'node:assert/strict'
import { sponsorItemKey, sponsorshipItems, sponsorshipPreview } from './sponsorship.js'
import { sponsorReturnPath } from './partner.js'

test('plans and packages sharing a code retain distinct purchase identities', () => {
  const rows = sponsorshipItems({ sponsor_packages: [{ code: 'SHARED', duration_days: 365 }], plans: [{ code: 'SHARED', validity_days: 365 }, { code: 'ERP', one_time: true }] })
  assert.deepEqual(rows.map(sponsorItemKey), ['package:SHARED', 'plan:SHARED', 'plan:ERP'])
  assert.equal(rows[2].unit, '/one time')
  assert.deepEqual(rows[0].benefits, [])
})

test('the preview rounds GST to cents and respects a configured zero rate', () => {
  assert.deepEqual(sponsorshipPreview('100.03', '18'), { subtotal: 100.03, tax: 18.01, total: 118.04 })
  assert.deepEqual(sponsorshipPreview('15000', '0'), { subtotal: 15000, tax: 0, total: 15000 })
  assert.deepEqual(sponsorshipPreview(undefined, '18'), { subtotal: 0, tax: 0, total: 0 })
})

test('sign-in retains the actual product, payment method, listing, type and referral', () => {
  const path = sponsorReturnPath('slug=stale&ref=OLD', { slug: 'selected-temple' }, 'P-CURRENT', 'third_party', { product: 'package:PATRON', method: 'cheque' })
  const query = new URL(path, 'https://example.invalid').searchParams
  assert.equal(query.get('slug'), 'selected-temple')
  assert.equal(query.get('ref'), 'P-CURRENT')
  assert.equal(query.get('kind'), 'third_party')
  assert.equal(query.get('product'), 'package:PATRON')
  assert.equal(query.get('method'), 'cheque')
})
