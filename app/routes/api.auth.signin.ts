import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Credentials, ServerCredentials, createApiError, credentialsSchema } from "~/models";
import bcrypt from 'bcrypt'
import { getCredentials, signIn } from "~/services/auth";

export class UnauthenticatedException extends Error {
  constructor() {
    super('Invalid credentials')
  }
}

export async function action({request}: LoaderFunctionArgs) {
  try {
    const body = await request.json() as Credentials
    const providedCredentials = credentialsSchema.validateSync(body) as ServerCredentials
    const storedCredentials = getCredentials()
    if (!storedCredentials) {
      return json(createApiError(400, 'No users registered!'), 400)
    }
    console.log(providedCredentials)
    console.log(storedCredentials)
    if (providedCredentials.username !== storedCredentials.username) {
      throw new UnauthenticatedException()
    }
    if (!await bcrypt.compare(providedCredentials.password, storedCredentials.password)) {
      console.log('wtf')
      throw new UnauthenticatedException()
    }
    providedCredentials.id = storedCredentials.id
    const token = signIn(providedCredentials)
    console.log(`Signed user ${providedCredentials.username} in`)
    return json({data: token})
  }
  catch (e) {
    console.log((e as Error).message)
    return json(createApiError(401, 'Invalid credentials'), 401)
  }
}