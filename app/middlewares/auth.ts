import { json } from "@remix-run/node";
import jwt from 'jsonwebtoken'
import { privateKey } from "~/constants";
import { createApiError } from "~/models";
import { oidcEnabled, oidcSession } from '~/services/oidc.server';

export async function getIdentity(request: Request) {
  const header = request.headers.get('X-Authorization')
  const token = header || await oidcSession.parse(request.headers.get('Cookie'))
  if (!token || typeof token !== 'string') return undefined
  try {
    const identity = jwt.verify(token, privateKey, { algorithms: ['HS256'] })
    if (typeof identity === 'string') return undefined
    if (identity.provider === 'oidc' && !oidcEnabled) return undefined
    if (!header && identity.provider !== 'oidc') return undefined
    return identity
  }
  catch {
    return undefined
  }
}

export async function handleAuth(request: Request) {
  const identity = await getIdentity(request)
  if (!identity) return json(createApiError(401, 'Unauthorized'), 401)
  // Cookie-authenticated writes must originate from our own public URL.
  if (!request.headers.get('X-Authorization') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('Origin')
    if (!origin || origin !== new URL(process.env.SWYD_OIDC_REDIRECT_URI!).origin) {
      return json(createApiError(403, 'Invalid request origin'), 403)
    }
  }
}
