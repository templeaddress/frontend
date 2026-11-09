'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import StaffOperations from '@/components/phase1/StaffOperations'
function Enquiries() { const params = useSearchParams(); const kind = params.get('view') === 'leads' ? 'leads' : 'enquiries'; return <StaffOperations key={kind} kind={kind}/> }
export default function Page() { return <Suspense fallback={<p>Loading enquiries…</p>}><Enquiries/></Suspense> }
