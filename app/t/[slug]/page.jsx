import { notFound } from 'next/navigation'
import { ListingDetail } from '@/components/phase1/Public'
import { publicContentFetch } from '@/lib/public-content-server'
import { displayContent } from '@/lib/content-language'
import { JsonLd, SITE_URL, breadcrumbSchema, listingSharing } from '@/lib/seo'

// The selected language comes from a request cookie.
export const dynamic = 'force-dynamic'

// Runs before anything is streamed, so a missing temple answers HTTP 404 instead of 200.
async function load(slug) {
  try { return await publicContentFetch(`listings/${encodeURIComponent(slug)}`) } catch (error) {
    if (error.status === 404) notFound()
    console.error('Public listing API request failed', error.status || 'network')
    throw error
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const listing = await load(slug)
  const title = listing.seo_title || listing.name_en
  const description = listing.seo_description || listing.short_description_en || `${listing.name_en} on TempleAddress.`
  return { title, description, alternates: { canonical: `/t/${slug}` }, ...listingSharing(listing, listing.name_en, description) }
}

export default async function Page({ params }) {
  const { slug } = await params
  const listing = await load(slug)
  const schema = {
    '@context': 'https://schema.org', '@type': listing.listing_type === 'service' ? 'ProfessionalService' : 'PlaceOfWorship', name: listing.name_en,
    description: listing.seo_description || listing.short_description_en || undefined, url: `${SITE_URL}/t/${listing.slug}`, ...(listing.cover ? { image: listing.cover } : {}),
    ...(listing.address || listing.district ? { address: { '@type': 'PostalAddress', streetAddress: listing.address || undefined, addressLocality: listing.district?.name_en || listing.district_name || undefined, postalCode: listing.pincode || undefined, addressCountry: 'IN' } } : {}),
  }
  return <><JsonLd schema={schema}/><JsonLd schema={breadcrumbSchema([['Home', '/'], ['Temples', '/temples'], [listing.name_en, `/t/${listing.slug}`]])}/><ListingDetail listing={displayContent(listing)}/></>
}
