import { apiCollection, listingPath } from '@/lib/catalogue'

// Generate on request so a temporary API outage cannot fail the deployment build.
export const dynamic = 'force-dynamic'

const BASE = 'https://templeaddress.com'
const STATIC_PATHS = ['/', '/temples', '/special', '/festival', '/services', '/sponsor', '/submit-temple', '/download-app', '/support',
  ...['terms', 'privacy', 'data', 'cancellation', 'refund', 'cookie'].map(kind => `/policies/${kind}`)]

export default async function sitemap() {
  // An API outage still yields a valid sitemap of the fixed pages.
  const [listings, events] = await Promise.all([apiCollection('listings'), apiCollection('events')]).catch(() => [[], []])
  const entry = (path, row) => ({ url: `${BASE}${path}`, changeFrequency: 'weekly', ...(row?.updated_at ? { lastModified: row.updated_at } : {}) })
  return [...STATIC_PATHS.map(path => entry(path)), ...listings.map(row => entry(listingPath(row), row)), ...events.map(row => entry(`/events/${row.slug}`, row))]
}
