import { LoaderFunctionArgs, json } from "@remix-run/node"
import { handleAuth } from "~/middlewares/auth"
import { createApiInternalError } from "~/models"
import { getDevices } from "~/services/devices"

export async function loader({request}: LoaderFunctionArgs) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const devices = getDevices()
    console.log('got devices')
    return json({data: devices})
  }
  catch (e) {
    return json(createApiInternalError(e as Error))
  }
}