'use client'

import { useEffect, useState } from 'react'
import { Field, Input } from '@/components/ui'
import { clientApi } from '@/lib/client-api'

const sections = {
  basics: [['name_en', 'English name'], ['name_ml', 'Malayalam name'], ['short_description_en', 'Short description'], ['short_description_ml', 'Malayalam short description']],
  location: [['address', 'Postal address'], ['pincode', 'Pincode'], ['latitude', 'Latitude'], ['longitude', 'Longitude'], ['map_url', 'Map URL'], ['website', 'Website']],
  details: [['description_en', 'About'], ['description_ml', 'About in Malayalam'], ['history', 'History / Aithihyam'], ['speciality', 'Speciality'], ['guidelines', 'Visitor guidelines'], ['remarks', 'Remarks']],
  contact: [['phone', 'Official phone'], ['whatsapp', 'Official WhatsApp'], ['email', 'Official email'], ['payout_email', 'Payout notification email'], ['payout_mobile', 'Payout notification mobile'], ['chart_email', 'Chart notification email'], ['chart_mobile', 'Chart notification mobile']],
}
const profiles = {
  temple: [['main_deity', 'Main deity'], ['management', 'Managed by'], ['chief_priest', 'Chief priest']],
  festival: [['organiser', 'Organiser'], ['start_date', 'Start date', 'date'], ['end_date', 'End date', 'date'], ['venue', 'Venue'], ['travel_notes', 'Travel information'], ['parking_notes', 'Parking information'], ['sponsorship_instructions', 'External sponsorship instructions']],
  service: [['profession', 'Profession'], ['experience_years', 'Experience in years', 'number'], ['qualifications', 'Qualifications'], ['languages', 'Languages, separated by commas']],
}

function Rows({ title, fields, value, onChange }) {
  return <div className="space-y-3 md:col-span-2"><h3 className="font-semibold">{title}</h3>{value.map((row, index) => <div key={index} className="grid gap-3 rounded-xl border p-3 md:grid-cols-2">{fields.map(([key, label, type = 'text']) => <Field key={key} label={label}><Input type={type} step={type === 'number' ? 'any' : undefined} value={row[key] ?? ''} onChange={event => onChange(value.map((item, i) => i === index ? { ...item, [key]: event.target.value } : item))}/></Field>)}<button type="button" className="btn-g" onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove row</button></div>)}<button type="button" className="btn-g" onClick={() => onChange([...value, {}])}>Add {title.toLowerCase()} row</button></div>
}

