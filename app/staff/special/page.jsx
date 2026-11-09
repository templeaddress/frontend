import { Suspense } from 'react'
import StaffEvents from '@/components/phase1/StaffEvents'
export const metadata = { title: 'Special Poojas' }
export default function Page() { return <Suspense fallback={null}><StaffEvents special/></Suspense> }
