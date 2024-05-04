import { poweroff } from "~/services/system"
import { json } from "@remix-run/node"
import { getSettings } from "~/services/settings"
import { getDeviceById } from "~/services/devices"
import { createApiError } from "~/models"

export async function loader({params}: {params: {deviceId: string}}) {
  const { ssh } = getSettings()
  const device = getDeviceById(params.deviceId)
  if (!device) {
    const msg = `Device ${params.deviceId} not found`
    const code = 404
    console.log(msg)
    return json(createApiError(code, msg), code)
  }
  const result = poweroff(device.ssh.user || ssh.defaultUser, device.host, ssh.strictHostKeyChecking)
  if (result) {
    console.log(`Shutdown sequence sent to ${device.name} (${device.host})`)
  }
  else {
    console.log(`Failed to send shutdown sequence to ${device.name} (${device.host})`)
  }
  return json(result)
}