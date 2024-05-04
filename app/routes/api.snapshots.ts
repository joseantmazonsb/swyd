import { LoaderFunctionArgs, json } from "@remix-run/node"
import { handleAuth } from "~/middlewares/auth"
import { getSnapshots } from "~/services/snapshots"

export async function loader({request}: LoaderFunctionArgs) {
  // Remix does not support middlewares yet
  const unauthorized = await handleAuth(request)
  if (unauthorized) return unauthorized
  
  const snapshots = getSnapshots()
  return json({data: snapshots})
}