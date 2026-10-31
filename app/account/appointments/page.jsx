import { Suspense } from 'react'
import { PublicShell } from '@/components/ui'
import { MyAppointments } from '@/components/phase1/ListingPhase2'
export const metadata = { title: 'My appointments', robots: { index: false } }
export default function Page() { return <PublicShell><Suspense fallback={null}><MyAppointments/></Suspense></PublicShell> }
