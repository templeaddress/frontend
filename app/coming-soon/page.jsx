import Link from 'next/link'

export const metadata = { title: 'Coming soon', robots: { index: false, follow: false } }

export default function ComingSoon() {
  return <main className="mx-auto max-w-2xl px-4 py-16"><h1 className="text-3xl font-semibold">Coming soon</h1><p className="mt-3 text-brown-600">This portal is not available yet.</p><Link href="/" className="btn-g mt-6">Back to home</Link></main>
}
