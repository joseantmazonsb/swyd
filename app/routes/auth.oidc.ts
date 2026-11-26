import { redirect } from '@remix-run/node'
import { beginOidc, oidcEnabled } from '~/services/oidc.server'

export async function loader() {
  if (!oidcEnabled) throw new Response('OIDC is not configured', { status: 404 })
  try {
    const { url, cookie } = await beginOidc()
    return redirect(url, { headers: { 'Set-Cookie': cookie, 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('OIDC login could not be started', error)
    throw new Response('OIDC login is unavailable', { status: 503 })
  }
}
