'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AVAILABLE_CONTENT_LANGUAGES, CONTENT_TRANSLATION_ENABLED, LANGUAGE_COOKIE, validLanguage } from '@/lib/content-language'
import { publicLabel } from '@/lib/public-labels'
import PublicText, { LANGUAGE_CHANGED, useContentLanguage } from './PublicText'

// Optional, user-initiated Google translation. Booking/receipt fields excluded.
function LegacyLanguageControl() {
  const menu = useRef(null)
  const [enabled, setEnabled] = useState(false), [error, setError] = useState('')
  useEffect(() => {
    const widget = menu.current.querySelector('#ta-google-translate')
    const closeOutside = event => {
      if (menu.current?.open && !menu.current.contains(event.target)) menu.current.open = false
    }
    const closeOnSelection = event => {
      if (event.target instanceof HTMLSelectElement && event.target.value && menu.current.open) {
        menu.current.open = false
        menu.current.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    widget.addEventListener('change', closeOnSelection)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      widget.removeEventListener('change', closeOnSelection)
    }
  }, [])
  const enable = () => {
    setEnabled(true); setError('')
    const init = () => { if (window.google?.translate) new window.google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,ml,hi,ta,te,kn', autoDisplay: false }, 'ta-google-translate') }
    if (window.google?.translate) { setTimeout(init, 0); return }
    window.taTranslateReady = init
    if (!document.getElementById('ta-translate-script')) {
      const s = document.createElement('script'); s.id = 'ta-translate-script'
      s.src = 'https://translate.google.com/translate_a/element.js?cb=taTranslateReady'
      s.onerror = () => { setError('Translation could not load. Use your browser\'s Translate option.'); s.remove() }
      document.head.appendChild(s)
    }
  }
  return (
    <details ref={menu} className="relative text-sm" onKeyDown={event => {
      if (event.key === 'Escape' && menu.current.open) {
        menu.current.open = false
        menu.current.querySelector('summary')?.focus()
      }
    }}>
      <summary className="cursor-pointer list-none whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-2 [&::-webkit-details-marker]:hidden" aria-label="Language">🌐<span className="hidden sm:inline"> <PublicText>Language</PublicText></span></summary>
      <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl bg-white p-4 text-brown-900 shadow-xl">
        <p className="mb-2">English · മലയാളം · हिन्दी · தமிழ் · తెలుగు · ಕನ್ನಡ</p>
        <p className="mb-3 text-xs"><PublicText>Optional Google machine translation. Verify important details in English.</PublicText></p>
        <div id="ta-google-translate"/>
        {(!enabled || error) && <button className="btn-p" onClick={enable}><PublicText>Enable translation</PublicText></button>}
        {enabled && !error && <p className="mt-2 text-xs"><PublicText>Choose a language above once Google loads.</PublicText></p>}
        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      </div>
    </details>
  )
}

function CloudLanguageControl() {
  const menu = useRef(null)
  const language = useContentLanguage()
  const router = useRouter()
  const label = publicLabel('Language', language)
  useEffect(() => {
    function dismiss(event) {
      if (menu.current?.open && !menu.current.contains(event.target)) menu.current.open = false
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [])

  function close() {
    menu.current.open = false
    menu.current.querySelector('summary')?.focus()
  }

  function choose(value) {
    const selected = validLanguage(value)
    close()
    if (selected === language) return
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${LANGUAGE_COOKIE}=${selected}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
    window.dispatchEvent(new Event(LANGUAGE_CHANGED))
    router.refresh()
  }

  return <details ref={menu} className="relative text-sm notranslate" translate="no" onKeyDown={event => {
    if (event.key === 'Escape' && menu.current.open) close()
  }}>
    <summary className="cursor-pointer list-none whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-2 [&::-webkit-details-marker]:hidden" aria-label={label}>
      🌐<span className="hidden sm:inline"> {label}</span>
    </summary>
    <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl bg-white p-4 text-brown-900 shadow-xl">
      <ul className="grid grid-cols-2 gap-1" aria-label={label}>
        {Object.entries(AVAILABLE_CONTENT_LANGUAGES).map(([value, name]) => <li key={value}>
          <button type="button" lang={value} aria-pressed={language === value} onClick={() => choose(value)}
            className={`w-full rounded-lg px-2 py-1.5 text-left hover:bg-brown-50 ${language === value ? 'bg-brown-100 font-semibold' : ''}`}>{name}</button>
        </li>)}
      </ul>
      <p className="mt-2 text-xs"><PublicText>Published content may be automatically translated. Verify important details in the original language.</PublicText></p>
      <Link className="mt-2 block text-xs underline" href="/help#translation"><PublicText>Translation information</PublicText></Link>
    </div>
  </details>
}

export default function LanguageControl() {
  return CONTENT_TRANSLATION_ENABLED ? <CloudLanguageControl/> : <LegacyLanguageControl/>
}
