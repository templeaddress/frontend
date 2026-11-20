'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const publicPages = new Map([
  ['/', 'Home'],
  ['/temples', 'Temples'],
  ['/festival', 'Festivals'],
  ['/special', 'Special poojas'],
  ['/services', 'Services'],
  ['/about', 'About'],
  ['/download-app', 'Downloads'],
])

export default function SiteAnalytics({ measurementId, consentGranted = false }) {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const initialized = useRef(false)
  const lastPath = useRef(null)

  useEffect(() => {
    if (!consentGranted || !ready || lastPath.current === pathname) return
    lastPath.current = pathname
    const pageTitle = publicPages.get(pathname)
    if (!pageTitle) return

    window.dataLayer ||= []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    const page = {
      page_location: new URL(pathname, window.location.origin).href,
      page_title: pageTitle,
      page_referrer: '',
      ignore_referrer: true,
    }
    if (!initialized.current) {
      gtag('js', new Date())
      gtag('config', measurementId, {
        ...page,
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      })
      initialized.current = true
    }
    gtag('event', 'page_view', { ...page, send_to: measurementId })
  }, [consentGranted, measurementId, pathname, ready])

  if (!consentGranted || !/^G-[A-Z0-9]+$/.test(measurementId) || !publicPages.has(pathname)) return null

  return <Script
    src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
    strategy="afterInteractive"
    referrerPolicy="no-referrer"
    onReady={() => setReady(true)}
  />
}
