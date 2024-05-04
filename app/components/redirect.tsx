import { useEffect } from "react"

export function Redirect({to}: {to: string}) {
  useEffect(() => {
    window.location.pathname = to
  }, [to])
  return <></>
}