export default function ListingRevisionEditor({ listing, revision, onChange, readOnly = false }) {
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  const [media, setMedia] = useState([]), [documents, setDocuments] = useState([]), [masters, setMasters] = useState({})
  const [nearby, setNearby] = useState([]), [programmes, setProgrammes] = useState([]), [offerings, setOfferings] = useState([])
  const root = `me/listings/${listing.uuid}`, snapshot = revision?.snapshot || {}, profile = snapshot[`${listing.listing_type}_profile`] || {}
  const editable = !readOnly && revision?.can_edit
  useEffect(() => {
    setNearby(revision?.snapshot?.nearby_places || []); setProgrammes(revision?.snapshot?.programmes || []); setOfferings(revision?.snapshot?.service_offerings || [])
  }, [revision?.uuid]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (readOnly) return
    let active = true
    Promise.all(['category', 'district', 'deity'].map(async kind => [kind, await clientApi(`master-values/${kind === 'category' ? 'listing_category' : kind}`, { auth: false })]))
      .then(items => { if (active) setMasters(Object.fromEntries(items)) }).catch(err => { if (active) setError(err.message) })
    return () => { active = false }
  }, [readOnly])
  async function reloadFiles() {
    setMedia(await clientApi(`${root}/media`))
    if (revision?.can_access_private) setDocuments(await clientApi(`${root}/documents`))
  }
  useEffect(() => { reloadFiles().catch(err => setError(err.message)) }, [listing.uuid, revision?.uuid, revision?.can_access_private]) // eslint-disable-line react-hooks/exhaustive-deps
  async function action(work) {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try { await work(); setNotice('Saved successfully.'); await onChange() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  async function save(event, section) {
    event.preventDefault()
    const form = new FormData(event.currentTarget), values = Object.fromEntries(form)
    let change = values
    if (section === 'contact') change = { contact: values }
    if (section === 'location') for (const key of ['latitude', 'longitude', 'category', 'district']) if (change[key] === '') change[key] = null
    if (section === 'details') {
      const detailFields = Object.fromEntries(sections.details.map(([key]) => [key, values[key]]))
      const specific = Object.fromEntries(profiles[listing.listing_type].map(([key]) => [key, values[key]]))
      if (listing.listing_type === 'temple') specific.opening_periods = ['Morning', 'Evening'].flatMap(label => values[`${label}_opens`] || values[`${label}_closes`] ? [{ label, opens: values[`${label}_opens`], closes: values[`${label}_closes`] }] : [])
      if (listing.listing_type === 'service') { specific.languages = (specific.languages || '').split(',').map(x => x.trim()).filter(Boolean); specific.experience_years = Number(specific.experience_years || 0) }
      if (listing.listing_type === 'festival') for (const key of ['start_date', 'end_date']) specific[key] ||= null
      change = { ...detailFields, [`${listing.listing_type}_profile`]: specific, nearby_places: nearby.map(row => ({ ...row, distance_km: row.distance_km || null })) }
      if (listing.listing_type === 'temple') change.deities = form.getAll('deities').map(code => ({ code, is_primary: !!snapshot.deities?.find(row => row.code === code)?.is_primary }))
      if (listing.listing_type === 'festival') change.programmes = programmes.map(row => ({ ...row, start_time: row.start_time || null, end_time: row.end_time || null }))
      if (listing.listing_type === 'service') change.service_offerings = offerings.map(row => ({ ...row, indicative_price_amount: row.indicative_price_amount || null }))
    }
    await action(() => clientApi(`${root}/revision`, { method: 'PATCH', body: { snapshot: change, sections_completed: [...new Set([...(revision.sections_completed || []), section])].slice(-6) } }))
  }
  async function upload(event, kind) {
    event.preventDefault(); const element = event.currentTarget; const data = new FormData(element)
    await action(async () => { await clientApi(`${root}/${kind}`, { method: 'POST', body: data }); element.reset(); await reloadFiles() })
  }
  async function download(path, name) {
    await action(async () => { const blob = await clientApi(path, { responseType: 'blob' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000) })
  }
  return <section className="mt-6 space-y-5">
    <div className="card p-5"><h2 className="text-xl font-semibold">Listing content and staff review</h2><p className="mt-2 text-sm">Revision: {revision?.status || 'No open draft'} · {revision?.scope === 'public_content' ? 'Public content proposal' : 'Listing submission'}</p>{revision?.review_notes && <p className="mt-3 rounded-xl bg-amber-50 p-3">Staff feedback: {revision.review_notes}</p>}{!readOnly && revision && !editable && revision.status !== 'submitted' && <button disabled={busy} className="btn-p mt-3" onClick={() => action(() => clientApi(`${root}/revision/new`, { method: 'POST', body: {} }))}>Start a new revision</button>}{!readOnly && !revision && <button className="btn-p mt-3" disabled={busy} onClick={() => action(() => clientApi(`${root}/revision/new`, { method: 'POST', body: {} }))}>Create revision</button>}<p className="mt-3 text-sm text-brown-500">Saved edits become public after staff approval. Submission does not grant ownership or vendor access.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-3">{notice}</p>}
    {editable && Object.entries(sections).filter(([section]) => section !== 'contact' || revision.can_access_private).map(([section, fields]) => <form key={`${revision.uuid}-${section}`} onSubmit={event => save(event, section)} className="card grid gap-4 p-5 md:grid-cols-2"><h3 className="text-lg font-semibold capitalize md:col-span-2">{section}</h3>{fields.map(([key, label]) => <Field label={label} key={key}>{section === 'details' || key.includes('description') || key === 'address' ? <textarea className="input" name={key} defaultValue={(section === 'contact' ? snapshot.contact : snapshot)?.[key] || ''} rows={3}/> : <Input name={key} defaultValue={(section === 'contact' ? snapshot.contact : snapshot)?.[key] || ''}/>}</Field>)}
      {section === 'location' && ['category', 'district'].map(kind => <Field key={kind} label={kind === 'category' ? 'Category' : 'District'}><select name={kind} defaultValue={snapshot[kind] || ''} className="input"><option value="">Choose {kind}</option>{(masters[kind] || []).map(row => <option key={row.code} value={row.code}>{row.name_en}</option>)}</select></Field>)}
      {section === 'details' && <>{profiles[listing.listing_type].map(([key, label, type = 'text']) => <Field key={key} label={label}><Input name={key} type={type} min={type === 'number' ? 0 : undefined} defaultValue={Array.isArray(profile[key]) ? profile[key].join(', ') : profile[key] || ''}/></Field>)}{listing.listing_type === 'temple' && <>{['Morning', 'Evening'].map(label => { const period = profile.opening_periods?.find(row => row.label === label); return ['opens', 'closes'].map(key => <Field key={`${label}-${key}`} label={`${label} ${key === 'opens' ? 'opening' : 'closing'} time`}><Input name={`${label}_${key}`} type="time" defaultValue={period?.[key] || ''}/></Field>) })}<Field label="Deities (multiple selection)"><select name="deities" multiple className="input" defaultValue={(snapshot.deities || []).map(row => row.code)}>{(masters.deity || []).map(row => <option key={row.code} value={row.code}>{row.name_en}</option>)}</select></Field></>}
        <Rows title="Nearby places" value={nearby} onChange={setNearby} fields={[["name_en", "Name"], ["distance_km", "Distance in km", "number"]]}/>
        {listing.listing_type === 'festival' && <Rows title="Programme" value={programmes} onChange={setProgrammes} fields={[["name_en", "Programme name"], ["date", "Date", "date"], ["start_time", "Starts", "time"], ["end_time", "Ends", "time"], ["performer", "Performer"], ["details", "Details"]]}/>}
        {listing.listing_type === 'service' && <Rows title="Services offered" value={offerings} onChange={setOfferings} fields={[["name_en", "Service name"], ["indicative_price_amount", "Indicative price", "number"], ["duration_text", "Duration"], ["availability_text", "Availability"]]}/>}</>}
      <div className="md:col-span-2"><button disabled={busy} className="btn-g">Save {section} section</button></div></form>)}
    <div className="card space-y-3 p-5"><h3 className="font-semibold">Gallery · optional</h3>{media.map(row => <div key={row.uuid} className="flex flex-wrap items-center gap-3 text-sm"><span>{row.caption || 'Listing image'} · {row.publication_state}</span>{row.preview_path && <button className="btn-g" disabled={busy} onClick={() => download(`me/listings/${listing.uuid}/media/${row.uuid}/file`, row.uuid)}>Download preview</button>}{row.public_url && <a href={row.public_url} target="_blank" rel="noopener noreferrer" className="btn-g">View approved image</a>}{editable && row.publication_state === 'approved' && <button disabled={busy} className="btn-g" onClick={() => action(() => clientApi(`${root}/revision`, { method: 'PATCH', body: { snapshot: { remove_media: [...new Set([...(snapshot.remove_media || []), row.uuid])] } } }))}>Request removal on approval</button>}{editable && row.publication_state === 'draft' && <button disabled={busy} className="btn-g" onClick={() => action(async () => { await clientApi(`${root}/media`, { method: 'DELETE', body: { uuid: row.uuid } }); await reloadFiles() })}>Remove draft image</button>}</div>)}{editable && <form onSubmit={event => upload(event, 'media')} className="space-y-3"><input type="file" name="file" accept="image/jpeg,image/png,image/webp" required/><Input name="caption" placeholder="Image caption (optional)"/><Field label="Gallery order (0 is the cover)"><Input name="sort_order" type="number" min="0" defaultValue="0"/></Field><button disabled={busy} className="btn-g">Upload draft image</button></form>}</div>
    {revision?.can_access_private && <div className="card space-y-3 p-5"><h3 className="font-semibold">Private supporting documents · optional</h3>{documents.map(row => <div key={row.uuid} className="flex gap-3 text-sm"><span>{row.kind} · {row.review_status}</span><button disabled={busy} className="btn-g" onClick={() => download(`${root}/documents/${row.uuid}/file`, row.kind)}>Download</button>{!readOnly && row.review_status === 'submitted' && <button disabled={busy} className="btn-g" onClick={() => action(async () => { await clientApi(`${root}/documents`, { method: 'DELETE', body: { uuid: row.uuid } }); await reloadFiles() })}>Remove</button>}</div>)}{!readOnly && <form onSubmit={event => upload(event, 'documents')} className="space-y-3"><Input name="kind" placeholder="Document type, e.g. registration" required/><input type="file" name="file" accept="application/pdf,image/jpeg,image/png,image/webp" required/><button disabled={busy} className="btn-g">Upload private document</button></form>}</div>}
    {editable && <button disabled={busy} className="btn-p" onClick={() => action(() => clientApi(`${root}/submit`, { method: 'POST', body: {} }))}>Submit saved sections for staff review</button>}
  </section>
}
