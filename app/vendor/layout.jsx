import { VendorArea } from '@/components/phase1/Vendor'

export const metadata = {
  title: { default: 'Temple dashboard', template: '%s | Temple dashboard' },
  robots: { index: false, follow: false, nocache: true },
}

export default function Layout({ children }) { return <VendorArea>{children}</VendorArea> }
