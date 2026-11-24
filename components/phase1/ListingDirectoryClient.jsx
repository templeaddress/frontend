'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock3, Landmark, MapPin, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { listingPath, openingText } from '@/lib/catalogue'
import { directoryApiQuery, directoryFilters, directoryHref, directoryPageNumber, EMPTY_FILTERS } from '@/lib/listing-directory'
import { ListingSearchInput } from './ListingSearch'
import { CatalogueLoadMore, useCataloguePages } from './useCataloguePages'
import PublicText from '@/components/PublicText'

export default function ListingDirectoryClient({ initialPage, initialFilters = EMPTY_FILTERS, initialPageNumber = 1, facets = {}, type }) {
  const [filters, setFilters] = useState(initialFilters)
  const [query, setQuery] = useState(initialFilters.query)
  const [startPage, setStartPage] = useState(initialPageNumber)
  const { district, deity, category, bookable, sort } = filters
  const { districts = [], deities = [], categories = [] } = facets
  const facetLabel = (key, index, original) => {
    const native = facets.native_labels?.[key]?.[index]
    return (native !== original && native) || facets.localized?.[key]?.[index] || original
  }
  const queryKey = directoryApiQuery(type, filters)
  const useInitialPage = queryKey === directoryApiQuery(type, initialFilters) && startPage === initialPageNumber
  const filtered = query || district || deity || category || bookable

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query.trim() !== filters.query) {
        setStartPage(1)
        setFilters(value => ({ ...value, query: query.trim(), searchScope: '' }))
      }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query, filters.query])

  useEffect(() => {
    window.history.replaceState(window.history.state, '', directoryHref(type, filters, startPage))
  }, [type, filters, startPage])

  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search)
      const restored = directoryFilters(params)
      setFilters(restored); setQuery(restored.query); setStartPage(directoryPageNumber(params))
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  function updateFilter(key, value) {
    setStartPage(1); setFilters(previous => ({ ...previous, [key]: value }))
  }

  function reset() {
    setQuery(''); setFilters(EMPTY_FILTERS); setStartPage(1)
  }

  return <>
    <section className="card mb-6 p-5" aria-label="Listing search filters">
      <div className="mb-4 flex items-center gap-2"><SlidersHorizontal size={17} className="text-saffron-600"/><h2 className="font-semibold"><PublicText>Search and filter</PublicText></h2></div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2"><span className="mb-1 block text-xs font-semibold uppercase text-brown-500"><PublicText>Search</PublicText></span><ListingSearchInput value={query} onChange={setQuery} type={type} onSelect={row => { setQuery(row.name_en); setStartPage(1); setFilters(value => ({ ...value, query: row.name_en, searchScope: 'listing_only' })) }}/></div>
        <label><span className="mb-1 block text-xs font-semibold uppercase text-brown-500"><PublicText>District</PublicText></span><select className="input" value={district} onChange={event => updateFilter('district', event.target.value)}><option value=""><PublicText>All districts</PublicText></option>{districts.map((value, index) => <option key={value} value={value}>{facetLabel('districts', index, value)}</option>)}</select></label>
        <label><span className="mb-1 block text-xs font-semibold uppercase text-brown-500"><PublicText>{type === 'service' ? 'Category' : 'Main deity'}</PublicText></span><select className="input" value={type === 'service' ? category : deity} onChange={event => updateFilter(type === 'service' ? 'category' : 'deity', event.target.value)}><option value=""><PublicText>{type === 'service' ? 'All categories' : 'All deities'}</PublicText></option>{(type === 'service' ? categories : deities).map((value, index) => <option key={value} value={value}>{facetLabel(type === 'service' ? 'categories' : 'deities', index, value)}</option>)}</select></label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-brown-100 pt-4">
        {type === 'temple' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bookable} onChange={event => updateFilter('bookable', event.target.checked)}/><PublicText>Pooja booking open</PublicText></label>}
        <label className="ml-auto flex items-center gap-2 text-sm"><span className="text-brown-500"><PublicText>Sort</PublicText></span><select className="input !w-auto !py-2" value={sort} onChange={event => updateFilter('sort', event.target.value)}><option value="relevance"><PublicText>{type === 'temple' && !filters.query ? 'Pooja booking first' : 'Relevance'}</PublicText></option><option value="name_asc"><PublicText>Name A–Z</PublicText></option><option value="name_desc"><PublicText>Name Z–A</PublicText></option></select></label>
        <button type="button" className="btn-g !py-2" onClick={reset}><PublicText>Reset</PublicText></button>
      </div>
    </section>

    <ListingResults key={`${queryKey}:${startPage}`} queryKey={queryKey} initialPage={useInitialPage ? initialPage : null} startPage={startPage} filters={filters} type={type} filtered={filtered} reset={reset}/>
  </>
}

