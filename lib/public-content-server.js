import { cookies } from 'next/headers'
import { apiFetch } from './api.js'
import { CONTENT_TRANSLATION_ENABLED, LANGUAGE_COOKIE, displayContent, localizedApiPath, validLanguage } from './content-language.js'

export async function serverContentLanguage() {
  return CONTENT_TRANSLATION_ENABLED ? validLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value) : 'en'
}

export async function publicContentFetch(path, options) {
  const language = await serverContentLanguage()
  if (language !== 'en' && process.env.NODE_ENV === 'development') {
    return apiFetch(localizedApiPath(path, language), { ...options, next: { ...options?.next, revalidate: 0 } })
  }
  return apiFetch(localizedApiPath(path, language), options)
}

export async function publicDisplayFetch(path, options) {
  const data = await publicContentFetch(path, options)
  // Facet values are sent back to the API as identifiers. Keep the display labels alongside them.
  if (path.startsWith('listings/facets?') || !CONTENT_TRANSLATION_ENABLED) return data
  return displayContent(data)
}
