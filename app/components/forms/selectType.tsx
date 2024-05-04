import { Select, SelectItem } from "@nextui-org/react"
import { useFormikContext } from "formik"
import { Device, deviceTypes, DeviceType } from "~/models"
import { DeviceIcon } from "../devices/deviceIcon"

export function SelectType({id, label}: {id: string, label: string}) {
  // const ctx = useContext(CustomFormikContext) as FormikContextType<Device>
  const ctx = useFormikContext<Device>()
  return (
    <Select {...ctx.getFieldProps(id)}
      disallowEmptySelection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorMessage={(ctx.errors as any)[id]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isInvalid={(ctx.errors as any)[id]}
      label={label}
      placeholder="desktop"
      className="max-w-xs" 
      items={deviceTypes}
      defaultSelectedKeys={[ctx.getFieldProps(id).value]}
      renderValue={(items) => {
        return items.map(item => (
          <div key={item.key} className="flex items-center gap-2 mt-2">
            <DeviceIcon type={item.key! as DeviceType}/>
            {/* <span>{item.key! as DeviceType}</span> */}
          </div>
        ))
      }}
    >
      {deviceTypes.map((type) => (
        <SelectItem key={type} value={type} textValue={type}>
          <div className="flex items-center gap-2">
            <DeviceIcon type={type}/>
          </div>
        </SelectItem>
      ))}
    </Select>
  )
}