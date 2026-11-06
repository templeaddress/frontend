'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Photo } from '@/components/ui'
import { DIRECTORY_PAGE_SIZE } from '@/lib/listing-directory'
import { CatalogueLoadMore, useCataloguePages } from './useCataloguePages'

export default function SpecialPoojaDirectory({ initialPage, initialPageNumber }) {
  const pagination = useCataloguePages(`events?kind=special_pooja&page_size=${DIRECTORY_PAGE_SIZE}`, initialPage, initialPageNumber)
  return <>
    <div className="mt-6 grid gap-4 md:grid-cols-3" aria-busy={pagination.loading}>{pagination.results.map(row => {
      const image = row.media?.find(item => item.url)?.url || row.host_listing?.cover
      return <Link key={row.uuid} href={`/special/${row.slug}`} className="card overflow-hidden">
        <div className="relative aspect-[4/3] bg-brown-100">
          {image ? <Image src={image} alt={row.name_en} fill unoptimized sizes="(max-width: 767px) 100vw, 33vw" className="object-cover"/> : <Photo className="h-full w-full"/>}
        </div>
        <div className="p-5"><h2 className="text-xl font-semibold">{row.name_en}</h2><p>{row.host_listing?.name_en}</p></div>
      </Link>
    })}</div>
    {!pagination.loading && !pagination.error && !pagination.count && <p className="mt-5">No special poojas are currently published.</p>}
    <CatalogueLoadMore pagination={pagination} href={`/special?page=${pagination.nextPage}`}/>
  </>
}
