import { test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { generateKeyPairSync } from 'node:crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

test('OIDC authorization, protected operations and logout', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'swyd-test-'))
  await writeFile(join(dir, 'devices.json'), '[]')
  await writeFile(join(dir, 'credentials.json'), JSON.stringify({ username: 'admin', password: bcrypt.hashSync('local-password', 4), id: 'local-user' }))
  let issuer, nonce, tamperNonce = false
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const provider = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json')
    if (req.url === '/.well-known/openid-configuration') {
      res.end(JSON.stringify({ issuer, authorization_endpoint: `${issuer}/authorize`, token_endpoint: `${issuer}/token`, jwks_uri: `${issuer}/jwks`, response_types_supported: ['code'], subject_types_supported: ['public'], id_token_signing_alg_values_supported: ['RS256'] }))
    } else if (req.url === '/jwks') {
      res.end(JSON.stringify({ keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'test', use: 'sig', alg: 'RS256' }] }))
    } else if (req.url === '/token') {
      const now = Math.floor(Date.now() / 1000)
      const idToken = jwt.sign({ iss: issuer, sub: 'user-1', aud: 'client', iat: now, exp: now + 300, nonce: tamperNonce ? 'wrong' : nonce, preferred_username: 'test-user' }, privateKey, { algorithm: 'RS256', keyid: 'test' })
      res.end(JSON.stringify({ access_token: 'access', token_type: 'Bearer', id_token: idToken }))
    } else { res.statusCode = 404; res.end('{}') }
  })
  provider.listen(0, '127.0.0.1')
  await once(provider, 'listening')
  t.after(() => provider.close())
  issuer = `http://127.0.0.1:${provider.address().port}`
  const reservation = http.createServer()
  reservation.listen(0, '127.0.0.1')
  await once(reservation, 'listening')
  const port = reservation.address().port
  await new Promise(resolve => reservation.close(resolve))
  const base = `http://127.0.0.1:${port}`
  const app = spawn('node', ['node_modules/@remix-run/serve/dist/cli.js', 'build/server/index.js'], { env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), SWYD_ROOT: dir, SWYD_SNAPSHOTS: dir, SWYD_PRIVATE_KEY: 'test-secret', SWYD_OIDC_ISSUER: issuer, SWYD_OIDC_CLIENT_ID: 'client', SWYD_OIDC_CLIENT_SECRET: 'client-secret', SWYD_OIDC_REDIRECT_URI: `${base}/auth/oidc/callback` }, stdio: 'inherit' })
  t.after(() => app.kill())
  let ready = false
  for (let i = 0; i < 80; i++) {
    try { await fetch(`${base}/api/setup`); ready = true; break } catch { await new Promise(resolve => setTimeout(resolve, 100)) }
  }
  assert.ok(ready, 'server started')
  assert.equal((await fetch(`${base}/api/devices`)).status, 401)
  assert.equal((await fetch(`${base}/wake/missing`, { method: 'POST' })).status, 401)
  assert.equal((await fetch(`${base}/poweroff/missing`, { method: 'POST' })).status, 401)
  assert.equal((await fetch(`${base}/settings/update`, { method: 'POST' })).status, 401)
  assert.equal((await fetch(`${base}/api/auth/signup`, { method: 'POST' })).status, 403)
  const localLogin = await fetch(`${base}/api/auth/signin`, { method: 'POST', body: JSON.stringify({ username: 'admin', password: 'local-password' }) })
  assert.equal(localLogin.status, 200)
  const localToken = (await localLogin.json()).data
  assert.equal((await fetch(`${base}/api/devices`, { headers: { 'X-Authorization': localToken } })).status, 200)
  const login = await fetch(`${base}/auth/oidc`, { redirect: 'manual' })
  assert.equal(login.status, 302)
  const auth = new URL(login.headers.get('location'))
  assert.equal(auth.searchParams.get('code_challenge_method'), 'S256')
  nonce = auth.searchParams.get('nonce')
  const transaction = login.headers.get('set-cookie').split(';')[0]
  const bad = await fetch(`${base}/auth/oidc/callback?code=ok&state=wrong`, { headers: { cookie: transaction }, redirect: 'manual' })
  assert.equal(bad.headers.get('location'), '/signin?oidc_error=1')
  tamperNonce = true
  const badNonce = await fetch(`${base}/auth/oidc/callback?code=ok&state=${auth.searchParams.get('state')}`, { headers: { cookie: transaction }, redirect: 'manual' })
  assert.equal(badNonce.headers.get('location'), '/signin?oidc_error=1')
  tamperNonce = false
  const callback = await fetch(`${base}/auth/oidc/callback?code=ok&state=${auth.searchParams.get('state')}`, { headers: { cookie: transaction }, redirect: 'manual' })
  assert.equal(callback.headers.get('location'), '/')
  const sessionCookie = callback.headers.getSetCookie().find(c => c.startsWith('swyd_oidc_session=')).split(';')[0]
  const headers = { cookie: sessionCookie }
  assert.equal((await fetch(`${base}/api/devices`, { headers })).status, 200)
  assert.equal((await (await fetch(`${base}/api/auth/session`, { headers })).json()).data.username, 'test-user')
  assert.equal((await fetch(`${base}/wake/missing`, { method: 'POST', headers: { ...headers, origin: 'https://attacker.example' } })).status, 403)
  assert.equal((await fetch(`${base}/wake/missing`, { method: 'POST', headers: { ...headers, origin: base } })).status, 404)
  assert.equal((await fetch(`${base}/api/auth/account`, { method: 'POST', headers: { ...headers, origin: base } })).status, 403)
  const logout = await fetch(`${base}/api/auth/logout`, { method: 'POST', headers })
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/)
})

test('local-only deployments can still register and sign in', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'swyd-local-test-'))
  const reservation = http.createServer()
  reservation.listen(0, '127.0.0.1')
  await once(reservation, 'listening')
  const port = reservation.address().port
  await new Promise(resolve => reservation.close(resolve))
  const base = `http://127.0.0.1:${port}`
  const env = { ...process.env, HOST: '127.0.0.1', PORT: String(port), SWYD_ROOT: dir, SWYD_SNAPSHOTS: dir, SWYD_PRIVATE_KEY: 'test-secret' }
  for (const key of ['SWYD_OIDC_ISSUER', 'SWYD_OIDC_CLIENT_ID', 'SWYD_OIDC_CLIENT_SECRET', 'SWYD_OIDC_REDIRECT_URI']) delete env[key]
  const app = spawn('node', ['node_modules/@remix-run/serve/dist/cli.js', 'build/server/index.js'], { env, stdio: 'ignore' })
  t.after(() => app.kill())
  let ready = false
  for (let i = 0; i < 80; i++) {
    try { await fetch(`${base}/api/setup`); ready = true; break } catch { await new Promise(resolve => setTimeout(resolve, 100)) }
  }
  assert.ok(ready, 'server started')
  assert.deepEqual(await (await fetch(`${base}/api/setup`)).json(), { data: false, oidc: false, local: false })
  assert.equal((await fetch(`${base}/auth/oidc`)).status, 404)
  const signup = await fetch(`${base}/api/auth/signup`, { method: 'POST', body: JSON.stringify({ username: 'admin', password: 'local-password' }) })
  assert.equal(signup.status, 200)
  const token = (await signup.json()).data
  assert.equal((await fetch(`${base}/api/devices`, { headers: { 'X-Authorization': token } })).status, 200)
  assert.equal((await fetch(`${base}/api/auth/signup`, { method: 'POST', body: '{}' })).status, 409)
})
