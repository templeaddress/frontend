import { apiCollection, listingPath } from '@/lib/catalogue'

// Generate on request so a temporary API outage cannot fail the deployment build.
export const dynamic = 'force-dynamic'

const BASE = 'https://templeaddress.com'
export default async function sitemap() {
  const [listings, events] = await Promise.all([apiCollection('listings'), apiCollection('events')])
  const paths = ['/', '/temples', '/special', '/festival', '/services', '/submit-temple', '/download-app']
  return [...paths, ...listings.map(listingPath), ...events.map(row => `/events/${row.slug}`)].map(path => ({ url: `${BASE}${path}`, changeFrequency: 'weekly' }))
}
