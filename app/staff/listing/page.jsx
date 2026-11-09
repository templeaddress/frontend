import { Suspense } from 'react'
import StaffDirectory from '@/components/phase1/StaffDirectory'
export const metadata = { title: 'Listing Queue' }
export default function Page() { return <Suspense fallback={null}><StaffDirectory kind="listings"/></Suspense> }
