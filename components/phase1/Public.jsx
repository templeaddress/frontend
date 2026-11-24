import Link from 'next/link'
import { PublicShell } from '@/components/ui'
import ListingDetailClient from '@/components/phase1/ListingDetailClient'
import ListingDirectoryClient from '@/components/phase1/ListingDirectoryClient'
import PublicText from '@/components/PublicText'
import { serverContentLanguage } from '@/lib/public-content-server'

const Wrap = ({ children }) => <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

export async function ListingDirectory({ title = 'TempleAddress listings', ...directory }) {
  const language = await serverContentLanguage()
  return <PublicShell><Wrap>
    <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-wide text-saffron-600"><PublicText>Verified directory</PublicText></p><h1 className="mt-2 text-4xl font-semibold"><PublicText>{title}</PublicText></h1><p className="mt-2 text-brown-500"><PublicText>Profiles verified by the TempleAddress team.</PublicText></p></div>
    <ListingDirectoryClient key={JSON.stringify([directory.type, directory.initialFilters, directory.initialPageNumber, language])} {...directory}/>
  </Wrap></PublicShell>
}

export function ListingDetail({ listing }) {
  return <ListingDetailClient listing={listing}/>
}
