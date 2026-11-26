import { createCookie } from '@remix-run/node'
import { generators, Issuer, type Client } from 'openid-client'
import jwt from 'jsonwebtoken'
import { privateKey } from '~/constants'

const issuer = process.env.SWYD_OIDC_ISSUER
const clientId = process.env.SWYD_OIDC_CLIENT_ID
const clientSecret = process.env.SWYD_OIDC_CLIENT_SECRET
const redirectUri = process.env.SWYD_OIDC_REDIRECT_URI
const configured = [issuer, clientId, clientSecret, redirectUri]
if (configured.some(Boolean) && !configured.every(Boolean)) {
  throw new Error('All SWYD_OIDC_* settings must be provided together')
}
export const oidcEnabled = configured.every(Boolean)

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: redirectUri?.startsWith('https://') ?? false,
  path: '/',
  secrets: [privateKey],
}
export const oidcTransaction = createCookie('swyd_oidc_transaction', { ...cookieOptions, maxAge: 600 })
export const oidcSession = createCookie('swyd_oidc_session', { ...cookieOptions, maxAge: 7200 })

let clientPromise: Promise<Client> | undefined
function getClient(): Promise<Client> {
  if (!oidcEnabled) throw new Error('OIDC is not configured')
  if (!clientPromise) {
    clientPromise = Issuer.discover(issuer!).then(discovered => {
      if (discovered.issuer !== issuer) throw new Error('OIDC issuer mismatch')
      return new discovered.Client({ client_id: clientId!, client_secret: clientSecret!, redirect_uris: [redirectUri!], response_types: ['code'] })
    }).catch(error => { clientPromise = undefined; throw error })
  }
  return clientPromise
}

export async function beginOidc() {
  const client = await getClient()
  const state = generators.state()
  const nonce = generators.nonce()
  const verifier = generators.codeVerifier()
  return {
    url: client.authorizationUrl({ scope: 'openid profile email', state, nonce, code_challenge: generators.codeChallenge(verifier), code_challenge_method: 'S256' }),
    cookie: await oidcTransaction.serialize({ state, nonce, verifier }),
  }
}

export async function finishOidc(request: Request) {
  const transaction = await oidcTransaction.parse(request.headers.get('Cookie'))
  if (!transaction?.state || !transaction?.nonce || !transaction?.verifier) throw new Error('Missing OIDC transaction')
  const client = await getClient()
  const tokens = await client.callback(redirectUri!, client.callbackParams(request.url), {
    state: transaction.state,
    nonce: transaction.nonce,
    code_verifier: transaction.verifier,
  })
  const claims = tokens.claims()
  const username = claims.preferred_username || claims.name || claims.sub
  if (typeof username !== 'string' || typeof claims.sub !== 'string') throw new Error('Invalid OIDC identity')
  const token = jwt.sign({ id: claims.sub, username, provider: 'oidc' }, privateKey, { expiresIn: '2h' })
  return oidcSession.serialize(token)
}
