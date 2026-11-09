import test from 'node:test'
import assert from 'node:assert/strict'
import { androidDownloadResponse, appDownloads, downloadResponse, downloadUrl } from './app-downloads.js'

test('download URLs accept direct HTTPS links and same-site files', () => {
  assert.equal(downloadUrl(' https://cdn.example.com/templeaddress-v3.0.1.apk?version=3 '), 'https://cdn.example.com/templeaddress-v3.0.1.apk?version=3')
  assert.equal(downloadUrl('/downloads/templeaddress.apk'), '/downloads/templeaddress.apk')
  assert.equal(downloadUrl('https://apps.apple.com/app/example/id123456'), 'https://apps.apple.com/app/example/id123456')
})

test('empty, unsafe, malformed and looping download URLs are unavailable', () => {
  for (const value of ['', '   ', 'javascript:alert(1)', 'http://cdn.example.com/app.apk', '//cdn.example.com/app.apk',
    '/\\cdn.example.com/app.apk', 'file:///app.apk', 'C:\\downloads\\app.apk', 'https://',
    'https://user:password@cdn.example.com/app.apk', 'https://cdn.example.com/app.apk\nX-Test: true',
    '/download-android', '/download-ios/', '/download-app/android', '/download-app/ios/', '/download-app?file=app.apk', 'https://templeaddress.com/download-android']) {
    assert.equal(downloadUrl(value), null, value)
  }
})

test('Android downloads redirect to the configured file without caching or proxying bytes', () => {
  const response = downloadResponse('android', {
    android: 'https://cdn.example.com/templeaddress.apk', ios: null,
  })
  assert.equal(response.status, 307)
  assert.equal(response.headers.get('location'), 'https://cdn.example.com/templeaddress.apk')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(response.body, null)
})

test('local APKs resolve on the website and absent downloads return to the landing page', () => {
  // Relative locations preserve the public origin even behind a hosting proxy.
  assert.equal(downloadResponse('android', { android: '/downloads/app.apk' }).headers.get('location'), '/downloads/app.apk')
  assert.equal(downloadResponse('android', {}).headers.get('location'), '/download-app')
  assert.equal(downloadResponse('ios', { ios: 'https://apps.apple.com/app/id123' }).headers.get('location'), 'https://apps.apple.com/app/id123')
})

test('server URL takes priority and legacy landing-page configuration remains supported', () => {
  const android = process.env.ANDROID_APK_URL
  const ios = process.env.IOS_APP_STORE_URL
  const legacy = process.env.NEXT_PUBLIC_ANDROID_APP_URL
  try {
    process.env.ANDROID_APK_URL = 'https://cdn.example.com/v1.apk'
    process.env.IOS_APP_STORE_URL = ''
    process.env.NEXT_PUBLIC_ANDROID_APP_URL = 'https://expo.dev/artifacts/eas/legacy.apk'
    assert.deepEqual(appDownloads(), { android: 'https://cdn.example.com/v1.apk', ios: null })
    process.env.ANDROID_APK_URL = 'https://cdn.example.com/v2.apk'
    assert.equal(appDownloads().android, 'https://cdn.example.com/v2.apk')
    process.env.ANDROID_APK_URL = ' '
    assert.equal(appDownloads().android, process.env.NEXT_PUBLIC_ANDROID_APP_URL)
  } finally {
    if (android === undefined) delete process.env.ANDROID_APK_URL
    else process.env.ANDROID_APK_URL = android
    if (ios === undefined) delete process.env.IOS_APP_STORE_URL
    else process.env.IOS_APP_STORE_URL = ios
    if (legacy === undefined) delete process.env.NEXT_PUBLIC_ANDROID_APP_URL
    else process.env.NEXT_PUBLIC_ANDROID_APP_URL = legacy
  }
})

test('proxy downloads stream the artifact unchanged with the old landing page attachment filename', async () => {
  const request = new Request('https://templeaddress.com/download-app/android')
  const bytes = new Uint8Array([80, 75, 3, 4, 1, 2, 3, 4])
  const upstream = new Response(bytes, {headers: {'Content-Type': 'application/octet-stream', 'Content-Length': '8'}})
  const body = upstream.body
  const response = await androidDownloadResponse(request, {
    downloads: {android: 'https://expo.dev/artifacts/eas/release.apk'}, mode: 'proxy',
    fetcher: async (url, options) => {
      assert.equal(url, 'https://expo.dev/artifacts/eas/release.apk')
      assert.equal(options.cache, 'no-store')
      assert.equal(options.signal, request.signal)
      assert.equal(options.headers['Accept-Encoding'], 'identity')
      return upstream
    },
  })
  assert.equal(response.status, 200)
  assert.equal(response.body, body)
  assert.equal(response.headers.get('content-disposition'), 'attachment; filename="TempleaddressApp.apk"')
  assert.equal(response.headers.get('content-type'), 'application/vnd.android.package-archive')
  assert.equal(response.headers.get('content-length'), '8')
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes)
})

test('unconfigured or failed APK downloads return readable errors without provider content', async () => {
  const request = new Request('https://templeaddress.com/download-app/android')
  let fetched = false
  const missing = await androidDownloadResponse(request, {downloads: {}, fetcher: async () => { fetched = true }})
  assert.equal(missing.status, 503)
  assert.equal(fetched, false)
  for (const fetcher of [
    async () => new Response('provider-private-error', {status: 403}),
    async () => new Response(null, {status: 204}),
    async () => { throw new Error('private provider connection details') },
    async () => new Response('<html>EAS build details</html>', {headers: {'Content-Type': 'text/html'}}),
    async () => new Response('{"error":"login required"}', {headers: {'Content-Type': 'application/json'}}),
  ]) {
    const response = await androidDownloadResponse(request, {downloads: {android: 'https://cdn.example.com/app.apk'}, mode: 'proxy', fetcher})
    assert.equal(response.status, 502)
    assert.equal(await response.text(), 'The Android app download is currently unavailable. Please try again later.')
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
  }
})

test('Amplify direct mode avoids fetching or proxying the large APK', async () => {
  let fetched = false
  const response = await androidDownloadResponse(new Request('https://templeaddress.com/download-app/android'), {
    downloads: {android: 'https://cdn.example.com/app.apk'}, mode: 'redirect',
    fetcher: async () => { fetched = true },
  })
  assert.equal(response.status, 307)
  assert.equal(response.headers.get('location'), 'https://cdn.example.com/app.apk')
  assert.equal(fetched, false)
})

test('same-site proxy files resolve correctly and compressed responses do not get a stale length', async () => {
  const response = await androidDownloadResponse(new Request('https://dev.templeaddress.com/download-app/android'), {
    downloads: {android: '/downloads/app.apk'}, mode: 'proxy',
    fetcher: async (url) => {
      assert.equal(url, 'https://dev.templeaddress.com/downloads/app.apk')
      return new Response('decoded artifact bytes', {headers: {'Content-Type': 'application/octet-stream', 'Content-Encoding': 'gzip', 'Content-Length': '7'}})
    },
  })
  assert.equal(response.headers.get('content-length'), null)
  assert.equal(await response.text(), 'decoded artifact bytes')
})
