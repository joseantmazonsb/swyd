import { json } from "@remix-run/node";
import { ValidationError } from "yup";
import { handleAuth } from "~/middlewares/auth";
import { createApiError, createApiInternalError, createApiValidationError } from "~/models";
import { getDeviceById, getDevices, updateDevices } from "~/services/devices";
import { remove } from "~/utils";

export async function action({params, request}: {params: {deviceId: string}, request: Request}) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    console.log(`Removing device ${params.deviceId}...`)
    const device = getDeviceById(params.deviceId)
    if (!device) {
      const msg = `Device ${params.deviceId} not found`
      console.log(msg)
      return createApiError(404, msg)
    }
    console.log(device)
    const devices = getDevices()
    remove(device, devices)
    console.log(devices)
    updateDevices(devices)
    console.log(`Device ${device.id} (${device.name}) removed successfully.`)
    return json({success: true})
  }
  catch (e) {
    const err = e as Error
    if (err instanceof ValidationError) {
      return json(createApiValidationError(err))
    }
    return json(createApiInternalError(err))
  }
}