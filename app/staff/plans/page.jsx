import { Suspense } from 'react'
import { SponsorsPlans } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Sponsors & plans' }
export default function Page() { return <Suspense fallback={null}><SponsorsPlans/></Suspense> }
