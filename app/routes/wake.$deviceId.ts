import { wake } from "~/services/system"
import { json } from "@remix-run/node"
import { getDeviceById } from "~/services/devices"
import { createApiError } from "~/models"

export function loader({params} : {params: {deviceId: string}}) {
  const device = getDeviceById(params.deviceId)
  if (!device) {
    const msg = `Device ${params.deviceId} not found`
    const code = 404
    console.log(msg)
    return json(createApiError(code, msg), code)
  }
  console.log(`Waking up ${device.name} (${device.id})...`)
  const result = wake(device.host, device.mac)
  if (result) {
    console.log(`Magic packet was successfully sent to ${device.mac} (${device.host}) in order to wake ${device.name}`)
  }
  else {
    console.log(`Failed to send magic packet to ${device.mac} (${device.host}) in order to wake ${device.name}`)
  }
  return json(result)
}