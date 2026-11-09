import { ImageResponse } from 'next/og'

export const alt = 'TempleAddress — a sacred address for every temple'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, color: '#fff', background: 'linear-gradient(135deg, #2e2019 0%, #6b4a32 55%, #c9541e 100%)' }}>
      <div style={{ fontSize: 34, color: '#f2d9a0', letterSpacing: 2 }}>TEMPLEADDRESS</div>
      <div style={{ marginTop: 28, maxWidth: 920, fontSize: 76, lineHeight: 1.08, fontWeight: 700 }}>A sacred address for every temple.</div>
      <div style={{ marginTop: 32, fontSize: 30, color: '#f8f3ec' }}>Verified temples · Vazhipadu booking · Festivals · Donations</div>
    </div>,
    size,
  )
}
