'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { ListingSearchInput } from '@/components/phase1/ListingSearch'
import { listingPath } from '@/lib/catalogue'
import { directoryHref, EMPTY_FILTERS } from '@/lib/listing-directory'

const CATEGORIES = [['all', 'All'], ['temple', 'Temples'], ['festival', 'Festivals'], ['service', 'Services'], ['events', 'Events']]

// BRD 1.1: one search box across categories, with a link to the full filters.
export default function HomeSearch() {
  const [type, setType] = useState('all'), [query, setQuery] = useState('')
  const router = useRouter()
  const search = value => {
    const term = value.trim()
    if (!term) return
    if (type === 'all' || type === 'events') router.push(`/search?q=${encodeURIComponent(term)}${type === 'events' ? '&type=events' : ''}`)
    else router.push(directoryHref(type, { ...EMPTY_FILTERS, query: term, searchScope: 'listing_only' }))
  }
  const placeholder = { all: 'Search temples, festivals, services or events', temple: 'Temple name, deity, place or code', festival: 'Festival name, place or code', service: 'Priest, astrologer, artist or place', events: 'Event name, host or code' }[type]
  return <div className="relative z-20 mt-8 max-w-2xl">
    <div role="tablist" aria-label="Search in" className="mb-3 flex flex-wrap gap-2">
      {CATEGORIES.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={type === key} onClick={() => setType(key)}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${type === key ? 'bg-white text-brown-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>{label}</button>)}
    </div>
    <form className="flex flex-col gap-2 rounded-2xl bg-white p-2 text-brown-900 shadow-soft sm:flex-row sm:items-start" onSubmit={event => { event.preventDefault(); search(query) }}>
      <div className="min-w-0 flex-1"><ListingSearchInput key={type} type={type === 'events' ? 'temple' : type} suggestions={type !== 'events'} value={query} onChange={setQuery} label={`Search ${type}`} placeholder={placeholder}
        onSelect={row => row.slug ? router.push(listingPath({ ...row, listing_type: row.listing_type || type })) : search(row.name_en)}/></div>
      <button className="btn-p !py-3 sm:!py-2.5">Search</button>
    </form>
    {['temple', 'festival', 'service'].includes(type) && <Link href={directoryHref(type)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-white"><SlidersHorizontal size={15} aria-hidden="true"/>Advanced search with district, deity and filters</Link>}
  </div>
}
