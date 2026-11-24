import { CataloguePage, catalogueMetadata } from '@/components/phase1/CataloguePage'

// The selected language comes from a request cookie.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { id } = await params
  return catalogueMetadata('listings', id, 'service')
}

export default async function Page({ params }) {
  const { id } = await params
  return <CataloguePage kind="listings" reference={id} type="service"/>
}
