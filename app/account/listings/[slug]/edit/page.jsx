import { Suspense } from 'react'
import { UserEditListing } from '@/components/pages/account'
export const metadata = { title: 'Edit Listing' }
export default function Page(props) { return <Suspense fallback={null}><UserEditListing {...props}/></Suspense> }