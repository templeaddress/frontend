export default function manifest() {
  return {
    name: 'TempleAddress',
    short_name: 'TempleAddress',
    description: 'Discover verified temples, book vazhipadu and follow festivals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf5ea',
    theme_color: '#2e2019',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
