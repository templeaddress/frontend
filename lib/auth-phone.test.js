import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanMobile, mobileLimits, validMobile } from './auth-phone.js'

test('mobile input removes letters, punctuation, whitespace and non-ASCII digits', () => {
  assert.equal(cleanMobile('abc90 00-(00).00+00x', '+91'), '9000000000')
  assert.equal(cleanMobile('letters only', '+91'), '')
  assert.equal(cleanMobile('９０００🙂abc', '+91'), '')
})

test('Indian phone numbers require exactly ten digits', () => {
  for (const value of ['', '90000', '90000000000', '900000000x']) assert.equal(validMobile(value, '+91'), false)
  assert.equal(validMobile('9000000000', '+91'), true)
  assert.equal(cleanMobile('90000000001', '+91'), '9000000000')
})

test('pasting a phone number with the selected country code keeps the national number', () => {
  assert.equal(cleanMobile('+91 90000 00000', '+91'), '9000000000')
  assert.equal(cleanMobile('919000000000', '+91'), '9000000000')
  assert.equal(cleanMobile('09000000000', '+91'), '9000000000')
  assert.equal(cleanMobile('+971 50 000 0000', '+971'), '500000000')
})

test('international phone limits preserve the backend E.164 contract', () => {
  assert.deepEqual(mobileLimits('+971'), { min: 6, max: 12 })
  assert.deepEqual(mobileLimits('+1'), { min: 7, max: 14 })
  assert.equal(validMobile('500000000', '+971'), true)
  assert.equal(validMobile('123456', '+1'), false)
  assert.equal(validMobile('1234567', '+1'), true)
  assert.equal(validMobile('1'.repeat(13), '+971'), false)
  assert.equal(validMobile('500abc000', '+971'), false)
})
