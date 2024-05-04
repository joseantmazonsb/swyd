/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Skeleton } from "@nextui-org/react";
import { useFormikContext } from "formik";
import { Device } from "~/models";

export default function CustomInput({
  id, label, placeholder, isRequired, isHidden, type, description, isLoading
} : 
{
  id: string, label?: string, placeholder?: string, isRequired?: boolean, isHidden?: boolean,
  type?: string, description?: string, isLoading?: boolean
}) {
  const ctx = useFormikContext<Device>()
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Skeleton isLoaded={!isLoading}>
      <Input {...ctx.getFieldProps(id)}
        type={type}
        description={description}
        hidden={isHidden}
        className={isHidden ? 'hidden': ''}
        isRequired={isRequired}
        label={label}
        placeholder={placeholder}
        errorMessage={(ctx.errors as any)[id]}
        isInvalid={(ctx.errors as any)[id]}
      />
    </Skeleton>
  )
}