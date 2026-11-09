import { Suspense } from 'react'
import { PartnerListings } from '@/components/phase1/PartnerPortal'
export default function Page() { return <Suspense fallback={null}><PartnerListings/></Suspense> }
