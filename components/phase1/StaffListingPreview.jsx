'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { clientApi } from '@/lib/client-api'

export default function StaffListingPreview({ row }) {
  const snapshot = row.snapshot || {}
  const [media, setMedia] = useState([]), [preview, setPreview] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let active = true
    clientApi(`me/listings/${row.listing_uuid}/media`).then(data => { if (active) setMedia(data) }).catch(err => { if (active) setError(err.message) })
    return () => { active = false }
  }, [row.listing_uuid])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url) }, [preview])
  async function inspect(image) {
    try { const blob = await clientApi(`me/listings/${row.listing_uuid}/media/${image.uuid}/file`, { responseType: 'blob' }); setPreview({ url: URL.createObjectURL(blob), caption: image.caption || 'Listing image' }); setError('') } catch (err) { setError(err.message) }
  }
  return <article aria-label="Listing content preview" className="card space-y-3 p-5"><p className="text-sm capitalize text-saffron-700">{row.listing_type} · {row.code} · {row.status}</p><h2 className="text-3xl font-semibold">{snapshot.name_en || row.name_en}</h2>{snapshot.name_ml && <p>{snapshot.name_ml}</p>}<p className="text-brown-500">{snapshot.address}</p><p>{snapshot.short_description_en}</p>{['description_en', 'history', 'speciality', 'guidelines', 'remarks'].filter(key => snapshot[key]).map(key => <section key={key}><h3 className="font-semibold capitalize">{key === 'description_en' ? 'About' : key}</h3><p className="whitespace-pre-wrap">{snapshot[key]}</p></section>)}<h3 className="font-semibold">Current and submitted images</h3><div className="flex flex-wrap gap-2">{media.filter(image => image.preview_path).map(image => <button className="btn-g" key={image.uuid} onClick={() => inspect(image)}>{image.caption || 'View image'} · {image.publication_state}</button>)}</div>{preview && <Image src={preview.url} alt={preview.caption} width={640} height={480} unoptimized className="h-64 w-full rounded-xl object-contain"/>}{error && <p role="alert" className="text-red-700">{error}</p>}</article>
}
