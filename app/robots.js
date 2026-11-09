import { isProductionSite } from '@/lib/site-env'

/** @returns {import('next').MetadataRoute.Robots} */
export default function robots() {
  if (!isProductionSite()) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/vendor', '/festival-admin', '/service-admin', '/partner', '/dealer', '/staff', '/account', '/login', '/receipt', '/preview', '/coming-soon'],
      },
    ],
    sitemap: 'https://templeaddress.com/sitemap.xml',
  }
}
