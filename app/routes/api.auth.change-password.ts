import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node"
import { compare } from "bcrypt"
import { ValidationError } from "yup"
import { handleAuth } from "~/middlewares/auth"
import { ChangePasswordType, changePasswordSchema, createApiError, createApiInternalError, createApiValidationError, credentialsSchema } from "~/models"
import { getCredentials, updateCredentials } from "~/services/auth"

export async function action({request}: ActionFunctionArgs) {
    try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const body = await request.json() as ChangePasswordType
    const storedCredentials = getCredentials()
    if (!storedCredentials) {
      return json(createApiError(400, 'No credentials yet!'), 400)
    }
    const credentials = changePasswordSchema.validateSync(body)

    if (!await compare(body.currentPassword, storedCredentials.password)) {
      return json(createApiError(401, 'Invalid password'), 401)
    }
    
    storedCredentials.password = credentials.newPassword
    updateCredentials(storedCredentials, true)
    return new Response(null, {status: 204})
  }
  catch (e) {
    if (e instanceof ValidationError) {
      return json(createApiValidationError(e))
    }
    return json(createApiInternalError(e as Error))
  }
}