import { Button, ButtonProps } from "@nextui-org/react";
import { useRef, useState } from "react";

export default function FileInput({
  title,
  accept,
  onChange,
  ...rest
}: {
  title: string,
  accept?: string,
} & ButtonProps) {

  const inputRef = useRef<HTMLInputElement>(null)
  const createClickEvent = () => new MouseEvent("click", {
    "view": window,
    "bubbles": true,
    "cancelable": false
  })
  const [files, setFiles] = useState<FileList | null>(null)

  return (
    <>
      <Button {...rest} onClick={() => inputRef.current?.dispatchEvent(createClickEvent())}>{title}</Button>
      <input accept={accept} type="file" className="hidden" ref={inputRef} onChange={(e) => {
        setFiles(e.target.files)
      }}/>
    </>
  )
}