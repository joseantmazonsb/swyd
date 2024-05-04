import { LoaderFunctionArgs, json } from "@remix-run/node";
import { ValidationError } from "yup";
import { handleAuth } from "~/middlewares/auth";
import { Device, createApiInternalError, createApiValidationError, deviceSchema } from "~/models";
import { getDevices, updateDevices } from "~/services/devices";

export async function action({request}: LoaderFunctionArgs) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const body = await request.json() as Device
    console.log(body)
    body.id = crypto.randomUUID()
    console.log(body)
    const device = deviceSchema.validateSync(body)
    const devices = getDevices()
    if (devices.find(d => d.name === device.name)) {
      throw new ValidationError('A device with the same name already exists', 'name', 'name')
    }
    devices.push(device)
    updateDevices(devices)
    return json({data: device})
  }
  catch (e) {
    const err = e as Error
    if (err instanceof ValidationError) {
      return json(createApiValidationError(err), 400)
    }
    return json(createApiInternalError(err), 500)
  }
}