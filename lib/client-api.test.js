import test from 'node:test'
import assert from 'node:assert/strict'
import { safeNextPath, clientApi, canLinkGoogle, canLinkMobile, requireAuth, hasAuthSession, subscribeAuth, saveAuth, clearAuth } from './client-api.js'
import { apiCollection, catalogueReference, listingPath } from './catalogue.js'
import { demoPortalsEnabled, isDemoPortal } from './demo-portals.js'
import { starOptions } from './stars.js'

test('birth star choices submit catalogue codes and preserve an existing legacy value', () => {
  const stars = [{ code: 'aswathi', name_en: 'Aswathi' }, { code: 'bharani', name_en: 'Bharani' }]
  assert.deepEqual(starOptions(stars, 'aswathi'), [{ value: 'aswathi', label: 'Aswathi' }, { value: 'bharani', label: 'Bharani' }])
  const legacy = starOptions(stars, 'Ashwini')
  assert.equal(legacy[0].value, 'Ashwini')
  assert.equal(legacy.length, 3)
  assert.equal(stars.length, 2)
})

test('demo portals fail closed while live staff routes stay available', () => {
  for (const value of [undefined, '', 'false', '1', true]) assert.equal(demoPortalsEnabled(value), false)
  assert.equal(demoPortalsEnabled('true'), true)
  for (const path of ['/vendor', '/vendor/charts/CH1', '/festival-admin', '/service-admin/profile']) assert.equal(isDemoPortal(path), false, path)
  for (const path of ['/partner/share', '/dealer/wallet', '/staff/plans', '/staff/review/listing/1', '/staff/directory/partners', '/claim/example-temple']) assert.equal(isDemoPortal(path), true, path)
  for (const path of ['/', '/account', '/staff', '/staff/charts', '/staff/payouts', '/staff/listing', '/staff/directory/bookings', '/staff/directory/users', '/staff/directory/transactions']) assert.equal(isDemoPortal(path), false, path)
})

test('login redirects stay inside TempleAddress', () => {
  assert.equal(safeNextPath('/book/test-temple?pooja=P1'), '/book/test-temple?pooja=P1')
  assert.equal(safeNextPath('https://evil.example'), '/account')
  assert.equal(safeNextPath('//evil.example'), '/account')
})

test('navigation session updates after login and logout and unsubscribes cleanly', () => {
  const previousWindow = globalThis.window
  const values = new Map()
  const events = new EventTarget()
  globalThis.window = {
    localStorage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) },
    addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  }
  const changes = []
  const unsubscribe = subscribeAuth(() => changes.push(hasAuthSession()))
  try {
    assert.equal(hasAuthSession(), false)
    saveAuth({ access: 'signed-in', user: { name: 'Devotee' } })
    assert.equal(hasAuthSession(), true)
    clearAuth()
    assert.equal(hasAuthSession(), false)
    assert.deepEqual(changes, [true, false])
    unsubscribe()
    saveAuth({ access: 'another-session' })
    assert.deepEqual(changes, [true, false])
  } finally { unsubscribe(); globalThis.window = previousWindow }
})

test('navigation restores persisted sessions and follows auth changes from other tabs', () => {
  const previousWindow = globalThis.window
  const values = new Map([['ta-phase1-auth', JSON.stringify({ access: 'persisted-session' })]])
  const events = new EventTarget()
  globalThis.window = {
    localStorage: { getItem: key => values.get(key) },
    addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events),
  }
  const sessionWindow = globalThis.window
  const changes = []
  const unsubscribe = subscribeAuth(() => changes.push(hasAuthSession()))
  const storageEvent = key => {
    const event = new Event('storage')
    Object.defineProperty(event, 'key', { value: key })
    events.dispatchEvent(event)
  }
  try {
    assert.equal(hasAuthSession(), true)
    storageEvent('ta-device-id')
    assert.deepEqual(changes, [])
    values.delete('ta-phase1-auth')
    storageEvent('ta-phase1-auth')
    assert.deepEqual(changes, [false])
    values.set('ta-phase1-auth', JSON.stringify({ access: 'new-tab-session' }))
    storageEvent('ta-phase1-auth')
    assert.deepEqual(changes, [false, true])
    values.clear()
    storageEvent(null)
    assert.deepEqual(changes, [false, true, false])
    values.set('ta-phase1-auth', 'invalid-json')
    assert.equal(hasAuthSession(), false)
    delete globalThis.window
    assert.equal(hasAuthSession(), false)
  } finally { globalThis.window = sessionWindow; unsubscribe(); globalThis.window = previousWindow }
})

test('Google users may add a mobile later; verified users and staff are never asked', () => {
  assert.equal(canLinkMobile({ google_verified_at: 'verified', mobile_verified_at: null, is_staff: false }), true)
  assert.equal(canLinkMobile({ google_verified_at: 'verified', mobile_verified_at: 'verified' }), false)
  assert.equal(canLinkMobile({ google_verified_at: 'verified', is_staff: true }), false)
  assert.equal(canLinkMobile({ mobile_verified_at: 'verified' }), false)
  assert.equal(canLinkMobile(null), false)
})

