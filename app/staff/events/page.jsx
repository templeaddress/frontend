import { Suspense } from 'react'
import StaffEvents from '@/components/phase1/StaffEvents'
export default function Page() { return <Suspense fallback={<p>Loading events…</p>}><StaffEvents/></Suspense> }
