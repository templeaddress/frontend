import { Suspense } from 'react'
import { PartnerWallet } from '@/components/phase1/PartnerPortal'
export default function Page() { return <Suspense fallback={null}><PartnerWallet/></Suspense> }
