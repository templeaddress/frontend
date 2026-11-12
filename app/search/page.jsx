import Link from 'next/link'
import { PublicShell } from '@/components/ui'
import { apiFetch } from '@/lib/api'
import { listingPath } from '@/lib/catalogue'

export const revalidate = 0

const PAGE_SIZE = 24
const text = value => String(Array.isArray(value) ? value[0] || '' : value || '').trim().slice(0, 200)

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const query = text(params?.q)
  const type = text(params?.type) === 'events' ? 'events' : 'all'
  const listingTypes = type === 'all' ? ['temple', 'festival', 'service'] : []
  const [listings, events] = await Promise.all([
    Promise.all(listingTypes.map(async kind => {
      const qs = new URLSearchParams({ type: kind, q: query, search_scope: 'listing_only', page_size: String(PAGE_SIZE) })
      return (await apiFetch(`listings?${qs}`)).results.map(row => ({ ...row, resultType: kind }))
    })),
    apiFetch(`events?${new URLSearchParams({ q: query, page_size: String(PAGE_SIZE) })}`),
  ])
  const rows = [...listings.flat(), ...(type === 'events' || type === 'all' ? events.results : [])]

  return <PublicShell><main className="mx-auto max-w-6xl px-4 py-10">
    <h1 className="text-3xl font-semibold">Search results</h1>
    <p className="mt-2 text-brown-500">{query ? `Results for “${query}”` : 'Enter a search term on the home page.'}</p>
    <div className="mt-5 flex flex-wrap gap-2" aria-label="Search category">
      <Link className={`btn-g ${type === 'all' ? '!bg-brown-900 !text-white' : ''}`} href={`/search?q=${encodeURIComponent(query)}`}>All</Link>
      <Link className="btn-g" href={`/temples?q=${encodeURIComponent(query)}&search_scope=listing_only`}>Temples</Link>
      <Link className="btn-g" href={`/festival?q=${encodeURIComponent(query)}&search_scope=listing_only`}>Festivals</Link>
      <Link className="btn-g" href={`/services?q=${encodeURIComponent(query)}&search_scope=listing_only`}>Services</Link>
      <Link className={`btn-g ${type === 'events' ? '!bg-brown-900 !text-white' : ''}`} href={`/search?q=${encodeURIComponent(query)}&type=events`}>Events</Link>
    </div>
    <h2 className="mt-8 text-xl font-semibold">{rows.length} results</h2>
    {rows.length ? <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{rows.map(row => {
      const event = !row.resultType
      const href = event ? (row.kind === 'special_pooja' ? `/special/${row.slug}` : `/events/${row.slug}`) : listingPath(row)
      const label = event ? (row.kind === 'special_pooja' ? 'Special pooja' : 'Event') : ({ temple: 'Temple', festival: 'Festival', service: 'Service' }[row.resultType])
      return <li key={`${label}-${row.uuid}`}><Link className="card block p-5 hover:border-saffron-300" href={href}><span className="text-xs font-semibold uppercase text-saffron-700">{label}</span><h3 className="mt-1 text-lg font-semibold">{row.name_en}</h3><p className="mt-1 text-sm text-brown-500">{event ? row.host_listing?.name_en : row.code}</p></Link></li>
    })}</ul> : <p className="mt-4 rounded-xl bg-brown-50 p-6 text-brown-600">No results found. Try a different name, place or code.</p>}
  </main></PublicShell>
}
