import Link from 'next/link'
import { PublicShell } from '@/components/ui'
import { JsonLd, breadcrumbSchema } from '@/lib/seo'
import { SITE, whatsappLink } from '@/lib/site'

export const metadata = {
  title: 'User guide',
  description: 'How to find temples, book poojas, donate, get receipts and list your temple on TempleAddress.',
  alternates: { canonical: '/help' },
}

const GUIDE = [
  ['For devotees', [
    ['Find a temple, festival or service', <>Use the search on the home page or open <Link href="/temples">Temples</Link>, <Link href="/festival">Festivals</Link> or <Link href="/services">Services</Link>. Filter by district, deity or category. Every listing has a short ID beside its name, such as T1001 for a temple.</>],
    ['Book a pooja', 'Open a temple, choose a pooja and date, then add the devotee’s name, star and other ritual details. Bookings for a day close at the time shown on the temple page.'],
    ['Pay securely', 'Pay with UPI, card or net banking through Razorpay. TempleAddress charges no platform fee on vazhipadu and donations, and never stores card details.'],
    ['Get your receipt', 'Your receipt is issued as soon as the payment is confirmed. Find all bookings and receipts under your account after signing in with your mobile OTP or Google.'],
    ['Donate', 'Temples that accept donations show a Donate button on their page. Donations get the same receipt as bookings.'],
    ['Book on WhatsApp or the app', <>The WhatsApp bot and the mobile app offer the same poojas, prices and receipts as the website. Say Hi on <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp {SITE.whatsappDisplay}</a> or get the app from <Link href="/download-app">Downloads</Link>.</>],
  ]],
  ['For temples, committees and professionals', [
    ['List your temple', <><Link href="/submit-temple">Submit a temple</Link> needs no login. To manage a listing yourself, <Link href="/login?next=/account/listings/new&intent=create-profile">create a profile</Link>; our team reviews it before it goes live.</>],
    ['Bookings and daily charts', 'The temple dashboard shows today’s bookings. A daily chart is prepared automatically at the configured time and sent to the temple.'],
    ['Payouts', 'Money collected by TempleAddress is paid to the temple’s verified bank account by NEFT, with the bank reference shown against each chart. Temples can also connect their own Razorpay account.'],
    ['Sponsorship and plans', <>Organisations and families can <Link href="/sponsor">sponsor a temple</Link>. Sponsorships receive a GST tax invoice.</>],
  ]],
]

export default function HelpPage() {
  return <PublicShell>
    <JsonLd schema={breadcrumbSchema([['Home', '/'], ['User guide', '/help']])}/>
    <main className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron-600">Help</p>
      <h1 className="mt-2 text-4xl font-semibold">User guide</h1>
      <p className="mt-3 text-brown-600">Everything you need to use TempleAddress. Still stuck? <Link href="/support" className="text-saffron-700 underline">Raise a support request</Link> or write to <a className="text-saffron-700 underline" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.</p>
      {GUIDE.map(([section, items]) => <section key={section} className="mt-10">
        <h2 className="text-2xl font-semibold">{section}</h2>
        <div className="mt-4 space-y-3">{items.map(([title, body]) => <details key={title} className="card group p-5 [&_a]:text-saffron-700 [&_a]:underline">
          <summary className="cursor-pointer list-none font-semibold marker:hidden">{title}<span className="float-right text-saffron-600 transition group-open:rotate-45" aria-hidden="true">+</span></summary>
          <p className="mt-3 text-sm text-brown-700">{body}</p>
        </details>)}</div>
      </section>)}
      <p className="mt-10 text-sm text-brown-500">See also our <Link href="/policies/terms" className="underline">terms</Link>, <Link href="/policies/cancellation" className="underline">cancellation</Link> and <Link href="/policies/refund" className="underline">refund</Link> policies.</p>
    </main>
  </PublicShell>
}
