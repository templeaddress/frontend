import Link from 'next/link'
import { Apple, ArrowLeftRight, Award, BadgeIndianRupee, Facebook, Globe2, Instagram, Landmark, Linkedin, Lock, Mail, MessageCircle, Rocket, ShieldCheck, Smartphone, Sparkles, Twitter, Youtube, Zap } from 'lucide-react'
import { Logo } from '@/components/ui'
import { SITE, whatsappLink } from '@/lib/site'

const SOCIAL_ICONS = { facebook: Facebook, instagram: Instagram, youtube: Youtube, x: Twitter, linkedin: Linkedin }

const COLUMNS = [
  ['Explore', [['/temples', 'Temples'], ['/special', 'Special poojas & events'], ['/festival', 'Festivals'], ['/services', 'Services'], ['/temples?bookable=true', 'Book a pooja'], ['/#reviews', 'Devotee reviews']]],
  ['For temples & partners', [['/submit-temple', 'Submit a temple'], ['/login?next=/account/listings/new&intent=create-profile', 'Create a profile'], ['/vendor', 'Temple login'], ['/sponsor', 'Sponsor a temple'],
    ['/partner', 'Become a partner'], ['/dealer', 'Dealer portal'], ['/staff', 'Staff login']]],
  ['Help & company', [['/about', 'About TempleAddress'], ['/help', 'User guide'], ['/support', 'Help & support'], ['/contact', 'Contact us'], ['/whatsapp', 'Book on WhatsApp'], ['/download-app', 'Downloads']]],
  ['Legal', [['/policies/terms', 'Terms of service'], ['/policies/privacy', 'Privacy policy'], ['/policies/data', 'Data policy'], ['/policies/cancellation', 'Cancellation policy'], ['/policies/refund', 'Refund policy'], ['/policies/cookie', 'Cookie policy']]],
]

const PAYMENTS = [[Zap, 'Razorpay'], [ArrowLeftRight, 'UPI'], [BadgeIndianRupee, 'Cards & net banking']]
// Programme marks are shown as text, not official artwork, until VASS supplies approved logo files.
const RECOGNITIONS = [[Globe2, 'Digital India'], [Rocket, 'Startup India'], [Award, 'MSME'], [Sparkles, 'Kerala Startup Mission']]

const Chip = ({ icon: Icon, children }) => <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-brown-100"><Icon size={13} className="text-gold-400" aria-hidden="true"/>{children}</span>

export default function SiteFooter() {
  const year = new Date().getFullYear()
  return <footer className="mt-16 bg-brown-950 text-brown-100">
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Logo light/>
          <p className="mt-3 max-w-xs text-sm text-brown-200">{SITE.tagline} Discover verified temples, book poojas and donate with zero platform fee.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]"><Chip icon={ShieldCheck}>Committee verified</Chip><Chip icon={Lock}>Secure payments</Chip></div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href="/download-app/android" download="TempleaddressApp.apk" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-3 py-2 hover:bg-black/50"><Smartphone size={20} aria-hidden="true"/><span className="leading-tight"><small className="block text-[10px] text-brown-200">Get it for</small><b className="text-sm text-white">Android</b></span></a>
            <Link href="/download-app" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-3 py-2 hover:bg-black/50"><Apple size={20} aria-hidden="true"/><span className="leading-tight"><small className="block text-[10px] text-brown-200">Download for</small><b className="text-sm text-white">iPhone</b></span></Link>
          </div>
          <div className="mt-5 space-y-1.5 text-sm">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><MessageCircle size={15} className="text-[#25D366]" aria-hidden="true"/>WhatsApp {SITE.whatsappDisplay}</a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={15} className="text-gold-400" aria-hidden="true"/>{SITE.email}</a>
            <p className="ml flex items-center gap-2 text-brown-200"><Landmark size={15} className="text-gold-400" aria-hidden="true"/>{SITE.languages}</p>
          </div>
          {SITE.social.length > 0 && <ul aria-label="TempleAddress on social media" className="mt-5 flex gap-2">{SITE.social.map(([key, label, url]) => { const Icon = SOCIAL_ICONS[key]; return <li key={key}><a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-saffron-500"><Icon size={17} aria-hidden="true"/></a></li> })}</ul>}
        </div>
        {COLUMNS.map(([title, links]) => <nav key={title} aria-label={title} className="text-sm">
          <h2 className="font-sans text-sm font-bold text-white">{title}</h2>
          <ul className="mt-3 space-y-2">{links.map(([href, label]) => <li key={href}><Link href={href} className="text-brown-200 hover:text-white">{label}</Link></li>)}</ul>
        </nav>)}
      </div>
      <div className="mt-10 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brown-300">We accept</p><div className="flex flex-wrap gap-2">{PAYMENTS.map(([icon, label]) => <Chip key={label} icon={icon}>{label}</Chip>)}</div><p className="mt-2 text-xs text-brown-300">Payments are processed by Razorpay. TempleAddress never stores card details.</p></div>
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brown-300">Proudly part of</p><div className="flex flex-wrap gap-2">{RECOGNITIONS.map(([icon, label]) => <Chip key={label} icon={icon}>{label}</Chip>)}</div>
          {SITE.registrations.length > 0 && <p className="mt-2 text-xs text-brown-300">{SITE.registrations.map(([label, value]) => `${label}: ${value}`).join(' · ')}</p>}</div>
      </div>
    </div>
    <div className="border-t border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pb-24 pt-5 text-xs text-brown-300 md:flex-row md:items-center md:justify-between md:pb-20">
        <p>© {year} {SITE.legalName}. All rights reserved. TempleAddress™ and the TempleAddress logo are trademarks of {SITE.legalName}.</p>
        <p>Made with devotion in Kerala, India.</p>
      </div>
    </div>
  </footer>
}
