import { PublicShell } from '@/components/ui'
import { apiFetch } from '@/lib/api'
import { DIRECTORY_PAGE_SIZE, directoryPageNumber } from '@/lib/listing-directory'
import SpecialPoojaDirectory from '@/components/phase1/SpecialPoojaDirectory'

// Render on request; lib/api retains its 300-second fetch cache.
export const revalidate = 0

export const metadata = { title: 'Special Poojas', description: 'Book special poojas and seasonal temple offerings from verified temples.', alternates: { canonical: '/special' } }
export default async function Page({ searchParams }) {
  const initialPageNumber = directoryPageNumber(await searchParams)
  const initialPage = await apiFetch(`events?kind=special_pooja&page_size=${DIRECTORY_PAGE_SIZE}&page=${initialPageNumber}`)
  return <PublicShell><main className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-4xl font-semibold">Special poojas</h1><SpecialPoojaDirectory key={initialPageNumber} initialPage={initialPage} initialPageNumber={initialPageNumber}/></main></PublicShell>
}
