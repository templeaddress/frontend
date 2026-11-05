// Structured data shared by server-rendered public pages.
export const SITE_URL = 'https://templeaddress.com'

export const organizationSchema = {
  '@context': 'https://schema.org', '@type': 'Organization', name: 'TempleAddress', url: SITE_URL,
}

export const websiteSchema = {
  '@context': 'https://schema.org', '@type': 'WebSite', name: 'TempleAddress', url: SITE_URL,
  potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/temples?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
}

export function breadcrumbSchema(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: `${SITE_URL}${path}` })) }
}

// Escapes "<" so catalogue text can never close the script tag.
export const jsonLdHtml = schema => ({ __html: JSON.stringify(schema).replace(/</g, '\\u003c') })

export function JsonLd({ schema }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(schema)}/>
}

export function listingSharing(row, title, description) {
  const images = row.cover ? [{ url: row.cover, alt: row.name_en }] : undefined
  return { openGraph: { title, description, type: 'website', ...(images ? { images } : {}) }, twitter: { card: images ? 'summary_large_image' : 'summary', title, description, ...(images ? { images: [row.cover] } : {}) } }
}

// Keeps a public page's words in the server HTML while a client-only form (useSearchParams) loads.
export function PageIntro({ title, text }) {
  return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-4xl font-semibold">{title}</h1><p className="mt-3 text-brown-600">{text}</p></main>
}
