import { Card, CardHeader, Button, CardBody } from "@nextui-org/react"
import { Formik, Form, FormikHelpers } from "formik"
import { HiChevronDown, HiChevronUp } from "react-icons/hi2"
import { Device, deviceSchema } from "~/models"
import { Collapse, Collapsable } from "../collapse"
import CustomInput from "../forms/input"
import { SelectType } from "../forms/selectType"
import FlexSpacer from "../spacer"
import { useDeviceContext } from "~/contexts"

export function EditDevice({
  submitText,
  onSubmit
}: {
  submitText?: string,
  onSubmit: (values: Device, formik: FormikHelpers<Device>) => void
}) {
  const { device } = useDeviceContext()
  return (
    <Collapse>
    {(toggleCollapsed, isCollapsed) => (
      <Card className="p-4 flex flex-grow">
        <CardHeader className="flex">
          <h3 className='font-semibold text-xl'>Info</h3>
          <FlexSpacer/>
          <Button onClick={toggleCollapsed} variant={'light'} isIconOnly>{isCollapsed ? <HiChevronDown/> : <HiChevronUp/>}</Button>
        </CardHeader>
        <Collapsable>
          <CardBody>
            <Formik initialValues={device} onSubmit={onSubmit} validationSchema={deviceSchema}>
            {formik => (
              <Form className="flex flex-col gap-4">
                <SelectType id="type" label="Icon"/>
                <CustomInput isRequired id="name" label="Name" placeholder="Raspberry pi 5"/>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <CustomInput isRequired id="host" label="Host address" placeholder="10.0.0.1/24"/>
                  <CustomInput isRequired id="mac" label="MAC address" placeholder="00:B0:D0:63:C2:26"/>
                </div>
                <CustomInput id="ssh.user" label="SSH user" placeholder="root"/>
                <div className="flex">
                  <FlexSpacer/>
                  <Button 
                    isDisabled={!formik.isValid || !formik.dirty} 
                    type="submit" color="primary"
                    isLoading={formik.isSubmitting}
                  >{submitText ?? 'Save'}</Button>
                </div>
              </Form>
            )}
            </Formik>
          </CardBody>
        </Collapsable>
      </Card>
    )}
    </Collapse>
  )
}