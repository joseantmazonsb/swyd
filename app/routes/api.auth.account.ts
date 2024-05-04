import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node"
import { handleAuth } from "~/middlewares/auth"
import { createApiError, createApiInternalError } from "~/models"
import { getCredentials, updateCredentials } from "~/services/auth"

export async function loader({request}: LoaderFunctionArgs) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const credentials = getCredentials()
    return json({data: {
      username: credentials?.username
    }})
  }
  catch (e) {
    return json(createApiInternalError(e as Error))
  }
}

export async function action({request}: ActionFunctionArgs) {
    try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const account = await request.json() as {username: string}
    const credentials = getCredentials()
    if (!credentials) {
      return json(createApiError(400, 'No credentials yet!'), 400)
    }
    credentials.username = account.username
    updateCredentials(credentials, false)
    return new Response(null, {status: 204})
  }
  catch (e) {
    return json(createApiInternalError(e as Error))
  }
}