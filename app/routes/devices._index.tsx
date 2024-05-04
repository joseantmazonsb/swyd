import { Button, Image, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, select, useDisclosure } from "@nextui-org/react";
import { MetaFunction, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { HiPlus, HiTrash } from "react-icons/hi2";
import { DeviceEditModal, DeviceView } from "~/components/devices/deviceView";
import NoContentImage from "~/components/noContentImage";
import Page from "~/components/page";
import { Selectable } from "~/components/selectable";
import FlexSpacer from "~/components/spacer";
import { toastError, toastSuccess } from "~/components/toast";
import { useApiFetch, useJsonFetch } from "~/hooks";
import { ApiError, Device } from "~/models";
import { remove } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Devices" },
    { name: "devices" },
  ];
};

export default function Devices() {
  const {data: devices, status, setData: setDevices} = useJsonFetch<Device[]>({
    input: '/api/devices'
  }, [])
  const [editingDevice, setEditingDevice] = useState<Device>()
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [isDeleting, setDeleting] = useState(false)
  const [isSelecting, setSelecting] = useState(false)
  const disclosure = useDisclosure()

  const bulkDeleteDisclosure = useDisclosure()
  const apiFetch = useApiFetch()
  return (
    <Page title="Devices">
      <div className="mx-auto px-6 flex flex-col gap-4">
        <div className="px-6 flex flex-col gap-4 w-100">
          <div className="w-100 flex flex-row gap-4">
            {isSelecting
              ? <>
                <FlexSpacer/>
                <Button
                variant="light"
                  onClick={() => {
                    setSelectedDevices([])
                    setSelecting(false)
                  }}
                >Cancel</Button>
                <Button
                  color="danger"
                  isDisabled={!selectedDevices.length}
                  onClick={bulkDeleteDisclosure.onOpen}
                >Delete{selectedDevices.length > 0 && ` ${selectedDevices.length}`}</Button>
                <FlexSpacer/>
              </>
              : <>
                <FlexSpacer/>
                {!!devices?.length &&
                  <Button
                    variant="light" color="danger" startContent={<HiTrash/>}
                    onClick={() => setSelecting(true)}
                  >Bulk delete</Button>
                }
                <Button color="primary" startContent={<HiPlus/>}
                  href="/devices/new" as={Link}
                  >Add new
                </Button>
                <FlexSpacer/>
              </>
            }

          </div>
        </div>
        <div className="flex flex-wrap gap-6 flex-col md:flex-row text-gray-500" style={{alignItems: 'center', justifyContent: 'center'}}>
          {status === 'fetching' && <div className="text-center my-8"><Spinner/></div>}
          {devices && devices.map(d => {
            return (
              <Selectable key={d.id} isSelecting={isSelecting} 
                defaultSelected={selectedDevices.includes(d.id)} 
                onClick={(isSelected) => {
                  const newDevices = isSelected
                    ? [...selectedDevices, d.id]
                    : [...remove(d.id, selectedDevices)]
                  setSelectedDevices(newDevices)
                }}
              >
                <DeviceView key={d.id} device={d} isPressable={!isSelecting} onClick={() => {
                  // Timeout so we can see the neat animation
                  setEditingDevice(d)
                  setTimeout(() => {
                    disclosure.onOpen()
                  }, 200);
                }}/>
              </Selectable>
            )
          })}
          {status === 'ok' && !devices?.length && 
          <NoContentImage caption="There are no devices yet!"/>
          }
          {editingDevice && <DeviceEditModal device={editingDevice} disclosure={disclosure} updateDevices={(device) => {
            const newDevices = remove(devices!.find(d => d.id === device.id)!, devices!)
            newDevices.push(device)
            setDevices([...newDevices])
          }}/>}
        </div>
        <Modal isOpen={bulkDeleteDisclosure.isOpen} onClose={bulkDeleteDisclosure.onClose}>
          <ModalContent>
            <ModalHeader>Remove devices</ModalHeader>
            <ModalBody>
              <p>Are you sure you would like to delete <strong>{selectedDevices.length}</strong> device{selectedDevices.length > 1 ? 's' : ''}? This action is final and cannot be undone</p>
            </ModalBody>
            <ModalFooter className="flex flex-row gap-2">
              <Button variant="light" onClick={bulkDeleteDisclosure.onClose}>Cancel</Button>
              <Button color="danger" isLoading={isDeleting} onClick={async () => {
                try {
                  setDeleting(true)
                  const res = await apiFetch('/api/devices/bulk/delete', {
                    method: 'DELETE',
                    body: JSON.stringify(selectedDevices)
                  })
                  if (!res.ok) {
                    const err = await res.json() as ApiError
                    toastError(err.message)
                    return
                  }
                  toastSuccess('Bulk operation completed')
                  setSelecting(false)
                  setDevices(devices!.filter(d => !selectedDevices.includes(d.id)))
                  bulkDeleteDisclosure.onClose()
                  setSelectedDevices([])
                }
                catch (err) {
                  toastError((err as Error).message)
                }
                finally {
                  setDeleting(false)
                }
              }}>Remove</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Page>
  );
}