import Link from 'next/link'
import { HeartHandshake, Landmark, Lightbulb, Globe2 } from 'lucide-react'
import { PublicShell } from '@/components/ui'
import { JsonLd, breadcrumbSchema } from '@/lib/seo'
import { SITE } from '@/lib/site'
import PublicText from '@/components/PublicText'

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
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300"><PublicText>About us</PublicText></p>
      <h1 className="mt-2 text-4xl font-semibold md:text-5xl"><PublicText>A digital bhakti movement</PublicText></h1>
      <p className="mt-4 max-w-2xl text-lg text-brown-100"><PublicText>Preserving India's sacred heritage with modern technology.</PublicText></p>
    </div></section>
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h2 className="text-2xl font-semibold"><PublicText>Our divine purpose</PublicText></h2>
      <p className="mt-3 text-brown-700"><PublicText>TempleAddress exists to connect devotees with temples, festivals and spiritual services across India. We bridge tradition and technology to make spiritual journeys easy, trustworthy and accessible.</PublicText></p>
      <p className="mt-3 text-brown-700"><PublicText>Every listing is reviewed by our team, every booking produces a receipt, and every temple receives its bookings on a daily chart with traceable bank payouts. Devotees pay no platform fee on vazhipadu and donations.</PublicText></p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">{VALUES.map(([Icon, title, text]) => <li key={title} className="card p-5"><Icon className="text-saffron-600" size={26} aria-hidden="true"/><h3 className="mt-3 font-semibold"><PublicText>{title}</PublicText></h3><p className="mt-1 text-sm text-brown-500"><PublicText>{text}</PublicText></p></li>)}</ul>
      <section className="mt-10 rounded-2xl border border-brown-100 bg-white p-6">
        <h2 className="text-xl font-semibold"><PublicText>Who we are</PublicText></h2>
        <p className="mt-2 text-sm text-brown-700"><PublicText values={{ company: SITE.legalName }}>{'TempleAddress is built and operated by {company}, Kerala, India.'}</PublicText> <PublicText>Write to us at</PublicText> <a className="text-saffron-700 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>. <PublicText>For devotee assistance, visit</PublicText> <Link href="/support" className="text-saffron-700 underline"><PublicText>Help & support</PublicText></Link>.</p>
      </section>
    </main>
  </PublicShell>
}
