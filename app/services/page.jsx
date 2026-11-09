import { ListingDirectory } from '@/components/phase1/Public'
import { loadListingDirectory } from '@/lib/listing-directory'

// Render on request; lib/api retains its 300-second fetch cache.
export const revalidate = 0

export const metadata = { title: 'Temple Service Professionals', description: 'Find verified priests, astrologers, artists and temple service professionals.', alternates: { canonical: '/services' } }
export default async function Page({ searchParams }) {
  return <ListingDirectory title="Temple service professionals" {...await loadListingDirectory('service', await searchParams)}/>
}
