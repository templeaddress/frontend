'use client'

import { useState } from 'react'

export default function CommissionRuleForm({ bases, busy, onSave }) {
  const [basis, setBasis] = useState('sale_order'), [unit, setUnit] = useState('rate_percent')
  const points = ['affiliate_points', 'affiliate_signup'].includes(basis)
  const units = points || basis === 'listing_verified' ? ['fixed_amount'] : basis === 'dealer_override' ? ['rate_percent'] : ['rate_percent', 'fixed_amount']
  const selectedUnit = units.includes(unit) ? unit : units[0]
  return <form className="mt-4 grid gap-3 sm:grid-cols-4" onSubmit={event => {
    event.preventDefault()
    onSave({ basis, [selectedUnit]: new FormData(event.currentTarget).get('value') })
  }}>
    <select aria-label="Commission or reward basis" className="input min-w-0" value={basis} onChange={event => setBasis(event.target.value)}>{Object.entries(bases || {}).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
    <select aria-label="Calculation type" className="input min-w-0" value={selectedUnit} onChange={event => setUnit(event.target.value)}>{units.map(value => <option key={value} value={value}>{points ? 'Whole points' : value === 'rate_percent' ? 'Percent' : 'Fixed amount'}</option>)}</select>
    <input name="value" aria-label={points ? 'Points per referral' : 'Commission value'} type="number" step={points ? '1' : '0.01'} min="0" max={selectedUnit === 'rate_percent' ? '100' : undefined} className="input min-w-0" required placeholder={points ? 'Points (0 to disable)' : 'Value'}/>
    <button className="btn-p" disabled={busy || !Object.keys(bases || {}).length}>Save new version</button>
  </form>
}
