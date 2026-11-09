import { Suspense } from 'react'
import { SReviewDetail } from '@/components/pages/partners'
export const metadata = { title: 'Review' }
export default function Page(props) { return <Suspense fallback={null}><SReviewDetail {...props}/></Suspense> }