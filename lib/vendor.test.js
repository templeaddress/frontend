import test from 'node:test'
import assert from 'node:assert/strict'
import { availabilityDraft, canManageVendor, istDateTime, reportQuery, selectVendorListing, vendorLanding } from './vendor.js'

test('vendor header destinations follow the authorized listing type', () => {
  for (const [listing_type, expected] of [['temple', '/vendor'], ['festival', '/festival-admin'], ['service', '/service-admin']]) {
    assert.equal(vendorLanding([{ uuid: 'QA-LISTING', listing_type }]), expected)
  }
})

test('vendor header restores only an authorized saved listing', () => {
  const rows = [{ uuid: 'T-QA', listing_type: 'temple' }, { uuid: 'S-QA', listing_type: 'service' }]
  assert.equal(vendorLanding(rows, 'S-QA'), '/service-admin')
  assert.equal(vendorLanding(rows, 'unrelated-listing'), '/vendor')
})

test('regular users and invalid membership responses keep the ordinary profile link', () => {
  for (const value of [[], {}, null, undefined, [{ uuid: 'QA', listing_type: 'unsupported' }]]) assert.equal(vendorLanding(value), null)
})

test('vendor selection cannot substitute a different listing type or an unrelated saved identity', () => {
  const rows = [{ uuid: 'T1', listing_type: 'temple' }, { uuid: 'T2', listing_type: 'temple' }, { uuid: 'S1', listing_type: 'service' }]
  assert.equal(selectVendorListing(rows, 'temple', 'T2').uuid, 'T2')
  assert.equal(selectVendorListing(rows, 'temple', 'S1').uuid, 'T1')
  assert.equal(selectVendorListing(rows, 'festival', 'S1'), null)
  assert.equal(selectVendorListing(rows, 'service', 'unrelated').uuid, 'S1')
})
test('aggregated owner permissions are honoured when event editor is the first membership', () => {
  assert.equal(canManageVendor({ membership_role: 'event_editor', can_manage_content: true }), true)
  assert.equal(canManageVendor({ membership_role: 'event_editor' }), false)
})
test('availability edits retain every window without mutating the loaded schedule', () => {
  const source = { days: { mon: [['09:00', '12:00'], ['15:00', '18:00']] }, modes: ['in_person'], slot_minutes: 30 }
  const draft = availabilityDraft(source)
  assert.deepEqual(draft.days.mon, source.days.mon)
  draft.days.mon[0][0] = '10:00'
  draft.modes.push('phone')
  assert.equal(source.days.mon[0][0], '09:00')
  assert.deepEqual(source.modes, ['in_person'])
})
test('blocked periods use IST regardless of the browser timezone', () => {
  assert.equal(istDateTime('2026-11-15T09:30'), '2026-11-15T04:00:00.000Z')
  assert.throws(() => istDateTime('invalid'), /valid date/)
})
test('server report queries retain filters on subsequent pages', () => {
  const query = reportQuery({ search: 'QA & Temple', type: 'donation', from: '2026-11-01', status: '' }, 3)
  assert.equal(query.get('search'), 'QA & Temple')
  assert.equal(query.get('page'), '3')
  assert.equal(query.get('type'), 'donation')
  assert.equal(query.has('status'), false)
})
