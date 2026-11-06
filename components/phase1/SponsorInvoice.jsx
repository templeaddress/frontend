'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PublicShell } from '@/components/ui'
import { clientApi, requireAuth } from '@/lib/client-api'

export function InvoiceDocument({ invoice }) {
  const snapshot = invoice.snapshot, currency = snapshot.currency || 'INR'
  const money = value => `${currency} ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return <article id="sponsor-invoice" className="rounded-2xl border border-brown-100 bg-white p-6">
    <h1 className="text-2xl font-semibold">Invoice {invoice.number}</h1>
    <p>{snapshot.seller?.name || 'TempleAddress'}</p>
    {snapshot.seller?.address && <p className="whitespace-pre-line text-sm">{snapshot.seller.address}</p>}
    {snapshot.seller?.gstin && <p className="text-sm">GSTIN: {snapshot.seller.gstin}</p>}
    <p className="mt-3 text-sm">Issued {new Date(invoice.issued_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} · Order {snapshot.sale_order}</p>
    <p className="mt-4 font-semibold">Billed to: {snapshot.sponsor?.name || snapshot.buyer}</p>
    {snapshot.sponsor?.gstin && <p className="text-sm">GSTIN: {snapshot.sponsor.gstin}</p>}
    <p className="text-sm">For {snapshot.listing} · {snapshot.listing_code}</p>
    <table className="mt-5 w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Description</th><th className="py-2 text-right">Amount</th></tr></thead><tbody>{snapshot.lines.map((line, index) => <tr key={index} className="border-b border-brown-100"><td className="py-3 pr-3">{line.description}</td><td className="py-3 text-right">{money(line.amount)}</td></tr>)}</tbody></table>
    <dl className="ml-auto mt-4 max-w-sm space-y-2 text-sm">{[['Taxable amount', snapshot.subtotal], [`GST ${snapshot.gst_percent || ''}%`, snapshot.tax_total], ['Total paid', snapshot.total]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-semibold">{money(value)}</dd></div>)}</dl>
    <p className="mt-5 break-all text-xs text-brown-500">Payment reference: {snapshot.payment_reference}</p>
    <button className="btn-g mt-5 print:hidden" type="button" onClick={() => window.print()}>Print / save as PDF</button>
    <style jsx global>{`@media print { body * { visibility: hidden; } #sponsor-invoice, #sponsor-invoice * { visibility: visible; } #sponsor-invoice { position: absolute; left: 0; top: 0; width: 100%; border: 0; } #sponsor-invoice button { display: none; } }`}</style>
  </article>
}

export default function SponsorInvoice() {
  const { code } = useParams(), router = useRouter(), [order, setOrder] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    if (!requireAuth(router, `/sponsor/orders/${code}/invoice`)) return
    clientApi(`me/sale-orders/${code}`).then(setOrder).catch(err => setError(err.message))
  }, [router, code])
  return <PublicShell><main className="mx-auto max-w-3xl space-y-5 px-4 py-10"><Link className="text-saffron-700 print:hidden" href={`/sponsor/orders/${code}`}>Back to sponsorship</Link>{error && <p role="alert">{error}</p>}{order?.invoice ? <InvoiceDocument invoice={order.invoice}/> : <p role="status">{order ? 'The invoice is issued after payment is confirmed.' : 'Loading invoice…'}</p>}</main></PublicShell>
}
