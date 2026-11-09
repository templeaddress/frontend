import test from 'node:test'
import assert from 'node:assert/strict'
import { DIRECTORY_PAGE_SIZE, directoryApiQuery, directoryFilters, directoryHref, directoryPageNumber, EMPTY_FILTERS, loadListingDirectory, mergeCatalogueRows } from './listing-directory.js'

test('directory requests preserve selected filters and paginate server-side', () => {
  const filters = directoryFilters({ q: 'Cherpu', district: 'North District', deity: 'Shiva', category: 'Temple', bookable: 'true', sort: 'name_desc' })
  const params = new URLSearchParams(directoryApiQuery('temple', filters).split('?')[1])
  assert.equal(params.get('page_size'), String(DIRECTORY_PAGE_SIZE))
  assert.equal(params.get('q'), 'Cherpu')
  assert.equal(params.get('search_scope'), 'directory')
  assert.equal(params.get('district_exact'), 'North District')
  assert.equal(params.get('main_deity_exact'), 'Shiva')
  assert.equal(params.get('category_exact'), 'Temple')
  assert.equal(params.get('bookable'), 'true')
  assert.equal(params.get('ordering'), '-name_en')
  assert.equal(directoryApiQuery('temple', EMPTY_FILTERS).includes('ordering'), false)
})

test('directory URLs round-trip filters, legacy search links and accessible page links', () => {
  const filters = directoryFilters(new URLSearchParams('search=cherpu&search_scope=listing_only&district=North&sort=name_asc'))
  for (const [type, path] of [['temple', '/temples'], ['festival', '/festival'], ['service', '/services']]) {
    const href = directoryHref(type, filters, 3)
    assert.equal(href.split('?')[0], path)
    const params = new URLSearchParams(href.split('?')[1])
    assert.deepEqual(directoryFilters(params), filters)
    assert.equal(directoryPageNumber(params), 3)
  }
  for (const page of ['0', '-1', 'invalid', '1.5', 'Infinity']) assert.equal(directoryPageNumber({ page }), 1)
  assert.equal(directoryPageNumber({ page: ['4', '5'] }), 4)
})

test('initial directory rendering fetches only one bounded page plus full-catalogue facets', async () => {
  const calls = []
  const page = { results: [{ uuid: 'first' }], count: 1500, next: 'page-2' }
  const facets = { districts: ['Beyond the first page'], categories: [], deities: [] }
  const result = await loadListingDirectory('festival', { page: '2', q: 'utsavam' }, async path => {
    calls.push(path)
    return path.startsWith('listings/facets') ? facets : page
  })
  assert.equal(calls.length, 2)
  assert.equal(calls[0], 'listings?type=festival&page_size=24&q=utsavam&search_scope=directory&page=2')
  assert.equal(result.initialPage, page)
  assert.equal(result.facets, facets)
  assert.equal(result.initialPageNumber, 2)
})

test('successive pages retain ordering and do not duplicate overlapping records', () => {
  const first = [{ uuid: 'a', name: 'A' }, { uuid: 'b', name: 'Old B' }]
  const merged = mergeCatalogueRows(first, [{ uuid: 'b', name: 'B' }, { uuid: 'c', name: 'C' }])
  assert.deepEqual(merged.map(row => row.uuid), ['a', 'b', 'c'])
  assert.equal(merged[1].name, 'B')
  assert.equal(first[1].name, 'Old B')
})
