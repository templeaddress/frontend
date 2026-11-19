'use client'
import { useEffect, useRef, useState } from 'react'

// Optional, user-initiated Google translation. Booking/receipt fields excluded.
export default function LanguageControl() {
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
      <summary className="cursor-pointer list-none whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-2 [&::-webkit-details-marker]:hidden" aria-label="Language">🌐<span className="hidden sm:inline"> Language</span></summary>
      <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl bg-white p-4 text-brown-900 shadow-xl">
        <p className="mb-2">English · മലയാളം · हिन्दी · தமிழ் · తెలుగు · ಕನ್ನಡ</p>
        <p className="mb-3 text-xs">Optional Google machine translation. Verify important details in English.</p>
        <div id="ta-google-translate"/>
        {(!enabled || error) && <button className="btn-p" onClick={enable}>Enable translation</button>}
        {enabled && !error && <p className="mt-2 text-xs">Choose a language above once Google loads.</p>}
        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      </div>
    </details>
  )
}
