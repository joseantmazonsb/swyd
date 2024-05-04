import { LoaderFunctionArgs, json } from "@remix-run/node";
import { ValidationError } from "yup";
import { Credentials, createApiError, createApiInternalError, createApiValidationError, credentialsSchema } from "~/models";
import { getCredentials, signIn, updateCredentials } from "~/services/auth";

export async function action({request}: LoaderFunctionArgs) {
  try {
    const storedCredentials = getCredentials()
    if (storedCredentials) {
      return json(createApiError(409, 'Already registered!'), 409)
    }
    const body = await request.json() as Credentials
    const credentials = credentialsSchema.validateSync(body)
    const updated = updateCredentials(credentials, true)
    const token = signIn(updated)
    return json({data: token})
  }
  catch (e) {
    const err = e as Error
    if (err instanceof ValidationError) {
      return json(createApiValidationError(err))
    }
    return json(createApiInternalError(err))
  }
}