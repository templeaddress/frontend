'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clientApi } from '@/lib/client-api'
import { StaffNotice } from './StaffUI'

export function useVendorQuery(path, allowMissing = false) {
  const [state, setState] = useState({ path: null, data: null, loading: true, error: '' }), [version, setVersion] = useState(0)
  useEffect(() => {
    if (!path) return
    let active = true
    setState({ path, data: null, loading: true, error: '' })
    clientApi(path).then(value => { if (active) setState({ path, data: value?.success === true && value.data === null ? null : value, loading: false, error: '' }) }).catch(error => { if (active) setState({ path, data: null, loading: false, error: allowMissing && error.status === 404 ? '' : error.message }) })
    return () => { active = false }
  }, [path, version, allowMissing])
  return { ...(path && state.path === path ? state : { data: null, loading: Boolean(path), error: '' }), reload: useCallback(() => setVersion(value => value + 1), []) }
}

export function useVendorAction() {
  const lock = useRef(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  async function run(work, message = '', done) {
    if (lock.current) return
    lock.current = true; setBusy(true); setError(''); setNotice('')
    try { const result = await work(); setNotice(message); done?.(result); return result } catch (failure) { setError(failure.message) } finally { lock.current = false; setBusy(false) }
  }
  return { busy, error, notice, run }
}

export const VendorCard = ({ children, className = '' }) => <section className={`min-w-0 rounded-2xl border border-brown-100 bg-white p-5 ${className}`}>{children}</section>
export const VendorHeading = ({ title, text, action }) => <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h1 className="font-display break-words text-3xl font-semibold">{title}</h1>{text && <p className="mt-1 text-sm text-brown-500">{text}</p>}</div>{action && <div className="flex flex-wrap gap-2">{action}</div>}</div>
export const VendorTable = ({ head, children }) => <div className="min-w-0 overflow-x-auto rounded-2xl border border-brown-100 bg-white"><table className="w-full text-sm"><thead><tr>{head.map(label => <th key={label} className="th">{label}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
export function VendorLoad({ state }) { return <><StaffNotice error={state.error}/>{state.error && <button className="btn-g mb-3" onClick={state.reload}>Try again</button>}{state.loading && <p className="mb-3 text-sm text-brown-500" role="status">Loading records…</p>}</> }
export function VendorManageOnly({ manage, children }) { return manage ? children : <VendorCard><p className="text-sm">Owner or admin membership is required for these controls.</p></VendorCard> }
