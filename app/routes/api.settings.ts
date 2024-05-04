import { LoaderFunctionArgs, json } from "@remix-run/node";
import { handleAuth } from "~/middlewares/auth";
import { getSettings } from "~/services/settings";

export async function loader({request}: LoaderFunctionArgs) {
  // Remix does not support middlewares yet
  const unauthorized = await handleAuth(request)
  if (unauthorized) return unauthorized

  const settings = getSettings()
  console.log(settings)
  return json({data: settings})
}