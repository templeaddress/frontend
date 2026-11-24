import { CataloguePage, catalogueMetadata } from '@/components/phase1/CataloguePage'

// The selected language comes from a request cookie.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { code } = await params
  return catalogueMetadata('listings', code, 'festival')
}

export default async function Page({ params }) {
  const { code } = await params
  return <CataloguePage kind="listings" reference={code} type="festival"/>
}
