import { PublicShell } from '@/components/ui'
import { publicDisplayFetch, serverContentLanguage } from '@/lib/public-content-server'
import PublicText from '@/components/PublicText'
import { DIRECTORY_PAGE_SIZE, directoryPageNumber } from '@/lib/listing-directory'
import SpecialPoojaDirectory from '@/components/phase1/SpecialPoojaDirectory'

// Render on request; lib/api retains its 300-second fetch cache.
export const revalidate = 0

export const metadata = { title: 'Special Poojas', description: 'Book special poojas and seasonal temple offerings from verified temples.', alternates: { canonical: '/special' } }
export default async function Page({ searchParams }) {
  const initialPageNumber = directoryPageNumber(await searchParams)
  const [initialPage, language] = await Promise.all([
    publicDisplayFetch(`events?kind=special_pooja&page_size=${DIRECTORY_PAGE_SIZE}&page=${initialPageNumber}`),
    serverContentLanguage(),
  ])
  return <PublicShell><main className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-4xl font-semibold"><PublicText>Special poojas</PublicText></h1><SpecialPoojaDirectory key={`${initialPageNumber}:${language}`} initialPage={initialPage} initialPageNumber={initialPageNumber}/></main></PublicShell>
}
