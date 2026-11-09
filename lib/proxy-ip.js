import { isIP } from 'node:net'

// Next.js 15 has no request.ip; trust only a header the deployment's ingress overwrites (TRUSTED_CLIENT_IP_HEADER).
export function forwardedClientChain(request, trustedHeader) {
  const client = trustedHeader && request.headers.get(trustedHeader)
  if (!client || !isIP(client.trim())) return ''
  const incoming = (request.headers.get('x-forwarded-for') || '').split(',').map(value => value.trim()).filter(value => isIP(value))
  return [...incoming, client.trim()].join(', ')
}
