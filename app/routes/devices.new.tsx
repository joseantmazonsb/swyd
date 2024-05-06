import { json, useNavigate } from "@remix-run/react";
import Page from "~/components/page";
import { ApiOk, ApiValidationError, Device } from "~/models";
import { getDeviceById } from "~/services/devices";
import { useApiFetch } from "~/hooks";
import { toastError, toastSuccess } from "~/components/toast";
import { getTasksByDevice } from "~/services/tasks";
import { EditDevice } from "~/components/devices/editDevice";
import { FormikHelpers } from "formik";
import { DeviceContext } from "~/contexts";

export function loader({params} : {params: {deviceId: string}}) {
  const device = getDeviceById(params.deviceId)
  const tasks = getTasksByDevice(params.deviceId)
  return json({device, tasks})
}

export default function NewDevice() {
  const device: Device = {
    name: '',
    host: '',
    id: '-',
    mac: '',
    type: 'server',
    ssh: {}     
  }

  return (
    <Page title="New device">
      <DeviceContext.Provider value={{device, tasks: []}}>
        <CreateDevice/>
      </DeviceContext.Provider>
    </Page>
  )
}

function CreateDevice() {
  const navigate = useNavigate()
  const apiFetch = useApiFetch()
  const onSubmit = async (values: Device, formik: FormikHelpers<Device>) => {
    try {
      const res = await apiFetch(`/api/devices/new`, {
        method: 'POST',
        body: JSON.stringify(values)
      })
      if (!res.ok) {
        const {message, errors} = await res.json() as ApiValidationError
        if (errors) {
          formik.setErrors(errors)
          toastError('Validation error')
        }
        else {
          toastError(message)
        }
        return
      }
      toastSuccess('Device created! Redirecting...')
      formik.setFieldError('id', 'prevent resubmit')
      const { data: device } = await res.json() as ApiOk<Device>
      navigate(`/devices/${device.id}`)
    }
    catch (err) {
      toastError((err as Error).message)
    }
  }

  return (
    <div className="flex flex-row">
      <div className="flex md:flex-grow"/>
      <div className="flex flex-col flex-grow gap-6">
        <EditDevice submitText="Create" onSubmit={onSubmit}/>
      </div>  
      <div className="flex md:flex-grow"/>
    </div>
  )
}