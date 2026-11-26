import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { getIdentity } from '~/middlewares/auth'

export async function loader({ request }: LoaderFunctionArgs) {
  const identity = await getIdentity(request)
  return json({ data: identity ? { provider: identity.provider || 'local', username: identity.username } : null }, { headers: { 'Cache-Control': 'no-store' } })
}
