import Link from 'next/link'
import PublicText from '@/components/PublicText'

export const metadata = { title: 'Coming soon', robots: { index: false, follow: false } }

export default function ComingSoon() {
  return <main className="mx-auto max-w-2xl px-4 py-16"><h1 className="text-3xl font-semibold"><PublicText>Coming soon</PublicText></h1><p className="mt-3 text-brown-600"><PublicText>This portal is not available yet.</PublicText></p><Link href="/" className="btn-g mt-6"><PublicText>Back to home</PublicText></Link></main>
}
