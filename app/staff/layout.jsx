import { StaffArea } from '@/components/phase1/StaffShell'

export const metadata = {
  title: { default: 'Staff Dashboard', template: '%s | Staff Dashboard' },
  robots: { index: false, follow: false, nocache: true },
}

export default function Layout({ children }) { return <StaffArea>{children}</StaffArea> }
