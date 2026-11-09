'use client'
import React, { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Download, ExternalLink, QrCode } from 'lucide-react'
import { generateListingQr, listingQrKey, readListingQr } from '@/lib/listingQr'

const QR_UPDATED = 'ta:listing-qr-updated'

export function useListingQr(temple) {
  const code = temple?.code
  const [state, setState] = useState({ record: null, error: '', loading: true })
  useEffect(() => {
    if (!code) { setState({ record: null, error: '', loading: false }); return }
    const refresh = () => {
      try { setState({ record: readListingQr(code), error: '', loading: false }) }
      catch { setState({ record: null, error: 'The saved QR could not be loaded. Restore browser storage and reload to avoid replacing it.', loading: false }) }
    }
    const onStorage = event => { if (event.key === null || event.key === listingQrKey(code)) refresh() }
    refresh()
    window.addEventListener('storage', onStorage)
    window.addEventListener(QR_UPDATED, refresh)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(QR_UPDATED, refresh)
    }
  }, [code])
  return { ...state, record: state.record?.listingCode === code ? state.record : null }
}

// Keep the QR payload and encoding identical in the dashboard, download, and public page.
export function ListingQrPreview({ value, size = 192, svgRef }) {
  return <QRCodeSVG ref={svgRef} value={value} size={size} level="M" marginSize={4}/>
}

export default function ListingQr({ temple, title = 'Temple QR code' }) {
  const { record, error, loading } = useListingQr(temple)
  const [generating, setGenerating] = useState(false)
  const [actionError, setActionError] = useState('')
  const svgRef = useRef(null)
  const generate = async () => {
    if (generating || loading || error || record) return
    setGenerating(true)
    setActionError('')
    try {
      const save = () => generateListingQr(temple)
      // Serialize first creation across tabs where Web Locks is available.
      if (navigator.locks) await navigator.locks.request(listingQrKey(temple.code), save)
      else save()
      window.dispatchEvent(new Event(QR_UPDATED))
    } catch (failure) {
      setActionError(`QR could not be saved. ${failure.message || 'Check browser storage and try again.'}`)
    } finally { setGenerating(false) }
  }
  const download = () => {
    if (!record || !svgRef.current) return
    const svg = new XMLSerializer().serializeToString(svgRef.current)
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${temple.code}-qr.svg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <section className="card p-5" aria-label={`${temple.name} QR code`}>
    <h3 className="flex items-center gap-2 font-semibold"><QrCode size={18}/>{title}</h3>
    <p className="mt-1 text-xs text-brown-500">Listing {temple.code} · Scan to open the temple's public page.</p>
    {record ? <>
      <div className="mt-4 flex justify-center rounded-xl border border-brown-100 bg-white p-2"><ListingQrPreview value={record.targetUrl} svgRef={svgRef}/></div>
      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><Check size={14}/>QR already generated · {new Date(record.generatedAt).toLocaleDateString('en-IN')}</p>
      <a href={record.targetUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-xs text-saffron-600 underline">{record.targetUrl}</a>
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={download} className="btn-g"><Download size={15}/>Download QR (SVG)</button><a href={record.targetUrl} target="_blank" rel="noopener noreferrer" className="btn-g"><ExternalLink size={15}/>Open temple</a></div>
      <p className="mt-3 text-xs text-brown-500">This listing keeps the same QR. Download it again whenever needed.</p>
    </> : <>
      <p className="mt-4 text-sm text-brown-500">QR code not generated yet. Only one QR is saved for this listing.</p>
      <button type="button" onClick={generate} disabled={loading || generating || !!error} className="btn-p mt-3 disabled:opacity-40"><QrCode size={16}/>{generating ? 'Generating…' : 'Generate QR code'}</button>
    </>}
    {(error || actionError) && <p role="alert" className="mt-3 text-xs text-red-700">{error || actionError}</p>}
  </section>
}
