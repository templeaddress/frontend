import { Suspense } from 'react'
import { Analytics } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Analytics' }
export default function Page() { return <Suspense fallback={null}><Analytics/></Suspense> }
