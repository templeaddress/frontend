'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Download } from 'lucide-react'
import { Field, Input } from '@/components/ui'
import { clientApi } from '@/lib/client-api'
import { reportQuery } from '@/lib/vendor'
import { staffDownload } from './StaffData'
import { StaffDetails, StaffEmpty, StaffModal, StaffNotice, StaffPager, StaffStatus, money, staffDate, titleCase } from './StaffUI'
import { useVendorAction, useVendorQuery, VendorCard, VendorHeading, VendorLoad, VendorTable } from './VendorUI'

function useReport(path, defaults = {}) {
  const query = useSearchParams(), router = useRouter(), pathname = usePathname()
  const values = { ...defaults, ...Object.fromEntries(query) }
  if (defaults.type) values.type = defaults.type
  if (values.date && !values.from && !values.to) { values.from = values.date; values.to = values.date }
  const params = reportQuery(values, values.page || 1)
  const state = useVendorQuery(`${path}?${params}`)
  function change(key, value) {
    const next = new URLSearchParams(query)
    next.delete('date')
    for (const [name, val] of Object.entries({ ...defaults, ...values, [key]: value, page: key === 'page' ? value : '1' })) {
      if (name === 'date') continue
      if (val) next.set(name, val); else next.delete(name)
    }
    router.replace(`${pathname}?${next}`, { scroll: false })
  }
  return { state, values, params, change, page: Number(values.page || 1) }
}

function Filters({ report, statuses, search = false, types = false }) {
  const { values, change } = report
  return <VendorCard className="mb-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {search && <Field label="Search"><Input value={values.search || ''} onChange={event => change('search', event.target.value)} placeholder="Booking, devotee or item"/></Field>}
    {types && <Field label="Type"><select className="input" value={values.type || ''} onChange={event => change('type', event.target.value)}><option value="">All types</option>{['pooja', 'special_pooja', 'donation'].map(type => <option key={type} value={type}>{titleCase(type)}</option>)}</select></Field>}
    <Field label="Status"><select className="input" value={values.status || ''} onChange={event => change('status', event.target.value)}><option value="">All statuses</option>{statuses.map(status => <option key={status} value={status}>{titleCase(status)}</option>)}</select></Field>
    <Field label="From (IST)"><Input type="date" value={values.from || ''} max={values.to || undefined} onChange={event => change('from', event.target.value)}/></Field><Field label="To (IST)"><Input type="date" value={values.to || ''} min={values.from || undefined} onChange={event => change('to', event.target.value)}/></Field>
  </div></VendorCard>
}

