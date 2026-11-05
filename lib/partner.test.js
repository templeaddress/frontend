import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizePartnerApplication, partnerSharePath, sponsorReturnPath } from './partner.js'

test('an absent partner application uses the empty-object API contract', () => {
  for (const value of [{}, null, undefined]) assert.equal(normalizePartnerApplication(value), null)
})

test('existing applications retain their identity and tolerate missing document or history lists', () => {
  const source = { code: 'P-QA001', status: 'pending', bank: { account_last_four: '0001' } }
  const app = normalizePartnerApplication(source)
  assert.equal(app.code, source.code)
  assert.equal(app.status, source.status)
  assert.equal(app.bank, source.bank)
  assert.deepEqual(app.documents, [])
  assert.deepEqual(app.history, [])
  assert.equal(Object.hasOwn(source, 'documents'), false)
  assert.deepEqual(normalizePartnerApplication({ ...source, documents: null, history: null }).documents, [])
})

test('normalizing an application preserves its real documents, feedback and history', () => {
  const source = { code: 'P-QA002', status: 'changes_requested', review_note: 'Fictional correction note', documents: [{ uuid: 'QA-DOC', kind: 'pan', status: 'submitted' }], history: [{ status: 'submitted' }] }
  assert.deepEqual(normalizePartnerApplication(source), source)
  assert.equal(normalizePartnerApplication(source).documents, source.documents)
  assert.equal(normalizePartnerApplication(source).history, source.history)
})

test('partner referral links preserve the code and selected listing across public listing types', () => {
  for (const [type, path] of [['temple', '/t/'], ['festival', '/festival/'], ['service', '/service/']]) {
    const listing = { listing_type: type, slug: 'selected-listing' }
    const checkout = new URL(partnerSharePath('P&42', listing), 'https://example.invalid')
    assert.equal(checkout.pathname, '/sponsor')
    assert.equal(checkout.searchParams.get('ref'), 'P&42')
    assert.equal(checkout.searchParams.get('slug'), listing.slug)
    const publicPage = new URL(partnerSharePath('P&42', listing, 'listing'), 'https://example.invalid')
    assert.equal(publicPage.pathname, `${path}selected-listing`)
    assert.equal(publicPage.searchParams.get('ref'), 'P&42')
  }
})

test('selecting the general sponsorship page does not silently select the first listing', () => {
  const link = new URL(partnerSharePath('P001', undefined, 'listing'), 'https://example.invalid')
  assert.equal(link.pathname, '/sponsor')
  assert.equal(link.searchParams.get('ref'), 'P001')
  assert.equal(link.searchParams.has('slug'), false)
})

test('sponsorship sign-in preserves the selected public listing, edited referral and purchase kind', () => {
  const next = new URL(sponsorReturnPath('listing=old&ref=OLD', { uuid: 'new-uuid', slug: 'selected-temple' }, ' P001 ', 'third_party'), 'https://example.invalid')
  assert.equal(next.pathname, '/sponsor')
  assert.equal(next.searchParams.get('slug'), 'selected-temple')
  assert.equal(next.searchParams.has('listing'), false)
  assert.equal(next.searchParams.get('ref'), 'P001')
  assert.equal(next.searchParams.get('kind'), 'third_party')
  assert.equal(new URL(sponsorReturnPath('ref=OLD', null, '', 'self'), next.origin).searchParams.has('ref'), false)
})
