import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { handleAuth } from '~/middlewares/auth'
import { getDeviceById } from '~/services/devices'
import { getTasksByDevice } from '~/services/tasks'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const unauthorized = await handleAuth(request)
  if (unauthorized) return unauthorized
  const id = params.deviceId!
  return json({ data: { device: getDeviceById(id), tasks: getTasksByDevice(id) } })
}
