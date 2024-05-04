import { useState } from "react"

export default function CustomPopover({
  children
}: {
  children: (isOpen: boolean, setOpen: (value: boolean) => void) => React.ReactElement
}) {
  const [isOpen, setOpen] = useState(false)
  return (
    children(isOpen, setOpen)
  )
}