import { notFound } from 'next/navigation'
import { catalogueReference, listingPath } from '@/lib/catalogue'
import { listingSharing } from '@/lib/seo'
import ListingDetailClient from './ListingDetailClient'
import EventRegistration from './EventRegistration'

export async function loadCatalogue(kind, reference, type) {
  try { return await catalogueReference(kind, reference, type) }
  catch (error) { if (error.status === 404) notFound(); throw error }
}

export async function catalogueMetadata(kind, reference, type) {
  const row = await loadCatalogue(kind, reference, type)
  const description = row.seo_description || row.short_description_en || row.description_en || `${row.name_en} on TempleAddress.`
  return { title: row.seo_title || row.name_en, description,
    alternates: { canonical: kind === 'events' ? `/events/${row.slug}` : listingPath(row) }, ...listingSharing(row, row.name_en, description) }
}

export async function CataloguePage({ kind = 'listings', reference, type }) {
  const row = await loadCatalogue(kind, reference, type)
  const path = kind === 'events' ? `/events/${row.slug}` : listingPath(row)
  const schema = kind === 'events'
    ? { '@context': 'https://schema.org', '@type': 'Event', name: row.name_en, description: row.description_en, url: `https://templeaddress.com${path}`, location: { '@type': 'Place', name: row.host_listing?.name_en } }
    : { '@context': 'https://schema.org', '@type': row.listing_type === 'service' ? 'ProfessionalService' : row.listing_type === 'festival' ? 'Festival' : 'PlaceOfWorship', name: row.name_en, description: row.short_description_en || row.description_en, url: `https://templeaddress.com${path}`, address: { '@type': 'PostalAddress', streetAddress: row.address, postalCode: row.pincode, addressCountry: 'IN' } }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}/>{kind === 'events' ? <EventRegistration event={row}/> : <ListingDetailClient listing={row}/>}</>
}
