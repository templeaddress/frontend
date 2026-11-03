import { downloadResponse } from '@/lib/app-downloads'

export const dynamic = 'force-dynamic'

export function GET() {
  return downloadResponse('ios')
}
