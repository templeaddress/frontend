import HomePage from '@/components/home/HomePage'
import { apiFetch } from '@/lib/api'
import { JsonLd, organizationSchema, websiteSchema } from '@/lib/seo'

// Static HTML refreshed every five minutes. A failed refresh keeps serving the last good page.
export const revalidate = 300

const rows = data => data?.results || data || []

async function loadHome() {
  const [home, temples, festivals, services] = await Promise.allSettled([
    apiFetch('home'), apiFetch('listings?type=temple&page_size=12'), apiFetch('listings?type=festival&page_size=8'), apiFetch('listings?type=service&page_size=8'),
  ])
  // A temporary API outage must not fail the deployment build; at run time the last good page keeps serving.
  if (home.status === 'rejected' && process.env.NEXT_PHASE !== 'phase-production-build') throw home.reason
  const value = result => (result.status === 'fulfilled' ? rows(result.value) : [])
  const base = home.status === 'fulfilled' ? home.value : {}
  return { temples: value(temples), festivals: value(festivals), services: value(services), events: base.events || [], reviews: base.reviews || [], counts: base.counts || {} }
}

export default async function Page() {
  const data = await loadHome()
  return <><JsonLd schema={organizationSchema}/><JsonLd schema={websiteSchema}/><HomePage {...data}/></>
}
