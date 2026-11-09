import { notFound } from 'next/navigation'

import EventRegistration from '@/components/phase1/EventRegistration'
import { apiFetch } from '@/lib/api'
import { staticParams } from '@/lib/catalogue'

// Pre-rendered at build and refreshed every five minutes; new events render on first visit.
export const revalidate = 300
export const dynamicParams = true

export function generateStaticParams() {
  return staticParams('events', row => ({ slug: row.slug }))
}

async function load(slug) {
  try { return await apiFetch(`events/${encodeURIComponent(slug)}`) }
  catch (error) { if (error.status === 404) notFound(); throw error }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const event = await load(slug)
  return { title: event.name_en, description: event.description_en || `${event.name_en} at ${event.host_listing?.name_en || 'TempleAddress'}.`, alternates: { canonical: `/events/${event.slug}` } }
}

export default async function Page({ params }) {
  const { slug } = await params
  const event = await load(slug)
  const schema = { '@context': 'https://schema.org', '@type': 'Event', name: event.name_en, description: event.description_en, url: `https://templeaddress.com/events/${event.slug}`, location: { '@type': 'Place', name: event.host_listing?.name_en } }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}/><EventRegistration event={event}/></>
}
