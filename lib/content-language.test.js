import test from 'node:test'
import assert from 'node:assert/strict'
import { displayContent, localizedApiPath, validLanguage } from './content-language.js'

test('language is appended only to public catalogue reads with their filters intact', () => {
  assert.equal(localizedApiPath('listings?type=temple&page=2', 'ta'), 'listings?type=temple&page=2&lang=ta')
  assert.equal(localizedApiPath('listings/example/availability?date=2026-11-21', 'ta'), 'listings/example/availability?date=2026-11-21')
  assert.equal(localizedApiPath('me/bookings', 'ml'), 'me/bookings')
  assert.equal(localizedApiPath('events', 'invalid'), 'events')
  assert.equal(validLanguage('constructor'), 'en')
})

test('localized display keeps original identities, payment data, contact and map inputs', () => {
  const input = {
    slug: 'lotus', name_en: 'Lotus Temple', address: 'Kerala', localized: { name_en: 'कमल मंदिर', address: 'केरल', slug: 'changed' },
    poojas: [{ uuid: 'ritual-id', name_en: 'Pooja', price: '10.00', localized: { name_en: 'पूजा', price: '0' } }],
    contact: { name_en: 'Official', localized: { name_en: 'changed' } },
  }
  const display = displayContent(input)
  assert.equal(display.name_en, 'कमल मंदिर')
  assert.equal(display.original_name_en, 'Lotus Temple')
  assert.equal(display.original_address, 'Kerala')
  assert.equal(display.slug, 'lotus')
  assert.equal(display.poojas[0].name_en, 'पूजा')
  assert.equal(display.poojas[0].uuid, 'ritual-id')
  assert.equal(display.poojas[0].price, '10.00')
  assert.equal(display.contact.name_en, 'Official')
  assert.equal(input.name_en, 'Lotus Temple')
})
