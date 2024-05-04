import { paths, privateKey } from "~/constants"
import { Credentials, ServerCredentials } from "~/models"
import fs from 'fs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export function getCredentials()  {
  try {
    const data = fs.readFileSync(paths.credentials)
    const credentials = JSON.parse(data.toString()) as ServerCredentials
    return credentials
  }
  catch (err) {
    console.log(err)
    return undefined
  }
}

export function updateCredentials(credentials: Credentials, encrypt: boolean) {
  const storedCredentials = getCredentials()
  const providedCredentials = credentials as ServerCredentials
  providedCredentials.id = storedCredentials?.id ?? crypto.randomUUID()
  if (encrypt) {
    const encryptedPassword = bcrypt.hashSync(providedCredentials.password, bcrypt.genSaltSync())
    providedCredentials.password = encryptedPassword
  }
  fs.writeFileSync(paths.credentials, JSON.stringify(providedCredentials, null, 2))
  return providedCredentials
}

export function signIn(credentials: ServerCredentials) {
  const token = jwt.sign({
    id: credentials.id,
    nonce: crypto.randomUUID(),
  }, privateKey, {
    expiresIn: credentials.rememberMe ? '7 days' : '2 hours'
  })
  return token
}