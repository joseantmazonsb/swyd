import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { finishOidc, oidcEnabled, oidcTransaction } from '~/services/oidc.server'

export async function loader({ request }: LoaderFunctionArgs) {
  if (!oidcEnabled) throw new Response('OIDC is not configured', { status: 404 })
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  headers.append('Set-Cookie', await oidcTransaction.serialize('', { maxAge: 0 }))
  try {
    headers.append('Set-Cookie', await finishOidc(request))
    return redirect('/', { headers })
  } catch (error) {
    console.error('OIDC callback failed', error instanceof Error ? error.message : 'unknown error')
    return redirect('/signin?oidc_error=1', { headers })
  }
}
