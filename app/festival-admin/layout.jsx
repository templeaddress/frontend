import { VendorArea } from '@/components/phase1/Vendor'

export const metadata = {
  title: { default: 'Festival dashboard', template: '%s | Festival dashboard' },
  robots: { index: false, follow: false, nocache: true },
}

export default function Layout({ children }) { return <VendorArea>{children}</VendorArea> }
