import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { temples } from '@/lib/data'
import { Claim } from '@/components/pages/public'

export function generateStaticParams() { return temples.map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }) {
  const { slug } = await params
  const temple = temples.find(item => item.slug === slug)
  return { title: temple ? `Claim ${temple.name}` : 'Temple not found', robots: { index: false, follow: false } }
}
export default async function Page({ params }) {
  const { slug } = await params
  if (!temples.some(item => item.slug === slug)) notFound()
  return <Suspense fallback={null}><Claim /></Suspense>
}
