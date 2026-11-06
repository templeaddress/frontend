import Link from 'next/link'
import { HeartHandshake, Landmark, Lightbulb, Globe2 } from 'lucide-react'
import { PublicShell } from '@/components/ui'
import { JsonLd, breadcrumbSchema } from '@/lib/seo'
import { SITE } from '@/lib/site'

export const metadata = {
  title: 'About TempleAddress',
  description: 'TempleAddress is a digital bhakti platform by VASS SYSTEMS LLP that connects devotees with verified temples, festivals and spiritual services.',
  alternates: { canonical: '/about' },
}

const VALUES = [
  [Landmark, 'Preserve sacred heritage', 'Digitally document temple stories, traditions, architecture, rituals and cultural wisdom for future generations.'],
  [Globe2, 'Universal accessibility', 'Enable devotees everywhere to discover temples and take part in spiritual life from any device.'],
  [HeartHandshake, 'Community building', 'Strengthen connections between devotees, temples, trustees, artists and volunteers.'],
  [Lightbulb, 'Innovation with reverence', 'Use modern tools respectfully, without compromising spiritual values and local traditions.'],
]

export default function AboutPage() {
  return <PublicShell>
    <JsonLd schema={breadcrumbSchema([['Home', '/'], ['About', '/about']])}/>
    <section className="bg-temple-grad text-white"><div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">About us</p>
      <h1 className="mt-2 text-4xl font-semibold md:text-5xl">A digital bhakti movement</h1>
      <p className="mt-4 max-w-2xl text-lg text-brown-100">Preserving India&apos;s sacred heritage with modern technology.</p>
    </div></section>
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Our divine purpose</h2>
      <p className="mt-3 text-brown-700">TempleAddress exists to connect devotees with temples, festivals and spiritual services across India. We bridge tradition and technology to make spiritual journeys easy, trustworthy and accessible.</p>
      <p className="mt-3 text-brown-700">Every listing is reviewed by our team, every booking produces a receipt, and every temple receives its bookings on a daily chart with traceable bank payouts. Devotees pay no platform fee on vazhipadu and donations.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">{VALUES.map(([Icon, title, text]) => <li key={title} className="card p-5"><Icon className="text-saffron-600" size={26} aria-hidden="true"/><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 text-sm text-brown-500">{text}</p></li>)}</ul>
      <section className="mt-10 rounded-2xl border border-brown-100 bg-white p-6">
        <h2 className="text-xl font-semibold">Who we are</h2>
        <p className="mt-2 text-sm text-brown-700">TempleAddress is built and operated by {SITE.legalName}, Kerala, India. Write to us at <a className="text-saffron-700 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or reach devotee support from the <Link href="/support" className="text-saffron-700 underline">help & support</Link> page.</p>
      </section>
    </main>
  </PublicShell>
}
