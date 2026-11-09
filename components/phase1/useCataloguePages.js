'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { mergeCatalogueRows } from '@/lib/listing-directory'

// Callers key their results by query so filter changes abort the old collection.
export function useCataloguePages(query, initialPage, initialPageNumber = 1) {
  const [collection, setCollection] = useState(initialPage || { results: [], count: 0, next: null })
  const [loading, setLoading] = useState(!initialPage)
  const [error, setError] = useState('')
  const currentPage = useRef(initialPage ? initialPageNumber : initialPageNumber - 1)
  const pending = useRef(false)
  const controller = useRef(null)

  const loadMore = useCallback(async () => {
    if (pending.current) return
    pending.current = true
    const request = new AbortController()
    controller.current = request
    setLoading(true); setError('')
    try {
      const data = await apiFetch(`${query}&page=${currentPage.current + 1}`, { signal: request.signal, cache: 'no-store', next: { revalidate: 0 } })
      if (request.signal.aborted) return
      currentPage.current += 1
      setCollection(previous => ({ ...data, results: mergeCatalogueRows(previous.results, data.results) }))
    } catch (err) {
      if (!request.signal.aborted) setError(err.message)
    } finally {
      if (!request.signal.aborted) { pending.current = false; setLoading(false) }
    }
  }, [query])

  useEffect(() => {
    if (!initialPage) loadMore()
    return () => { controller.current?.abort(); pending.current = false }
  }, [initialPage, loadMore])

  return { ...collection, loading, error, loadMore, nextPage: currentPage.current + 1 }
}

export function CatalogueLoadMore({ pagination, href }) {
  const sentinel = useRef(null)
  const { results, count, next, loading, error, loadMore } = pagination
  useEffect(() => {
    if (!next || loading || error || !sentinel.current || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadMore()
    }, { rootMargin: '300px' })
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [next, loading, error, loadMore])

  return <div ref={sentinel} className="mt-6 space-y-3 text-center">
    <p role="status" className="text-sm text-brown-500">{loading ? 'Loading…' : `Showing ${results.length} of ${count}`}</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {(next || error) && <a className="btn-g" href={href} aria-disabled={loading} onClick={event => { event.preventDefault(); if (!loading) loadMore() }}>{error ? 'Retry loading' : loading ? 'Loading…' : 'Load more'}</a>}
  </div>
}
