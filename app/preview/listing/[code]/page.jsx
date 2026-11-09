import { Suspense } from 'react'
import ListingPreview from '@/components/pages/listingPreview'
export const metadata = { title: 'Listing Preview', robots: { index: false, follow: false, nocache: true } }
export default function Page(props) { return <Suspense fallback={null}><ListingPreview {...props}/></Suspense> }
