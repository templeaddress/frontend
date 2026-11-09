import { Suspense } from 'react'
import { DealerPartners } from '@/components/phase1/PartnerPortal'
export default function Page() { return <Suspense fallback={null}><DealerPartners/></Suspense> }