function ListingResults({ queryKey, initialPage, startPage, filters, type, filtered, reset }) {
  const pagination = useCataloguePages(queryKey, initialPage, startPage)
  const { results, count, loading, error } = pagination
  return <>
    <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-semibold"><PublicText>Search results</PublicText></h2><p className="text-sm text-brown-500"><PublicText values={{ count, query: filters.query }}>{filters.query
      ? (count === 1 ? '{count} listing for “{query}”' : '{count} listings for “{query}”')
      : (count === 1 ? '{count} listing' : '{count} listings')}</PublicText></p></div></div>
    {!loading && !error && !results.length && <div className="card p-8 text-center"><Search size={28} className="mx-auto text-brown-300"/><h3 className="mt-3 font-semibold"><PublicText>No listings match these filters</PublicText></h3><p className="mt-1 text-sm text-brown-500"><PublicText>Try another name, place or filter.</PublicText></p>{filtered && <button type="button" onClick={reset} className="btn-g mt-4"><PublicText>Clear filters</PublicText></button>}</div>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={loading}>{results.map(item => {
      const hours = openingText(item.opening_periods)
      return <Link key={item.uuid} href={listingPath(item)} className="card-premium group overflow-hidden">
        <div className="relative aspect-[16/10] bg-brown-100">
          {item.cover ? <Image src={item.cover} alt={item.name_en} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-105"/> : <span className="grid h-full place-items-center text-saffron-700"><Landmark size={38}/></span>}
          <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1 pl-20"><span className="pill bg-white/95 text-emerald-700 shadow-sm"><ShieldCheck size={12}/><PublicText>Verified</PublicText></span>{item.listing_type === 'temple' && item.booking_enabled && item.has_poojas && <span className="pill bg-white/95 text-emerald-700 shadow-sm"><PublicText>Booking Available</PublicText></span>}</div>
          <span className="pill absolute left-3 top-3 bg-brown-900/85 text-white">{item.code}</span>
        </div>
        <div className="p-5">
          <h2 className="text-xl font-semibold">{item.name_en}</h2>{item.name_ml && (!item.original_name_en || item.name_ml !== item.name_en) && <p className="ml text-sm text-brown-500">{item.name_ml}</p>}
          {item.main_deity && <p className="mt-2 text-sm font-medium text-saffron-700"><PublicText>Main deity</PublicText> · {item.main_deity}</p>}
          <p className="mt-3 flex items-start gap-2 text-sm text-brown-500"><MapPin size={15} className="mt-0.5 shrink-0"/>{item.address || <PublicText>Location available on detail page</PublicText>}</p>
          {hours && <p className="mt-2 flex items-start gap-2 text-xs text-brown-500"><Clock3 size={14} className="mt-0.5 shrink-0"/>{hours}</p>}
          <div className="mt-4 flex flex-wrap gap-2">{item.booking_enabled ? <span className="pill bg-saffron-50 text-saffron-700"><PublicText>Pooja booking</PublicText></span> : <span className="pill bg-brown-100 text-brown-500"><PublicText>Profile only</PublicText></span>}{item.donation_enabled && <span className="pill bg-blue-50 text-blue-700"><PublicText>Donations</PublicText></span>}{item.listing_type === 'service' && <span className="pill bg-brown-100"><PublicText>Enquiry only</PublicText></span>}</div>
        </div>
      </Link>
    })}</div>
    <CatalogueLoadMore pagination={pagination} href={directoryHref(type, filters, pagination.nextPage)}/>
  </>
}
