'use client'
import React from 'react'
import Link from 'next/link'
import { Check, ExternalLink } from 'lucide-react'
import ListingQr from '@/components/ListingQr'
import { Pill, Table } from '@/components/ui'

export default function StaffListingReview({ listing, role }) {
  const isTemple = listing.type === 'Temple'
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="min-w-0 space-y-5">
      <section className="card p-5">
        <h3 className="font-semibold">Submission overview</h3>
        <Table head={['Field', 'Submitted value']} rows={[
          ['Listing code', listing.code], ['Type', listing.type], ['Created', listing.created],
          ['Created by', listing.creator], ...(!isTemple ? [['Submission status', listing.status]] : []), ...listing.fields,
        ]}/>
      </section>
      <section className="card p-5">
        <h3 className="font-semibold">{isTemple ? 'Content and completeness' : `About this ${listing.type.toLowerCase()}`}</h3>
        {isTemple && <div className="mt-3 flex flex-wrap gap-2">{['Basic details', 'About', 'History', 'Timings', 'Gallery · 3 photos', 'Contact'].map(label => <Pill key={label} tone="ok"><Check size={12}/>{label}</Pill>)}</div>}
        <p className="mt-3 text-sm text-brown-600">{listing.about || 'Description not submitted.'}</p>
      </section>
      {listing.sections.map(section => <section key={section.title} className="card p-5">
        <h3 className="mb-3 font-semibold">{section.title}</h3>
        <Table head={section.head || ['Field', 'Submitted value']} rows={section.rows}/>
      </section>)}
    </div>
    <aside className="space-y-4">
      <div className="card p-4">
        <div className="photo aspect-[4/3] rounded-xl p-3 text-xs text-white">Default {isTemple ? 'listing' : listing.type.toLowerCase()} photo</div>
        {listing.preview ? <Link target="_blank" rel="noreferrer" href={listing.preview} className="btn-g mt-3 w-full"><ExternalLink size={15}/>Open public preview</Link> : <p className="mt-3 text-xs text-brown-500">Public preview is not available for this submission yet.</p>}
      </div>
      {!isTemple && <section className="card p-5">
        <h3 className="font-semibold">Verification checklist</h3>
        <div className="mt-2"><Pill tone="info">{listing.type} · {listing.code}</Pill></div>
        <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-brown-600">{listing.checks.map(check => <li key={check}>{check}</li>)}</ul>
        <p className="mt-4 text-xs text-brown-500">Review the submitted information before recording a decision below.</p>
      </section>}
      {listing.type === 'Temple' && ['moderator', 'admin'].includes(role) && (listing.publicTemple ? <ListingQr key={listing.code} temple={listing.publicTemple}/> : <section className="card p-5"><h3 className="font-semibold">Temple QR code</h3><p className="mt-2 text-sm text-brown-500">A public temple page is required before generating this listing's QR.</p></section>)}
    </aside>
  </div>
}
