'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { PublicShell } from '@/components/ui'
import { clientApi, requireAuth } from '@/lib/client-api'
import { listingPath } from '@/lib/catalogue'

export default function SponsorQrBoard() {
  const { code } = useParams(), router = useRouter(), [order, setOrder] = useState(null), [error, setError] = useState(''), [origin, setOrigin] = useState('')
  useEffect(() => {
    if (!requireAuth(router, `/sponsor/orders/${code}/qr`)) return
    setOrigin(window.location.origin)
    clientApi(`me/sale-orders/${code}`).then(setOrder).catch(err => setError(err.message))
  }, [code, router])
  const ad = order?.advertisements?.find(row => row.status === 'active' && row.placements?.includes('qr_board') && new Date(row.starts_at) <= new Date() && new Date(row.ends_at) > new Date())
  const target = order?.listing ? `${origin}${listingPath(order.listing)}` : ''
  return <PublicShell><main className="mx-auto max-w-2xl space-y-5 px-4 py-10"><Link className="text-saffron-700" href={`/sponsor/orders/${code}`}>Back to sponsorship</Link>{error && <p role="alert">{error}</p>}{ad && target ? <article id="sponsor-qr-board" className="space-y-5 rounded-2xl border border-brown-100 bg-white p-8 text-center"><p className="text-xl font-semibold">TempleAddress</p><h1 className="text-3xl font-semibold">{order.listing.name_en}</h1><p>Scan to visit the temple and book a pooja</p><QRCodeSVG value={target} size={240} level="M" marginSize={4} className="mx-auto h-auto max-w-full"/><p className="break-all text-xs">{target}</p><p className="font-semibold">Sponsored by {ad.title}</p>{ad.media_url && <img src={ad.media_url} alt={`${ad.title} sponsor artwork`} className="mx-auto max-h-28 max-w-full object-contain"/>}<button className="btn-p" onClick={() => window.print()}>Print / save QR board</button><style jsx global>{`@media print { body * { visibility: hidden; } #sponsor-qr-board, #sponsor-qr-board * { visibility: visible; } #sponsor-qr-board { position: absolute; left: 0; top: 0; width: 100%; border: 0; } #sponsor-qr-board button { display: none; } }`}</style></article> : <p role="status">{order ? 'A QR board is available after artwork approval for packages that include it.' : 'Loading QR board…'}</p>}</main></PublicShell>
}
