import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";
import { ValidationError } from "yup";
import { deviceSchema } from "~/models";
import { getDevices, updateDevices } from "~/services/devices";
import { toDictionary } from "~/services/validation";
import { remove } from "~/utils";

export const action = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  try {
    const data = await request.json()
    console.log(data)
    const toValidate = {
      id: params.deviceId!,
      description: data.description,
      name: data.name,
      host: data.host,
      mac: data.mac,
      ssh: {
        user: data.ssh.user,
      },
      type: data.type
    }
    console.log(`Input to validate: ${JSON.stringify(toValidate)}`)
    const device = await deviceSchema.validate(toValidate)
    console.log(device)
    const devices = getDevices()
    if (devices.filter(d => d.id !== device.id).find(d => d.name === device.name)) {
      throw new ValidationError('A device with the same name already exists', 'name', 'name')
    }
    remove(device, devices)
    devices.push(device)
    updateDevices(devices)
    return json({ success: true }, 200);
  }
  catch (err) {
    console.log(err)
    if (err instanceof ValidationError) {
      return json({
        code: 400,
        message: 'Validation error',
        errors: toDictionary(err)
      }, 400)
    }
    return json((err as Error).message, 500)
  }
};