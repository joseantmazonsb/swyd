import { LoaderFunctionArgs, json } from "@remix-run/node";
import { paths } from "~/constants";
import { handleAuth } from "~/middlewares/auth";
import { packageInfo } from "~/package";
import fs from 'fs'
import { getUpdates, setUpdates } from "~/services/updates";
import { createApiError } from "~/models";
import { add } from "date-fns";

export async function loader({request}: LoaderFunctionArgs) {
  // Remix does not support middlewares yet
  const unauthorized = await handleAuth(request)
  if (unauthorized) return unauthorized

  try {
    console.log('Checking updates...')
    const update = getUpdates()

    const updateValues = async () => {
      console.log('Updating cache...')
      const res = await fetch(`https://api.github.com/repos/${packageInfo.repository.directory}/releases/latest`);
      if (!res.ok) {
        const msg = `Failed to get updates: ${res.status}`
        console.error(msg)
        const update = { version: '0.0.0', lastCheck: new Date(Date.now()) }
        setUpdates(update)
        console.log(`Cache updated with value ${JSON.stringify(update)}`)
        return json(createApiError(500, msg), 500)
      }
      const data = await res.json() as {tag_name: string}
      const latestVersion = data.tag_name.replace('v', '')
      const update = { version: latestVersion, lastCheck: new Date(Date.now()) }
      setUpdates(update)
      console.log(`Cache updated with value ${JSON.stringify(update)}`)
      if (update.version > packageInfo.version) {
        console.log(`Update to version ${update.version} available`)
        return json({data: update})
      }
      console.log('No updates found')
      return json({data: false})
    }

    if (update) {
      if (update.version > packageInfo.version) {
        console.log(`Update to version ${update.version} available`)
        return json({data: update})
      }
      const isCachedDataExpired = add(update.lastCheck, {hours: 2}) < new Date(Date.now())
      if (isCachedDataExpired) {
        console.log('Updates cache expired')
        return await updateValues()
      }
      console.log('No updates found')
      return json({data: false})
    }
    return await updateValues()
    
  } catch (error) {
    return json(createApiError(500, `Failed to check updates: ${error}`), 500)
  }
}