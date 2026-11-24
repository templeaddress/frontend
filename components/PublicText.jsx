'use client'

import { useSyncExternalStore } from 'react'
import { browserContentLanguage } from '@/lib/content-language'
import { publicLabel } from '@/lib/public-labels'

export const LANGUAGE_CHANGED = 'ta:content-language'

function subscribe(listener) {
  window.addEventListener(LANGUAGE_CHANGED, listener)
  window.addEventListener('pageshow', listener)
  return () => {
    window.removeEventListener(LANGUAGE_CHANGED, listener)
    window.removeEventListener('pageshow', listener)
  }
}

export function useContentLanguage() {
  return useSyncExternalStore(subscribe, browserContentLanguage, () => 'en')
}

export default function PublicText({ children, values }) {
  const label = publicLabel(children, useContentLanguage())
  if (!values) return label
  return label.replace(/\{(\w+)\}/g, (token, key) => Object.hasOwn(values, key) ? String(values[key]) : token)
}

export function PublicMonth({ date }) {
  const language = useContentLanguage()
  const day = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(day.getTime())) return null
  return new Intl.DateTimeFormat(`${language}-IN`, { month: 'short', timeZone: 'UTC' })
    .format(day)
}
