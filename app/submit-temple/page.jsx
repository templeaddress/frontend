import { Suspense } from 'react'
import { PageIntro } from '@/lib/seo'
import { SubmitTemple } from '@/components/pages/public'
export const metadata = { title: 'Submit a Temple', description: 'Submit a temple or sacred listing for verification and publication on TempleAddress.', alternates: { canonical: '/submit-temple' } }
export default function Page(props) { return <Suspense fallback={<PageIntro title="Submit a temple" text="Submit a temple or sacred listing for verification and publication on TempleAddress."/>}><SubmitTemple {...props}/></Suspense> }
