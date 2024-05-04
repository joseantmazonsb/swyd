import { ActionFunctionArgs, json } from "@remix-run/node";
import { handleAuth } from "~/middlewares/auth";
import { createApiInternalError } from "~/models";
import { getDeviceById, getDevices, updateDevices } from "~/services/devices";
import { remove } from "~/utils";

export async function action({request}: ActionFunctionArgs) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    const ids = await request.json() as string[]
    console.log(`Removing devices ${ids.join(', ')}...`)
    const devices = getDevices()
    const removed: string[] = []
    for (const id of ids) {
      const device = getDeviceById(id)
      if (!device) {
        const msg = `Device ${id} not found: skipping...`
        console.log(msg)
        continue
      }
      console.log(device)
      remove(device, devices)
      removed.push(id)
    }
    updateDevices(devices)
    console.log(`Removed devices ${removed.join(', ')}.`)
    return json({data: removed})
  }
  catch (e) {
    const err = e as Error
    return json(createApiInternalError(err))
  }
}