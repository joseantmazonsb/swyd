import { json } from '@remix-run/node'
import { oidcSession } from '~/services/oidc.server'

export async function action() {
  return json({ data: true }, { headers: { 'Set-Cookie': await oidcSession.serialize('', { maxAge: 0 }), 'Cache-Control': 'no-store' } })
}
