import { Suspense } from 'react'
import { StaffCharts } from '@/components/phase1/Staff'
export const metadata = { title: 'Daily Charts' }
export default function Page() { return <Suspense fallback={null}><StaffCharts/></Suspense> }
