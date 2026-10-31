import test from 'node:test'
import assert from 'node:assert/strict'
import { canOpenStaff, canUseStaff, rolesFor, staffLanding, staffLinks, staffNext } from './staff-access.js'
import { isDemoPortal } from './demo-portals.js'

test('assigned roles select the correct staff workspace and navigation', () => {
  const moderator = { roles: ['moderator'] }, accountant = { roles: ['accountant'] }, admin = { roles: ['portal admin'] }
  assert.equal(staffLanding(moderator), '/staff')
  assert.equal(staffLanding(accountant), '/staff/payouts')
  assert.equal(canOpenStaff(moderator, '/staff/payouts'), false)
  assert.equal(canOpenStaff(accountant, '/staff/directory/users'), false)
  assert.equal(canOpenStaff(admin, '/staff/payouts'), true)
  assert.equal(canOpenStaff(admin, '/staff/audit'), true)
  assert.equal(canOpenStaff({ is_staff: true, roles: [] }, '/staff'), false)
  assert.equal(canUseStaff({ roles: ['devotee'] }, 'moderator'), false)
})

test('staff next routes cannot escape into external or deferred portals', () => {
  const moderator = { roles: ['moderator'] }
  for (const path of ['https://example.invalid', '//example.invalid', '/staff/config', '/staff/login', '/staff/payouts', '/account', '/staff/../staff/config']) assert.equal(staffNext(moderator, path), '/staff')
  assert.equal(staffNext(moderator, '/staff/directory/bookings'), '/staff/directory/bookings')
  assert.deepEqual(rolesFor({ role: 'accountant' }), ['accountant'])
  assert.deepEqual(rolesFor({ role: 'admin' }), ['portal admin'])
  assert.deepEqual(rolesFor({ role: 'admin', roles: [] }), [])
})

test('only the real Phase 1 staff routes are enabled outside demo mode', () => {
  for (const path of ['/staff/login', '/staff/enquiries', '/staff/audit']) assert.equal(isDemoPortal(path), false)
  for (const path of ['/staff/config', '/staff/plans', '/staff/analytics', '/staff/staff-management']) assert.equal(isDemoPortal(path), true)
})

test('Phase 1 navigation exposes each live workspace only to its assigned roles', () => {
  const moderator = { roles: ['moderator'] }, accountant = { roles: ['accountant'] }, admin = { roles: ['portal admin'] }
  for (const [path, , role] of staffLinks) {
    assert.equal(isDemoPortal(path), false, path)
    assert.equal(canOpenStaff(admin, path), true, path)
    assert.equal(canOpenStaff(moderator, path), role === 'moderator', path)
    assert.equal(canOpenStaff(accountant, path), role === 'accountant', path)
  }
  const preview = '/staff/reviews/00000000-0000-0000-0000-000000000001'
  assert.equal(isDemoPortal(preview), false)
  assert.equal(canOpenStaff(moderator, preview), true)
  assert.equal(canOpenStaff(accountant, preview), false)
  assert.equal(canOpenStaff(moderator, '/staff/reviews/../../config'), false)
  assert.equal(isDemoPortal('/staff/reviews/not-a-record'), true)
})

test('Phase 2 moderator queues are live staff pages for moderators only', async () => {
  const { isDemoPortal } = await import('./demo-portals.js')
  const moderator = { roles: ['moderator'] }, accountant = { roles: ['accountant'] }
  for (const path of ['/staff/kyc', '/staff/ownership', '/staff/support', '/staff/wallet-credit']) {
    assert.equal(isDemoPortal(path), false)
    assert.equal(canOpenStaff(moderator, path), true)
    assert.equal(canOpenStaff(accountant, path), false)
  }
})
