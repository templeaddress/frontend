import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicShell } from '@/components/ui'
import { apiFetch } from '@/lib/api'
import { listingPath } from '@/lib/catalogue'

export const revalidate = 0
export const metadata = { title: 'Temple sponsor', robots: { index: false } }

export default async function Page({ params }) {
  const { uuid } = await params
  let data
  try { data = await apiFetch(`sponsors/${encodeURIComponent(uuid)}`, { next: { revalidate: 0 } }) }
  catch (error) { if (error.status === 404) notFound(); throw error }
  const { sponsor, listing } = data
  return <PublicShell><main className="mx-auto max-w-3xl space-y-5 px-4 py-10"><p className="text-sm text-saffron-700">Temple sponsor</p><h1 className="text-3xl font-semibold">{sponsor.title}</h1>{sponsor.media_url && <img src={sponsor.media_url} alt={`${sponsor.title} sponsor artwork`} className="max-h-96 w-full rounded-2xl object-contain"/>}{sponsor.message && <p>{sponsor.message}</p>}<p>Supporting <Link className="text-saffron-700 underline" href={listingPath(listing)}>{listing.name_en}</Link></p>{/^https?:\/\//.test(sponsor.click_url || '') && <a href={sponsor.click_url} className="btn-g" target="_blank" rel="sponsored noopener noreferrer">Visit sponsor</a>}</main></PublicShell>
}
