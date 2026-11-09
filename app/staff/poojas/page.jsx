import StaffShell from '@/components/phase1/StaffShell'
import StaffPoojas from '@/components/phase1/StaffPoojas'
import { StaffPageHeading } from '@/components/phase1/StaffUI'
export default function Page() { return <StaffShell><StaffPageHeading title="Pooja catalogue" description="Manage published temple and festival offerings, prices and booking availability."/><div className="rounded-2xl border border-brown-100 bg-white p-5"><StaffPoojas/></div></StaffShell> }
