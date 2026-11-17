'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useStaffQuery } from './StaffData'
import { StaffNotice, StaffPager, staffDate } from './StaffUI'

export default function StaffChartAlerts({ onInspect, onPrepare }) {
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useStaffQuery(`staff/chart-alerts?page=${page}`)

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') reload()
    }, 60000)
    return () => window.clearInterval(timer)
  }, [reload])

  // Recovery can remove the last page while staff are viewing it.
  useEffect(() => {
    if (error && page > 1) setPage(1)
  }, [error, page])

  return <section aria-label="Chart alerts" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-brown-900"><AlertTriangle size={20} className="text-amber-700"/>Chart alerts{data && ` (${data.count})`}</h2>
      <button type="button" className="btn-g !py-2 text-xs" onClick={reload} disabled={loading}><RefreshCw size={14}/>Refresh alerts</button>
    </div>
    <StaffNotice error={error}/>
    {loading && <p role="status" className="mt-3 text-sm text-brown-500">Checking chart alerts…</p>}
    {!loading && data?.count === 0 && <p role="status" className="mt-3 text-sm text-brown-600">No active chart alerts.</p>}
    <div className="mt-3 space-y-3">{data?.results.map(row => <article key={row.id} className="rounded-xl border border-amber-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="font-semibold">{row.listing} <span className="text-sm font-normal text-brown-500">({row.listing_code})</span></h3><p className="mt-1 text-sm text-brown-500">Chart date {staffDate(row.business_date, false)}{row.chart_code && ` · ${row.chart_code}`}</p></div>
        {row.chart_uuid && onInspect ? <button type="button" className="btn-g !py-2 text-xs" onClick={() => onInspect({ uuid: row.chart_uuid })}>View chart</button> : !row.chart_uuid && onPrepare ? <button type="button" className="btn-g !py-2 text-xs" onClick={() => onPrepare(row)}>Prepare chart</button> : <Link className="btn-g !py-2 text-xs" href={row.chart_uuid ? `/staff/charts?search=${encodeURIComponent(row.chart_code)}` : `/staff/charts?business_date=${row.business_date}`}>{row.chart_uuid ? 'Find chart' : 'Open daily charts'}</Link>}
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-800">{row.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
    </article>)}</div>
    {data?.count > 12 && <StaffPager payload={data} page={page} loading={loading} onChange={setPage}/>}
  </section>
}
