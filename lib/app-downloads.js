// Read on the server so deployments can configure the file without bundling it.
export function downloadUrl(value = '') {
  const url = value.trim()
  if (!url || /[\\\s\u0000-\u001f\u007f]/.test(url)) return null
  let parsed
  try { parsed = new URL(url, 'https://local.invalid') } catch { return null }
  const relative = url.startsWith('/') && !url.startsWith('//')
  if (!relative && (!url.startsWith('https://') || parsed.protocol !== 'https:')) return null
  if (parsed.username || parsed.password) return null
  if (['/download-app', '/download-app/android', '/download-app/ios', '/download-android', '/download-ios'].includes(parsed.pathname.replace(/\/$/, ''))) return null
  return relative ? `${parsed.pathname}${parsed.search}${parsed.hash}` : parsed.href
}

export function appDownloads() {
  return {
    android: downloadUrl(process.env.ANDROID_APK_URL?.trim() || process.env.NEXT_PUBLIC_ANDROID_APP_URL),
    ios: downloadUrl(process.env.IOS_APP_STORE_URL),
  }
}

// Match landingpage-next's attachment download, without buffering the APK in memory.
// Amplify uses redirect mode because its compute response limit is smaller than an APK.
export async function androidDownloadResponse(request, {
  downloads = appDownloads(), mode = process.env.ANDROID_APK_DOWNLOAD_MODE || 'proxy', fetcher = fetch,
} = {}) {
  const unavailable = (status) => new Response('The Android app download is currently unavailable. Please try again later.', {
    status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'private, no-store' },
  })
  if (!downloads.android) return unavailable(503)
  if (mode === 'redirect') return downloadResponse('android', downloads)
  try {
    const artifact = new URL(downloads.android, request.url)
    const upstream = await fetcher(artifact.href, {
      cache: 'no-store', signal: request.signal, headers: { 'Accept-Encoding': 'identity' },
    })
    // Avoid saving an EAS details/login/error page under an .apk filename.
    if (!upstream.ok || !upstream.body || /text\/|application\/(?:json|xhtml\+xml)/i.test(upstream.headers.get('content-type') || '')) {
      await upstream.body?.cancel()
      return unavailable(502)
    }
    const headers = new Headers({
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'attachment; filename="TempleaddressApp.apk"',
      'Content-Type': 'application/vnd.android.package-archive',
      'X-Content-Type-Options': 'nosniff',
    })
    const length = upstream.headers.get('content-length')
    const encoding = upstream.headers.get('content-encoding')
    if (length && /^\d+$/.test(length) && (!encoding || encoding === 'identity')) headers.set('Content-Length', length)
    return new Response(upstream.body, { headers })
  } catch {
    return unavailable(502)
  }
}

export function downloadResponse(platform, downloads = appDownloads()) {
  const target = downloads[platform] || '/download-app'
  return new Response(null, { status: 307, headers: {
    Location: target,
    'Cache-Control': 'no-store',
  } })
}
