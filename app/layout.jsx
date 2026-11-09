import localFont from 'next/font/local'
import './globals.css'
import DemoPortalGate from '@/components/DemoPortalGate'
import { isProductionSite } from '@/lib/site-env'

/* Bundled fonts keep builds independent of Google Fonts response formats. */
const fraunces = localFont({
  src: './fonts/fraunces-variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-fraunces',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})
const manrope = localFont({
  src: './fonts/manrope-variable.woff2',
  weight: '200 800',
  style: 'normal',
  variable: '--font-manrope',
  display: 'swap',
  adjustFontFallback: 'Arial',
})
const anekMalayalam = localFont({
  src: './fonts/anek-malayalam-variable.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-anek',
  display: 'swap',
  adjustFontFallback: 'Arial',
})

/* ── Site-wide default metadata (pages override with their own generateMetadata) ── */
export const metadata = {
  metadataBase: new URL('https://templeaddress.com'),
  title: {
    template: '%s | TempleAddress',
    default: 'TempleAddress — Digital address for every temple',
  },
  description:
    'Discover verified temples, book vazhipadu, donate and follow festivals — from anywhere in the world. Zero platform fee on bookings and donations.',
  keywords: ['temple', 'vazhipadu', 'pooja booking', 'Kerala temple', 'festival', 'temple donation', 'templeaddress'],
  authors: [{ name: 'TempleAddress', url: 'https://templeaddress.com' }],
  openGraph: {
    title: 'TempleAddress — Digital address for every temple',
    description: 'Verified temples · Book vazhipadu · Donations · Festivals',
    url: 'https://templeaddress.com',
    siteName: 'TempleAddress',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', site: '@templeaddress' },
  alternates: { canonical: 'https://templeaddress.com' },
  robots: isProductionSite() ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
  category: 'travel',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${manrope.variable} ${anekMalayalam.variable}`}
    >
      <body className="bg-brown-50 text-brown-900 antialiased">
        <DemoPortalGate>{children}</DemoPortalGate>
      </body>
    </html>
  )
}
