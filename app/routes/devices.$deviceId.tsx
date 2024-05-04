import { Button, Card, CardBody, CardHeader, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@nextui-org/react";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { HiArrowPath, HiChevronDown, HiChevronUp, HiPlus, HiPower, HiTrash } from "react-icons/hi2";
import { Collapsable, Collapse } from "~/components/collapse";
import FlexSpacer from "~/components/spacer";
import NotFound from "~/components/notFound";
import Page from "~/components/page";
import { ApiError, Device, DeviceStatus, Task } from "~/models";
import { getDeviceById } from "~/services/devices";
import { DeviceContext, useApiFetch, useDeviceContext, useJsonFetch } from "~/hooks";
import { toastError, toastSuccess } from "~/components/toast";
import { getTasksByDevice } from "~/services/tasks";
import { EditDevice } from "~/components/devices/editDevice";

export function loader({params} : {params: {deviceId: string}}) {
  const device = getDeviceById(params.deviceId)
  const tasks = getTasksByDevice(params.deviceId)
  return json({device, tasks})
}

export default function Device() {
  const {device, tasks} = useLoaderData<typeof loader>()
  
  if (!device) {
    return <NotFound/>
  }

  return (
    <Page title="Manage device">
      <DeviceContext.Provider value={{device, tasks: tasks as Task[]}}>
        <ManageDevice/>
      </DeviceContext.Provider>
    </Page>
  )
}

function StatusBar() {
  const [checkStatus, setCheckStatus] = useState(0)
  const {device} = useDeviceContext()
  const refreshStatus = () => {
    setCheckStatus(checkStatus + 1)
  }
  const { status: fetchStatus, data: deviceStatus, error } = useJsonFetch<DeviceStatus>({
    input: `/status/${device.id}`
  }, [checkStatus])
  const apiFetch = useApiFetch()

  const onSubmit = async (endpoint: 'wake' | 'poweroff') => {
    try {
      const res = await apiFetch(`/${endpoint}/${device.id}/`)
      if (!res.ok) {
        const { message } = await res.json() as ApiError
        return toastError(message)
      }
      toastSuccess(`Command sent!`)
      refreshStatus()
    }
    catch (err) {
      console.log(err)
      toastError('Something went wrong')
    }
  }

  return (
    <div className="flex gap-2 items-center">
      {deviceStatus && 
      <Chip color={deviceStatus === 'online' ? 'success' : 'danger'} 
        className={deviceStatus === 'online' ? 'text-white' : ''}
      >
        {deviceStatus}
      </Chip>}
      <FlexSpacer/>
      <Button 
        onClick={refreshStatus}
        isLoading={fetchStatus === 'fetching'} 
        startContent={fetchStatus !== 'fetching' && <HiArrowPath/>}
        variant="light"
      >
        {fetchStatus === 'fetching' ? 'Checking status...' : 'Refresh'}
      </Button>
      {deviceStatus && 
        <Button
          onClick={() => onSubmit(deviceStatus === 'online' ? 'poweroff' : 'wake')}
          variant="flat"
          color={deviceStatus === 'online' ? 'danger' : 'primary'}
          startContent={<HiPower/>}
        >
          Turn {deviceStatus === 'online' ? 'off' : 'on'}
        </Button>
      }
    </div>
)
}

function ManageDevice() {
  const {device} = useDeviceContext()
  const {isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const apiFetch = useApiFetch()
  const onSubmit = async (values: Device) => {
    console.log(values)
    const res = await apiFetch(`/devices/${device.id}/update`, {
      method: 'POST',
      body: JSON.stringify(values)
    })
    if (!res.ok) {
      const {message} = await res.json() as ApiError
      toastError(message)
      return
    }
    toastSuccess('Device updated!')
  }
  return (
    <div className="flex flex-row">
      <div className="flex md:flex-grow"/>
      <div className="flex flex-col flex-grow gap-4">
        <StatusBar/>
        <EditDevice onSubmit={onSubmit}/>
        {/* TODO: Comming soon */}
        {/* <Tasks/> */}
        <Button startContent={<HiTrash/>} color="danger" variant='light' onClick={onOpen}>Remove</Button>
        <Modal isDismissable isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>
              Remove device
            </ModalHeader>
            <ModalBody>
              <p>Are you sure you would like to delete device <strong>{device.name}</strong>? This action is final and cannot be undone</p>
              </ModalBody>
            <ModalFooter>
              <Button onClick={onClose} variant="light">Cancel</Button>
              <Button color="danger" onClick={async () => {
                try {
                  await fetch(`/api/devices/delete/${device.id}`, {
                    method: 'DELETE'
                  })
                  navigate('/devices')
                }
                catch (e) {
                  toastError((e as Error).message)
                }
              }}>Remove</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>  
      <div className="flex md:flex-grow"/>
    </div>
  )
}

function Tasks() {
  const {tasks} = useDeviceContext()
  console.log(tasks)
  return (
    <Collapse>
    {(toggleCollapsed, isCollapsed) => (
      <Card className="p-4 flex flex-grow">
        <CardHeader className="flex">
          <h3 className='font-semibold text-xl'>Tasks</h3>
          <FlexSpacer/>
          <Button onClick={toggleCollapsed} variant={'light'} isIconOnly>{isCollapsed ? <HiChevronDown/> : <HiChevronUp/>}</Button>
        </CardHeader>
        <Collapsable>
          <CardBody className="gap-4">
            <div className="flex w-100">
              <div className="hidden md:flex flex-grow"/>
              <Button color="primary" startContent={<HiPlus/>} className="flex flex-grow md:flex-grow-0">Add new</Button>
            </div>
            <Table aria-label="Tasks">
              <TableHeader>
                <TableColumn>When</TableColumn>
                <TableColumn>Do</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"There are no tasks for this device"}>
                {tasks.map((t, index) => (
                  <TableRow key={index} className="hover:bg-sky-300" style={{borderRadius: '0.5em'}}>
                    <TableCell>{t.when.idle ? `Device has been idle for ${t.when.idle.replace('h', ' hours').replace('m', ' minutes')}` : `Time is ${t.when.time}`}</TableCell>
                    <TableCell>{t.do === 'turn-on' ? 'Turn it on' : 'Turn it off'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Collapsable>
      </Card>
    )}
    </Collapse>
  )
}