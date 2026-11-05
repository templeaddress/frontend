import { CataloguePage, catalogueMetadata } from '@/components/phase1/CataloguePage'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { id } = await params
  return catalogueMetadata('events', id)
}

export default async function Page({ params }) {
  const { id } = await params
  return <CataloguePage kind="events" reference={id}/>
}
