/**
 * /policies/[kind] — Static policy pages (SSG)
 */
import { notFound } from 'next/navigation'
import { Policy, policies } from '@/components/pages/policy'

const kindMeta = {
  terms:        ['Terms of Service',    'TempleAddress terms of service — how the platform works, your rights and responsibilities.'],
  privacy:      ['Privacy Policy',      'How TempleAddress collects, stores and uses your data.'],
  data:         ['Data Policy',         'Data retention, export and deletion rights on TempleAddress.'],
  cancellation: ['Cancellation Policy', 'How to cancel a pooja booking on TempleAddress and what happens next.'],
  refund:       ['Refund Policy',       'Refund timelines and eligibility for TempleAddress bookings and donations.'],
  cookie:       ['Cookie Policy',       'How TempleAddress uses cookies and similar technologies.'],
}

export function generateStaticParams() {
  return Object.keys(kindMeta).map(kind => ({ kind }))
}

export async function generateMetadata({ params }) {
  const { kind } = await params
  const meta = kindMeta[kind]
  if (!meta) return { title: 'Policy not found' }
  const [title, description] = meta
  return { title, description, alternates: { canonical: `https://templeaddress.com/policies/${kind}` } }
}

export default async function PolicyPage({ params }) {
  const { kind } = await params
  if (!kindMeta[kind]) notFound()
  return <Policy />
}
