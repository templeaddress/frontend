import { CataloguePage, catalogueMetadata } from '@/components/phase1/CataloguePage'
import { staticParams } from '@/lib/catalogue'

// Pre-rendered at build and refreshed every five minutes; new pages render on first visit.
export const revalidate = 300
export const dynamicParams = true

export function generateStaticParams() {
  return staticParams('listings?type=festival', row => ({ code: row.slug }))
}

export async function generateMetadata({ params }) {
  const { code } = await params
  return catalogueMetadata('listings', code, 'festival')
}

export default async function Page({ params }) {
  const { code } = await params
  return <CataloguePage kind="listings" reference={code} type="festival"/>
}
