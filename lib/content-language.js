export const CONTENT_TRANSLATION_ENABLED = process.env.NEXT_PUBLIC_CONTENT_TRANSLATION_ENABLED === 'true'
export const LANGUAGE_COOKIE = 'ta-content-language'
export const CONTENT_LANGUAGES = {
  en: 'English',
  ml: 'മലയാളം',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  te: 'తెలుగు',
}

export function validLanguage(value) {
  return typeof value === 'string' && Object.hasOwn(CONTENT_LANGUAGES, value) ? value : 'en'
}

export function browserContentLanguage() {
  if (!CONTENT_TRANSLATION_ENABLED || typeof document === 'undefined') return 'en'
  const pair = document.cookie.split('; ').find(item => item.startsWith(`${LANGUAGE_COOKIE}=`))
  return validLanguage(pair?.slice(LANGUAGE_COOKIE.length + 1))
}

const PUBLIC_CATALOGUE = /^(?:home|events(?:\/[\w-]+)?|listings(?:\/[\w-]+(?:\/sponsors)?)?|master-values\/[\w-]+|plans|sponsors\/[\w-]+)\/?$/
const DISPLAY_FIELDS = new Set([
  'name_en', 'name', 'description_en', 'short_description_en', 'description', 'address', 'main_deity',
  'district__name_en', 'history', 'speciality', 'guidelines', 'management', 'organiser', 'venue',
  'travel_notes', 'parking_notes', 'profession', 'qualifications', 'languages', 'duration_text',
  'availability_text', 'details', 'purpose', 'location_override', 'caption', 'label', 'benefits',
  'listing_name', 'package_name', 'plan',
])
const OPAQUE_FIELDS = new Set(['metadata', 'features', 'localized', 'contact', 'ritual_details', 'proof_details', 'prasadam_details'])

export function localizedApiPath(path, language) {
  const [pathname, query] = path.split('?', 2)
  if (validLanguage(language) === 'en' || !PUBLIC_CATALOGUE.test(pathname)) return path
  const params = new URLSearchParams(query)
  params.set('lang', language)
  return `${pathname}?${params}`
}

export function displayContent(data) {
  if (Array.isArray(data)) return data.map(displayContent)
  if (!data || typeof data !== 'object') return data
  const display = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, OPAQUE_FIELDS.has(key) ? value : displayContent(value)]))
  if (data.localized && typeof data.localized === 'object') {
    for (const [field, value] of Object.entries(data.localized)) {
      if (DISPLAY_FIELDS.has(field) && Object.hasOwn(display, field) && (typeof value === 'string' && typeof display[field] === 'string'
        || Array.isArray(value) && Array.isArray(display[field]))) {
        if (['name_en', 'address'].includes(field) && value !== display[field]) display[`original_${field}`] = display[field]
        display[field] = value
      }
    }
  }
  return display
}
