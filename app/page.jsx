import { Phase1Home } from '@/components/phase1/Public'
import { apiFetch } from '@/lib/api'
import { JsonLd, organizationSchema, websiteSchema } from '@/lib/seo'

// Static HTML refreshed every five minutes. A failed refresh keeps serving the last good page.
export const revalidate = 300

async function loadHome() {
  try { return await apiFetch('home') } catch (error) {
    // A temporary API outage must not fail the deployment build.
    if (process.env.NEXT_PHASE === 'phase-production-build') return { listings: [], events: [] }
    throw error
  }
}

export default async function Page() {
  const data = await loadHome()
  return <><JsonLd schema={organizationSchema}/><JsonLd schema={websiteSchema}/><Phase1Home listings={data.listings} events={data.events}/></>
}
