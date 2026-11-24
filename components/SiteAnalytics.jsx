'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const CONSENT_KEY = 'ta-analytics-consent'
const denied = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
}
const publicPages = new Map([
  ['/', 'Home'],
  ['/temples', 'Temples'],
  ['/festival', 'Festivals'],
  ['/special', 'Special poojas'],
  ['/services', 'Services'],
  ['/about', 'About'],
  ['/download-app', 'Downloads'],
])
/** @type {[RegExp, string, string][]} */
const detailPages = [
  [/^\/t\/[^/]+$/, '/t/[slug]', 'Temple detail'],
  [/^\/festival\/[^/]+$/, '/festival/[code]', 'Festival detail'],
  [/^\/service\/[^/]+$/, '/service/[id]', 'Service detail'],
  [/^\/special\/[^/]+$/, '/special/[id]', 'Special pooja detail'],
  [/^\/events\/[^/]+$/, '/events/[slug]', 'Event detail'],
]

/** @type {(...args: unknown[]) => void} */
const gtag = function () {
  const browser = /** @type {Window & {dataLayer?: IArguments[]}} */ (window)
  browser.dataLayer ||= []
  browser.dataLayer.push(arguments)
}

function storedChoice() {
  try {
    const choice = window.localStorage.getItem(CONSENT_KEY)
    return choice === 'granted' || choice === 'denied' ? choice : 'unset'
  } catch {
    return 'unset'
  }
}

/** @param {{measurementId: string}} props */
export default function SiteAnalytics({ measurementId }) {
  const pathname = usePathname()
  const [choice, setChoice] = useState(null)
  const [ready, setReady] = useState(false)
  const [productionHost, setProductionHost] = useState(false)
  const initialized = useRef(false)
  const lastPath = useRef(null)
  const disableKey = `ga-disable-${measurementId}`
  const detail = detailPages.find(([pattern]) => pattern.test(pathname || ''))
  const pageTitle = publicPages.get(pathname) || detail?.[2]
  const pagePath = detail?.[1] || pathname
  const enabled = productionHost && choice === 'granted' && Boolean(pageTitle)

  useEffect(() => {
    setProductionHost(['templeaddress.com', 'www.templeaddress.com'].includes(window.location.hostname))
    setChoice(storedChoice())

    function syncChoice(event) {
      if (event.key !== CONSENT_KEY && event.key !== null) return
      const next = storedChoice()
      if (next !== 'granted') Reflect.set(window, disableKey, true)
      setChoice(next)
    }
    window.addEventListener('storage', syncChoice)
    return () => window.removeEventListener('storage', syncChoice)
  }, [disableKey])

  useEffect(() => {
    if (!enabled) {
      Reflect.set(window, disableKey, true)
      lastPath.current = null
      if (initialized.current) gtag('consent', 'update', denied)
      return
    }

    Reflect.set(window, disableKey, false)
    if (!ready || lastPath.current === pathname) return

    const page = {
      page_location: new URL(pagePath, 'https://templeaddress.com').href,
      page_title: pageTitle,
      page_referrer: '',
      ignore_referrer: true,
    }
    if (!initialized.current) {
      gtag('consent', 'default', denied)
      gtag('js', new Date())
    }
    gtag('consent', 'update', { ...denied, analytics_storage: 'granted' })
    gtag('config', measurementId, {
      ...page,
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
    initialized.current = true
    lastPath.current = pathname
    gtag('event', 'page_view', { ...page, send_to: measurementId })
  }, [disableKey, enabled, measurementId, pagePath, pageTitle, pathname, ready])

  function selectChoice(next) {
    if (next === 'denied') Reflect.set(window, disableKey, true)
    try { window.localStorage.setItem(CONSENT_KEY, next) } catch { /* Apply for this visit. */ }
    setChoice(next)
  }

  if (!productionHost || choice === null || !pageTitle) return null

  return <>
    {enabled && <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
      referrerPolicy="no-referrer"
      onReady={() => setReady(true)}
    />}
    <section aria-label="Analytics preferences" className="border-t border-brown-200 bg-brown-50 px-4 py-4 text-sm text-brown-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <p>Optional analytics help us understand how visitors use TempleAddress.</p>
        <button type="button" className="btn-g !py-1.5" aria-pressed={choice === 'granted'} onClick={() => selectChoice('granted')}>Allow analytics</button>
        <button type="button" className="btn-g !py-1.5" aria-pressed={choice === 'denied'} onClick={() => selectChoice('denied')}>Decline analytics</button>
      </div>
    </section>
  </>
}
