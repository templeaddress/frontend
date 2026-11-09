'use client'

import { useCallback, useEffect, useState } from 'react'
import { clientApi } from '@/lib/client-api'

export function useStaffQuery(path) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [version, setVersion] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setError(''); setData(null)
    clientApi(path).then(value => { if (active) setData(value) }).catch(err => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [path, version])
  const reload = useCallback(() => setVersion(value => value + 1), [])
  return { data, loading, error, reload }
}

export async function staffDownload(path, filename) {
  const blob = await clientApi(path, { responseType: 'blob' })
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
