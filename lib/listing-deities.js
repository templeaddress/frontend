export function listingDeities(mainDeity, secondary, masters) {
  const name = mainDeity.trim().replace(/\s+/g, ' ')
  const primary = masters.find(row => [row.name_en, row.name_ml].some(label => label?.trim().toLowerCase() === name.toLowerCase()))
  const rows = secondary.filter(row => primary ? row.code !== primary.code : row.custom_name?.trim().toLowerCase() !== name.toLowerCase())
  return [
    ...(name ? [{ ...(primary ? { code: primary.code } : { custom_name: name }), is_primary: true }] : []),
    ...rows.map(row => ({ ...row, is_primary: false })),
  ].map((row, sort_order) => ({ ...row, sort_order }))
}
