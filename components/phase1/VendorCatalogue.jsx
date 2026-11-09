'use client'
import { useState } from 'react'
import { Field, Input } from '@/components/ui'
import { clientApi } from '@/lib/client-api'
import { StaffEmpty, StaffModal, StaffNotice, StaffStatus, money, titleCase } from './StaffUI'
import { useVendorAction, useVendorQuery, VendorHeading, VendorLoad, VendorTable } from './VendorUI'
import { indiaDate } from '@/lib/booking-dates'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function VendorCatalogue({ listing, kind }) {
  const root = `me/managed-listings/${listing.uuid}/${kind}`, state = useVendorQuery(root), action = useVendorAction()
  const [editing, setEditing] = useState(null), [blocked, setBlocked] = useState([]), [masters, setMasters] = useState({})
  const pooja = kind === 'poojas', service = kind === 'service-offerings', label = pooja ? 'pooja' : service ? 'service' : 'donation purpose'
  const id = row => row.uuid || row.id
  async function open(row) {
    await action.run(async () => {
      const data = row ? await clientApi(`${root}/${id(row)}`) : { is_active: true, booking_mode: 'online', price: '', daily_capacity: 20, lead_time_hours: 8, required_devotee_fields: ['name', 'star'], weekday_mask: [] }
      const values = pooja ? await Promise.all([clientApi('master-values/pooja_category', { auth: false }), clientApi('master-values/deity', { auth: false }), row ? clientApi(`${root}/${id(row)}/blocked-dates`) : Promise.resolve([])]) : []
      if (pooja) { setMasters({ category: values[0], deity: values[1] }); setBlocked(values[2]) }
      setEditing({ ...data, uuid: row?.uuid, id: row?.id })
    })
  }
  async function save(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget), body = Object.fromEntries(form), key = id(editing)
    body.is_active = form.has('is_active')
    if (pooja) {
      body.is_live = form.has('is_live'); body.requires_proof = form.has('requires_proof')
      body.weekday_mask = form.getAll('weekday').map(Number); body.required_devotee_fields = form.getAll('devotee_field')
      delete body.weekday; delete body.devotee_field
      for (const field of ['category', 'deity', 'start_time', 'end_time', 'available_from', 'available_to']) body[field] ||= null
      for (const field of ['category', 'deity']) if (key && body[field] === editing[field]) delete body[field]
      const original = editing.prasadam_details || {}, delivery = original.home_delivery || {}
      body.prasadam_details = { ...original, collection: form.has('collection'), home_delivery: { ...delivery, enabled: form.has('delivery_enabled'), charge: body.delivery_charge || '0', timeframe: body.delivery_timeframe || '', pincodes: String(body.delivery_pincodes || '').split(/[\s,]+/).filter(Boolean) } }
      for (const field of ['collection', 'delivery_enabled', 'delivery_charge', 'delivery_timeframe', 'delivery_pincodes']) delete body[field]
    }
    if (service && !body.indicative_price_amount) body.indicative_price_amount = null
    if (!pooja && !service && !body.suggested_amount) body.suggested_amount = null
    if (!body.code) delete body.code
    await action.run(() => clientApi(key ? `${root}/${key}` : root, { method: key ? 'PATCH' : 'POST', body }), `${titleCase(label)} saved. Existing booking records keep their saved values.`, () => { setEditing(null); state.reload() })
  }
  async function changeBlocked(work) {
    await action.run(async () => { await work(); setBlocked(await clientApi(`${root}/${id(editing)}/blocked-dates`)) }, 'Blocked dates updated.')
  }
  return <><VendorHeading title={service ? 'Services' : pooja ? listing.listing_type === 'festival' ? 'Festival offerings' : 'Poojas & prices' : 'Donation purposes'} text={service ? 'Indicative charges and duration. Customers pay the provider directly.' : 'Manage the catalogue used for new bookings. Existing records retain their snapshots.'} action={<button className="btn-p" disabled={action.busy} onClick={() => open(null)}>Add {label}</button>}/><VendorLoad state={state}/><StaffNotice error={action.error}/><StaffNotice>{action.notice}</StaffNotice>
    <VendorTable head={['Code / ID', 'Name', service ? 'Charge' : 'Amount', service ? 'Duration' : 'Booking', 'Status', '']}>
      {state.data?.map(row => <tr key={id(row)}><td className="td text-xs">{row.code || row.id}</td><td className="td font-semibold">{row.name_en}<small className="block font-normal text-brown-500">{row.name_ml}</small></td><td className="td">{service ? row.indicative_price_text || (row.indicative_price_amount != null ? money(row.indicative_price_amount) : 'Contact provider') : money(pooja ? row.price : row.suggested_amount)}</td><td className="td">{service ? row.duration_text : pooja ? `${titleCase(row.booking_mode)}${row.is_live ? ' · Live' : ''}` : 'Donation'}</td><td className="td"><StaffStatus value={row.is_active ? 'active' : 'disabled'}/></td><td className="td"><button className="btn-g !py-1.5" disabled={action.busy} onClick={() => open(row)}>Edit</button></td></tr>)}{!state.data?.length && <StaffEmpty columns={6} loading={state.loading}/>}</VendorTable>
    {editing && <StaffModal wide title={`${id(editing) ? 'Edit' : 'Add'} ${label}`} onClose={() => { if (!action.busy) setEditing(null) }}><form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={save}>
      {pooja && <Field label={id(editing) ? 'Code (fixed)' : 'Code (optional; generated if blank)'}><Input name="code" defaultValue={editing.code} readOnly={Boolean(id(editing))} maxLength={30}/></Field>}
      <Field label="English name"><Input name="name_en" required maxLength={200} defaultValue={editing.name_en}/></Field><Field label="Malayalam name"><Input name="name_ml" maxLength={200} defaultValue={editing.name_ml}/></Field>
      <Field label="Description"><textarea className="input" name="description_en" defaultValue={editing.description_en} rows={3}/></Field><Field label="Malayalam description"><textarea className="input" name="description_ml" defaultValue={editing.description_ml} rows={3}/></Field>
      {service ? <><Field label="Indicative charge (text)"><Input name="indicative_price_text" maxLength={120} defaultValue={editing.indicative_price_text}/></Field><Field label="Indicative charge (₹, optional)"><Input name="indicative_price_amount" type="number" min="0" step="0.01" defaultValue={editing.indicative_price_amount}/></Field><Field label="Duration"><Input name="duration_text" maxLength={120} defaultValue={editing.duration_text}/></Field><Field label="Availability"><Input name="availability_text" maxLength={255} defaultValue={editing.availability_text}/></Field></> : !pooja ? <Field label="Suggested donation (₹, optional)"><Input name="suggested_amount" type="number" min="0" step="0.01" defaultValue={editing.suggested_amount}/></Field> : <>
        <Field label="Price (₹)"><Input name="price" type="number" required min="0" step="0.01" defaultValue={editing.price}/></Field><Field label="Booking mode"><select name="booking_mode" className="input" defaultValue={editing.booking_mode}><option value="online">Online booking</option><option value="display">Display only</option></select></Field>
        {['category', 'deity'].map(field => <Field label={titleCase(field)} key={field}><select name={field} className="input" defaultValue={editing[field] || ''}><option value="">Not specified</option>{editing[field] && !(masters[field] || []).some(row => row.code === editing[field]) && <option value={editing[field]}>{editing[field]}</option>}{(masters[field] || []).map(row => <option key={row.code} value={row.code}>{row.name_en}</option>)}</select></Field>)}
        <Field label="Starts at (IST)"><Input name="start_time" type="time" defaultValue={editing.start_time || ''}/></Field><Field label="Ends at (IST)"><Input name="end_time" type="time" defaultValue={editing.end_time || ''}/></Field><Field label="Lead time (hours)"><Input name="lead_time_hours" type="number" min="0" required defaultValue={editing.lead_time_hours}/></Field><Field label="Daily capacity"><Input name="daily_capacity" type="number" min="1" required defaultValue={editing.daily_capacity}/></Field><Field label="Available from"><Input name="available_from" type="date" defaultValue={editing.available_from || ''}/></Field><Field label="Available until"><Input name="available_to" type="date" defaultValue={editing.available_to || ''}/></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_live" defaultChecked={editing.is_live}/>Live booking (online and end time required)</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="requires_proof" defaultChecked={editing.requires_proof}/>Requires fulfilment proof</label>
        <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-semibold">Weekdays (none means every day)</legend><div className="flex flex-wrap gap-3">{DAYS.map((day, index) => <label className="flex items-center gap-1 text-sm" key={day}><input name="weekday" type="checkbox" value={index} defaultChecked={editing.weekday_mask?.includes(index)}/>{day}</label>)}</div></fieldset>
        <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-semibold">Devotee details required</legend><div className="flex flex-wrap gap-4">{['name', 'star', 'mobile', 'address'].map(field => <label className="flex items-center gap-1 text-sm" key={field}><input name="devotee_field" type="checkbox" value={field} defaultChecked={editing.required_devotee_fields?.includes(field)}/>{titleCase(field)}</label>)}</div></fieldset>
        <h3 className="font-semibold sm:col-span-2">Prasadam options</h3><label className="flex items-center gap-2 text-sm"><input name="collection" type="checkbox" defaultChecked={editing.prasadam_details?.collection ?? true}/>Collection at temple</label><label className="flex items-center gap-2 text-sm"><input name="delivery_enabled" type="checkbox" defaultChecked={editing.prasadam_details?.home_delivery?.enabled}/>Home delivery</label><Field label="Delivery charge per unit (₹)"><Input name="delivery_charge" type="number" min="0" step="0.01" defaultValue={editing.prasadam_details?.home_delivery?.charge || '0'}/></Field><Field label="Delivery timeframe"><Input name="delivery_timeframe" defaultValue={editing.prasadam_details?.home_delivery?.timeframe || ''}/></Field><Field label="Supported pincodes (comma separated)" className="sm:col-span-2"><Input name="delivery_pincodes" defaultValue={(editing.prasadam_details?.home_delivery?.pincodes || []).join(', ')}/></Field>
      </>}
      <Field label="Display order"><Input name="sort_order" type="number" min="0" required defaultValue={editing.sort_order || 0}/></Field><label className="flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={editing.is_active}/>Active for new bookings / enquiries</label>
      <div className="sm:col-span-2"><StaffNotice error={action.error}/><div className="flex flex-wrap gap-2"><button className="btn-p" disabled={action.busy}>Save {label}</button><button className="btn-g" type="button" disabled={action.busy} onClick={() => setEditing(null)}>Cancel</button></div></div>
    </form>
      {pooja && id(editing) && <section className="mt-6 border-t pt-5"><h3 className="mb-3 font-semibold">Blocked dates</h3><ul className="space-y-2">{blocked.map(row => <li className="flex flex-wrap items-center justify-between gap-2 text-sm" key={row.date}><span>{row.date} · {row.reason}</span><button className="btn-g !py-1.5" disabled={action.busy} onClick={() => changeBlocked(() => clientApi(`${root}/${id(editing)}/blocked-dates`, { method: 'DELETE', body: { date: row.date } }))}>Unblock</button></li>)}</ul><form className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3" onSubmit={event => { event.preventDefault(); const form = event.currentTarget, body = Object.fromEntries(new FormData(form)); changeBlocked(async () => { await clientApi(`${root}/${id(editing)}/blocked-dates`, { method: 'POST', body }); form.reset() }) }}><Field label="Date to block"><Input type="date" name="date" min={indiaDate()} required/></Field><Field label="Reason"><Input name="reason" maxLength={255}/></Field><button className="btn-g self-end" disabled={action.busy}>Block date</button></form></section>}
    </StaffModal>}
  </>
}
