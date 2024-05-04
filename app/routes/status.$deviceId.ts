import { isAwakeAsync } from "~/services/system";
import { json } from "@remix-run/node";
import { getDeviceById } from "~/services/devices"
import { getSettings } from "~/services/settings";

export async function loader({params} : {params: {deviceId: string}}) {
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