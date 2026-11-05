import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, CalendarDays, CreditCard, Flame, HandHeart, Landmark, Languages, MapPin, MessageCircle, Quote, ReceiptText, ScrollText, Search, ShieldCheck, Smartphone, Sparkles, Star, Users } from 'lucide-react'
import { PublicShell, Photo } from '@/components/ui'
import HomeSearch from './HomeSearch'
import { listingPath } from '@/lib/catalogue'
import { SITE, whatsappLink } from '@/lib/site'

const count = value => Number(value || 0).toLocaleString('en-IN')

function SectionHead({ eyebrow, title, text, href, cta = 'View all' }) {
  return <div className="mb-5 flex items-end justify-between gap-4">
    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron-600">{eyebrow}</p><h2 className="mt-1 text-2xl font-semibold md:text-3xl">{title}</h2>{text && <p className="mt-1 max-w-2xl text-sm text-brown-500">{text}</p>}</div>
    {href && <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-saffron-700 hover:text-saffron-600">{cta}<ArrowRight size={15} aria-hidden="true"/></Link>}
  </div>
}

// Swipeable row on phones, grid from tablet up. No script needed.
function Rail({ children, label }) {
  return <ul aria-label={label} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">{children}</ul>
}
const RailItem = ({ children }) => <li className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto">{children}</li>

function Cover({ src, alt, label }) {
  return <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-brown-100">
    {src ? <Image src={src} alt={alt} fill unoptimized sizes="(max-width: 768px) 80vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105"/> : <Photo className="h-full w-full"/>}
    {label && <span className="pill absolute left-3 top-3 bg-white/90 text-brown-800 backdrop-blur">{label}</span>}
  </div>
}

function ListingCard({ row, action }) {
  return <Link href={listingPath(row)} className="group card-premium flex h-full flex-col overflow-hidden">
    <Cover src={row.cover} alt={row.name_en} label={row.code}/>
    <div className="flex flex-1 flex-col p-4">
      <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><BadgeCheck size={14} aria-hidden="true"/>Verified</p>
      <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug">{row.name_en}</h3>
      {row.name_ml && <p className="ml line-clamp-1 text-sm text-brown-500">{row.name_ml}</p>}
      <p className="mt-2 flex items-center gap-1 text-sm text-brown-500"><MapPin size={14} aria-hidden="true"/>{row.district?.name_en || 'Kerala'}{row.main_deity ? ` · ${row.main_deity}` : ''}</p>
      <span className="mt-auto pt-4 text-sm font-semibold text-saffron-700">{action}<ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-1" aria-hidden="true"/></span>
    </div>
  </Link>
}

function EventCard({ row }) {
  const next = row.occurrences?.[0]
  const date = next?.date ? new Date(`${next.date}T00:00:00`) : null
  const image = row.media?.find(item => item.url)?.url || row.host_listing?.cover
  return <Link href={`/events/${row.slug}`} className="group card-premium flex h-full flex-col overflow-hidden">
    <div className="relative">
      <Cover src={image} alt={row.name_en}/>
      {date && <span className="absolute bottom-3 left-3 rounded-xl bg-white px-3 py-1.5 text-center leading-tight shadow-soft"><b className="block text-xl text-brown-900">{date.getDate()}</b><small className="text-xs font-semibold uppercase text-saffron-700">{date.toLocaleString('en-IN', { month: 'short' })}</small></span>}
    </div>
    <div className="flex flex-1 flex-col p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-saffron-600">{row.kind === 'special_pooja' ? 'Special pooja' : 'Event'}</p>
      <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug">{row.name_en}</h3>
      <p className="mt-1 line-clamp-1 text-sm text-brown-500">{row.host_listing?.name_en}</p>
      <span className="mt-auto pt-4 text-sm font-semibold text-saffron-700">{row.registration_mode === 'paid_booking' ? 'Book now' : 'View details'}<ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-1" aria-hidden="true"/></span>
    </div>
  </Link>
}

// Real temple photographs slowly cross-fade behind the headline; reduced-motion users see the first one still.
function HeroSlides({ images }) {
  if (!images.length) return null
  return <div aria-hidden="true" className="absolute inset-0 -z-10">
    {images.map((src, index) => <div key={`${index}-${src}`} className={`absolute inset-0 ${images.length > 1 ? 'hero-slide' : ''}`} style={images.length > 1 ? { animationDelay: `${index * 6}s, ${index * 6}s`, animationDuration: `${images.length * 6}s, ${images.length * 6}s` } : undefined}>
      <Image src={src} alt="" fill unoptimized priority={index === 0} sizes="100vw" className="object-cover"/>
    </div>)}
  </div>
}

function Hero({ images, counts }) {
  const stats = [[counts.temples, 'Verified temples'], [counts.festivals, 'Festivals'], [counts.services, 'Service professionals'], [counts.events, 'Events & special poojas']].filter(([value]) => value > 0)
  return <section className="relative isolate overflow-hidden bg-brown-950 text-white">
    <HeroSlides images={images}/>
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-brown-950 via-brown-950/85 to-brown-950/30"/>
    <div aria-hidden="true" className="hero-glow absolute -left-24 top-10 -z-10 h-96 w-96"/>
    <svg aria-hidden="true" viewBox="0 0 200 200" className="animate-float absolute -right-16 bottom-0 -z-10 hidden h-[28rem] w-[28rem] text-gold-400/15 lg:block"><g fill="none" stroke="currentColor" strokeWidth=".6">{Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="100" cy="100" rx="88" ry="30" transform={`rotate(${i * 15} 100 100)`}/>)}<circle cx="100" cy="100" r="22"/><circle cx="100" cy="100" r="96"/></g></svg>
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 md:pb-32 md:pt-20">
      <p className="fade-up inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/5 px-3 py-1 text-xs font-semibold text-gold-300 backdrop-blur"><ShieldCheck size={14} aria-hidden="true"/>Committee-verified temples · Zero platform fee</p>
      <h1 className="fade-up-1 mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] md:text-6xl">Every temple. <span className="gold-text">One sacred address.</span></h1>
      <p className="fade-up-2 mt-4 max-w-2xl text-base text-brown-100 md:text-lg">Discover verified temples, festivals and spiritual services across Kerala and beyond. Book poojas, give donations and get your receipt instantly — online, on WhatsApp or in our app.</p>
      <HomeSearch/>
      {stats.length > 0 && <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">{stats.map(([value, label]) => <div key={label} className="glass rounded-2xl px-4 py-3"><dt className="text-xs text-brown-200">{label}</dt><dd className="font-display text-2xl font-semibold text-white">{count(value)}+</dd></div>)}</dl>}
    </div>
  </section>
}

const ACTIONS = [
  [Flame, 'Book a pooja', 'Vazhipadu at verified temples', '/temples?bookable=true', 'from-saffron-500 to-saffron-700'],
  [Sparkles, 'Special poojas', 'Seasonal and festival offerings', '/special', 'from-gold-500 to-saffron-600'],
  [CalendarDays, 'Festivals', 'Programmes, dates and offerings', '/festival', 'from-brown-500 to-brown-800'],
  [Users, 'Services', 'Priests, astrologers and artists', '/services', 'from-emerald-600 to-emerald-800'],
  [HandHeart, 'Sponsor a temple', 'Support a temple transparently', '/sponsor', 'from-rose-600 to-rose-800'],
  [MessageCircle, 'Book on WhatsApp', 'Same poojas, same receipt', whatsappLink('Hi, I would like to book a pooja.'), 'from-[#1fa855] to-[#128c4a]'],
]

function QuickActions() {
  return <section aria-label="What would you like to do?" className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 md:-mt-20">
    <div className="rounded-3xl border border-brown-100 bg-white/95 p-3 shadow-soft backdrop-blur md:p-4">
      <p className="mb-3 text-center text-sm font-semibold text-saffron-700">Your temple journey, all in one place</p>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{ACTIONS.map(([Icon, title, text, href, tone]) => {
        const external = href.startsWith('https://')
        return <li key={title}><Link href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`group flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br ${tone} p-4 text-white transition hover:-translate-y-0.5 hover:shadow-soft`}>
          <Icon size={26} aria-hidden="true" className="opacity-90"/><span className="mt-6"><b className="block text-base leading-tight">{title}</b><small className="mt-1 block text-xs text-white/80">{text}</small></span>
        </Link></li>
      })}</ul>
    </div>
  </section>
}

