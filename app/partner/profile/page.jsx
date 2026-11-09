import { Suspense } from 'react'
import { PartnerProfile } from '@/components/phase1/PartnerPortal'
export default function Page() { return <Suspense fallback={null}><PartnerProfile/></Suspense> }
