import { apiRoot } from './lib/api-url.js'

const isDev = process.env.NODE_ENV !== 'production'

function apiOrigin() {
  try { return new URL(process.env.NEXT_PUBLIC_API_URL || '').origin } catch { return '' }
}

// Next.js needs inline scripts for hydration; everything else that may run or frame here is listed by name.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ''}https://checkout.razorpay.com https://*.razorpay.com https://accounts.google.com/gsi/ https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' https:",
  `connect-src 'self' ${apiOrigin()} https://*.razorpay.com https://accounts.google.com/gsi/ https://www.google.com/recaptcha/ ${isDev ? 'ws: http://localhost:* http://127.0.0.1:*' : ''}`.trim(),
  "frame-src https://*.razorpay.com https://accounts.google.com/gsi/ https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.razorpay.com",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }]),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'templeaddress-cloud.s3.amazonaws.com' },
      // Listing photos are also served from the bucket's regional endpoint.
      { protocol: 'https', hostname: 'templeaddress-cloud.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'fonts.googleapis.com' },
    ],
  },
  // Allow CSS imports from node_modules (recharts uses them)
  transpilePackages: ['recharts'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  // Older links, including the mobile app's profile menu, use these short paths.
  async redirects() {
    return [
      ...['terms', 'privacy', 'refund'].map(kind => ({ source: `/${kind}`, destination: `/policies/${kind}`, permanent: true })),
      { source: '/cancellation-policy', destination: '/policies/cancellation', permanent: true },
      { source: '/refund-policy', destination: '/policies/refund', permanent: true },
      { source: '/privacy-policy', destination: '/policies/privacy', permanent: true },
      { source: '/contact', destination: '/support', permanent: false },
      { source: '/about', destination: '/', permanent: false },
    ]
  },
  async rewrites() {
    const backend = process.env.TEMPLEADDRESS_API_URL || 'http://127.0.0.1:8000'
    return [{ source: '/api/backend/:path*', destination: `${apiRoot(backend)}/:path*` }]
  },
}

export default nextConfig
