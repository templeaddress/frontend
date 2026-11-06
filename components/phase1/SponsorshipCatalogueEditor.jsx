'use client'

import { useState } from 'react'
import { useStaffQuery } from './StaffData'

const Field = ({ label, children }) => <label className="block text-sm font-medium">{label}{children}</label>

export default function SponsorshipCatalogueEditor({ row, kind, busy, onSave }) {
  const { data: plans, error } = useStaffQuery('staff/commerce/plans')
  const [includedPlan, setIncludedPlan] = useState(row.includes_plan || '')
  return <form className="space-y-3" onSubmit={event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget), body = Object.fromEntries(form)
    onSave({ ...body, is_active: form.has('is_active'), featured: form.has('featured'),
      ...(kind === 'plans' ? { one_time: form.has('one_time') } : { placements: form.getAll('placements') }),
      benefits: String(body.benefits || '').split('\n').map(value => value.trim()).filter(Boolean) })
  }}>
    <Field label="Code"><input name="code" className="input mt-1" defaultValue={row.code} readOnly={Boolean(row.code)} maxLength={40} required/></Field>
    <Field label="Name"><input name="name" className="input mt-1" defaultValue={row.name} required maxLength={160}/></Field>
    <Field label="Description"><textarea name="description" className="input mt-1" defaultValue={row.description}/></Field>
    <Field label="Price INR (before GST)"><input name="price" type="number" min="0" step="0.01" className="input mt-1" defaultValue={row.price} required/></Field>
    <Field label={kind === 'plans' ? 'Validity (days)' : 'Duration (days)'}><input name={kind === 'plans' ? 'validity_days' : 'duration_days'} type="number" min="1" className="input mt-1" defaultValue={row.validity_days || row.duration_days || 365} required/></Field>
    <Field label="Benefits (one per line)"><textarea name="benefits" className="input mt-1" rows={4} defaultValue={(row.benefits || []).join('\n')}/></Field>
    {kind === 'plans' ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="one_time" defaultChecked={row.one_time}/>One-time purchase</label> : <>
      <Field label="Included subscription plan"><select name="plan_code" className="input mt-1" value={includedPlan} onChange={event => setIncludedPlan(event.target.value)}><option value="">No included plan</option>{includedPlan && !(plans || []).some(plan => plan.code === includedPlan) && <option value={includedPlan}>{includedPlan}</option>}{(plans || []).map(plan => <option key={plan.code} value={plan.code}>{plan.name} ({plan.code})</option>)}</select></Field>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Field label="Tier"><input name="tier" className="input mt-1" defaultValue={row.tier}/></Field>
      <fieldset><legend className="text-sm font-medium">Sponsor placements</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{[['listing_page', 'Listing page'], ['receipt', 'Receipts'], ['qr_board', 'QR board'], ['sponsor_page', 'Dedicated sponsor page']].map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" name="placements" value={value} defaultChecked={(row.placements || ['listing_page']).includes(value)}/>{label}</label>)}</div></fieldset>
    </>}
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={row.featured}/>Featured package</label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={row.is_active}/>Published (visible at checkout)</label>
    <button className="btn-p" disabled={busy}>Save</button>
  </form>
}
