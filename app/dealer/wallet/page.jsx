import { Suspense } from 'react'
import { DealerWallet } from '@/components/phase1/PartnerPortal'
export default function Page() { return <Suspense fallback={null}><DealerWallet/></Suspense> }
