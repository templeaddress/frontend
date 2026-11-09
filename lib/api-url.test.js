import test from 'node:test'
import assert from 'node:assert/strict'
import { apiRoot, apiUrl, browserApiRoot } from './api-url.js'

test('Django API root accepts a host URL', () => {
  assert.equal(apiRoot('https://api.example.com/'), 'https://api.example.com/api/v1')
})

test('Django API root does not duplicate an existing version path', () => {
  assert.equal(apiRoot('https://api.example.com/api/v1/'), 'https://api.example.com/api/v1')
  assert.equal(apiUrl('https://api.example.com/api/v1', '/listings?type=service'), 'https://api.example.com/api/v1/listings?type=service')
})

test('browser API supports the same-origin proxy and direct Django URLs', () => {
  assert.equal(browserApiRoot('/api/backend/'), '/api/backend')
  assert.equal(browserApiRoot('https://api.example.com'), 'https://api.example.com/api/v1')
  assert.equal(browserApiRoot('https://api.example.com/api/v1/'), 'https://api.example.com/api/v1')
})
import { forwardedClientChain } from './proxy-ip.js'

test('proxy appends only an independently trusted client IP', () => {
  const request = { headers: new Headers({ 'x-forwarded-for': '192.0.2.99', 'x-real-ip': '203.0.113.4' }) }
  assert.equal(forwardedClientChain(request), '')
  assert.equal(forwardedClientChain(request, 'x-real-ip'), '192.0.2.99, 203.0.113.4')
  request.headers.set('x-real-ip', 'invalid')
  assert.equal(forwardedClientChain(request, 'x-real-ip'), '')
})

test('a request.ip property is never trusted on its own', () => {
  const request = { ip: '198.51.100.7', headers: new Headers() }
  assert.equal(forwardedClientChain(request), '')
})