const STEPS = [
  [Search, 'Find a verified temple', 'Search by name, deity or place. Every listing is checked by our team with the temple committee.'],
  [ScrollText, 'Choose your pooja', 'Pick the pooja, date and devotee details, star and name — the same way the temple counter does.'],
  [CreditCard, 'Pay securely', 'UPI, cards or net banking through Razorpay. We never store your card details.'],
  [ReceiptText, 'Get your receipt', 'Your receipt arrives instantly, and the temple receives your booking on its daily chart.'],
]

const PROMISES = [
  [BadgeCheck, 'Verified listings', 'Temples, festivals and professionals go live only after staff review.'],
  [HandHeart, 'Zero platform fee', 'No platform fee on vazhipadu and donations. You pay what the temple charges.'],
  [ShieldCheck, 'Secure payments', 'Payments are processed by Razorpay, a PCI-DSS compliant gateway.'],
  [ReceiptText, 'Every rupee traceable', 'Receipt, daily temple chart and bank payout stay linked to your booking.'],
  [Languages, 'English & മലയാളം', 'Browse in English or Malayalam, with more Indian languages planned.'],
  [MessageCircle, 'Help when you need it', 'Our AI assistant and WhatsApp support team are a message away.'],
]

function Reviews({ reviews }) {
  return <section id="reviews" className="bg-brown-50 py-14">
    <div className="mx-auto max-w-6xl px-4">
      <SectionHead eyebrow="Devotee voices" title="What devotees say" text="Reviews are moderated by the TempleAddress team before they appear."/>
      {reviews.length ? <Rail label="Devotee reviews">{reviews.map((row, index) => <RailItem key={index}><figure className="card flex h-full flex-col p-5">
        <Quote size={22} className="text-gold-500" aria-hidden="true"/>
        <div className="mt-2 flex gap-0.5" aria-label={`${row.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} aria-hidden="true" className={i < row.rating ? 'fill-gold-400 text-gold-400' : 'text-brown-200'}/>)}</div>
        <blockquote className="mt-3 line-clamp-5 flex-1 text-sm text-brown-700">{row.body}</blockquote>
        <figcaption className="mt-4 text-sm"><b>{row.name}</b><Link href={listingPath(row.listing)} className="block truncate text-xs text-saffron-700 hover:underline">{row.listing.name_en}</Link></figcaption>
      </figure></RailItem>)}</Rail>
        : <div className="card flex flex-col items-start gap-3 p-6 md:flex-row md:items-center md:justify-between"><p className="max-w-2xl text-brown-600">Devotee reviews will appear here once they are moderated. Visited or booked at a temple listed with us? Share your experience on its page after signing in.</p><Link href="/temples" className="btn-dk shrink-0">Find a temple</Link></div>}
    </div>
  </section>
}

export default function HomePage({ temples = [], festivals = [], services = [], events = [], reviews = [], counts = {} }) {
  const covers = [...new Set(temples.map(row => row.cover).filter(Boolean))].slice(0, 4)
  // The cross-fade is timed for four slides, so two or three photos repeat.
  const heroImages = covers.length > 1 ? Array.from({ length: 4 }, (_, index) => covers[index % covers.length]) : covers
  return <PublicShell>
    <Hero images={heroImages} counts={counts}/>
    <QuickActions/>
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
      {!!events.length && <section><SectionHead eyebrow="Coming up" title="Upcoming events & special poojas" href="/special"/><Rail label="Upcoming events">{events.slice(0, 8).map(row => <RailItem key={row.uuid}><EventCard row={row}/></RailItem>)}</Rail></section>}
      {!!temples.length && <section><SectionHead eyebrow="Verified directory" title="Temples" text="Timings, deities, poojas and online booking — maintained with the temple committee." href="/temples"/><Rail label="Temples">{temples.slice(0, 8).map(row => <RailItem key={row.uuid}><ListingCard row={row} action="Visit temple"/></RailItem>)}</Rail></section>}
      <section className="overflow-hidden rounded-3xl bg-temple-grad p-6 text-white md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">How it works</p>
        <h2 className="mt-1 text-2xl font-semibold md:text-3xl">Book a pooja in four simple steps</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(([Icon, title, text], index) => <li key={title} className="glass rounded-2xl p-5"><span className="flex items-center justify-between"><Icon size={24} className="text-gold-300" aria-hidden="true"/><b className="font-display text-3xl text-white/25">{index + 1}</b></span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 text-sm text-brown-100">{text}</p></li>)}</ol>
      </section>
      {!!services.length && <section><SectionHead eyebrow="Spiritual services" title="Priests, astrologers & artists" text="Verified professionals for poojas, ceremonies and temple arts." href="/services"/><Rail label="Services">{services.slice(0, 8).map(row => <RailItem key={row.uuid}><ListingCard row={row} action="View profile"/></RailItem>)}</Rail></section>}
      {!!festivals.length && <section><SectionHead eyebrow="Utsavam" title="Temple festivals" text="Programmes, dates and festival offerings from organising committees." href="/festival"/><Rail label="Festivals">{festivals.slice(0, 8).map(row => <RailItem key={row.uuid}><ListingCard row={row} action="See festival"/></RailItem>)}</Rail></section>}
    </div>
    <Reviews reviews={reviews}/>
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
      <section><SectionHead eyebrow="Why TempleAddress" title="Authentic, transparent, made for devotees"/>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PROMISES.map(([Icon, title, text]) => <li key={title} className="card flex gap-4 p-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-saffron-50 text-saffron-600"><Icon size={22} aria-hidden="true"/></span><span><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-brown-500">{text}</p></span></li>)}</ul>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card flex flex-col justify-between gap-5 p-6 md:p-8"><div><Smartphone className="text-saffron-600" size={28} aria-hidden="true"/><h2 className="mt-3 text-2xl font-semibold">Carry your temples with you</h2><p className="mt-2 text-sm text-brown-500">Bookings, receipts and temple updates in the TempleAddress app for Android and iOS.</p></div><Link href="/download-app" className="btn-dk w-fit">Get the app<ArrowRight size={15} aria-hidden="true"/></Link></div>
        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-[#0f5132] p-6 text-white md:p-8"><div><MessageCircle className="text-[#25D366]" size={28} aria-hidden="true"/><h2 className="mt-3 text-2xl font-semibold">Need help? Just say Hi</h2><p className="mt-2 text-sm text-emerald-50">Book poojas or ask questions on WhatsApp at {SITE.whatsappDisplay}, or ask our AI assistant on any page.</p></div><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-wa w-fit">Chat on WhatsApp</a></div>
      </section>
      <section className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-gold-400/50 bg-gradient-to-r from-saffron-50 to-white p-6 md:flex-row md:items-center md:p-8">
        <div className="flex gap-4"><Landmark className="mt-1 shrink-0 text-saffron-600" size={30} aria-hidden="true"/><div><h2 className="text-2xl font-semibold">Is your temple on TempleAddress?</h2><p className="mt-1 text-sm text-brown-600">Free listing for temples, festival committees and service professionals. Committees can accept bookings and donations with daily charts and bank payouts.</p></div></div>
        <div className="flex flex-wrap gap-2"><Link href="/submit-temple" className="btn-p">Submit a temple</Link><Link href="/login?next=/account/listings/new&intent=create-profile" className="btn-g">Create a profile</Link></div>
      </section>
    </div>
  </PublicShell>
}
