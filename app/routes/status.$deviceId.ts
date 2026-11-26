import { isAwakeAsync } from "~/services/system";
import { json } from "@remix-run/node";
import { getDeviceById } from "~/services/devices"
import { getSettings } from "~/services/settings";
import { handleAuth } from '~/middlewares/auth';

export async function loader({params, request} : {params: {deviceId: string}, request: Request}) {
  const unauthorized = await handleAuth(request)
  if (unauthorized) return unauthorized
  const device = getDeviceById(params.deviceId)
  const settings = getSettings()
  if (!device) {
    console.log(`Device ${params.deviceId} not found`)
    return
  }
  console.log(`Checking status of ${device.name} (${device.id})...`)
  const status = (await isAwakeAsync(device.host, settings.ping.attempts)) ? 'online' : 'offline'
  console.log(`${device.name} is currently ${status}`)
  return json({ data: status })
}
