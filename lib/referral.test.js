import test from 'node:test'
import assert from 'node:assert/strict'
import { referralLoginPath, signupReferralCode } from './referral.js'
import { partnerSharePath } from './partner.js'

test('signup referrals survive direct registration and sponsorship login return paths', () => {
  assert.equal(signupReferralCode('ref=p-001'), 'P-001')
  assert.equal(signupReferralCode(new URLSearchParams({ next: '/sponsor?ref=p-002&kind=third_party' })), 'P-002')
  assert.equal(signupReferralCode(new URLSearchParams({ ref: 'P-DIRECT', next: '/sponsor?ref=P-OLD' })), 'P-DIRECT')
  assert.equal(signupReferralCode(''), '')
})

test('external return paths and malformed codes cannot supply signup attribution', () => {
  for (const next of ['https://example.invalid/?ref=P-BAD', '//example.invalid/?ref=P-BAD', '/\\example.invalid?ref=P-BAD']) {
    assert.equal(signupReferralCode(new URLSearchParams({ next })), '')
  }
  assert.equal(signupReferralCode(new URLSearchParams({ ref: 'X'.repeat(31) })), '')
  assert.equal(signupReferralCode(new URLSearchParams({ ref: 'P\u0001BAD' })), '')
})

test('public login links preserve explicit referral identity and ordinary links stay the same', () => {
  assert.equal(referralLoginPath('/t/fictional-temple', ''), '/login')
  const target = new URL(referralLoginPath('/t/fictional-temple', 'ref=P-KEPT&tab=poojas'), 'https://example.invalid')
  assert.equal(target.searchParams.get('ref'), 'P-KEPT')
  assert.equal(target.searchParams.get('next'), '/t/fictional-temple?ref=P-KEPT&tab=poojas')
  const login = new URL(referralLoginPath('/register', 'ref=P-KEPT'), target.origin)
  assert.equal(login.searchParams.get('next'), '/account')
})

test('partner signup links preserve the optional selected listing without selecting a default one', () => {
  const direct = new URL(partnerSharePath('P&42', undefined, 'signup'), 'https://example.invalid')
  assert.equal(direct.pathname, '/register')
  assert.equal(direct.searchParams.get('ref'), 'P&42')
  assert.equal(direct.searchParams.has('next'), false)
  const selected = new URL(partnerSharePath('P-001', { slug: 'fictional-temple', listing_type: 'temple' }, 'signup'), direct.origin)
  assert.equal(selected.searchParams.get('next'), '/t/fictional-temple?ref=P-001')
})
