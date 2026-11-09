import { ListingDirectory } from '@/components/phase1/Public'
import { loadListingDirectory } from '@/lib/listing-directory'

// Render on request; lib/api retains its 300-second fetch cache.
export const revalidate = 0

export const metadata = { title: 'Temple Directory', description: 'Find verified temples by deity, district or pooja and book vazhipadu online.', alternates: { canonical: '/temples' } }
export default async function Page({ searchParams }) {
  return <ListingDirectory title="Temple directory" {...await loadListingDirectory('temple', await searchParams)}/>
}
