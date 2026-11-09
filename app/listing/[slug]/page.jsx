import { notFound, permanentRedirect } from 'next/navigation'
import { apiFetch, getListing } from '@/lib/api'
import { listingPath } from '@/lib/catalogue'

// Old templeaddress.com URLs (/listing/{slug}) keep working: a live listing redirects to its typed page,
// otherwise a staff-maintained UrlRedirect row is used (BRD 9.3).
async function legacyTarget(slug) {
  try { return listingPath(await getListing(slug)) } catch (error) { if (error.status !== 404) throw error }
  try { return (await apiFetch(`redirects/resolve?path=${encodeURIComponent(`/listing/${slug}`)}`)).new_path } catch (error) { if (error.status !== 404) throw error }
  return null
}

export default async function LegacyListingPage({ params }) {
  const { slug } = await params
  const target = await legacyTarget(slug)
  if (!target) notFound()
  permanentRedirect(target)
}
