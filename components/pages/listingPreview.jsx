'use client'
import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Eye, MapPin } from 'lucide-react'
import { getListingReview } from '@/lib/staffListingReviews'
import { Photo, Pill, PublicShell, Table } from '@/components/ui'

export default function ListingPreview() {
  const { code } = useParams()
  const listing = getListingReview(code)
  if (!listing) return <PublicShell hideChatbot><div className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-3xl font-semibold">Listing not found</h1><p className="mt-2 text-brown-500">This listing preview is unavailable.</p><Link href="/temples" className="btn-g mt-4">Browse temples</Link></div></PublicShell>

  const contactFields = listing.fields.filter(([label]) => /contact|location|venue/i.test(label))
  const detailFields = listing.fields.filter(([label]) => !/contact|location|venue/i.test(label))
  const location = contactFields.find(([label]) => /location|venue/i.test(label))?.[1]
  return <PublicShell hideChatbot>
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-saffron-50 px-4 py-3 text-sm text-saffron-700" role="status"><span className="inline-flex items-center gap-2 font-semibold"><Eye size={16}/>Listing preview</span><span>Bookings are unavailable in this preview.</span></div>
      <Photo hue={listing.hue || '#7A5238'} className="rounded-3xl p-6 text-white md:p-10">
        <Pill tone="gold">{listing.type} · {listing.code}</Pill>
        <h1 className="relative mt-16 text-3xl font-semibold md:text-4xl">{listing.name}</h1>
        {listing.ml && <p className="ml relative mt-2 text-lg text-brown-100">{listing.ml}</p>}
        {location && <p className="relative mt-3 flex items-center gap-2 text-sm text-brown-100"><MapPin size={16} className="shrink-0"/>{location}</p>}
      </Photo>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <section className="card p-5"><h2 className="text-xl font-semibold">About</h2><p className="mt-3 text-sm leading-relaxed text-brown-700">{listing.about || 'Description not submitted.'}</p></section>
          {detailFields.length > 0 && <section className="card p-5"><h2 className="mb-3 text-xl font-semibold">{listing.type} details</h2><Table head={['Detail', 'Information']} rows={detailFields}/></section>}
          {listing.sections.map(section => <section key={section.title} className="card p-5"><h2 className="mb-3 text-xl font-semibold">{section.title}</h2><Table head={section.head || ['Detail', 'Information']} rows={section.rows}/></section>)}
        </div>
        <aside className="space-y-5">
          <section className="card p-5"><h2 className="text-xl font-semibold">Contact and location</h2><dl className="mt-4 space-y-4 text-sm">{contactFields.map(([label, value]) => <div key={label}><dt className="text-brown-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl></section>
          <section className="card p-4"><Photo hue={listing.hue || '#7A5238'} className="aspect-[4/3] rounded-xl" label="Default listing photo"/></section>
        </aside>
      </div>
    </div>
  </PublicShell>
}