test('only mobile-verified devotees without Google are offered Google linking', () => {
  assert.equal(canLinkGoogle({ mobile_verified_at: 'verified', google_verified_at: null }), true)
  assert.equal(canLinkGoogle({ mobile_verified_at: 'verified', google_verified_at: 'verified' }), false)
  assert.equal(canLinkGoogle({ google_verified_at: 'verified' }), false)
  assert.equal(canLinkGoogle({ mobile_verified_at: 'verified', is_staff: true }), false)
  assert.equal(canLinkGoogle(null), false)
})

test('verified checkout gate accepts Google or mobile and preserves booking, donation and event destinations', () => {
  const previousWindow = globalThis.window
  let session = { access: 'google-session', user: { google_verified_at: 'verified', mobile_verified_at: null } }
  globalThis.window = { localStorage: { getItem: () => JSON.stringify(session) } }
  const redirects = []
  const router = { push: path => redirects.push(path) }
  try {
    assert.equal(requireAuth(router, '/account').access, 'google-session')
    assert.equal(requireAuth(router, '/book/temple', { verified: true }).access, 'google-session')
    assert.deepEqual(redirects, [])
    session = { ...session, user: { mobile_verified_at: 'verified' } }
    assert.equal(requireAuth(router, '/events/event-one', { verified: true }).access, 'google-session')
    session = { ...session, user: { name: 'Unverified' } }
    for (const path of ['/book/temple?pooja=P1', '/donate/temple?purpose=D1', '/events/event-one']) {
      assert.equal(requireAuth(router, path, { verified: true }), null)
      assert.equal(redirects.at(-1), `/login?next=${encodeURIComponent(path)}`)
    }
    session = null
    assert.equal(requireAuth(router, '/donate/temple', { verified: true }), null)
    assert.equal(redirects.at(-1), '/login?next=%2Fdonate%2Ftemple')
  } finally { globalThis.window = previousWindow }
})

test('catalogue resolves legacy codes through the API and preserves type identity', async () => {
  const fetcher = async path => {
    if (path === 'listings/F1016') throw Object.assign(new Error('missing slug'), { status: 404 })
    if (path.startsWith('listings?')) return { results: [{ code: 'F1016', slug: 'festival' }], next: null }
    return { code: 'F1016', slug: 'festival', listing_type: 'festival' }
  }
  assert.equal((await catalogueReference('listings', 'F1016', 'festival', fetcher)).slug, 'festival')
  await assert.rejects(catalogueReference('listings', 'festival', 'service', fetcher), error => error.status === 404)
  assert.equal(listingPath({ listing_type: 'service', slug: 'priest' }), '/service/priest')
})

test('API collections include later pages and propagate outages', async () => {
  const result = await apiCollection('events', async path => path.includes('page=1') ? { results: [{ code: 'EV1' }], next: 'page2' } : { results: [{ code: 'EV2' }], next: null })
  assert.equal(result.length, 2)
  await assert.rejects(catalogueReference('listings', 'temple', 'temple', async () => { throw Object.assign(new Error('Unavailable'), { status: 503 }) }), /Unavailable/)
})

test('expired access refreshes through the canonical endpoint and keeps friendly errors', async () => {
  const previousWindow = globalThis.window
  const previousFetch = globalThis.fetch
  const values = new Map([['ta-phase1-auth', JSON.stringify({ access: 'old', refresh: 'refresh' })]])
  globalThis.window = { localStorage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }, dispatchEvent() {} }
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push([url, options])
    if (String(url).endsWith('auth/token/refresh')) return new Response(JSON.stringify({ data: { access: 'new', refresh: 'rotated' } }), { status: 200 })
    if (options.headers.Authorization === 'Bearer old') return new Response('{}', { status: 401 })
    return new Response(JSON.stringify({ error: { code: 'BOOKING_CLOSED', message: 'Please choose a later date.' } }), { status: 400 })
  }
  try {
    await assert.rejects(clientApi('bookings/quote'), /Please choose a later date/)
    assert.equal(calls.length, 3)
    assert.ok(calls[1][0].endsWith('auth/token/refresh'))
    assert.equal(calls[2][1].headers.Authorization, 'Bearer new')
    assert.ok(calls[2][1].headers['X-Device-ID'])
  } finally { globalThis.window = previousWindow; globalThis.fetch = previousFetch }
})

test('an unset app environment is production; anything else is not indexed', async () => {
  const { isProductionSite } = await import('./site-env.js')
  assert.equal(isProductionSite(undefined), true)
  assert.equal(isProductionSite('production'), true)
  for (const value of ['staging', 'demo', 'development']) assert.equal(isProductionSite(value), false)
})