export function VendorBookingReport({ listing, type = '', title, text }) {
  const report = useReport(`vendor/listings/${listing.uuid}/bookings`, type ? { type } : {}), { state } = report, action = useVendorAction(), [selected, setSelected] = useState(null)
  function exportCsv() { const params = new URLSearchParams(report.params); params.set('export', 'csv'); params.delete('page'); action.run(() => staffDownload(`vendor/listings/${listing.uuid}/bookings?${params}`, `${listing.code}-${type || 'bookings'}.csv`)) }
  return <><VendorHeading title={title} text={text} action={<button className="btn-g" disabled={action.busy || state.loading || !!state.error} onClick={exportCsv}><Download size={15}/>Export CSV</button>}/><Filters report={report} search types={!type} statuses={['pending', 'confirmed', 'scheduled', 'performed', 'completed', 'cancelled', 'failed']}/><VendorLoad state={state}/><StaffNotice error={action.error}/>
    {state.data && <p className="mb-3 text-sm text-brown-500">{state.data.count} record(s) · {money(state.data.amount_total)} total</p>}
    <VendorTable head={['Booking', 'Item / purpose', 'Devotee / donor', 'Service date', 'Quantity', 'Amount', 'Status', '']}>
      {state.data?.results.map(row => <tr key={row.uuid}><td className="td font-semibold">{row.booking_code}{row.recurring && <small className="block text-blue-700">Recurring</small>}</td><td className="td">{row.item_name}<small className="block text-brown-500">{titleCase(row.item_type)}</small></td><td className="td">{row.item_type === 'donation' ? row.contact_name : row.devotee_name}<small className="block text-brown-500">{row.star}</small></td><td className="td">{staffDate(row.item_type === 'donation' ? row.created_at : row.service_date, row.item_type === 'donation')}</td><td className="td">{row.quantity}</td><td className="td">{money(row.amount)}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td"><button className="btn-g !py-1.5" onClick={() => setSelected(row)}>View</button></td></tr>)}
      {!state.data?.results.length && <StaffEmpty columns={8} loading={state.loading} text={state.error ? 'Records could not be loaded.' : 'No records match these filters.'}/>}</VendorTable>
    <StaffPager payload={state.data} page={report.page} onChange={value => report.change('page', String(value))} loading={state.loading}/>
    {selected && <StaffModal title={`${selected.booking_code} · ${selected.item_name}`} onClose={() => setSelected(null)}><StaffDetails values={[[ 'Item ID', selected.uuid], ['Code', selected.item_code], ['Devotee / donor', selected.devotee_name || selected.contact_name], ['Nakshatra', selected.star], ['Service date', staffDate(selected.service_date, false)], ['Quantity', selected.quantity], ['Amount', money(selected.amount)], ['Item status', titleCase(selected.status)], ['Payment / booking status', titleCase(selected.booking_status)], ['Contact', `${selected.contact_name} · ${selected.contact_mobile || '—'}`], ['Receipt number', selected.receipt_number], ['Prasadam', titleCase(selected.prasadam?.method)], ['Delivery status', titleCase(selected.prasadam?.status)], ['Funds destination', selected.funds_destination === 'listing' ? 'Listing gateway · direct settlement' : 'TempleAddress payout']]}/></StaffModal>}
  </>
}

export function VendorChartReport({ listing, base }) {
  const report = useReport(`vendor/listings/${listing.uuid}/charts`), { state } = report
  return <><VendorHeading title="Daily charts" text="Stored chart versions and settlement totals. Preparation and notifications follow the configured scheduled jobs."/><Filters report={report} statuses={['prepared', 'completed']}/><VendorLoad state={state}/><VendorTable head={['Chart', 'Date', 'Lines', 'Gross', 'Platform payable', 'Status', 'Payout']}>
    {state.data?.results.map(row => <tr key={row.uuid}><td className="td"><Link className="font-semibold text-saffron-700 underline" href={`${base}/charts/${row.uuid}`}>{row.code}</Link></td><td className="td">{staffDate(row.business_date, false)}</td><td className="td">{row.lines}</td><td className="td">{money(row.total)}</td><td className="td">{money(row.payable)}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td">{row.payout_status ? <StaffStatus value={row.payout_status}/> : '—'}</td></tr>)}{!state.data?.results.length && <StaffEmpty columns={7} loading={state.loading}/>}</VendorTable><StaffPager payload={state.data} page={report.page} onChange={value => report.change('page', String(value))} loading={state.loading}/></>
}

export function VendorPayoutReport({ listing, base }) {
  const report = useReport(`vendor/listings/${listing.uuid}/payouts`), { state } = report, action = useVendorAction(), [selected, setSelected] = useState(null)
  return <><VendorHeading title="Payouts" text="Settlement against stored charts. An export does not mark a payout paid." action={<button className="btn-g" disabled={action.busy || state.loading || !!state.error} onClick={() => { const params = new URLSearchParams(report.params); params.set('export', 'csv'); params.delete('page'); action.run(() => staffDownload(`vendor/listings/${listing.uuid}/payouts?${params}`, `${listing.code}-payouts.csv`)) }}><Download size={15}/>Export CSV</button>}/><Filters report={report} statuses={['pending', 'on_hold', 'exported', 'retry_required', 'paid', 'exception']}/><VendorLoad state={state}/><StaffNotice error={action.error}/>
    {state.data?.direct_settlement?.enabled && <p className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">Direct settlement: {state.data.direct_settlement.items} item(s), {money(state.data.direct_settlement.amount)}. These collections are excluded from TempleAddress payouts.</p>}
    <VendorTable head={['Chart', 'Date', 'Amount', 'Status', 'Bank reference', '']}>
      {state.data?.results.map(row => <tr key={row.uuid}><td className="td"><Link className="font-semibold text-saffron-700 underline" href={`${base}/charts/${row.chart_uuid}`}>{row.chart_code}</Link></td><td className="td">{staffDate(row.business_date, false)}</td><td className="td">{money(row.amount)}</td><td className="td"><StaffStatus value={row.status}/></td><td className="td">{row.bank_transaction_id || '—'}</td><td className="td"><button className="btn-g !py-1.5" onClick={() => setSelected(row)}>Details</button></td></tr>)}{!state.data?.results.length && <StaffEmpty columns={6} loading={state.loading}/>}</VendorTable><StaffPager payload={state.data} page={report.page} onChange={value => report.change('page', String(value))} loading={state.loading}/>
    {selected && <StaffModal title={`Payout · ${selected.chart_code}`} onClose={() => setSelected(null)}><StaffDetails values={[[ 'Payout ID', selected.uuid], ['Chart', selected.chart_code], ['Business date', staffDate(selected.business_date, false)], ['Vendor entitlement', money(selected.amount)], ['Status', titleCase(selected.status)], ['Bank transaction', selected.bank_transaction_id], ['Paid at', staffDate(selected.paid_at)]]}/></StaffModal>}
  </>
}

export function VendorDeliveryReport({ listing }) {
  const report = useReport(`vendor/listings/${listing.uuid}/deliveries`, { status: 'pending' }), { state } = report, [selected, setSelected] = useState(null), action = useVendorAction()
  return <><VendorHeading title="Prasadam delivery" text="Pack and track eligible home-delivery items. Status updates queue notifications through the existing delivery service."/><div className="mb-4 flex flex-wrap gap-2">{[['pending', 'To dispatch'], ['packed', 'Packed'], ['dispatched', 'Dispatched'], ['delivered', 'Delivered'], ['returned', 'Returned'], ['all', 'All']].map(([value, label]) => <button key={value} className={report.values.status === value ? 'btn-p' : 'btn-g'} onClick={() => report.change('status', value)}>{label}</button>)}</div><VendorLoad state={state}/><StaffNotice error={action.error}/><StaffNotice>{action.notice}</StaffNotice>
    <VendorTable head={['Booking', 'Item', 'Recipient', 'Address', 'Date', 'Delivery', '']}>
      {state.data?.results.map(row => <tr key={row.uuid}><td className="td">{row.booking_code}</td><td className="td">{row.item_name} × {row.quantity}</td><td className="td">{row.prasadam.recipient_name}<small className="block">{row.prasadam.mobile}</small></td><td className="td max-w-xs">{row.prasadam.address}, {row.prasadam.pincode}</td><td className="td">{staffDate(row.service_date, false)}</td><td className="td"><StaffStatus value={row.prasadam.status || 'pending'}/><small className="block">{row.prasadam.courier} {row.prasadam.tracking_number}</small></td><td className="td"><button className="btn-g !py-1.5" onClick={() => setSelected(row)}>Update</button></td></tr>)}{!state.data?.results.length && <StaffEmpty columns={7} loading={state.loading}/>}</VendorTable><StaffPager payload={state.data} page={report.page} onChange={value => report.change('page', String(value))} loading={state.loading}/>
    {selected && <StaffModal title={`${selected.booking_code} · delivery`} onClose={() => { if (!action.busy) setSelected(null) }}><form className="space-y-4" onSubmit={event => { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget)); action.run(() => clientApi(`vendor/listings/${listing.uuid}/booking-items/${selected.uuid}/dispatch`, { method: 'POST', body }), 'Delivery status saved.', () => { setSelected(null); state.reload() }) }}><p className="text-sm">{selected.item_name} · {selected.prasadam.recipient_name}</p><Field label="Delivery status"><select name="status" className="input" defaultValue={selected.prasadam.status === 'pending' || !selected.prasadam.status ? 'packed' : selected.prasadam.status}>{['packed', 'dispatched', 'delivered', 'returned'].map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select></Field><Field label="Courier"><Input name="courier" maxLength={80} defaultValue={selected.prasadam.courier}/></Field><Field label="Tracking number"><Input name="tracking_number" maxLength={80} defaultValue={selected.prasadam.tracking_number}/></Field><StaffNotice error={action.error}/><button className="btn-p" disabled={action.busy}>Save delivery status</button></form></StaffModal>}
  </>
}

export function VendorExportReport({ listing, manage }) {
  const report = useReport(`vendor/listings/${listing.uuid}/exports`), { state } = report, action = useVendorAction()
  return <><VendorHeading title="Reports & exports" text="Download the authoritative listing records. Every export is recorded with the user and date."/><div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">{[['bookings?export=csv&type=pooja', 'Pooja bookings'], ['bookings?export=csv&type=donation', 'Donations'], ...(manage ? [['payouts?export=csv', 'Payouts']] : [])].map(([path, label]) => <button key={path} className="btn-g" disabled={action.busy} onClick={() => action.run(() => staffDownload(`vendor/listings/${listing.uuid}/${path}`, `${listing.code}-${label}.csv`), 'Report downloaded.', state.reload)}><Download size={16}/>{label}</button>)}</div><VendorLoad state={state}/><StaffNotice error={action.error}/><StaffNotice>{action.notice}</StaffNotice>
    <VendorTable head={['Report', 'Rows', 'By', 'Date (IST)']}>{state.data?.results.map(row => <tr key={row.uuid}><td className="td">{titleCase(row.report)}</td><td className="td">{row.rows ?? '—'}</td><td className="td">{row.by || '—'}</td><td className="td">{staffDate(row.created_at)}</td></tr>)}{!state.data?.results.length && <StaffEmpty columns={4} loading={state.loading}/>}</VendorTable><StaffPager payload={state.data} page={report.page} onChange={value => report.change('page', String(value))} loading={state.loading}/></>
}
