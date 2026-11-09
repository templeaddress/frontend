import { CataloguePage, catalogueMetadata } from '@/components/phase1/CataloguePage'
import { staticParams } from '@/lib/catalogue'

// Pre-rendered at build and refreshed every five minutes; new pages render on first visit.
export const revalidate = 300
export const dynamicParams = true

export function generateStaticParams() {
  return staticParams('listings?type=service', row => ({ id: row.slug }))
}

export async function generateMetadata({ params }) {
  const { id } = await params
  return catalogueMetadata('listings', id, 'service')
}

export default async function Page({ params }) {
  const { id } = await params
  return <CataloguePage kind="listings" reference={id} type="service"/>
}
