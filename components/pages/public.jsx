'use client'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { ListingQrPreview, useListingQr } from '@/components/ListingQr'
import { Search, MapPin, ShieldCheck, Clock, Share2, Phone, MessageCircle, Star, Gift, BadgeCheck, ArrowRight, Download, CalendarDays, Users, QrCode, Lock, Check, Sparkles, Landmark, Flame, PartyPopper, Music, HeartHandshake, Receipt as ReceiptIcon, RefreshCcw, SlidersHorizontal, Globe2, Smartphone, Zap, Handshake, Plus, X, PenLine, Eye, TrendingUp, Mail, UserRound } from 'lucide-react'
import { temples, bySlug, specials, services, festivals, checkoutPlans, onlineGateways, manualMethods } from '@/lib/data'
import { PublicShell, Photo, Pill, Field, Input, Select, Toggle, Table, Section, Steps, Tabs, Money, useToast, GoogleIcon, TempleMark } from '@/components/ui'
import { FileField } from '@/components/pages/checkout'

const Wrap = ({ children, className='' }) => <div className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</div>

/* ---------------- HOME ---------------- */
const liveFeed = [
  ['Ganapathi Homam booked','Kottur Sree Mahavishnu · Kozhikode','2 min ago'],
  ['₹1,001 donation · 80G receipt issued','Thrikapaleshwaram · Thiruvalla','5 min ago'],
  ['Bhagavathi Seva booked from Dubai 🇦🇪','Vengamala Bhagavathi · Trivandrum','9 min ago'],
  ['Pushpanjali × 2 booked on WhatsApp','Bilathikulam Shiva · Kozhikode','12 min ago'],
  ['Santhanagopala Pooja booked','Kottur Sree Mahavishnu · Kozhikode','18 min ago'],
  ['Daily chart sent to 214 temples','TempleAddress · 8:00 PM','yesterday'],
]
const askAI = q => window.dispatchEvent(new CustomEvent('ta:ask',{detail:q}))
export function Home() {
  const router = useRouter(); const nav = (path, opts) => router.push(path, opts); const [q,setQ]=useState('')
  const go = e=>{e.preventDefault(); nav(q.trim()?`/temples?q=${encodeURIComponent(q.trim())}`:'/temples')}
  return (<PublicShell>

    {/* ---- HERO ---- */}
    <section className="relative overflow-hidden bg-temple-grad text-white">
      <div className="hero-glow pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2"/>
      <svg className="pointer-events-none absolute -right-24 -top-24 h-[560px] w-[560px] opacity-[.07]" viewBox="0 0 100 100">{[48,40,32,24,16].map(r=><circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#fff" strokeWidth=".5"/>)}<path d="M50 2 L53 47 L98 50 L53 53 L50 98 L47 53 L2 50 L47 47 Z" fill="#fff" opacity=".25"/></svg>
      <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full opacity-[.12]"><path d="M0 60 L0 40 L22 40 L30 22 L44 22 L52 10 L70 10 L84 2 L100 -4 L116 2 L130 10 L148 10 L156 22 L170 22 L178 40 L200 40 L200 60 Z" fill="#000"/></svg>
      <Wrap className="relative grid gap-12 py-16 md:grid-cols-[1.15fr_.85fr] md:py-24">
        <div className="fade-up">
          <div className="flex flex-wrap gap-2">
            <span className="pill glass text-brown-50"><ShieldCheck size={14} className="text-gold-400"/> 1,240 committee-verified temples</span>
            <span className="pill glass text-brown-50"><Sparkles size={14} className="text-gold-400"/> AI temple assistant · English & മലയാളം</span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] md:text-6xl">A sacred address<br/>for <span className="gold-text">every temple.</span></h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-brown-100">Discover verified temples, book vazhipadu, donate with 80G receipts and follow festivals — from anywhere in the world. <b className="text-white">The temple receives 100% of what you pay.</b></p>

          {/* single smart search — detailed filters live on the Advanced search page */}
          <form onSubmit={go} className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-2 pl-5 shadow-soft ring-1 ring-gold-400/40">
            <Search size={19} className="shrink-0 text-saffron-500"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search temple, deity or place…" className="w-full bg-transparent py-2.5 text-brown-900 outline-none placeholder:text-brown-500"/>
            <button className="btn-p shrink-0 !rounded-full !px-5" aria-label="Search">Search</button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {['Santhanagopala pooja','Shiva temples','Kozhikode','Ashtami Rohini'].map(c=><button key={c} onClick={()=>nav(`/temples?q=${encodeURIComponent(c)}`)} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-brown-50 transition hover:bg-white/20">{c}</button>)}
            <Link href="/temples" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-300 hover:underline"><SlidersHorizontal size={13}/>Advanced search</Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-brown-100"><span>Prefer chat?</span><Link href="/whatsapp" className="btn-wa !py-2"><MessageCircle size={16}/>Book on WhatsApp</Link><button onClick={()=>askAI('Temple timings')} className="btn glass !py-2 text-white"><Sparkles size={15} className="text-gold-400"/>Ask AI assistant</button></div>
        </div>

        <div className="relative hidden min-h-[420px] md:block">
          <div className="glass animate-float absolute right-0 top-2 w-72 rounded-2xl p-4"><div className="flex items-center gap-2 text-xs text-brown-100"><CalendarDays size={13} className="text-gold-400"/>Tomorrow's chart · Kottur Mahavishnu</div><div className="mt-1.5 text-2xl font-bold">14 bookings · ₹3,420</div><div className="mt-2 text-xs text-brown-200">Auto-sent to the temple on WhatsApp at 8:00 PM</div></div>
          <div className="glass animate-float-2 absolute left-2 top-44 w-64 rounded-2xl p-4"><div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/20"><Check size={14} className="text-emerald-300"/></span>Receipt TA-2609-004812</div><div className="mt-1.5 text-xs text-brown-200">Ganapathi Homam · Anand · Rohini</div><div className="mt-2 text-xs font-semibold text-gold-300">100% to the temple · ₹250</div></div>
          <div className="glass animate-float-3 absolute bottom-4 right-10 w-64 rounded-2xl p-4"><div className="flex items-center gap-2 text-xs text-brown-100"><Sparkles size={13} className="text-gold-400"/>Temple assistant</div><div className="mt-1.5 text-sm">“ഗണപതി ഹോമം എത്ര രൂപയാണ്?”</div><div className="mt-1.5 rounded-xl bg-white/10 p-2 text-xs text-brown-100">Ganapathi Homam is ₹250 · 14 slots left tomorrow. Shall I book it?</div></div>
        </div>
      </Wrap>

      {/* live activity ticker */}
      <div className="relative border-t border-white/10 bg-black/20 py-2.5 backdrop-blur">
        <div className="flex overflow-hidden" aria-hidden>
          <div className="ticker-track flex shrink-0 items-center gap-10 pr-10">{[...liveFeed,...liveFeed].map(([a,b,c],i)=><span key={i} className="flex items-center gap-2 whitespace-nowrap text-xs text-brown-100"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/><b className="text-white">{a}</b>{b} · <span className="text-brown-200">{c}</span></span>)}</div>
        </div>
      </div>
    </section>

    {/* ---- TRUST STRIP ---- */}
    <div className="border-b border-brown-100 bg-white">
      <Wrap className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-6 text-sm md:grid-cols-4">
          {[['0%','platform fee on vazhipadu'],['38,400+','poojas booked'],['4.8 ★','2,100 devotee reviews'],['52','districts & 6 countries served']].map(([a,b])=><div key={b}><div className="font-display text-2xl font-bold text-brown-900">{a}</div><div className="text-brown-500">{b}</div></div>)}
        </div>
        <div className="flex items-center gap-3 text-xs text-brown-500 md:border-l md:border-brown-100 md:pl-6"><Lock size={16} className="text-emerald-600"/><span>Secure payments by<br/><b className="text-brown-800">Razorpay · PayU · Stripe</b></span></div>
      </Wrap>
    </div>

    <Wrap>
      {/* ---- EXPLORE CATEGORIES ---- */}
      <Section title="Explore the sacred" sub="Everything a devotee needs, in one place">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[[Landmark,'Temples','1,240 verified pages','/temples','#7A5238'],[Flame,'Special poojas','In your name · proof on WhatsApp','/special','#8A3A1F'],[PartyPopper,'Festivals','Utsavam pages & sponsorships','/festival','#A24A13'],[Music,'Priests & artists','Poojari, astrologer, thayambaka','/services','#3F4E5C'],[Gift,'Donate','100% to temple · 80G receipts','/donate/kottur-sree-mahavishnu-temple','#2F5F4E']].map(([I,t,d,h,hue])=>
            <Link key={t} href={h} className="card-premium group p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-soft transition group-hover:scale-110" style={{background:`linear-gradient(135deg,${hue},#2E2019)`}}><I size={20}/></span><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-0.5 text-xs leading-relaxed text-brown-500">{d}</p></Link>)}
        </div>
      </Section>

      {/* ---- FEATURED TEMPLES ---- */}
      <Section title="Bookable today" sub="Temples with verified committees and open charts" action={<Link href="/temples" className="btn-g">All temples <ArrowRight size={16}/></Link>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{temples.map(t=><TempleCard key={t.slug} t={t}/>)}</div></Section>

      {/* ---- SPECIAL POOJAS ---- */}
      <Section title="Special poojas this month" sub="Performed in your name at partner temples · proof on WhatsApp" action={<Link href="/special" className="btn-g">See all</Link>}>
        <div className="grid gap-4 md:grid-cols-3">{specials.slice(0,3).map(s=><SpecialCard key={s.id} s={s}/>)}</div></Section>
    </Wrap>

    {/* ---- WHY TRUST ---- */}
    <section className="mt-4 bg-white py-12">
      <Wrap>
        <div className="mx-auto max-w-2xl text-center"><span className="pill bg-saffron-50 text-saffron-700"><ShieldCheck size={13}/>Built for trust</span><h2 className="mt-3 font-display text-3xl font-semibold">Why devotees & committees trust TempleAddress</h2><p className="mt-2 text-brown-500">Every rupee, every ritual, every receipt — transparent and verifiable.</p></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[[ShieldCheck,'Committee-verified listings','Every temple page is claimed and approved by its committee, Devaswom or trust — then re-checked by our staff.'],
            [HeartHandshake,'100% reaches the temple','Zero platform fee on vazhipadu and donations. The gateway shows its processing fee before you pay.'],
            [MessageCircle,'Receipt on WhatsApp, instantly','Numbered receipt with the temple\'s name — and the pooja lands on the temple\'s daily chart automatically.'],
            [ReceiptIcon,'80G tax receipts','Temples with an 80G certificate issue a tax receipt with your PAN, along with Form 10BE after the year.'],
            [Lock,'Bank-grade payments','Razorpay, PayU and Stripe for international devotees. TempleAddress never stores your card details.'],
            [RefreshCcw,'Free cancellation','Cancel or reschedule any booking until the temple\'s chart closes. Refunds in 5–7 days to the same account.']]
            .map(([I,h,p])=><div key={h} className="card-premium p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-saffron-50 text-saffron-600"><I size={19}/></span><h3 className="mt-3 font-semibold">{h}</h3><p className="mt-1.5 text-sm leading-relaxed text-brown-500">{p}</p></div>)}
        </div>
      </Wrap>
    </section>

    <Wrap>
      {/* ---- HOW IT WORKS ---- */}
      <Section title="Book a pooja in under a minute" sub="From any phone — website, WhatsApp or the QR board at the temple">
        <div className="grid gap-4 md:grid-cols-4">{[['Choose temple & pooja','Every listing is verified by the committee and by our staff.'],['Enter name & nakshatra','Save family members once; reuse them every time.'],['Pay securely','Razorpay, PayU or Stripe. The fee is shown before you pay.'],['Receipt & chart','Receipt on WhatsApp; the pooja joins the temple\'s daily chart.']].map(([h,p],i)=><div key={h} className="card-premium relative p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-temple-grad font-display text-lg font-bold text-gold-300">{i+1}</div><h3 className="font-semibold">{h}</h3><p className="mt-1 text-sm text-brown-500">{p}</p>{i<3&&<ArrowRight size={16} className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-brown-200 md:block"/>}</div>)}</div></Section>

      {/* ---- AI ASSISTANT BAND ---- */}
      <section className="my-8 overflow-hidden rounded-3xl bg-temple-grad text-white">
        <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_380px] md:items-center md:p-12">
          <div className="hero-glow pointer-events-none absolute -right-20 -top-32 h-96 w-96"/>
          <div className="relative">
            <span className="pill glass"><Sparkles size={13} className="text-gold-400"/>New · Temple assistant</span>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Ask anything. <span className="gold-text">English or മലയാളം.</span></h2>
            <p className="mt-3 max-w-lg text-brown-100">Timings, pooja prices, nakshatra guidance, 80G rules — the assistant answers only from verified TempleAddress data, and hands over to a human on WhatsApp when needed.</p>
            <div className="mt-5 flex flex-wrap gap-2">{['Ganapathi Homam price','Temple timings','Cancel a booking'].map(s=><button key={s} onClick={()=>askAI(s)} className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm transition hover:bg-white/20">{s}</button>)}</div>
          </div>
          <div className="glass relative rounded-2xl p-4 text-sm">
            <div className="flex items-center gap-2 text-xs text-brown-100"><Sparkles size={13} className="text-gold-400"/>Temple assistant · answers from verified data</div>
            <div className="mt-3 ml-auto w-fit max-w-[85%] rounded-2xl bg-saffron-500 px-3 py-2">When is Ashtami Rohini at Kottur temple?</div>
            <div className="mt-2 w-fit max-w-[90%] rounded-2xl bg-white/10 px-3 py-2">Ashtami Rohini falls on <b>14 September</b>. Kottur Sree Mahavishnu Temple has special poojas open — Ashta Dravya Maha Ganapathi Homam at ₹1,500 (18 seats left). Book now?</div>
            <div className="mt-3 flex gap-2"><span className="rounded-full border border-white/25 px-3 py-1 text-xs">Book a seat</span><span className="rounded-full border border-white/25 px-3 py-1 text-xs">Talk to a human</span></div>
          </div>
        </div>
      </section>

      {/* ---- TESTIMONIALS ---- */}
      <Section title="Loved by devotees & committees" sub="From Malabar to the Gulf — real stories from the TempleAddress family">
        <div className="grid gap-4 md:grid-cols-3">{[['Sreeja S','Palakkad · devotee','Booked from Dubai for my mother\'s birthday star. The receipt and the temple\'s photo came on WhatsApp the same morning.'],['Rajesh Iyer','Kozhikode · committee secretary','Our committee runs bookings from one phone now. The evening chart on WhatsApp replaced the notebook.'],['Vinod K','Thrissur · trustee','Clear pricing, no hidden fee. The temple gets the full amount — that\'s what convinced our elders.']].map(([n,c,t])=>
          <figure key={n} className="card-premium relative p-6"><span className="absolute right-5 top-4 font-display text-6xl leading-none text-gold-300/40">”</span><div className="flex gap-0.5 text-gold-500">{[...Array(5)].map((_,i)=><Star key={i} size={14} fill="currentColor"/>)}</div><blockquote className="mt-3 text-sm leading-relaxed text-brown-700">“{t}”</blockquote><figcaption className="mt-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-temple-grad text-sm font-bold text-gold-300">{n[0]}</span><span className="text-sm font-semibold">{n}<span className="block text-xs font-normal text-brown-500">{c}</span></span></figcaption></figure>)}</div></Section>

      {/* ---- APP / GLOBAL ---- */}
      <div className="grid gap-4 py-4 md:grid-cols-2">
        <div className="card-premium flex items-center gap-4 p-6"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-saffron-50 text-saffron-600"><Smartphone size={22}/></span><div><h3 className="font-semibold">Book from any phone</h3><p className="mt-0.5 text-sm text-brown-500">Website, WhatsApp bot or the QR board at the temple — the same booking, the same receipt.</p></div></div>
        <div className="card-premium flex items-center gap-4 p-6"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-saffron-50 text-saffron-600"><Globe2 size={22}/></span><div><h3 className="font-semibold">NRI-friendly by design</h3><p className="mt-0.5 text-sm text-brown-500">Pay by international card via Stripe; prasadam by post and proof photos for special poojas.</p></div></div>
      </div>

      {/* ---- TEMPLE CTA ---- */}
      <section className="my-8 overflow-hidden rounded-3xl bg-brown-900 text-white">
        <div className="relative grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <svg className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 opacity-[.07]" viewBox="0 0 100 100">{[48,36,24].map(r=><circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#fff" strokeWidth=".8"/>)}</svg>
          <div className="relative"><h2 className="font-display text-3xl font-semibold">Is your temple listed?</h2><p className="mt-2 max-w-xl text-brown-100">Get a free verified page, a QR board and WhatsApp bookings. No computer or printer needed — the daily chart arrives on the secretary's phone at 8 PM.</p></div>
          <div className="relative flex flex-col gap-2 sm:flex-row"><Link href="/submit-temple" className="btn-p">Submit a temple</Link><Link href="/login?next=/account/listings/new&intent=create-profile" className="btn bg-white/15 text-white hover:bg-white/25">Create a Profile</Link></div>
        </div>
      </section>
    </Wrap>
  </PublicShell>)
}
const TempleCard = ({ t }) => (
  <Link href={`/t/${t.slug}`} className="card-premium group overflow-hidden">
    <Photo hue={t.hue} className="aspect-[4/3]" label={t.plan==='Pro'?'Featured':''}>
      <span className="absolute right-3 top-3 pill bg-emerald-500/90 text-white"><BadgeCheck size={12}/>Verified</span>
      <span className="absolute bottom-3 right-3 pill bg-white/90 text-brown-900"><Star size={12} className="text-gold-500" fill="currentColor"/>{t.rating}</span></Photo>
    <div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-tight">{t.name}</h3><Pill tone="n">{t.code}</Pill></div><div className="ml mt-0.5 text-sm text-brown-500">{t.ml}</div>
      <div className="mt-2 flex items-center gap-1 text-xs text-brown-500"><MapPin size={12}/>{t.place}, {t.district} · {t.deity}</div>
      <div className="mt-3 flex items-center justify-between border-t border-brown-100 pt-3 text-sm"><span className="text-brown-500">{t.poojas.length?<>From <b className="text-brown-900">₹{t.poojas[0].price}</b></>:'Bookings unavailable'}</span><span className="inline-flex items-center gap-1 font-semibold text-saffron-600 transition group-hover:gap-2">{t.bookable?'Book pooja':'View temple'} <ArrowRight size={14}/></span></div></div></Link>
)
const SpecialCard = ({ s }) => (
  <Link href={`/special/${s.id}`} className="card-premium group overflow-hidden">
    <Photo hue={s.hue} className="aspect-[16/9]" label={s.tag}><span className="absolute bottom-3 left-3 pill bg-white/90 text-brown-900"><CalendarDays size={12}/>{s.date}</span></Photo>
    <div className="p-4"><h3 className="font-semibold">{s.title}</h3><div className="ml text-sm text-brown-500">{s.ml}</div><div className="mt-1 text-xs text-brown-500">{s.temple.name} · {s.proof} proof</div>
      <div className="mt-3 flex items-center justify-between"><b className="text-lg">₹{s.price.toLocaleString('en-IN')}</b><span className={`text-xs font-semibold ${s.left<10?'text-red-600':'text-brown-500'}`}>{s.left} seats left</span></div></div></Link>
)

/* ---------------- TEMPLES DIRECTORY · ADVANCED SEARCH ---------------- */
export function Temples() {
  const sp = useSearchParams()
  const all = useMemo(()=>[...temples, ...temples.map(t=>({...t, slug:t.slug, name:t.name.replace('Temple','Kshethram')}))],[])
  const [q,setQ]=useState(sp.get('q')||''); const [district,setDistrict]=useState('All districts'); const [deity,setDeity]=useState('All deities'); const [cat,setCat]=useState('All categories'); const [bookable,setBookable]=useState(false); const [g80,setG80]=useState(false); const [sort,setSort]=useState('Top rated')
  const districts = ['All districts',...new Set(temples.map(t=>t.district))]
  const deities = ['All deities',...new Set(temples.map(t=>t.deity))]
  const [rk,setRk]=useState(0)
  const reset = () => { setQ(''); setDistrict('All districts'); setDeity('All deities'); setCat('All categories'); setBookable(false); setG80(false); setRk(k=>k+1) }
  const res = all.filter(t=>
    (!q || `${t.name} ${t.ml} ${t.deity} ${t.place} ${t.district} ${t.code}`.toLowerCase().includes(q.toLowerCase())) &&
    (district==='All districts'||t.district===district) && (deity==='All deities'||t.deity===deity) &&
    (!bookable||t.bookable) && (!g80||t.g80)
  ).sort((a,b)=>sort==='Top rated'?b.rating-a.rating:a.name.localeCompare(b.name))
  return (<PublicShell>
    <section className="bg-temple-grad text-white"><Wrap className="py-10 text-center">
      <span className="pill glass"><SlidersHorizontal size={12}/>Advanced search</span>
      <h1 className="mt-3 font-display text-4xl font-semibold">Find temples</h1>
      <p className="mx-auto mt-2 max-w-xl text-brown-100">Search 1,240 verified listings by name, temple code, place, deity or district.</p>
    </Wrap></section>
    <Wrap className="py-6">
      <div className="card -mt-12 relative z-10 p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <Field label="Search"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-500"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Name, Temple ID/code, place…" className="input !pl-9"/></div></Field>
          <Field label="District"><select className="input" value={district} onChange={e=>setDistrict(e.target.value)}>{districts.map(d=><option key={d}>{d}</option>)}</select></Field>
          <Field label="Deity"><select className="input" value={deity} onChange={e=>setDeity(e.target.value)}>{deities.map(d=><option key={d}>{d}</option>)}</select></Field>
          <Field label="Category"><select className="input" value={cat} onChange={e=>setCat(e.target.value)}>{['All categories','Temples','Festivals','Holy places','Services'].map(c=><option key={c}>{c}</option>)}</select></Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-brown-100 pt-3">
          <Toggle key={'b'+rk} label="Pooja booking open" defaultChecked={bookable} onChange={setBookable}/>
          <Toggle key={'g'+rk} label="80G certified" defaultChecked={g80} onChange={setG80}/>
          <div className="ml-auto flex items-center gap-2 text-sm"><span className="text-brown-500">Sort</span><select className="input !w-auto !py-1.5" value={sort} onChange={e=>setSort(e.target.value)}>{['Top rated','A–Z'].map(s=><option key={s}>{s}</option>)}</select><button onClick={reset} className="btn-g !py-1.5">Reset</button></div>
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between"><div><h2 className="text-xl font-semibold">Search results</h2><p className="text-sm text-brown-500">{res.length} listings{q&&<> for “{q}”</>}{district!=='All districts'&&<> in {district}</>}</p></div></div>
      {res.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{res.map((t,i)=><TempleCard key={t.slug+i} t={t}/>)}</div>
        : <div className="card mt-4 p-10 text-center"><Search size={28} className="mx-auto text-brown-200"/><h3 className="mt-3 font-semibold">No temples match those filters</h3><p className="mt-1 text-sm text-brown-500">Try clearing a filter — or ask the assistant, it knows every listing.</p><div className="mt-4 flex justify-center gap-2"><button onClick={reset} className="btn-g">Clear filters</button><button onClick={()=>askAI(q||'Find a temple')} className="btn-p"><Sparkles size={15}/>Ask AI assistant</button></div></div>}
    </Wrap></PublicShell>)
}

/* ---------------- TEMPLE PAGE ---------------- */
/* Temple detail page tabs: Basic Info (default) carries the at-a-glance facts, gallery, deities and
   nearby places; Details is the narrative/record tab — story, history, remarks and the chief priest;
   Contact, Donations and Poojas stay separate since each has its own actions/forms. */
const templeTabs = ['Basic Info','Details','Contact','Donations','Poojas']
const Fact = ({ l, v }) => <div><dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">{l}</dt><dd className="mt-0.5 text-sm font-semibold text-brown-900">{v}</dd></div>
const StatBox = ({ icon:Icon, v, l }) => <div className="rounded-xl bg-brown-50 p-3"><div className="flex items-center gap-1.5 text-brown-400"><Icon size={13}/><span className="text-[11px] font-semibold uppercase tracking-wide">{l}</span></div><div className="mt-1 text-lg font-bold text-brown-900">{v}</div></div>

export function TemplePage() {
  const { slug } = useParams(); const t = temples.find(item=>item.slug===slug); const [wl,setWl]=useState(false); const [more,setMore]=useState(false)
  const [tab,setTab] = useState(0)
  const [toast,el] = useToast()
  const [enquiry,setEnquiry] = useState({name:'',mobile:'',message:''})
  const { record: listingQr, error: qrError } = useListingQr(t)
  if(!t) return <PublicShell><Wrap className="py-10"><h1 className="text-3xl">Temple not found</h1><Link href="/temples" className="btn-p mt-4">Browse temples</Link></Wrap></PublicShell>
  const pageUrl = `https://templeaddress.com/t/${encodeURIComponent(t.slug)}`
  const mapQuery = t.latitude != null && t.longitude != null ? `${t.latitude},${t.longitude}` : `${t.name}, ${t.address}`
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const own = t.gateway==='omniware'
  const analytics = { views: t.reviews*17+140, shares: Math.round(t.reviews*0.6)+3, contacts: Math.round(t.reviews*0.12)+2, enquiries: Math.round(t.reviews*0.05)+1, poojasBooked: t.poojas.length*14+t.reviews, liveCrowd: t.poojas.some(p=>p.live)?Math.round(t.reviews/25):0 }
  const upiUri = t.upiId ? `upi://pay?pa=${t.upiId}&pn=${encodeURIComponent(t.name)}&cu=INR` : ''
  const sendEnquiry = e => { e.preventDefault(); if(!enquiry.name.trim()||!enquiry.mobile.trim()) return; toast('Enquiry sent — the committee will reply on WhatsApp'); setEnquiry({name:'',mobile:'',message:''}) }
  return (<PublicShell tenant={wl?t.name:null}><Wrap className="py-6">{el}
    {!wl && <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-800"><span>Preview this page as the temple's own site ({t.slug.split('-')[0]}.templeaddress.com)</span><Toggle label="White-label view" onChange={setWl}/></div>}
    {wl && <div className="mb-4 flex items-center justify-between rounded-xl bg-gold-300/30 px-4 py-2 text-sm"><span>Tenant view — no TempleAddress ads or nearby temples; only this temple's sponsor.</span><button onClick={()=>setWl(false)} className="font-semibold underline">Exit</button></div>}
    <Photo hue={t.hue} className="rounded-3xl p-6 text-white md:p-10">
      <div className="relative flex flex-wrap gap-2"><Pill tone="ok"><BadgeCheck size={12}/>Verified</Pill><Pill tone="n">{t.code}</Pill>{t.category&&<Pill tone="info">{t.category}</Pill>}{own&&<Pill tone="info">Pays temple directly</Pill>}</div>
      <h1 className="relative mt-24 text-3xl font-semibold md:text-5xl">{t.name}</h1><div className="ml relative mt-1 text-lg text-brown-100">{t.ml} · {t.place}, {t.district}</div>
      <div className="relative mt-4 flex flex-wrap gap-4 text-sm text-brown-100"><span className="flex items-center gap-1"><Clock size={14}/>{t.timings}</span><span className="flex items-center gap-1"><Star size={14} className="text-gold-300" fill="currentColor"/>{t.rating} · {t.reviews} reviews</span></div>
    </Photo>

    <div className="sticky top-16 z-20 -mx-4 mt-4 bg-brown-50/95 px-4 pt-4 backdrop-blur"><Tabs tabs={templeTabs} at={tab} set={setTab}/></div>

    <div className="mt-2 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">

        {tab===0 && <>
          <div className="card p-5"><h2 className="text-xl font-semibold">About</h2><p className="mt-2 text-brown-700">{t.about}</p></div>
          <div className="card p-5"><h3 className="font-semibold">Basic details</h3>
            <dl className="mt-3 grid gap-4 sm:grid-cols-2">
              <Fact l="Name (English)" v={t.name}/><Fact l="Name (Malayalam)" v={<span className="ml">{t.ml}</span>}/>
              <Fact l="Temple code" v={t.code}/><Fact l="Category" v={t.category||'Hindu Temple'}/>
              <Fact l="Main deity" v={t.deity}/><Fact l="Location" v={`${t.place}, ${t.district}`}/>
              <Fact l="Opening hours" v={t.timings}/><Fact l="Rating" v={`${t.rating} ★ (${t.reviews} reviews)`}/>
            </dl></div>
          {own && <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">Payments for this temple go directly to the temple's own account through Omniware (Federal Bank). TempleAddress does not hold this money.</div>}
          {(t.speciality||t.guidelines) && <div className="card p-5"><h3 className="font-semibold">More details</h3><div className="mt-3 grid gap-4 sm:grid-cols-2">{t.speciality&&<Info h="Speciality" p={t.speciality}/>}{t.guidelines&&<Info h="Guidelines" p={t.guidelines}/>}</div></div>}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card p-5"><h3 className="font-semibold">Deities</h3><div className="mt-2 flex flex-wrap gap-2"><Pill tone="warn">{t.deity} (main)</Pill>{t.others.map(o=><Pill key={o}>{o}</Pill>)}</div></div>
            <div className="card p-5"><h3 className="font-semibold">Nearby places to visit</h3><ul className="mt-2 space-y-1 text-sm text-brown-700">{t.nearby.map(n=><li key={n} className="flex gap-2"><MapPin size={14} className="mt-1 shrink-0 text-saffron-500"/>{n}</li>)}</ul></div>
          </div>
          <div className="card p-5"><h3 className="font-semibold">Gallery</h3><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{[1,2,3,4].map(i=><Photo key={i} hue={t.hue} className="aspect-square rounded-xl"/>)}</div><p className="mt-2 text-xs text-brown-500">Photos are illustrative sample images for this prototype.</p></div>
          {t.sponsor && <Photo hue={t.hue} className="relative flex h-24 items-center gap-4 overflow-hidden rounded-2xl px-6 text-white"><span className="pill absolute left-4 top-3 bg-black/30 text-[10px]">Sponsored</span><div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white text-sm font-bold text-emerald-700">RIF</div><div><div className="text-xs text-brown-100">Sponsored by</div><b className="text-lg">{t.sponsor}</b></div></Photo>}
        </>}

        {tab===1 && <div className="card p-5"><h3 className="font-semibold">Details</h3>
          <div className="mt-3 space-y-4">
            <div><h4 className="font-semibold">Story</h4>{t.story ? <p className="mt-1 text-brown-700">{t.story}</p> : <p className="mt-1 text-sm text-brown-500">No story or aithihyam has been recorded for this temple yet.</p>}</div>
            <div><h4 className="font-semibold">History</h4>{t.history ? <p className="mt-1 text-brown-700">{t.history}</p> : <p className="mt-1 text-sm text-brown-500">No history has been recorded for this temple yet.</p>}</div>
            <div><h4 className="font-semibold">Remarks</h4>{t.remarks ? <p className="mt-1 text-brown-700">{t.remarks}</p> : <p className="mt-1 text-sm text-brown-500">No remarks have been recorded for this temple yet.</p>}</div>
          </div>
          {t.chiefPriest&&<div className="mt-4 flex items-center gap-2 rounded-xl bg-brown-50 p-3 text-sm"><UserRound size={16} className="text-saffron-600"/><span>Chief priest (Thantri/Melshanthi): <b>{t.chiefPriest}</b></span></div>}
        </div>}

        {tab===2 && <>
          <div className="card p-5"><h2 className="text-xl font-semibold">Contact & directions</h2><p className="mt-1 text-sm text-brown-700">{t.address}</p>
            <div className="mt-3 flex flex-wrap gap-2">{t.publicPhone&&<a href={`tel:${t.publicPhone}`} className="btn-g"><Phone size={16}/>Call office</a>}{t.publicPhone&&<a href={`https://wa.me/${t.publicPhone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="btn-wa"><MessageCircle size={16}/>WhatsApp</a>}{t.publicEmail&&<a href={`mailto:${t.publicEmail}`} className="btn-g"><Mail size={16}/>Email office</a>}<a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn-g"><MapPin size={16}/>Open in Maps</a><a href={`https://wa.me/?text=${encodeURIComponent(`${t.name} ${pageUrl}`)}`} target="_blank" rel="noopener noreferrer" className="btn-g"><Share2 size={16}/>Share</a></div>
            {(t.publicPhone||t.publicEmail)&&<div className="mt-3 grid gap-4 sm:grid-cols-2 rounded-xl bg-brown-50 p-3">{t.publicPhone&&<Fact l="Office contact" v={t.publicPhone}/>}{t.publicEmail&&<Fact l="Office email" v={t.publicEmail}/>}</div>}
            <iframe title={`Map of ${t.name}`} loading="lazy" referrerPolicy="no-referrer" src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} className="mt-4 h-64 w-full rounded-xl border-0"/><p className="mt-2 text-xs text-brown-500">{t.latitude == null ? 'Map searches the listing address; verify directions before travel.' : 'Map uses the listing coordinates.'}</p></div>
          {!wl && <div className="card p-5"><h2 className="text-xl font-semibold">Nearby temples</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{temples.filter(x=>x.slug!==t.slug).slice(0,3).map(x=><Link key={x.slug} href={`/t/${x.slug}`} className="rounded-xl border border-brown-100 p-3 hover:bg-brown-50"><b className="text-sm">{x.name}</b><div className="text-xs text-brown-500">{x.district}</div></Link>)}</div></div>}
        </>}

        {tab===3 && <>
          <div className="card p-5"><div className="flex items-center gap-2"><Gift size={18} className="text-saffron-600"/><h3 className="font-semibold">Direct UPI donation</h3><Pill tone="ok">No charges</Pill></div><p className="mt-1 text-sm text-brown-500">Donate directly to the temple's own UPI ID — the temple receives 100%.</p>
            {t.upiId ? <div className="mt-4 grid items-center gap-4 sm:grid-cols-[128px_1fr]"><div className="mx-auto grid aspect-square w-32 place-items-center rounded-xl border-4 border-brown-900 bg-white p-2"><QRCodeSVG value={upiUri} size={104} level="M"/></div><div className="text-sm"><b className="text-base">{t.upiId}</b><p className="mt-1 text-brown-500">Scan with any UPI app, or tap below on a phone.</p><a href={upiUri} className="btn-g mt-2 inline-flex"><QrCode size={16}/>Pay via UPI app</a></div></div> : <p className="mt-3 text-sm text-brown-500">This temple hasn't published a direct UPI ID yet.</p>}</div>
          <div className="card p-5"><div className="flex items-center gap-2"><ReceiptIcon size={18} className="text-saffron-600"/><h3 className="font-semibold">Donation with receipt</h3><Pill tone="info">2–5% fee</Pill></div><p className="mt-1 text-sm text-brown-500">Get an official numbered receipt and secure gateway payment support.</p>
            <div className="mt-3 flex flex-wrap gap-2">{['Razorpay','PayU','Stripe','UPI'].map(g=><Pill key={g}>{g}</Pill>)}</div>
            <Link href={`/donate/${t.slug}`} className="btn-p mt-4 w-full">Donate with receipt <ArrowRight size={16}/></Link></div>
          <form onSubmit={sendEnquiry} className="card space-y-3 p-5"><h3 className="font-semibold">Quick enquiry</h3><p className="text-sm text-brown-500">Send a simple enquiry to this listing with your name, mobile number and message.</p>
            <Field label="Your name"><Input value={enquiry.name} onChange={e=>setEnquiry(v=>({...v,name:e.target.value}))} placeholder="Your name"/></Field>
            <Field label="Mobile number"><Input type="tel" value={enquiry.mobile} onChange={e=>setEnquiry(v=>({...v,mobile:e.target.value}))} placeholder="+91"/></Field>
            <Field label="Message"><textarea className="input" rows={3} value={enquiry.message} onChange={e=>setEnquiry(v=>({...v,message:e.target.value}))} placeholder={`I have an enquiry about ${t.name}.`}/></Field>
            <button className="btn-p w-full">Send enquiry</button></form>
        </>}

        {tab===4 && <div className="card p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Book a vazhipadu</h2><span className="text-xs text-brown-500">Chart closes {t.cutoff} the day before</span></div>
          <div className="mt-2 divide-y divide-brown-100">{(more?t.poojas:t.poojas.slice(0,6)).map(pj=><div key={pj.code} className="flex items-center gap-3 py-3"><div className="flex-1"><div className="flex items-center gap-2"><span className="font-semibold">{pj.name}</span>{pj.live&&<span className="pill bg-emerald-50 text-emerald-700"><Zap size={11}/>Live</span>}</div><div className="ml text-sm text-brown-500">{pj.ml}{pj.dailyLimit?` · ${pj.dailyLimit}/day`:''}</div></div><div className="w-20 text-right text-lg font-bold">₹{pj.price}</div><Link href={`/book/${t.slug}?pooja=${pj.code}`} className="btn-p !py-2">Book</Link></div>)}</div>
          {t.poojas.length>6 && <button onClick={()=>setMore(!more)} className="mt-2 text-sm font-semibold text-saffron-600">{more?'Show fewer':`Show all ${t.poojas.length} poojas`}</button>}
          {t.poojas.some(pj=>pj.live) && <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800"><Zap size={13} className="mt-0.5 shrink-0"/><span><b>Live</b> poojas can be booked instantly, any time — even after tonight's chart is prepared. They're added to the temple's next chart automatically.</span></p>}</div>}

      </div>
      <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <div className="card p-5"><Link href={`/book/${t.slug}`} className="btn-p w-full !py-3 text-base">Book pooja</Link><Link href={`/donate/${t.slug}`} className="btn-s mt-2 w-full"><Gift size={16}/>Donate</Link><Link href="/whatsapp" className="btn-wa mt-2 w-full"><MessageCircle size={16}/>Book on WhatsApp</Link><p className="mt-3 text-xs text-brown-500">Temple receives 100% of the pooja amount. The payment gateway shows its processing fee before you pay.</p></div>

        <div className="card p-5"><h3 className="font-semibold">Quick info</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">{t.bookable&&<Pill tone="ok">Booking open</Pill>}<Pill tone="info">Donation open</Pill></div>
          <dl className="mt-3 space-y-3">
            <Fact l="Temple code" v={t.code}/><Fact l="Category" v={t.category||'Hindu Temple'}/><Fact l="Main deity" v={t.deity}/><Fact l="Location" v={`${t.place}, ${t.district}`}/><Fact l="Opening" v={t.timings}/>
          </dl></div>

        <div className="card p-5"><h3 className="font-semibold">Listing analytics</h3><p className="text-xs text-brown-500">Illustrative sample metrics for this prototype.</p>
          <div className="mt-3 grid grid-cols-2 gap-2"><StatBox icon={Eye} v={analytics.views.toLocaleString('en-IN')} l="Views"/><StatBox icon={Share2} v={analytics.shares} l="Shares"/><StatBox icon={Phone} v={analytics.contacts} l="Contacts"/><StatBox icon={Mail} v={analytics.enquiries} l="Enquiries"/><StatBox icon={CalendarDays} v={analytics.poojasBooked.toLocaleString('en-IN')} l="Poojas booked"/><StatBox icon={TrendingUp} v={analytics.liveCrowd} l="Live crowd"/></div></div>

        {t.events?.length>0&&<div className="card p-5"><h3 className="font-semibold">Upcoming</h3>{t.events.filter(event=>event.date>=new Date().toISOString().slice(0,10)).map(event=><p key={event.date+event.name}>{event.name} · {event.date}</p>)}</div>}
        {!t.sponsor && !wl && <Link href="/sponsor" className="block rounded-2xl border-2 border-dashed border-brown-200 p-4 text-sm hover:bg-white"><b>Sponsor slot available</b><div className="text-brown-500">Put your name on this temple's page, receipts and QR board.</div></Link>}
        {t.sponsorAd&&<div className="card p-4"><p className="mb-2 text-xs text-brown-500">Sponsored advertisement · {t.sponsor}</p>{t.sponsorAd.banner&&<img src={t.sponsorAd.banner} alt={t.sponsorAd.text||'Sponsor advertisement'} className="w-full rounded-xl"/>}{t.sponsorAd.text&&<p className="mt-2">{t.sponsorAd.text}</p>}{/^https?:\/\//.test(t.sponsorAd.url||'')&&<a href={t.sponsorAd.url} rel="sponsored noopener noreferrer" target="_blank" className="underline">Visit sponsor</a>}</div>}
        <div className="card p-3">{qrError?<p className="text-xs text-brown-500">Temple QR is temporarily unavailable.</p>:<div className="flex items-center gap-3"><ListingQrPreview value={listingQr?.targetUrl||pageUrl} size={64}/><div className="min-w-0"><div className="flex items-center gap-1.5 text-sm font-semibold"><QrCode size={14}/>Temple QR code</div><p className="mt-0.5 truncate text-xs text-brown-500">Scan to open {t.name}</p></div></div>}</div>
        <div className="card p-5 text-sm"><b>Are you the temple committee?</b><p className="mt-1 text-brown-500">Claim this page to manage poojas, prices and the daily chart.</p><Link href={`/claim/${t.slug}`} className="btn-g mt-2 w-full"><Lock size={14}/>Claim this temple</Link></div>
      </aside>
    </div>
  </Wrap></PublicShell>)
}
const Info = ({ h, p }) => <div><h3 className="font-semibold">{h}</h3><p className="mt-1 text-sm text-brown-700">{p}</p></div>

/* ---------------- PUBLIC TEMPLE SUBMISSION ---------------- */
export function SubmitTemple() {
  return (<PublicShell><Wrap className="max-w-2xl py-10"><div><Pill tone="gold">Phase 1 listing submission</Pill><h1 className="mt-3 text-3xl font-semibold">Submit a listing</h1><p className="mt-2 text-brown-500">Temple, festival and service listings can be submitted for staff review. Sign in first so your draft, review status and staff feedback remain securely linked to your account.</p></div>
    <div className="card mt-6 space-y-5 p-5 sm:p-7"><div className="rounded-2xl bg-brown-50 p-4"><h2 className="font-semibold">What happens next</h2><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-brown-700"><li>Sign in using phone OTP or Google.</li><li>Create the listing draft and add its official contact and public content.</li><li>Submit the completed draft for staff verification.</li><li>The listing becomes public only after staff approval.</li></ol></div><div className="flex flex-col gap-3 sm:flex-row"><Link href="/login?next=%2Faccount%2Flistings%2Fnew" className="btn-p flex-1">Sign in to submit</Link><Link href="/account/listings/new" className="btn-g flex-1">Continue with my account</Link></div><p className="text-center text-xs text-brown-500">Submitting content does not grant vendor ownership or operational access.</p></div>
  </Wrap></PublicShell>)
}

/* ---------------- CLAIM OWNERSHIP ---------------- */
export function Claim() {
  const { slug } = useParams(); const t = bySlug(slug); const [step,setStep]=useState(0)
  return (<PublicShell><Wrap className="max-w-2xl py-10">
    <Link href={`/t/${t.slug}`} className="text-sm text-brown-500">← {t.name}</Link><h1 className="mt-2 text-3xl font-semibold">Claim this temple page</h1><p className="text-brown-500">For the committee, Devaswom or trust that manages {t.name}.</p>
    <Steps items={['Who you are','Verify','Documents','Review']} at={step}/>
    <div className="card p-6">
      {step===0 && <div className="space-y-4"><Field label="Your role"><Select options={['Secretary','President','Treasurer','Devaswom officer','Melshanthi','Trustee']}/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Your name"><Input placeholder="Nishanth K"/></Field><Field label="WhatsApp number"><Input placeholder="+91"/></Field></div><Field label="Email (for the daily chart)"><Input placeholder="office@…"/></Field>
        <div className="rounded-xl bg-brown-50 p-3 text-sm">This page is currently managed by <b>partner Jinsha (JIN-4471)</b>. On approval, ownership transfers to you; the partner keeps referral credit.</div><button onClick={()=>setStep(1)} className="btn-p w-full">Continue</button></div>}
      {step===1 && <div className="space-y-4"><p className="text-sm">We'll call the temple's listed number <b>+91 90… 422</b> and send an OTP to your WhatsApp.</p><Field label="OTP"><Input placeholder="••••••"/></Field><button onClick={()=>setStep(2)} className="btn-p w-full">Verify</button></div>}
      {step===2 && <div className="space-y-4"><Field label="Committee resolution / authorisation letter" hint="PDF or photo"><Input type="file"/></Field><Field label="Trust / committee PAN"><Input placeholder="AAATK…"/></Field><Field label="ID proof of the claimant"><Input type="file"/></Field><button onClick={()=>setStep(3)} className="btn-p w-full">Submit</button></div>}
      {step===3 && <div className="space-y-3 text-center"><ShieldCheck size={40} className="mx-auto text-emerald-600"/><h3 className="text-xl font-semibold">Claim submitted</h3><p className="text-sm text-brown-500">Staff verify within 2 working days. You'll get a WhatsApp invite to the temple dashboard where you can edit the page, poojas, prices and payment settings — and transfer ownership later if needed.</p><Link href="/vendor" className="btn-g">Preview the temple dashboard</Link></div>}
    </div></Wrap></PublicShell>)
}

/* ---------------- BOOKING ---------------- */
export function Book() {
  const { slug } = useParams(); const t = bySlug(slug); const sp = useSearchParams()
  const initial = Math.max(0, t.poojas.findIndex(pj=>pj.code===sp.get('pooja')))
  const [s,setS]=useState(0); const [pooja,setPooja]=useState(initial===-1?0:initial); const [qty,setQty]=useState(1)
  const pj = t.poojas[pooja]; const price = pj.price*qty; const fee = 0
  return (<PublicShell><Wrap className="max-w-2xl py-8">
    <Link href={`/t/${t.slug}`} className="text-sm text-brown-500">← {t.name}</Link><h1 className="mt-1 text-3xl font-semibold">Book a vazhipadu</h1>
    <Steps items={['Pooja & date','Devotee','Pay']} at={s}/>
    {s===0 && <div className="card space-y-4 p-6">
      <Field label="Pooja"><select className="input" value={pooja} onChange={e=>setPooja(+e.target.value)}>{t.poojas.map((p,i)=><option key={p.code} value={i}>{p.name}{p.live?' · Live':''} — ₹{p.price}</option>)}</select></Field>
      {pj.live ? <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><Zap size={16} className="mt-0.5 shrink-0"/><span><b>Live booking.</b> This pooja can be booked instantly, any day, any time — {pj.startTime&&`performed around ${pj.startTime}`}. The temple gets an email, SMS and WhatsApp notification right away; it's settled with the next chart.</span></div>
        : <div className="grid gap-4 sm:grid-cols-2"><Field label="Date" hint={`Chart for this date closes the day before at ${t.cutoff}`}><Input type="date" defaultValue="2026-09-13"/></Field><Field label="Quantity"><select className="input" value={qty} onChange={e=>setQty(+e.target.value)}>{[1,2,3,5].map(n=><option key={n}>{n}</option>)}</select></Field></div>}
      {pj.live && <Field label="Quantity"><select className="input" value={qty} onChange={e=>setQty(+e.target.value)}>{[1,2,3,5].map(n=><option key={n}>{n}</option>)}</select></Field>}
      {!pj.live && pj.dailyLimit>0 && <div className="rounded-xl bg-saffron-50 p-3 text-sm text-saffron-700">{pj.name}: {pj.dailyLimit} per day · <b>{Math.max(pj.dailyLimit-6,0)} left</b> for 13 Sept.</div>}
      {pj.minBookingTime && !pj.live && <p className="text-xs text-brown-500">Book at least: {pj.minBookingTime}</p>}
      <button onClick={()=>setS(1)} className="btn-p w-full">Continue</button></div>}
    {s===1 && <div className="card space-y-4 p-6">
      <div><span className="label">Saved family members</span><div className="flex flex-wrap gap-2">{['Anand · Rohini','Devi · Makayiram','Aarav · Thiruvathira','+ New'].map((f,i)=><button key={f} className={`rounded-full px-3 py-1.5 text-sm ${i===0?'bg-brown-900 text-white':'border border-brown-200 bg-white'}`}>{f}</button>)}</div></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Devotee name"><Input defaultValue="Anand"/></Field><Field label="Nakshatra"><Select options={['Rohini','Makayiram','Thiruvathira','Punartham','Pooyam']}/></Field><Field label="Gothram (optional)"><Input placeholder="e.g. Bharadwaja"/></Field><Field label="Place"><Input defaultValue="Kozhikode"/></Field></div>
      <Field label="Instructions for the temple (optional)"><textarea className="input" rows={2} placeholder="e.g. after 8 AM"/></Field>
      <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">An OTP will be sent to <b>+91 94966 86256</b> on WhatsApp to confirm.</div>
      <div className="flex gap-2"><button onClick={()=>setS(0)} className="btn-g">Back</button><button onClick={()=>setS(2)} className="btn-p flex-1">Continue to payment</button></div></div>}
    {s===2 && <div className="card space-y-4 p-6"><h3 className="text-lg font-semibold">Review</h3>
      <dl className="grid grid-cols-[130px_1fr] gap-y-1 text-sm"><dt className="text-brown-500">Temple</dt><dd className="font-semibold">{t.name}</dd><dt className="text-brown-500">Pooja</dt><dd className="font-semibold">{pj.name} × {qty}{pj.live&&' · Live booking'}</dd><dt className="text-brown-500">Date</dt><dd className="font-semibold">{pj.live?'Today · instant':'Sat, 13 Sept 2026'}</dd><dt className="text-brown-500">For</dt><dd className="font-semibold">Anand · Rohini</dd></dl>
      <div className="divide-y divide-brown-100 rounded-xl bg-brown-50 px-4"><Row l="Pooja amount (to temple)" v={price}/><Row l={<>Convenience fee <span className="text-xs text-brown-500">(this listing: off)</span></>} v={fee}/><Row l="Total" v={price+fee} big/></div>
      <div><span className="label">Pay with</span><div className="grid grid-cols-3 gap-2">{['Razorpay','PayU','Stripe (intl.)'].map((g,i)=><button key={g} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${i===0?'border-saffron-500 bg-saffron-50 text-saffron-700':'border-brown-200 bg-white'}`}>{g}</button>)}</div><p className="mt-1 text-xs text-brown-500">The gateway adds its processing fee at checkout and shows it before you pay. Free cancellation until the chart closes.</p></div>
      <Toggle label="Also send the receipt on WhatsApp" defaultChecked/>
      <div className="flex gap-2"><button onClick={()=>setS(1)} className="btn-g">Back</button><Link href="/receipt" className="btn-p flex-1">Pay ₹{price} with Razorpay</Link></div></div>}
  </Wrap></PublicShell>)
}
const Row = ({ l, v, big }) => <div className={`flex justify-between py-2.5 ${big?'text-lg font-bold':'text-sm'}`}><span>{l}</span><Money v={v}/></div>

/* ---------------- RECEIPT ---------------- */
export function Receipt() {
  return (<PublicShell><Wrap className="max-w-xl py-8">
    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800"><Check className="shrink-0"/><span><b>Booking confirmed.</b> Receipt sent to WhatsApp and email. It will appear on the temple's chart for 13 Sept.</span></div>
    <div className="card p-6"><div className="flex items-start justify-between border-b-2 border-saffron-500 pb-4"><div><div className="font-display text-lg font-semibold">Kottur Sree Mahavishnu Temple</div><div className="text-xs text-brown-500">Ulliyeri, Kozhikode – 673614</div></div><div className="text-right"><b>Receipt</b><div className="text-xs text-brown-500">TA-2609-004812</div></div></div>
      <dl className="mt-4 grid grid-cols-[140px_1fr] gap-y-1.5 text-sm"><dt className="text-brown-500">Devotee</dt><dd className="font-semibold">Anand · Rohini</dd><dt className="text-brown-500">Pooja</dt><dd className="font-semibold">Ganapathi Homam × 1</dd><dt className="text-brown-500">Pooja date</dt><dd className="font-semibold">Sat, 13 Sept 2026</dd><dt className="text-brown-500">Booked on</dt><dd className="font-semibold">11 Sept 2026, 6:42 PM</dd><dt className="text-brown-500">Payment</dt><dd className="font-semibold">Paid · Razorpay pay_QX8k12…</dd><dt className="text-brown-500">Status</dt><dd><Pill tone="ok">Confirmed</Pill></dd></dl>
      <div className="mt-4 divide-y divide-brown-100 rounded-xl bg-brown-50 px-4"><Row l="Pooja amount" v={250}/><Row l="Convenience fee" v={0}/><Row l="Total paid" v={250} big/></div>
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-gold-300/25 p-3 text-xs"><div className="grid h-8 w-8 place-items-center rounded-md bg-white text-[10px] font-bold text-emerald-700">RIF</div>This temple's online booking is sponsored by <b>Resurge India Foundation</b></div>
      <p className="mt-3 text-xs text-brown-500">Cancel or reschedule until 12 Sept 8:00 PM from your account · Powered by TempleAddress</p>
      <div className="mt-4 flex flex-wrap gap-2"><a className="btn-p"><Download size={16}/>PDF</a><a className="btn-wa"><MessageCircle size={16}/>WhatsApp</a><Link href="/account" className="btn-g">My bookings</Link></div></div>
    <div className="card mt-6 border border-gold-400 p-6"><div className="flex items-start justify-between border-b-2 border-gold-400 pb-4"><div><div className="font-display text-lg font-semibold">Donation receipt · 80G</div><div className="text-xs text-brown-500">Generated with the booking because this temple holds an 80G certificate</div></div><div className="text-right"><b>DN-2609-000231</b><div className="text-xs text-brown-500">u/s 80G(5)(vi)</div></div></div>
      <dl className="mt-4 grid grid-cols-[140px_1fr] gap-y-1.5 text-sm"><dt className="text-brown-500">Donor</dt><dd className="font-semibold">Anand K</dd><dt className="text-brown-500">PAN</dt><dd className="font-semibold">ABCDE1234F</dd><dt className="text-brown-500">Purpose</dt><dd className="font-semibold">Annadanam fund</dd><dt className="text-brown-500">Amount</dt><dd className="font-semibold">₹1,000.00 (Rupees one thousand only)</dd><dt className="text-brown-500">Trust PAN</dt><dd className="font-semibold">AAATK1234B</dd><dt className="text-brown-500">80G reg. no.</dt><dd className="font-semibold">AAATK1234BF20221 · valid to AY 2027-28</dd><dt className="text-brown-500">Signatory</dt><dd className="font-semibold">Secretary, Kottur Devaswom Committee (digital)</dd></dl>
      <p className="mt-3 text-xs text-brown-500">Issued by the temple trust; TempleAddress only facilitates the payment. Form 10BE follows after the financial year.</p><a className="btn-p mt-3"><Download size={16}/>80G PDF</a></div>
  </Wrap></PublicShell>)
}

/* ---------------- DONATE ---------------- */
export function Donate() {
  const { slug } = useParams(); const t = bySlug(slug); const [g80,setG80]=useState(t.g80)
  return (<PublicShell><Wrap className="max-w-xl py-8"><Link href={`/t/${t.slug}`} className="text-sm text-brown-500">← {t.name}</Link><h1 className="mt-1 text-3xl font-semibold">Donate</h1>
    <div className="card mt-4 space-y-5 p-6">
      <div><span className="label">Purpose</span><div className="flex flex-wrap gap-2">{['Annadanam','Renovation','Festival 2026','General'].map((p,i)=><button key={p} className={`rounded-full px-3 py-1.5 text-sm ${i===0?'bg-brown-900 text-white':'border border-brown-200 bg-white'}`}>{p}</button>)}</div></div>
      <div><span className="label">Amount</span><div className="flex flex-wrap gap-2">{['₹101','₹501','₹1,000','₹5,000'].map((p,i)=><button key={p} className={`rounded-full px-3 py-1.5 text-sm ${i===2?'bg-brown-900 text-white':'border border-brown-200 bg-white'}`}>{p}</button>)}<input placeholder="Other" className="input !w-28 !rounded-full"/></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Donor name"><Input defaultValue="Anand K"/></Field><Field label="Mobile"><Input defaultValue="+91 94966 86256"/></Field></div>
      {t.g80 ? <div className="rounded-xl bg-emerald-50 p-4"><Toggle label="I want an 80G tax receipt" defaultChecked onChange={setG80}/>{g80&&<div className="mt-3"><Field label="PAN" hint="Required for 80G. The temple trust issues the receipt with your PAN."><Input defaultValue="ABCDE1234F"/></Field></div>}</div> : <div className="rounded-xl bg-brown-50 p-3 text-sm text-brown-600">This temple does not issue 80G receipts.</div>}
      <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹1,000</span></div><p className="-mt-3 text-xs text-brown-500">100% goes to the temple. No platform fee.</p>
      <Link href="/receipt" className="btn-p w-full !py-3">Donate ₹1,000</Link></div></Wrap></PublicShell>)
}

/* ---------------- SPECIAL POOJAS ---------------- */
export function Special() {
  const [tag,setTag]=useState('All')
  return (<PublicShell><section className="bg-temple-grad text-white"><Wrap className="py-12"><span className="pill glass"><Star size={12} className="text-gold-300" fill="currentColor"/>Organised by TempleAddress with partner temples</span><h1 className="mt-3 text-4xl font-semibold">Special poojas</h1><p className="mt-2 max-w-2xl text-brown-100">Performed in your name and nakshatra by the temple priest on the chosen day. Photo or video proof on WhatsApp; prasadam by post where offered.</p></Wrap></section>
    <Wrap className="py-8"><div className="mb-5 flex flex-wrap gap-2">{['All','Health','Ancestors','Obstacles','Family','Protection','Festival'].map(x=><button key={x} onClick={()=>setTag(x)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tag===x?'bg-brown-900 text-white':'bg-white shadow-ring'}`}>{x}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-3">{specials.filter(s=>tag==='All'||s.tag===tag).map(s=><SpecialCard key={s.id} s={s}/>)}</div></Wrap></PublicShell>)
}
export function SpecialDetail() {
  const { id } = useParams(); const s = specials.find(x=>x.id===id)||specials[0]; const fee=Math.round(s.price*0.02); const gst=Math.round(fee*0.18*100)/100
  return (<PublicShell><Wrap className="py-8"><Link href="/special" className="text-sm text-brown-500">← Special poojas</Link>
    <div className="mt-2 grid gap-8 lg:grid-cols-[1fr_380px]"><div className="space-y-5">
      <Photo hue={s.hue} className="aspect-[16/7] rounded-3xl" label={s.tag}/>
      <div><Pill tone="warn"><CalendarDays size={12}/>{s.date}</Pill><h1 className="mt-2 text-3xl font-semibold">{s.title}</h1><div className="ml text-brown-500">{s.ml} · <Link href={`/t/${s.temple.slug}`} className="text-saffron-600">{s.temple.name}</Link></div></div>
      <p className="text-brown-700">{s.desc}</p>
      <div className="grid gap-4 sm:grid-cols-3">{[['Sankalpam in your name','Read by the priest at the ritual'],[`${s.proof} proof`,'Sent to your WhatsApp the same day'],['Prasadam by post','India Post within 5 days']].map(([h,p])=><div key={h} className="card p-4"><b className="text-sm">{h}</b><div className="text-xs text-brown-500">{p}</div></div>)}</div>
      <div className="card p-5"><h3 className="font-semibold">How it works</h3><Steps items={['Book','We confirm with the temple','Pooja performed','Proof & prasadam']} at={3}/></div>
    </div>
    <aside className="card space-y-4 p-6 lg:sticky lg:top-20 lg:self-start"><div className="flex items-baseline justify-between"><b className="text-3xl">₹{s.price.toLocaleString('en-IN')}</b><span className="text-sm text-brown-500">{s.left} of {s.seats} seats left</span></div>
      <Field label="Sankalpam for"><Select options={['Anand · Rohini','Whole family (up to 5 names)','Someone else']}/></Field><Field label="Family names"><textarea className="input" rows={2} placeholder="Devi · Makayiram, Aarav · Thiruvathira"/></Field><Field label="Prasadam address"><textarea className="input" rows={2} defaultValue="12/44 Ulliyeri, Kozhikode 673614"/></Field>
      <div className="divide-y divide-brown-100 rounded-xl bg-brown-50 px-4"><Row l="Pooja" v={s.price}/><Row l={<>Convenience fee <span className="text-xs text-brown-500">2% + GST</span></>} v={fee+gst}/><Row l="Total" v={s.price+fee+gst} big/></div>
      <Link href="/receipt" className="btn-p w-full !py-3">Book seat</Link><p className="text-xs text-brown-500">Full refund if the temple cancels. No refund after the pooja day.</p></aside></div></Wrap></PublicShell>)
}

/* ---------------- FESTIVAL ---------------- */
export function Festivals() {
  return (<PublicShell><section className="bg-temple-grad text-white"><Wrap className="py-10"><h1 className="text-4xl font-semibold">Festivals</h1><p className="mt-2 text-brown-100">Explore temple festivals, view programmes and discover festival offerings.</p></Wrap></section>
    <Wrap className="py-8"><p className="mb-5 text-sm text-brown-500">{festivals.length} {festivals.length===1?'festival':'festivals'}</p><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{festivals.map(festival=><Link key={festival.code} href={`/festival/${festival.code}`} className="card-premium group overflow-hidden"><Photo hue="#8A3A1F" className="aspect-[16/9]" label={`Festival · ${festival.code}`}><span className="absolute bottom-3 left-3 pill bg-white/90 text-brown-900"><CalendarDays size={12}/>{festival.from} – {festival.to}</span></Photo><div className="p-5"><Pill tone="ok">{festival.status}</Pill><h2 className="mt-3 text-xl font-semibold">{festival.name}</h2><p className="ml mt-1 text-sm text-brown-500">{festival.ml}</p><p className="mt-3 text-sm font-semibold">{festival.temple}</p><p className="mt-1 flex items-center gap-1 text-sm text-brown-500"><MapPin size={14}/>{festival.place}</p><div className="mt-4 flex items-center justify-between border-t border-brown-100 pt-3 text-sm font-semibold text-saffron-600"><span>View festival</span><ArrowRight size={16}/></div></div></Link>)}</div></Wrap>
  </PublicShell>)
}

export function Festival() {
  const {code}=useParams()
  const festivalData=festivals.find(festival=>festival.code===code)
  const [toast,el]=useToast(); const [pack,setPack]=useState('Day sponsor ₹35,000')
  if(!festivalData)return <PublicShell><Wrap className="py-10"><h1 className="text-3xl font-semibold">Festival not found</h1><Link href="/festival" className="btn-g mt-4">Browse festivals</Link></Wrap></PublicShell>
  return (<PublicShell><Wrap className="py-6">{el}<Link href="/festival" className="mb-4 inline-block text-sm font-semibold text-brown-500">← All festivals</Link><Photo hue="#8A3A1F" className="rounded-3xl p-6 text-white md:p-10"><Pill tone="gold">Festival · {festivalData.code}</Pill><h1 className="relative mt-20 text-3xl font-semibold md:text-5xl">{festivalData.name}</h1><div className="ml relative mt-1 text-lg text-brown-100">{festivalData.ml} · {festivalData.from} – {festivalData.to} · {festivalData.temple}</div></Photo>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]"><div className="space-y-6">
      <div className="card p-5"><h2 className="text-xl font-semibold">About the festival</h2><p className="mt-2 text-sm text-brown-700">The festival page keeps the committee, venue, history, travel information and festival description as static listing content. Programme events below carry their own exact date and time and may change independently.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-brown-50 p-3 text-sm"><span className="text-brown-500">Venue</span><b className="block">{festivalData.temple}</b><span>{festivalData.place}</span></div><div className="rounded-xl bg-brown-50 p-3 text-sm"><span className="text-brown-500">Festival dates</span><b className="block">{festivalData.from} – {festivalData.to}</b><span>{festivalData.committee}</span></div></div></div>
      <div className="card p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Programme</h2><Pill tone="info">Times shown in IST</Pill></div><Table head={['Date','Time','Event','Type','Status']} rows={festivalData.programme.map(([day,event,time,kind,,status])=>[<b>{day} 2026</b>,time,event,<Pill tone="n">{kind}</Pill>,<Pill tone={status==='Confirmed'?'ok':'warn'}>{status}</Pill>])}/></div>
      <div className="card p-5"><h2 className="text-xl font-semibold">Bookable offerings</h2><p className="text-sm text-brown-500">Choose a festival date during booking. Availability and per-day limits are checked for that event date.</p><div className="divide-y divide-brown-100">{festivalData.offerings.map(o=><div key={o.code} className="flex flex-wrap items-center gap-3 py-3"><div className="min-w-[220px] flex-1"><div className="flex items-center gap-2"><b>{o.name}</b>{o.live&&<span className="pill bg-emerald-50 text-emerald-700"><Zap size={11}/>Live</span>}</div><div className="ml text-sm text-brown-500">{o.ml} · {festivalData.from} – {festivalData.to}</div><div className="text-xs text-brown-500">{o.dailyLimit?`${o.dailyLimit} per festival day`:'No daily limit'} · {o.sold} booked</div></div><b className="text-lg">₹{o.price.toLocaleString('en-IN')}</b><Link href={`/book/kottur-sree-mahavishnu-temple?pooja=${o.code}`} className="btn-p !py-2">{o.live?'Book instantly':'Choose date & book'}</Link></div>)}</div></div>
      <div className="card border-2 border-dashed border-gold-400 bg-gold-300/10 p-5"><div className="flex flex-wrap items-center gap-2"><Handshake size={18} className="text-saffron-600"/><h2 className="text-xl font-semibold">Become a sponsor</h2><Pill tone="gold">No login needed</Pill></div><p className="mt-1 text-sm text-brown-600">Anyone can sponsor part of this festival directly from this page — an organisation, a family, or a devotee living abroad. Your name goes on the festival page, the banner/arch for your slot, and every receipt.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{[['Day sponsor','₹35,000','Banner for one festival day + stage mention'],['Programme sponsor','₹25,000','Named before one cultural programme'],['Annadanam day','₹5,000','Sponsor one day\'s meal seva'],['Custom amount','Any ₹','Choose your own contribution']].map(([n,p,d])=><button key={n} onClick={()=>setPack(`${n} ${p}`)} className={`rounded-xl border p-3 text-left text-sm ${pack.startsWith(n)?'border-saffron-500 bg-white':'border-brown-200 bg-white/60'}`}><b>{n}</b><div className="text-saffron-600">{p}</div><div className="text-xs text-brown-500">{d}</div></button>)}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Your / organisation name (as printed)"><Input placeholder="e.g. Resurge India Foundation"/></Field><Field label="Mobile or WhatsApp"><Input placeholder="+91"/></Field></div>
        <button onClick={()=>toast('Thank you! The committee will confirm your sponsorship and send a receipt on WhatsApp.')} className="btn-p mt-4"><Handshake size={16}/>Sponsor this festival · {pack}</button>
        <p className="mt-2 text-xs text-brown-500">Prefer bank transfer, cheque or cash to the committee directly? <Link href="/festival-admin/sponsors" className="text-saffron-600 underline">The committee records it here</Link> too.</p></div>
      <div className="card p-5"><h2 className="text-xl font-semibold">Reach the temple</h2><p className="text-sm text-brown-700">Bus to Naduvannur, auto to Ulliyeri. Parking at the school ground. Thayambaka by Kalamandalam Anil — <Link href="/service/sv4" className="text-saffron-600">see artist</Link>.</p></div></div>
      <aside className="space-y-4"><div className="card p-5"><Link href="/book/kottur-sree-mahavishnu-temple" className="btn-p w-full !py-3">Book festival pooja</Link><Link href="/donate/kottur-sree-mahavishnu-temple" className="btn-s mt-2 w-full">Donate to festival</Link></div><div className="card p-5 text-sm"><b>Festival micro-site</b><div className="text-brown-500">kottur-utsavam-2026.templeaddress.com · included with Temple Pro</div></div><div className="flex items-center gap-3 rounded-2xl bg-gold-300/25 p-4 text-sm"><div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-xs font-bold text-emerald-700">RIF</div><div>Festival partner<br/><b>Resurge India Foundation</b></div></div></aside></div></Wrap></PublicShell>)
}

/* ---------------- SERVICES ---------------- */
export function Services() {
  const [category,setCategory]=useState('All')
  const categories=['All','Astrologer','Poojari / Pandit','Artist','Kazhakam']
  const shown=category==='All'?services:services.filter(s=>s.type===category)
  return (<PublicShell><Wrap className="py-8"><h1 className="text-3xl font-semibold">Priests, astrologers & performers</h1><p className="text-brown-500">Verified professionals with appointment booking</p>
    <div className="my-5 flex flex-wrap gap-2">{categories.map(x=><button key={x} onClick={()=>setCategory(x)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${category===x?'bg-brown-900 text-white':'bg-white shadow-ring'}`}>{x}</button>)}</div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{shown.map(s=><Link key={s.id} href={`/service/${s.id}`} className="card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft"><Photo hue={s.hue} className="aspect-square"><span className="absolute left-3 top-3 pill bg-white/90 text-brown-900">Default photo</span></Photo><div className="p-4"><div className="flex items-center justify-between"><b>{s.name}</b><Pill tone="ok"><BadgeCheck size={12}/>{s.code}</Pill></div><div className="ml text-sm text-brown-500">{s.ml}</div><div className="mt-1 text-xs text-brown-500">{s.type} · {s.district} · {s.exp} yrs</div><div className="mt-2 flex items-center justify-between text-sm"><span>From <b>₹{s.from.toLocaleString('en-IN')}</b></span><span className="text-gold-500">★ {s.rating}</span></div></div></Link>)}</div></Wrap></PublicShell>)
}
export function ServiceDetail() {
  const { id } = useParams(); const s = services.find(x=>x.id===id)||services[0]; const [toast,el]=useToast(); const [slot,setSlot]=useState(s.slots[0])
  const shareLink=`templeaddress.com/service/${s.code}?ref=${s.code}`
  return (<PublicShell><Wrap className="py-8"><Link href="/services" className="text-sm text-brown-500">← Services</Link>
    {el}<div className="mt-2 flex flex-wrap items-start justify-between gap-4"><div className="flex gap-4"><Photo hue={s.hue} className="h-28 w-28 rounded-2xl"><span className="absolute bottom-2 left-2 pill bg-white/90 text-brown-900">Default</span></Photo><div><h1 className="text-3xl font-semibold">{s.name}</h1><div className="ml text-brown-500">{s.ml}</div><div className="mt-1 flex flex-wrap gap-2"><Pill tone="ok"><BadgeCheck size={12}/>Verified</Pill><Pill tone="info">{s.code}</Pill><Pill>{s.type} · {s.district} · {s.exp} years</Pill><Pill tone="gold"><Star size={12} fill="currentColor"/>{s.rating} · {s.reviewCount} reviews</Pill></div></div></div>
      <div className="flex flex-wrap gap-2"><button onClick={()=>toast(`WhatsApp share link copied · ${s.code}`)} className="btn-wa"><MessageCircle size={16}/>WhatsApp</button><button onClick={()=>toast(`Facebook share link copied · ${s.code}`)} className="btn-g"><Share2 size={16}/>Facebook</button><button onClick={()=>toast(`Link copied: ${shareLink}`)} className="btn-g">Copy link · {s.code}</button></div></div>
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]"><div className="space-y-5">
      <div className="card p-5"><h2 className="text-xl font-semibold">Gallery</h2><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{[1,2,3,4].map(i=><Photo key={i} hue={s.hue} className="aspect-square rounded-xl">{i===s.defaultPhoto&&<span className="absolute bottom-2 left-2 pill bg-white/90 text-brown-900">Default photo</span>}</Photo>)}</div></div>
      <div className="card p-5"><h2 className="text-xl font-semibold">About</h2><p className="mt-2 text-sm text-brown-700">{s.about}</p><h3 className="mt-5 font-semibold">History & experience</h3><p className="mt-1 text-sm text-brown-700">{s.history}</p><h3 className="mt-5 font-semibold">Remarks</h3><p className="mt-1 text-sm text-brown-700">{s.remarks}</p></div>
      <div className="card p-5"><h2 className="text-xl font-semibold">Timings & availability</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-brown-50 p-3 text-sm"><Clock size={16}/><b className="mt-1 block">{s.timings}</b><span className="text-brown-500">{s.availabilityDays}</span></div><div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CalendarDays size={16}/><b className="mt-1 block">{s.slots.length} slots shown</b><span>Live availability is confirmed at booking</span></div></div><div className="mt-3 flex flex-wrap gap-2">{s.slots.map(x=><button key={x} onClick={()=>setSlot(x)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${slot===x?'bg-brown-900 text-white':'border border-brown-200 bg-white'}`}>{x}</button>)}</div></div>
      <div className="card p-5"><h2 className="text-xl font-semibold">Services</h2><div className="divide-y divide-brown-100">{s.offerings.map(([n,p,x])=><div key={n} className="flex items-center gap-3 py-3"><div className="flex-1"><b>{n}</b><div className="text-sm text-brown-500">{x}</div></div><b className="text-lg">₹{p.toLocaleString('en-IN')}</b><Link href="/receipt" className="btn-p !py-2">Book</Link></div>)}</div></div>
      <div className="card p-5"><h2 className="text-xl font-semibold">Special services & poojas</h2>{s.specials.length?<div className="divide-y divide-brown-100">{s.specials.map(([n,date,p])=><div key={n} className="flex flex-wrap items-center gap-3 py-3"><div className="flex-1"><b>{n}</b><div className="text-sm text-brown-500">{date} · Limited booking</div></div><b>₹{p.toLocaleString('en-IN')}</b><Link href="/receipt" className="btn-s !py-2">Book pooja</Link></div>)}</div>:<p className="mt-2 text-sm text-brown-500">No special poojas are currently listed.</p>}</div>
      <div className="card p-5"><h2 className="text-xl font-semibold">Reviews & ratings</h2><div className="mt-1 text-sm text-brown-500">{s.rating} out of 5 · {s.reviewCount} verified bookings</div><div className="mt-3 space-y-3">{s.feedback.map(([who,stars,tag,text])=><div key={who} className="rounded-xl bg-brown-50 p-3"><div className="flex items-center justify-between"><b>{who}</b><span className="text-gold-500">{'★'.repeat(stars)}</span></div><div className="text-xs text-saffron-600">{tag}</div><p className="mt-1 text-sm text-brown-700">{text}</p></div>)}</div></div></div>
      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start"><div className="card space-y-4 p-6"><h3 className="text-lg font-semibold">Book an appointment</h3><Field label="Service"><Select options={s.offerings.map(o=>o[0])}/></Field><div className="grid grid-cols-2 gap-3"><Field label="Date"><Input type="date" defaultValue="2026-09-15"/></Field><Field label="Slot"><Select options={s.slots} value={slot} onChange={e=>setSlot(e.target.value)}/></Field></div><Field label="Mode"><Select options={['In person','Phone call','Online video','At home / temple']}/></Field><div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{s.offerings[0][1].toLocaleString('en-IN')}</span></div><Link href="/receipt" className="btn-p w-full !py-3">Confirm & pay</Link><p className="text-xs text-brown-500">The provider confirms within 4 hours on WhatsApp.</p></div>
        <div className="card space-y-3 p-5"><h3 className="font-semibold">Contact / quick enquiry</h3><Field label="Your name"><Input placeholder="Name"/></Field><Field label="Mobile / WhatsApp"><Input placeholder="+91"/></Field><Field label="Message"><textarea className="input" rows={3} placeholder="What would you like to ask?"/></Field><button onClick={()=>toast('Enquiry sent · the provider will reply on WhatsApp')} className="btn-wa w-full"><MessageCircle size={16}/>Send enquiry</button><button className="btn-g w-full"><Phone size={16}/>Request a call</button><p className="text-xs text-brown-500">Usually replies within 2 hours.</p></div></aside></div></Wrap></PublicShell>)
}

/* ---------------- SPONSOR ---------------- */
const sponsorPacks = [
  ['Supporter',15000,'Temple Pro plan · logo on page & receipts · GST invoice',false,'yr'],
  ['Patron',30000,'+ QR board & standee printed with your logo · festival micro-site',true,'yr'],
  ['Benefactor',50000,'+ up to 3 temples · sponsor page on templeaddress.com',false,'yr'],
  ['Temple Billing mini ERP',checkoutPlans.billing.price,'Offline billing, receipts and member management for the temple',false,'one time'],
]
const sponsorPartners = { 'TA-AG-00124':'Jinsha', 'JIN-4471':'Jinsha' }
const sponsorGateways = onlineGateways.filter(gateway => gateway.key === 'razorpay')
const sponsorPayIcon = { omniware:ShieldCheck, razorpay:Zap, stripe:Globe2, upi:QrCode, bank:Landmark, cheque:PenLine }
const templeAddressTax = {gstin:'32AACCT1234B1Z9',pan:'AACCT1234B',state:'Kerala',stateCode:'32',address:'Kozhikode, Kerala – 673001'}
const billingActivationKey='ta-billing-activations-v1'
const partnerWalletTransactionKey='ta-partner-wallet-transactions-v1'
const readBillingActivations=()=>{if(typeof window==='undefined')return [];try{return JSON.parse(window.localStorage.getItem(billingActivationKey)||'[]')}catch{return []}}
const saveBillingActivations=records=>localStorage.setItem(billingActivationKey,JSON.stringify(records))
const readPartnerWalletTransactions=()=>{if(typeof window==='undefined')return [];try{return JSON.parse(window.localStorage.getItem(partnerWalletTransactionKey)||'[]')}catch{return []}}
export function Sponsor() {
  const [toast,el] = useToast()
  const [sponsorType,setSponsorType] = useState('self')
  const [partnerCode,setPartnerCode] = useState('')
  const [partnerValidation,setPartnerValidation] = useState(null)
  const [query,setQuery] = useState('')
  const [selected,setSelected] = useState([{ temple: bySlug('kottur-sree-mahavishnu-temple'), pack:'Patron' }])
  const [payMethod,setPayMethod] = useState('razorpay')
  const [sponsorDetails,setSponsorDetails] = useState({name:'',gstin:'',adsText:''})
  const [manualPayment,setManualPayment] = useState({date:'',transactionNo:'',amount:'',bankName:'',chequeNo:'',payerName:'',proof:''})
  const [paymentError,setPaymentError] = useState('')
  const [paymentResult,setPaymentResult] = useState(null)
  const results = query.trim() ? temples.filter(t=>!selected.some(s=>s.temple.slug===t.slug) && (t.name.toLowerCase().includes(query.toLowerCase())||t.code.toLowerCase().includes(query.toLowerCase())||t.place.toLowerCase().includes(query.toLowerCase()))).slice(0,6) : []
  const addTemple = t => { setSelected(s=>[...s,{ temple:t, pack:'Patron' }]); setQuery('') }
  const removeTemple = slug => setSelected(s=>s.filter(x=>x.temple.slug!==slug))
  const setPack = (slug,pack) => setSelected(s=>s.map(x=>x.temple.slug===slug?{...x,pack}:x))
  const packPrice = Object.fromEntries(sponsorPacks.map(([n,p])=>[n,p]))
  const subtotal = selected.reduce((s,x)=>s+packPrice[x.pack],0)
  const gst = Math.round(subtotal*0.18)
  const total = subtotal+gst
  const isOnline = sponsorGateways.some(g=>g.key===payMethod)
  const validatePartner = () => {
    const code = partnerCode.trim().toUpperCase()
    if(!code) { setPartnerValidation(null); return }
    const name = sponsorPartners[code]
    setPartnerValidation(name ? { valid:true, name, code } : { valid:false })
  }
  const updateManual = (key,value) => { setManualPayment(p=>({...p,[key]:value})); setPaymentError('') }
  const paymentReady = () => {
    if(partnerCode.trim()&&!partnerValidation?.valid) { setPaymentError('Validate the partner code, or remove it before continuing.'); return false }
    if(sponsorType==='third-party'&&!sponsorDetails.name.trim()) { setPaymentError('Enter the sponsor name for the tax invoice.'); return false }
    return true
  }
  const completePayment = ({status,reference,documentNo,method}) => {
    const activations=selected.filter(item=>item.pack==='Temple Billing mini ERP').map(item=>({temple:item.temple.name,templeCode:item.temple.code,activationUuid:globalThis.crypto?.randomUUID?.()||`TA-${Date.now()}-${item.temple.code}`,status:status==='paid'?'Active':'Pending payment verification',createdAt:new Date().toISOString()}))
    if(activations.length){const existing=readBillingActivations();saveBillingActivations([...existing.filter(old=>!activations.some(item=>item.activationUuid===old.activationUuid)),...activations])}
    if(partnerValidation?.valid){const createdAt=new Date().toISOString();const customerName=sponsorType==='third-party'?sponsorDetails.name:`${selected[0]?.temple.name} Committee`;const credits=selected.map((item,index)=>{const base=packPrice[item.pack];const activation=activations.find(record=>record.templeCode===item.temple.code);return {date:createdAt,id:`WLT-${Date.now().toString().slice(-8)}-${index+1}`,campaign:'—',description:`${item.temple.name} → ${item.pack}`,type:`${item.pack==='Temple Billing mini ERP'?'Software sale':'Sponsorship'} 15%`,amount:Math.round(base*.15),direction:'Credit',status:status==='paid'?'Credited':'Pending',product:item.pack,temple:item.temple.name,templeCode:item.temple.code,activationUuid:activation?.activationUuid,customerName,customerGstin:sponsorDetails.gstin||'',invoiceNo:documentNo,paymentReference:reference,paymentMethod:method,taxableValue:base,cgst:Math.round(base*.09),sgst:Math.round(base*.09),invoiceTotal:base+Math.round(base*.18),commissionRate:'15% of taxable value',source:'Sponsorship checkout',partnerCode:partnerValidation.code}});const existing=readPartnerWalletTransactions();localStorage.setItem(partnerWalletTransactionKey,JSON.stringify([...credits,...existing.filter(old=>!credits.some(item=>item.id===old.id))]))}
    setPaymentResult({status,reference,documentNo,method,activations})
  }
  const payByGateway = () => {
    if(!paymentReady()) return
    const stamp=Date.now().toString().slice(-8)
    completePayment({status:'paid',reference:`PAY-${stamp}`,documentNo:`TA/26-27/INV/${stamp}`,method:sponsorGateways.find(g=>g.key===payMethod)?.name})
  }
  const submitManual = () => {
    if(!paymentReady()) return
    const amount=Number(manualPayment.amount||total)
    const reference=payMethod==='cheque'?manualPayment.chequeNo:manualPayment.transactionNo
    if(!manualPayment.date||!reference||!manualPayment.payerName.trim()||(payMethod!=='upi'&&!manualPayment.bankName.trim())) { setPaymentError(`Enter the payer, transaction date, ${payMethod==='cheque'?'cheque number':'transaction / UTR number'}${payMethod==='upi'?'.':' and bank name.'}`); return }
    if(amount!==total) { setPaymentError(`Full payment of ₹${total.toLocaleString('en-IN')} is required.`); return }
    const stamp=Date.now().toString().slice(-8)
    completePayment({status:'pending',reference,documentNo:`TA/26-27/ACK/${stamp}`,method:manualMethods.find(m=>m.key===payMethod)?.name})
  }

  if(paymentResult) return (<PublicShell><Wrap className="max-w-4xl py-10">{el}<div className={`rounded-3xl p-6 sm:p-8 ${paymentResult.status==='paid'?'bg-emerald-50 text-emerald-900':'bg-saffron-50 text-saffron-900'}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><Pill tone={paymentResult.status==='paid'?'ok':'warn'}>{paymentResult.status==='paid'?'Payment successful':'Staff verification pending'}</Pill><h1 className="mt-3 text-3xl font-semibold">{paymentResult.status==='paid'?'GST tax invoice issued':'Partial receipt issued'}</h1><p className="mt-2 text-sm">{paymentResult.status==='paid'?'The gateway confirmed full payment. Purchased plans are queued for activation immediately after invoice generation.':'Payment details were submitted. Staff verification is required before the final tax invoice, plan activation, or software download is released.'}</p></div><ShieldCheck size={40}/></div></div>
    <div className="card mt-5 overflow-hidden"><div className="bg-brown-900 px-6 py-5 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[.2em] text-gold-300">{paymentResult.status==='paid'?'Tax invoice':'Provisional payment acknowledgement'}</div><h2 className="mt-1 text-2xl font-semibold">TempleAddress Technologies Pvt Ltd</h2><p className="text-sm text-brown-100">{templeAddressTax.address}</p></div><div className="text-right text-sm"><b className="text-gold-300">{paymentResult.documentNo}</b><div>Invoice date: {new Date().toLocaleDateString('en-IN')}</div><div>Payment ref: {paymentResult.reference}</div></div></div></div>
      <div className="grid gap-5 border-b border-brown-100 p-6 sm:grid-cols-2"><div><div className="text-xs font-semibold uppercase text-brown-500">Supplier tax details</div><div className="mt-2 text-sm"><b>GSTIN: {templeAddressTax.gstin}</b><br/>PAN: {templeAddressTax.pan}<br/>State: {templeAddressTax.state} · Code {templeAddressTax.stateCode}<br/>Reverse charge: No</div></div><div><div className="text-xs font-semibold uppercase text-brown-500">Bill to</div><div className="mt-2 text-sm"><b>{sponsorType==='third-party'?sponsorDetails.name:`${selected[0]?.temple.name} Committee`}</b><br/>{sponsorDetails.gstin?<>GSTIN: {sponsorDetails.gstin}<br/></>:'Unregistered recipient'}Place of supply: Kerala (32)<br/>Payment: {paymentResult.method}</div></div></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-brown-50"><tr><th className="px-4 py-3 text-left">Description</th><th className="px-3 py-3 text-left">SAC</th><th className="px-3 py-3 text-right">Taxable ₹</th><th className="px-3 py-3 text-right">CGST 9%</th><th className="px-3 py-3 text-right">SGST 9%</th><th className="px-4 py-3 text-right">Total ₹</th></tr></thead><tbody>{selected.map(item=>{const base=packPrice[item.pack],tax=Math.round(base*.09);return <tr key={item.temple.slug} className="border-t border-brown-100"><td className="px-4 py-3"><b>{item.pack}</b><span className="block text-xs text-brown-500">{item.temple.name} · Temple code {item.temple.code}</span></td><td className="px-3 py-3">{item.pack==='Temple Billing mini ERP'?'997331':'998361'}</td><td className="px-3 py-3 text-right">{base.toLocaleString('en-IN')}</td><td className="px-3 py-3 text-right">{tax.toLocaleString('en-IN')}</td><td className="px-3 py-3 text-right">{tax.toLocaleString('en-IN')}</td><td className="px-4 py-3 text-right font-semibold">{(base+tax*2).toLocaleString('en-IN')}</td></tr>})}</tbody></table></div>
      <div className="grid gap-5 border-t border-brown-100 p-6 sm:grid-cols-[1fr_300px]"><div className="text-xs text-brown-500"><b className="text-brown-800">Tax note</b><p className="mt-1">Amounts are taxable commercial sponsorship or software services. This document is digitally generated and does not require a signature.</p><p className="mt-2">Status: <b className={paymentResult.status==='paid'?'text-emerald-700':'text-saffron-700'}>{paymentResult.status==='paid'?'Paid in full · final invoice':'Reported payment · verification pending'}</b></p></div><div className="divide-y divide-brown-100 rounded-xl bg-brown-50 px-4"><Row l="Taxable value" v={subtotal}/><Row l="CGST 9%" v={Math.round(subtotal*.09)}/><Row l="SGST 9%" v={Math.round(subtotal*.09)}/><Row l={paymentResult.status==='paid'?'Invoice total':'Amount reported'} v={total} big/></div></div>
    </div>
    {selected.some(item=>item.pack!=='Temple Billing mini ERP')&&<div className="card mt-5 p-5"><div className="flex items-center gap-2"><ShieldCheck size={20} className="text-saffron-600"/><h2 className="text-lg font-semibold">Plan activation</h2></div><div className="mt-3 space-y-2">{selected.filter(item=>item.pack!=='Temple Billing mini ERP').map(item=><div key={item.temple.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brown-50 p-3 text-sm"><span><b>{item.pack}</b> · {item.temple.name}<span className="block text-xs text-brown-500">Temple code: {item.temple.code}</span></span><Pill tone={paymentResult.status==='paid'?'info':'warn'}>{paymentResult.status==='paid'?'Activation queued':'Waiting for payment verification'}</Pill></div>)}</div><p className="mt-3 text-xs text-brown-500">{paymentResult.status==='paid'?'The selected plan will be activated shortly after this invoice is generated.':'Activation starts after staff verifies the payment and issues the final tax invoice.'}</p></div>}
    {paymentResult.activations.map(record=><div key={record.activationUuid} className="card mt-5 overflow-hidden"><div className="bg-blue-50 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><Pill tone="info">Temple Billing mini ERP</Pill><h2 className="mt-2 text-xl font-semibold">{record.temple}</h2></div><Pill tone={paymentResult.status==='paid'?'ok':'warn'}>{record.status}</Pill></div></div><div className="grid gap-5 p-5 md:grid-cols-2"><dl className="divide-y divide-brown-100 text-sm"><div className="flex justify-between gap-3 py-2"><dt className="text-brown-500">Temple code</dt><dd className="font-semibold">{record.templeCode}</dd></div><div className="py-2"><dt className="text-brown-500">Activation UUID</dt><dd className="mt-1 break-all font-mono text-xs font-semibold">{record.activationUuid}</dd></div><div className="flex justify-between gap-3 py-2"><dt className="text-brown-500">Licence</dt><dd className="font-semibold">One-time · 1 temple</dd></div></dl><div><b className="text-sm">Activation steps</b><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-brown-600"><li>Download and install the Temple Billing app.</li><li>Enter the temple code shown here.</li><li>Paste the activation UUID.</li><li>Complete the first sync and create the billing operator.</li></ol></div></div><div className="flex flex-wrap gap-2 border-t border-brown-100 p-5">{paymentResult.status==='paid'?<a href="data:text/plain;charset=utf-8,TempleAddress%20Billing%20mini%20ERP%20installer%20prototype" download="TempleAddress-Billing-Setup.txt" className="btn-p"><Download size={16}/>Download Temple Billing</a>:<button disabled className="btn-p opacity-50"><Download size={16}/>Download after verification</button>}<button onClick={()=>navigator.clipboard?.writeText(`${record.templeCode} · ${record.activationUuid}`)} className="btn-g">Copy activation details</button></div></div>)}
    <div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>window.print()} className="btn-p"><Download size={16}/>{paymentResult.status==='paid'?'Print tax invoice':'Print partial receipt'}</button><button onClick={()=>setPaymentResult(null)} className="btn-g">Back to sponsorship</button></div>
  </Wrap></PublicShell>)

  return (<PublicShell><Wrap className="py-10">{el}<div className="grid gap-10 lg:grid-cols-[1fr_440px]"><div><h1 className="text-4xl font-semibold">Sponsor a temple's online presence</h1><p className="mt-3 max-w-xl text-brown-600">Fund a temple directly as its committee, or support it as a third-party sponsor with optional branding. The temple gets its website, WhatsApp bookings and paperless receipts.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{sponsorPacks.map(([n,p,d,hi,cycle])=><div key={n} className={`card p-5 ${hi?'ring-2 ring-saffron-500':''}`}>{hi&&<Pill tone="warn">Most chosen</Pill>}<h3 className="mt-2 text-lg font-semibold">{n}</h3><div className="text-2xl font-bold">₹{p.toLocaleString('en-IN')}<span className="text-sm font-normal text-brown-500">/{cycle}</span></div><p className="mt-2 text-sm text-brown-600">{d}</p></div>)}</div></div>

      <aside className="card space-y-4 p-6">
        <h3 className="text-lg font-semibold">Sponsor now</h3>

        <fieldset>
          <legend className="label">Sponsorship type</legend>
          <div className="grid gap-2 sm:grid-cols-2">{[
            ['self','Self sponsorship','Temple committee pays · no sponsor branding'],
            ['third-party','Third-party sponsor','Sponsor identity and advertising options'],
          ].map(([value,title,description])=><label key={value} className={`cursor-pointer rounded-xl border-2 p-3 transition ${sponsorType===value?'border-saffron-500 bg-saffron-50':'border-brown-100 bg-white hover:border-brown-200'}`}>
            <span className="flex items-start gap-2"><input type="radio" name="sponsorType" value={value} checked={sponsorType===value} onChange={e=>setSponsorType(e.target.value)} className="mt-1 accent-orange-600"/><span><b className="block text-sm">{title}</b><span className="mt-0.5 block text-xs text-brown-500">{description}</span></span></span>
          </label>)}</div>
        </fieldset>

        <div>
          <span className="label">Partner code (optional)</span>
          <div className="flex gap-2"><Input placeholder="e.g. TA-AG-00124" value={partnerCode} onChange={e=>{setPartnerCode(e.target.value.toUpperCase());setPartnerValidation(null)}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();validatePartner()}}}/><button type="button" onClick={validatePartner} className="btn-g shrink-0">Validate</button></div>
          {partnerValidation?.valid&&<p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><Check size={14} className="mr-1 inline"/><b>Valid partner:</b> {partnerValidation.name} · {partnerValidation.code}</p>}
          {partnerValidation&&!partnerValidation.valid&&<p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700"><X size={14} className="mr-1 inline"/><b>Invalid partner code.</b> Check the code and try again.</p>}
          {!partnerValidation&&<p className="mt-1 text-xs text-brown-500">Referred by a TempleAddress partner? Validate their code to credit the sale.</p>}
        </div>

        <div>
          <span className="label">Temples to sponsor</span>
          <div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brown-400"/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, place or code…" className="input !pl-9"/>
            {results.length>0 && <div className="absolute z-10 mt-1 w-full space-y-1 rounded-xl border border-brown-100 bg-white p-1.5 shadow-soft">{results.map(t=>
              <button key={t.slug} onClick={()=>addTemple(t)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-brown-50"><Photo hue={t.hue} className="h-8 w-11 shrink-0 rounded-md"/><span className="min-w-0 flex-1"><b className="block truncate">{t.name}</b><span className="block text-xs text-brown-500">{t.place}, {t.district} · {t.code}</span></span><Plus size={14} className="shrink-0 text-saffron-600"/></button>)}</div>}
          </div>
          <div className="mt-2 space-y-2">{selected.map(s=><div key={s.temple.slug} className="flex items-center gap-2 rounded-xl border border-brown-100 p-2.5">
            <Photo hue={s.temple.hue} className="h-10 w-14 shrink-0 rounded-lg"/>
            <div className="min-w-0 flex-1"><b className="block truncate text-sm">{s.temple.name}</b><div className="text-xs text-brown-500">{s.temple.place}, {s.temple.district}</div></div>
            <div className="w-28 shrink-0"><Select options={sponsorPacks.map(([n])=>n)} value={s.pack} onChange={e=>setPack(s.temple.slug,e.target.value)}/></div>
            {selected.length>1 && <button onClick={()=>removeTemple(s.temple.slug)} className="shrink-0 rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"><X size={14}/></button>}
          </div>)}</div>
        </div>

        {sponsorType==='third-party'&&<div className="space-y-4 rounded-2xl border border-brown-100 bg-brown-50/60 p-4">
          <div><b className="text-sm">Sponsor branding</b><p className="text-xs text-brown-500">These details identify the sponsor on approved temple placements.</p></div>
          <Field label="Sponsor name (as shown)"><Input placeholder="Business or sponsor name" value={sponsorDetails.name} onChange={e=>setSponsorDetails(s=>({...s,name:e.target.value}))}/></Field>
          <Field label="GSTIN (if registered)"><Input placeholder="e.g. 32AAACR1234A1Z5" value={sponsorDetails.gstin} onChange={e=>setSponsorDetails(s=>({...s,gstin:e.target.value.toUpperCase()}))}/></Field>
          <div className="grid grid-cols-2 gap-3"><FileField label="Sponsor logo"/><FileField label="Ads banner" hint="Horizontal, for QR board"/></div>
          <Field label="Ads text (optional)"><textarea className="input" rows={3} placeholder="Short sponsor message or advertisement copy" value={sponsorDetails.adsText} onChange={e=>setSponsorDetails(s=>({...s,adsText:e.target.value}))}/></Field>
        </div>}

        <div>
          <span className="label">Payment method</span>
          <div className="grid grid-cols-3 gap-2">{[...sponsorGateways,...manualMethods].map(m=>{ const Icon=sponsorPayIcon[m.key]; return (
            <button key={m.key} onClick={()=>{setPayMethod(m.key);setPaymentError('')}} className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-center text-xs font-semibold transition ${payMethod===m.key?'border-saffron-500 bg-saffron-50':'border-brown-100 bg-white hover:border-brown-200'}`}><Icon size={17} className={payMethod===m.key?'text-saffron-600':'text-brown-400'}/>{m.name}</button>
          )})}</div>
        </div>

        {!isOnline&&<div className="space-y-4 rounded-2xl border border-saffron-200 bg-saffron-50/50 p-4">
          <div><b className="text-sm">{manualMethods.find(m=>m.key===payMethod)?.name} payment details</b><p className="text-xs text-brown-500">Enter the full-payment details. Staff verification is required before activation and final tax invoice issuance.</p></div>
          {payMethod==='upi'&&<div className="grid items-center gap-4 rounded-xl bg-white p-4 sm:grid-cols-[128px_1fr]"><div className="grid aspect-square place-items-center rounded-xl border-4 border-brown-900 bg-white p-2" aria-label="Default TempleAddress UPI QR code"><QRCodeSVG value={`upi://pay?pa=${manualMethods.find(m=>m.key==='upi')?.upiId}&pn=TempleAddress%20Technologies%20Pvt%20Ltd&am=${total}&cu=INR`} size={104} level="M"/></div><div className="text-sm"><b className="text-base">Scan the default UPI QR</b><p className="mt-1 text-brown-500">Pay the full amount of ₹{total.toLocaleString('en-IN')} using any UPI app.</p><div className="mt-2 rounded-lg bg-brown-50 px-3 py-2 font-semibold text-brown-800">{manualMethods.find(m=>m.key==='upi')?.upiId}</div></div></div>}
          {payMethod==='bank'&&<div className="rounded-xl bg-white p-3 text-sm"><b>{manualMethods.find(m=>m.key==='bank')?.bank}</b><div className="text-brown-600">A/c {manualMethods.find(m=>m.key==='bank')?.account} · IFSC {manualMethods.find(m=>m.key==='bank')?.ifsc}</div></div>}
          {payMethod==='cheque'&&<div className="rounded-xl bg-white p-3 text-sm"><b>Cheque payable to</b><div className="text-brown-600">{manualMethods.find(m=>m.key==='cheque')?.payee}</div></div>}
          <Field label="Payer / account holder name"><Input value={manualPayment.payerName} onChange={e=>updateManual('payerName',e.target.value)} placeholder="Name used for payment"/></Field>
          <div className="grid gap-3 sm:grid-cols-2"><Field label={payMethod==='cheque'?'Cheque date':'Transaction date'}><Input type="date" value={manualPayment.date} onChange={e=>updateManual('date',e.target.value)}/></Field><Field label="Amount paid"><Input type="number" min={total} value={manualPayment.amount||total} onChange={e=>updateManual('amount',e.target.value)}/></Field></div>
          {payMethod==='cheque'?<Field label="Cheque number"><Input value={manualPayment.chequeNo} onChange={e=>updateManual('chequeNo',e.target.value)} placeholder="Enter cheque number"/></Field>:<Field label={payMethod==='upi'?'UPI transaction number':'UTR / transaction reference'}><Input value={manualPayment.transactionNo} onChange={e=>updateManual('transactionNo',e.target.value)} placeholder="Enter payment reference"/></Field>}
          {payMethod!=='upi'&&<Field label="Payer bank"><Input value={manualPayment.bankName} onChange={e=>updateManual('bankName',e.target.value)} placeholder="Bank name"/></Field>}
          <Field label="Payment proof (optional)" hint="Upload UPI confirmation, bank advice or cheque image"><Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>updateManual('proof',e.target.files?.[0]?.name||'')}/></Field>
        </div>}

        <div className="divide-y divide-brown-100 rounded-xl bg-brown-50 px-4"><Row l={`Selected plans (${selected.length} temple${selected.length!==1?'s':''})`} v={subtotal}/><Row l="GST 18%" v={gst}/><Row l="Total" v={total} big/></div>

        {paymentError&&<p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{paymentError}</p>}
        {isOnline
          ? <button onClick={payByGateway} className="btn-p w-full">Pay Full Amount via {sponsorGateways.find(g=>g.key===payMethod)?.name}</button>
          : <button onClick={submitManual} className="btn-p w-full">Submit Full Payment for Verification</button>}
        <p className="text-xs text-brown-500">{isOnline ? 'Gateway-confirmed payments activate immediately and issue a final GST tax invoice.' : `A partial receipt is issued now. The final GST tax invoice and activation follow staff verification of the ${manualMethods.find(m=>m.key===payMethod)?.name} payment.`}</p>
      </aside></div></Wrap></PublicShell>)
}

/* ---------------- LOGIN / ACCOUNT ---------------- */
const roleTabs = [['user','Devotee',Users],['partner','Partner',BadgeCheck],['dealer','Dealer',ShieldCheck],['vendor','Vendor',Landmark],['staff','Staff',Lock]]
const vendorTypes = ['Temple','Festival committee','Service provider']
const staffRoles = [['moderator','Moderator','Reviews listings, KYC, charts & special poojas'],['accountant','Accountant','Payout and wallet NEFT batches · view received payments'],['admin','Portal admin','Configuration, approvals, high-level settings']]
export function Login() {
  const router = useRouter(); const nav = (path, opts) => router.push(path, opts)
  const loginParams = useSearchParams()
  const next = loginParams.get('next')
  const creatingProfile = loginParams.get('intent')==='create-profile'
  const [role,setRole] = useState('user')
  const [vendorType,setVendorType] = useState('Temple')
  const [staffRole,setStaffRole] = useState('moderator')
  const [otp,setOtp] = useState(false)
  const needsPassword = role==='dealer' || role==='staff'
  const pickRole = k => { setRole(k); setOtp(false) }
  const vendorHome = { 'Temple':'/vendor', 'Festival committee':'/festival-admin', 'Service provider':'/service-admin' }
  const dest = () => role==='user'&&next ? next : role==='user' ? '/account' : role==='partner' ? '/partner' : role==='vendor' ? vendorHome[vendorType] : role==='dealer' ? '/dealer' : `/staff?role=${staffRole}`
  return (<PublicShell><Wrap className="max-w-lg py-12">
    <div className="text-center"><TempleMark size={44} className="mx-auto"/><h1 className="mt-3 text-3xl font-semibold">{creatingProfile?'Create your profile':'Login'}</h1><p className="mx-auto mt-1 max-w-sm text-sm text-brown-500">{creatingProfile?'Verify your phone number or continue with Google. After login, you can create and manage your own listings.':<>Just browsing or submitting a temple's basic details? You don't need an account — <Link href="/submit-temple" className="font-semibold text-saffron-600 underline">use the public form</Link>.</>}</p></div>

    <div className="card mt-6 p-6">
      {!creatingProfile&&<div className="grid grid-cols-5 gap-1 rounded-xl bg-brown-50 p-1 text-[11px] font-semibold sm:text-xs">
        {roleTabs.map(([k,l])=><button key={k} onClick={()=>pickRole(k)} className={`rounded-lg px-1 py-2 transition ${role===k?'bg-brown-900 text-white shadow-soft':'text-brown-600 hover:bg-white'}`}>{l}</button>)}
      </div>}

      {role==='vendor' && <div className="mt-4"><span className="label">Vendor type</span>
        <div className="flex flex-wrap gap-2">{vendorTypes.map(v=><button key={v} onClick={()=>setVendorType(v)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${vendorType===v?'bg-saffron-500 text-white':'border border-brown-200 bg-white text-brown-700'}`}>{v}</button>)}</div>
        <p className="mt-1.5 text-xs text-brown-500">{{'Temple':'Daily pooja chart, vazhipadu prices, donations and 80G receipts.','Festival committee':'A time-bound utsavam — programme, sponsorships, artists and day sheets.','Service provider':'Priests, astrologers and artists — appointment slots, enquiries and reviews. Special poojas can be listed too.'}[vendorType]}</p></div>}

      {role==='staff' && <div className="mt-4"><span className="label">Staff role</span>
        <div className="space-y-1.5">{staffRoles.map(([k,l,d])=><button key={k} onClick={()=>setStaffRole(k)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm ${staffRole===k?'border-saffron-500 bg-saffron-50':'border-brown-200 bg-white'}`}><span><b>{l}</b><span className="block text-xs font-normal text-brown-500">{d}</span></span>{staffRole===k&&<Check size={16} className="shrink-0 text-saffron-600"/>}</button>)}</div></div>}

      {needsPassword && <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-900"><Lock size={14} className="mt-0.5 shrink-0"/>{role==='dealer'?'Dealer':'Staff'} accounts require a <b>password + OTP</b>, or signing in with <b>Google Authenticator</b> — for extra security around {role==='staff'&&staffRole==='moderator'?'listing, KYC and ownership approvals':'account and platform operations'}.</div>}

      <div className="mt-4 space-y-3">
        <Field label="Mobile number"><Input defaultValue="+91 "/></Field>
        {needsPassword && <Field label="Password"><Input type="password" placeholder="••••••••"/></Field>}
        {!otp ? <button onClick={()=>setOtp(true)} className="btn-p w-full">{needsPassword?'Continue with password':'Send OTP'}</button> : <>
          <Field label="Enter the 6-digit code" hint={needsPassword?'Sent after password check':undefined}><Input placeholder="••••••"/></Field>
          <button onClick={()=>nav(dest())} className="btn-p w-full">Verify & continue</button></>}
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-brown-400"><div className="h-px flex-1 bg-brown-100"/><span>or</span><div className="h-px flex-1 bg-brown-100"/></div>
      <button onClick={()=>nav(dest())} className="btn-g w-full"><GoogleIcon/>Continue with Google{needsPassword?' Authenticator':''}</button>

      <p className="mt-4 text-center text-xs text-brown-500">
        {role==='user' && 'New devotees are created automatically on first login.'}
        {role==='partner' && <>Not a partner yet? <Link href="/partner/submit" className="font-semibold text-saffron-600">Apply to become one</Link>.</>}
        {role==='vendor' && <>Managing a temple already? Find its public temple page and use <b>Claim this temple</b>.</>}
        {role==='dealer' && 'Dealer accounts are created by TempleAddress staff after partner-network approval.'}
        {role==='staff' && 'Staff accounts are provisioned by the Portal admin and can be disabled instantly.'}
      </p>
    </div>
  </Wrap></PublicShell>)
}
export function Account() {
  return (<PublicShell><Wrap className="py-8"><div className="flex items-end justify-between"><div><h1 className="text-3xl font-semibold">Anand</h1><div className="text-sm text-brown-500">+91 94966 86256 · anand@example.com · English</div></div><button className="btn-g">Edit profile</button></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]"><div className="space-y-6">
      <div className="card p-5"><h2 className="text-xl font-semibold">Upcoming</h2><div className="divide-y divide-brown-100">{[['Ganapathi Homam','Kottur Sree Mahavishnu Temple · Sat 13 Sept · Anand · Rohini','ok','Confirmed'],['Ashta Dravya Maha Ganapathi Homam','Special pooja · 14 Sept · proof pending','warn','Booked']].map(([a,b,t,s])=><div key={a} className="flex items-center gap-3 py-3"><div className="flex-1"><b>{a}</b><div className="text-sm text-brown-500">{b}</div></div><Pill tone={t}>{s}</Pill><Link href="/receipt" className="btn-g !py-1.5">Receipt</Link></div>)}</div><p className="mt-2 text-xs text-brown-500">Cancel or reschedule until the chart closes (12 Sept, 8:00 PM).</p></div>
      <div className="card p-5"><h2 className="text-xl font-semibold">Past receipts</h2><Table head={['Date','Temple','Item','Amount','']} rows={[['31 Jul','Perayattil Subrahmanya Temple','Pushpanjali × 2','₹40',<Link href="/receipt" className="text-saffron-600">PDF</Link>],['5 Jun','Kottur Sree Mahavishnu Temple','Donation (80G)','₹1,000',<Link href="/receipt" className="text-saffron-600">PDF · 80G</Link>]]}/></div></div>
      <aside className="space-y-4"><div className="card p-5"><h3 className="font-semibold">Quick book</h3><Link href="/book/kottur-sree-mahavishnu-temple" className="btn-p mt-2 w-full">Kottur Mahavishnu Temple</Link><Link href="/temples" className="btn-s mt-2 w-full">Another temple</Link></div><div className="card p-5 text-sm"><h3 className="font-semibold">Family members</h3><div className="mt-2 space-y-1"><div>Anand · Rohini</div><div>Devi · Makayiram</div><div>Aarav · Thiruvathira</div></div><a className="text-saffron-600">+ Add</a></div><div className="card space-y-2 p-5"><h3 className="font-semibold">Notifications</h3><Toggle label="WhatsApp" defaultChecked/><Toggle label="Email" defaultChecked/></div></aside></div></Wrap></PublicShell>)
}

/* ---------------- WHATSAPP ---------------- */
export function WhatsApp() {
  const M = ({ me, children }) => <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow ${me?'ml-auto bg-[#DCF8C6]':'bg-white'}`}>{children}</div>
  const Q = ({ children }) => <div className="mt-1.5 rounded-lg border border-[#075E54] px-2 py-1 text-center text-xs font-semibold text-[#075E54]">{children}</div>
  return (<PublicShell><Wrap className="py-10"><h1 className="text-center text-3xl font-semibold">Booking on WhatsApp</h1><p className="mx-auto max-w-xl text-center text-brown-500">Libromi bot · same booking API as the website. A keyword per temple (printed on the QR board) or just “BOOK”.</p>
    <div className="mx-auto mt-8 max-w-sm overflow-hidden rounded-[36px] border-[10px] border-brown-900 bg-[#ECE5DD]"><div className="bg-[#075E54] px-4 py-3 font-semibold text-white">TempleAddress · +91 94950 41196</div><div className="flex min-h-[540px] flex-col gap-2 p-3">
      <M me>KMV</M><M>🙏 <b>Kottur Sree Mahavishnu Temple</b><br/>Choose language / ഭാഷ<Q>English</Q><Q>മലയാളം</Q></M><M me>English</M><M>What would you like to do?<Q>1 · Book a pooja</Q><Q>2 · Donate</Q><Q>3 · Timings & info</Q></M><M me>1</M>
      <M>Poojas at Kottur:<br/>1. Ganapathi Homam — ₹250<br/>2. Ilaneer Abhishekam — ₹50<br/>3. Naalikeram Udaykkal — ₹10<br/>4. Pushpanjali — ₹20<br/><i>Reply with the number</i></M><M me>1</M><M>Ganapathi Homam ₹250. Which date?<Q>Tomorrow · Sat 13 Sept</Q><Q>Sun 14 Sept</Q></M><M me>Tomorrow</M><M>For whom? Last time: <b>Anand · Rohini</b><Q>Same</Q><Q>Someone else</Q></M><M me>Same</M>
      <M>Ganapathi Homam · 13 Sept · Anand (Rohini)<br/>Amount ₹250 (temple receives ₹250)<Link href="/receipt"><Q>Pay ₹250 →</Q></Link></M><M>✅ Booked. Receipt TA-2609-004812<br/>📄 Receipt PDF attached<br/>Your pooja is on tomorrow's chart. Reply <b>CANCEL</b> before 8 PM tonight.</M></div></div>
    <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-white p-4 text-sm shadow-ring"><b>Temple side (same bot)</b><div className="text-brown-600">8:00 PM: “Chart for 13 Sept ready — 14 bookings, ₹3,420. Reply <b>OK</b> to confirm.” → PDF sent. Partners: <b>BALANCE</b>, <b>WITHDRAW</b>.</div></div></Wrap></PublicShell>)
}
