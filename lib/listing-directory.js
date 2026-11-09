import { apiFetch } from './api.js'

export const DIRECTORY_PAGE_SIZE = 24
export const EMPTY_FILTERS = { query: '', district: '', deity: '', category: '', bookable: false, sort: 'relevance', searchScope: '' }

const value = (params, key) => {
  const raw = params instanceof URLSearchParams ? params.get(key) : params?.[key]
  return String((Array.isArray(raw) ? raw[0] : raw) || '').trim()
}

export function directoryFilters(params) {
  const sort = value(params, 'sort')
  return {
    query: (value(params, 'q') || value(params, 'search')).slice(0, 200),
    district: value(params, 'district'), deity: value(params, 'deity'), category: value(params, 'category'),
    bookable: value(params, 'bookable') === 'true',
    sort: ['name_asc', 'name_desc'].includes(sort) ? sort : 'relevance',
    searchScope: value(params, 'search_scope') === 'listing_only' ? 'listing_only' : '',
  }
}

export function directoryPageNumber(params) {
  const page = Number(value(params, 'page'))
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export function directoryApiQuery(type, filters = EMPTY_FILTERS) {
  const params = new URLSearchParams({ type, page_size: String(DIRECTORY_PAGE_SIZE) })
  if (filters.query) params.set('q', filters.query)
  if (filters.query) params.set('search_scope', filters.searchScope || 'directory')
  for (const [key, parameter] of [['district', 'district_exact'], ['deity', 'main_deity_exact'], ['category', 'category_exact']]) {
    if (filters[key]) params.set(parameter, filters[key])
  }
  if (filters.bookable) params.set('bookable', 'true')
  if (filters.sort !== 'relevance') params.set('ordering', filters.sort === 'name_desc' ? '-name_en' : 'name_en')
  return `listings?${params}`
}

export function directoryHref(type, filters = EMPTY_FILTERS, page = 1) {
  const path = type === 'festival' ? '/festival' : type === 'service' ? '/services' : '/temples'
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.searchScope) params.set('search_scope', filters.searchScope)
  for (const key of ['district', 'deity', 'category']) if (filters[key]) params.set(key, filters[key])
  if (filters.bookable) params.set('bookable', 'true')
  if (filters.sort !== 'relevance') params.set('sort', filters.sort)
  if (page > 1) params.set('page', String(page))
  return `${path}${params.size ? `?${params}` : ''}`
}

export async function loadListingDirectory(type, searchParams, fetcher = apiFetch) {
  const initialFilters = directoryFilters(searchParams)
  const initialPageNumber = directoryPageNumber(searchParams)
  const [initialPage, facets] = await Promise.all([
    fetcher(`${directoryApiQuery(type, initialFilters)}&page=${initialPageNumber}`),
    fetcher(`listings/facets?type=${type}`),
  ])
  return { type, initialFilters, initialPageNumber, initialPage, facets }
}

export function mergeCatalogueRows(previous, incoming) {
  const rows = new Map(previous.map(row => [row.uuid, row]))
  for (const row of incoming) rows.set(row.uuid, row)
  return [...rows.values()]
}
