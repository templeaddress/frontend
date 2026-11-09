import { ListingDirectory } from '@/components/phase1/Public'
import { loadListingDirectory } from '@/lib/listing-directory'

// Render on request; lib/api retains its 300-second fetch cache.
export const revalidate = 0

export const metadata = { title: 'Temple Festivals', description: 'Find temple festivals across Kerala and beyond, with dates, programmes and ways to take part.', alternates: { canonical: '/festival' } }
export default async function Page({ searchParams }) {
  return <ListingDirectory title="Temple festivals" {...await loadListingDirectory('festival', await searchParams)}/>
}
