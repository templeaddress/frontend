import { Suspense } from 'react'
import StaffDirectory from '@/components/phase1/StaffDirectory'
export default function Page() { return <Suspense fallback={null}><StaffDirectory kind="bookings"/></Suspense> }
