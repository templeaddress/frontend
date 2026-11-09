import { Suspense } from 'react'
import { PartnerApplication } from '@/components/pages/account'
export const metadata = { title: 'Partner Application' }
export default function Page(props) { return <Suspense fallback={null}><PartnerApplication {...props}/></Suspense> }