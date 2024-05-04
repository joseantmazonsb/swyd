import { Button, Input, Listbox, ListboxItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, select, useDisclosure } from "@nextui-org/react";
import { format } from "date-fns";
import { Form, Formik, FormikHelpers } from "formik";
import { useEffect, useRef, useState } from "react";
import { HiDotsVertical, HiDownload, HiUpload } from "react-icons/hi";
import { HiTrash, HiPlus, HiArrowUturnLeft } from "react-icons/hi2";
import CustomPopover from "~/components/customPopover";
import FileInput from "~/components/fileInput";
import CustomInput from "~/components/forms/input";
import NoContentImage from "~/components/noContentImage";
import Page from "~/components/page";
import FlexSpacer from "~/components/spacer";
import { toastError, toastSuccess } from "~/components/toast";
import { useApiFetch, useJsonFetch } from "~/hooks";
import { ApiError, ApiOk, ApiValidationError, Snapshot, snapshotsSchema } from "~/models";
import { remove } from "~/utils";

export default function Snapshots() {
  const {status, data: snapshots, setData: setSnapshots} = useJsonFetch<Snapshot[]>({
    input: '/api/snapshots'
  }, [])
  const [isSelecting, setSelecting] = useState(false)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [selectedElement, setSelectedElement] = useState<Snapshot>()
  const bulkDeleteDisclosure = useDisclosure()
  const deleteDisclosure = useDisclosure()
  const restoreDisclosure = useDisclosure()
  const importDisclosure = useDisclosure()
  const createSnapshotDisclosure = useDisclosure()
  const inputImportRef = useRef<HTMLInputElement>(null)
  const apiFetch = useApiFetch()

  const onSubmit = async (values: Snapshot, formik: FormikHelpers<Snapshot>) => {
    try {
      console.log('submit')
      const res = await apiFetch('/api/snapshots/new', {
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
      toastSuccess('Snapshot created!')
      createSnapshotDisclosure.onClose()
      setSnapshots([...snapshots ?? [], values])
    }
    catch (err) {
      toastError((err as Error).message)
    }
  }

  useEffect(() => {
    return () => {
      setSelectedElements([])
    }
  }, [isSelecting])

  return (
    <Page title="Snapshots">
      <div>
        <div className="w-100 flex flex-row gap-4">
        <Modal isDismissable isOpen={importDisclosure.isOpen} onClose={importDisclosure.onClose}>
            <ModalContent>
              <ModalHeader>Import snapshot</ModalHeader>
              <ModalBody>
                <input ref={inputImportRef} type="file" accept=".zip" />
              </ModalBody>
              <ModalFooter>
                <div className="flex gap-4">
                  <Button variant="light" onClick={importDisclosure.onClose}>Cancel</Button>
                  <Button color="primary" 
                    onClick={async () => {
                      try {
                        const file = inputImportRef.current?.files?.item(0)
                        if (!file) {
                          toastError('You must select one file!')
                          return
                        }
                        const data = new FormData()
                        data.append('filename', file.name)
                        data.append('data', file)
                        const res = await apiFetch(`/api/snapshots/import`, {
                          method: 'POST',
                          body: data
                        })
                        if (!res.ok) {
                          const {message} = await res.json() as ApiError
                          toastError(message)
                          return
                        }
                        const {data: snapshot} = await res.json() as ApiOk<Snapshot>
                        setSnapshots([...snapshots ?? [], snapshot])
                        toastSuccess(`Snapshot imported!`)
                        importDisclosure.onClose()
                      }
                      catch (err) {
                        toastError((err as Error).message)
                      }
                    }}
                  >Import</Button>
                </div>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Modal isDismissable isOpen={restoreDisclosure.isOpen} onClose={restoreDisclosure.onClose}>
            <ModalContent>
              <ModalHeader>Restore snapshot</ModalHeader>
              <ModalBody>
                <p>Are you sure you would like to restore snapshot <strong>{selectedElement?.name}</strong>? This will set all devices, tasks and settings to the state they were when the snapshot was taken</p>
              </ModalBody>
              <ModalFooter>
                <div className="flex gap-4">
                  <Button variant="light" onClick={restoreDisclosure.onClose}>Cancel</Button>
                  <Button color="warning" 
                    onClick={async () => {
                      try {
                        const res = await apiFetch(`/api/snapshots/restore/${selectedElement!.name}`, {
                          method: 'POST'
                        })
                        if (!res.ok) {
                          const {message} = await res.json() as ApiError
                          toastError(message)
                          return
                        }
                        toastSuccess(`Snapshot restored!`)
                        restoreDisclosure.onClose()
                      }
                      catch (err) {
                        toastError((err as Error).message)
                      }
                    }}
                  >Restore</Button>
                </div>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Modal isDismissable isOpen={deleteDisclosure.isOpen} onClose={deleteDisclosure.onClose}>
            <ModalContent>
              <ModalHeader>Remove snapshot</ModalHeader>
              <ModalBody>
                <p>Are you sure you would like to remove snapshot <strong>{selectedElement?.name}</strong>? This action is final and cannot be undone</p>
              </ModalBody>
              <ModalFooter>
                <div className="flex gap-4">
                  <Button variant="light" onClick={deleteDisclosure.onClose}>Cancel</Button>
                  <Button color="danger" 
                    onClick={async () => {
                      try {
                        const res = await apiFetch(`/api/snapshots/delete/${selectedElement!.name}`, {
                          method: 'DELETE'
                        })
                        if (!res.ok) {
                          const {message} = await res.json() as ApiError
                          toastError(message)
                          return
                        }
                        toastSuccess(`Snapshot removed`)
                        setSnapshots([...remove(selectedElement!, snapshots!)])
                        deleteDisclosure.onClose()
                      }
                      catch (err) {
                        toastError((err as Error).message)
                      }
                    }}
                  >Remove</Button>
                </div>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Modal isDismissable isOpen={bulkDeleteDisclosure.isOpen} onClose={bulkDeleteDisclosure.onClose}>
            <ModalContent>
              <ModalHeader>Remove snapshot</ModalHeader>
              <ModalBody>
                <p>Are you sure you would like to remove <strong>{selectedElements.length}</strong> snapshots? This action is final and cannot be undone</p>
              </ModalBody>
              <ModalFooter>
                <div className="flex gap-4">
                  <Button variant="light" onClick={bulkDeleteDisclosure.onClose}>Cancel</Button>
                  <Button color="danger" 
                    onClick={async () => {
                      try {
                        const res = await apiFetch(`/api/snapshots/bulk/delete`, {
                          method: 'DELETE',
                          body: JSON.stringify(selectedElements)
                        })
                        if (!res.ok) {
                          const {message} = await res.json() as ApiError
                          toastError(message)
                          return
                        }
                        toastSuccess(`Snapshots removed`)
                        setSelectedElements([])
                        setSelecting(false)
                        setSnapshots(snapshots?.filter(s => !selectedElements.includes(s.name)))
                        bulkDeleteDisclosure.onClose()
                      }
                      catch (err) {
                        toastError((err as Error).message)
                      }
                    }}
                  >Remove</Button>
                </div>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Modal isDismissable isOpen={createSnapshotDisclosure.isOpen} onClose={createSnapshotDisclosure.onClose}>
            <ModalContent>
              <Formik initialValues={{
                name: '',
                creationDate: new Date(Date.now())
              }} onSubmit={onSubmit} enableReinitialize validationSchema={snapshotsSchema}>
              {formik => (
                <Form>
                  <ModalHeader>Create Snapshot</ModalHeader>
                  <ModalBody>
                    <CustomInput id={"name"} label="Name" isRequired placeholder={`snapshot-${Date.now()}`}/>
                    <CustomInput id={"description"} label="Description"/>
                  </ModalBody>
                  <ModalFooter>
                    <div className="flex gap-4">
                      <Button variant="light" onClick={createSnapshotDisclosure.onClose}>Cancel</Button>
                      <Button isLoading={formik.isSubmitting} isDisabled={!formik.dirty || !formik.isValid} type="submit" color="primary">Create</Button>
                    </div>
                  </ModalFooter>
                </Form>
              )}
              </Formik>
            </ModalContent>
          </Modal>
        {!isSelecting &&
          <>
            <FlexSpacer/>
            <Button color="secondary" startContent={<HiUpload/>} onClick={importDisclosure.onOpen}>Import</Button>
            <Button color="primary" startContent={<HiPlus/>} onClick={createSnapshotDisclosure.onOpen}
              >Add new
            </Button>
            <FlexSpacer/>
          </>
        }
        </div>
        <div className="w-100 flex flex-col gap-4" >
        {status === 'fetching' && <Spinner className="my-8"/>}
        {status === 'ok' && !snapshots?.length && 
        <div className="flex text-gray-500">
          <FlexSpacer/>
          <NoContentImage caption="There are no snapshots!"/>
          <FlexSpacer/>
        </div>
        }
        {status === 'ok' && !!snapshots?.length &&
        <div className="flex">
          <FlexSpacer/>
          <div className="flex flex-col gap-4 max-w-[600px] sm:min-w-[600px]">
            <div className="flex mt-8">
              <Table selectionMode={isSelecting ? 'multiple' : 'none'} color="primary"
                onSelectionChange={e => {
                  if (isSelecting) {
                    const items: string[] = []
                    for (const index of e) {
                      items.push(snapshots[index as number].name)
                    }
                    setSelectedElements(items)
                    return
                  }
                }}
              >
                <TableHeader>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Description</TableColumn>
                  <TableColumn>Creation date</TableColumn>
                  <TableColumn> </TableColumn>
                </TableHeader>
                <TableBody>
                {snapshots.map((s, index) => (
                  <TableRow key={index}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.description}</TableCell>
                    <TableCell>{format(s.creationDate, 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell>
                      <CustomPopover>
                      {(isOpen, setOpen) => (
                        <Popover isOpen={isOpen} onOpenChange={open => setOpen(open)}>
                          <PopoverTrigger>
                            <Button isDisabled={isSelecting} variant="light" isIconOnly><HiDotsVertical/></Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <Listbox>
                              <ListboxItem key={1} variant="light" startContent={<HiArrowUturnLeft/>} color="primary"
                                onClick={() => {
                                  setOpen(false)
                                  setSelectedElement(s)
                                  restoreDisclosure.onOpen()
                                }}
                              >Restore</ListboxItem>
                              <ListboxItem key={2} variant="light" startContent={<HiDownload/>} color="primary" 
                                href={`/api/snapshots/download/${s.name}`} onClick={() => setOpen(false)}
                              >Download</ListboxItem>
                              <ListboxItem variant="light" key={3} startContent={<HiTrash/>} color="danger"
                                onClick={() => {
                                  setOpen(false)
                                  setSelectedElement(s)
                                  deleteDisclosure.onOpen()
                                }}
                              >Delete</ListboxItem>
                            </Listbox>
                          </PopoverContent>
                        </Popover>
                      )}
                      </CustomPopover>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
            {!isSelecting &&
              <div className="flex flex-grow">
                <div className="hidden sm:flex flex-grow"/>
                <Button className="flex-grow sm:grow-0"
                  variant="light" color="danger" startContent={<HiTrash/>}
                  onClick={() => setSelecting(true)}
                >Bulk delete</Button>
                <div className="hidden sm:flex flex-grow"/>
               </div> 
            }
            {isSelecting && 
            <div className="flex flex-row gap-2">
              <FlexSpacer/>
              <Button
              variant="light"
                onClick={() => {
                  setSelectedElements([])
                  setSelecting(false)
                }}
              >Cancel</Button>
              <Button
                color="danger"
                isDisabled={!selectedElements.length}
                onClick={bulkDeleteDisclosure.onOpen}
              >Delete{selectedElements.length > 0 && ` ${selectedElements.length}`}</Button>
              <FlexSpacer/>
            </div>
            }
            </div>
            <FlexSpacer/>
        </div>
        }
        </div>
      </div>
    </Page>
  )
}