import { Suspense } from 'react'
import { GatewayConfig } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Payment gateways' }
export default function Page() { return <Suspense fallback={null}><GatewayConfig/></Suspense> }
