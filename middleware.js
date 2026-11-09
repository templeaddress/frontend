import { NextResponse } from 'next/server'
import { demoPortalsEnabled, isDemoPortal } from './lib/demo-portals.js'

// Demo portals use mock data; block them on the server so nothing reaches the HTML or RSC payload.
export function middleware(request) {
  if (!demoPortalsEnabled(process.env.NEXT_PUBLIC_DEMO_PORTALS_ENABLED) && isDemoPortal(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL('/coming-soon', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/vendor/:path*', '/festival-admin/:path*', '/service-admin/:path*', '/partner/:path*', '/dealer/:path*', '/staff/:path*', '/claim/:path*', '/sponsor/:path*'],
}
