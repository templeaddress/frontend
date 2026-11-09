import { androidDownloadResponse } from '@/lib/app-downloads'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET(request) {
  return androidDownloadResponse(request)
}
