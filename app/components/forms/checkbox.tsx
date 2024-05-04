import { Checkbox } from "@nextui-org/react";
import { useFormikContext } from "formik";

export function CustomCheckbox({
  id,
  label
}: {
  id: string,
  label?: string
}) {
  const ctx = useFormikContext()
  return (
    <Checkbox {...ctx.getFieldProps(id)} 
      id={id}
    >
      {label}
    </Checkbox>
  )
}