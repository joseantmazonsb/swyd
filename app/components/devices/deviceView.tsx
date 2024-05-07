import { Link, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardHeader, Chip, Divider, CardBody, CardFooter, Tooltip, UseDisclosureProps } from "@nextui-org/react"
import { useFetcher } from "@remix-run/react"
import { Form, Formik, FormikHelpers } from "formik"
import { useState, useEffect, createContext } from "react"
import { HiArrowPath, HiPower } from "react-icons/hi2"
import { Device, DeviceStatus, deviceSchema, ApiValidationError } from "~/models"
import CustomInput from "../forms/input"
import { DeviceIcon } from "./deviceIcon"
import { SelectType } from "../forms/selectType"
import { useApiFetch } from "~/hooks"
import { toastError, toastSuccess } from "../toast"

export const CustomFormikContext = createContext({})

export function DeviceView({
  device, onClick, isPressable
} : {
  device: Device, onClick: () => void, isPressable?: boolean
}) {
  const [fetching, setFetching] = useState(true)
  const [status, setStatus] = useState<DeviceStatus>('offline')
  const [checkStatus, setCheckStatus] = useState(0)
  const [isMainButtonWaiting, setMainButtonWaiting] = useState(false)
  const actionFetcher = useFetcher()

  const apiFetch = useApiFetch()
  useEffect(() => {
    const getData = async () => {
      const res = await apiFetch(`/status/${device.id}`)
      const { data: status } = await res.json()
      console.log(status)
      setStatus(status)
      setFetching(false)
    }
    setFetching(true)
    getData()
  }, [checkStatus])

  return (
    <Card className="flex min-w-96" isPressable={isPressable} onPress={onClick}>
      <CardHeader className="flex gap-3">
        <div className="flex gap-2" style={{alignItems: 'center'}}>
          <DeviceIcon type={device.type}/>
          <p className="text-md">{device.name}</p>
          {!fetching && <Chip size="sm" color={status === 'online' ? 'success' : 'danger'}>{status}</Chip>}
        </div>
      </CardHeader>
      <Divider/>
      <CardBody>
        <p className="text-small text-default-500">{device.description}</p>
        <p className="text-small text-default-500">Host address: {device.host}</p>
        <p className="text-small text-default-500">MAC address: {device.mac}</p>
      </CardBody>
      <Divider/>
      <CardFooter className="flex">
          {!fetching && 
            <>
              <Button variant="light" title="Refresh" isDisabled={isMainButtonWaiting} isIconOnly onClick={() => setCheckStatus(checkStatus+1)}><HiArrowPath/></Button>
              <div className="grow"/>
            </>
          }
          <actionFetcher.Form method="get" action={status == 'online' ? `/poweroff/${device.id}` : `/wake/${device.id}`}>
            <Button isLoading={fetching || isMainButtonWaiting} type="submit" 
                color={fetching ? undefined : status === 'online' ? 'danger' : 'primary'} 
                variant={fetching ? undefined : status === 'online' ? 'light' : 'flat'}
                startContent={fetching || isMainButtonWaiting? '' : <HiPower/>}
                onClick={() => {
                  setTimeout(() => {
                    setMainButtonWaiting(true)
                    setTimeout(() => {
                      setCheckStatus(checkStatus+1)
                      setMainButtonWaiting(false)
                    }, 15000)
                  }, 300)
                }}
              >
                {fetching 
                ? 'Checking status...'
                : <>{status == 'online' ? 'Turn off' : 'Turn on'}</>
                }
            </Button>
          </actionFetcher.Form>
      </CardFooter>
    </Card>
  )
}

export function DeviceEditModal({
  device, disclosure, updateDevices
}: 
{
  device: Device, disclosure: UseDisclosureProps, updateDevices: (device: Device) => void
}) {
  const {isOpen, onClose} = disclosure
  const apiFetch = useApiFetch()

  const onSubmit = async (values: Device, formik: FormikHelpers<Device>) => {
    try {
      const res = await apiFetch(`/devices/${device.id}/update`, {
        method: 'POST',
        body: JSON.stringify(values)
      })
      if (!res.ok) {
        const {errors, message} = await res.json() as ApiValidationError
        toastError(message)
        if (errors) {
          formik.setErrors(errors)
        }
        return
      }
      toastSuccess('Device updated!')
      updateDevices(values)
      onClose!()
    }
    catch (e) {
      toastError((e as Error).message)
    }
  }
  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      isDismissable
    >
      <ModalContent>
          <Formik initialValues={device} validationSchema={deviceSchema} onSubmit={onSubmit}>
            {formik => (
              <Form>
                <ModalHeader className="flex flex-col gap-1">Quick edit</ModalHeader>
                <ModalBody>
                  <SelectType id="type" label="Icon"/>
                  <CustomInput isRequired id="name" label="Name" placeholder="Raspberry pi 5"/>
                  <CustomInput isRequired id="host" label="Host address" placeholder="10.0.0.1/24"/>
                  <CustomInput isRequired id="mac" label="MAC address" placeholder="00:B0:D0:63:C2:26"/>
                  <CustomInput id="ssh.user" label="SSH user" placeholder="root"/>
                </ModalBody>
                <ModalFooter className="flex">
                  <Link size='sm' href={`/devices/${device.id}`}>More</Link>
                  <div className="flex flex-grow"/>
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" type="submit" isLoading={formik.isSubmitting} 
                    isDisabled={!formik.isValid || !formik.dirty}>
                    Apply
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
      </ModalContent>
    </Modal>
  )
}