import { Switch } from "@nextui-org/react";
import { useFormikContext } from "formik";

export function CustomSwitch({
  id,
  label
}: {
  id: string,
  label?: string
}) {
  const ctx = useFormikContext()
  return (
    <Switch {...ctx.getFieldProps(id)} 
      id={id}
    >
      {label}
    </Switch>
  )
}