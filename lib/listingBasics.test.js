import test from 'node:test'
import assert from 'node:assert/strict'
import { migrateTempleBasics, templeTimingFields } from './listingBasics.js'

test('existing morning and evening ranges retain opening and closing times', () => {
  assert.deepEqual(templeTimingFields('5:30–9:30 AM · 5:30–7:30 PM'), {
    morningOpening: '05:30', morningClosing: '09:30', eveningOpening: '17:30', eveningClosing: '19:30',
  })
})

test('time conversion handles noon, midnight and explicit meridiems', () => {
  assert.deepEqual(templeTimingFields('12:00 AM - 12:00 PM · 5:00 PM - 8:00 PM'), {
    morningOpening: '00:00', morningClosing: '12:00', eveningOpening: '17:00', eveningClosing: '20:00',
  })
  assert.deepEqual(templeTimingFields('05:30–09:30 · 17:30–19:30'), {
    morningOpening: '05:30', morningClosing: '09:30', eveningOpening: '17:30', eveningClosing: '19:30',
  })
})

test('missing or unconfirmed timings do not invent times', () => {
  const empty = { morningOpening: '', morningClosing: '', eveningOpening: '', eveningClosing: '' }
  assert.deepEqual(templeTimingFields(), empty)
  assert.deepEqual(templeTimingFields('To be confirmed'), empty)
  assert.deepEqual(templeTimingFields('25:90–26:99'), empty)
})

test('older drafts retain both main-deity selections, other deities, management and timing ranges', () => {
  const field = (value, type = 'select-one') => ({ value, type })
  const saved = [
    field('Saved temple', 'text'), field('Malayalam name', 'text'), field('Temple'), field('T1028', 'text'),
    field('Lord Vishnu'), field('Lord Shiva'), field('Ganapathi'), field('Lord Shiva'), field('Not selected'),
    field('Family / Illam'), field('5:30–9:30 AM · 5:30–7:30 PM', 'text'),
  ]
  const before = structuredClone(saved)
  const migrated = migrateTempleBasics(saved)
  assert.deepEqual(migrated.slice(0, 4), saved.slice(0, 4))
  assert.equal(migrated[4].value, 'Lord Vishnu')
  assert.deepEqual(migrated[5].values, ['Lord Shiva', 'Ganapathi'])
  assert.equal(migrated[6].value, 'Family / Illam')
  assert.deepEqual(migrated.slice(7).map(item => item.value), ['05:30', '09:30', '17:30', '19:30'])
  assert.deepEqual(saved, before)
  assert.equal(migrateTempleBasics(migrated), migrated)
})

test('new drafts preserve multiple selections including an empty selection', () => {
  for (const values of [[], ['Lord Krishna', 'Lord Ganesh', 'Naga', 'Subrahmanya']]) {
    const saved = [{ name: 'otherDeities', type: 'select-multiple', values }]
    assert.equal(migrateTempleBasics(saved), saved)
    assert.deepEqual(migrateTempleBasics(saved)[0].values, values)
  }
})

test('other listing types and sections pass through unchanged', () => {
  assert.equal(migrateTempleBasics(undefined), undefined)
  const saved = Array.from({ length: 11 }, () => ({ value: 'Unchanged', type: 'text' }))
  assert.equal(migrateTempleBasics(saved), saved)
})
