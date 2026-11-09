import { Suspense } from 'react'
import { ServiceAppointments } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><ServiceAppointments/></Suspense> }
