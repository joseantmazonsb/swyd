import { useEffect, useState } from "react";
import { Redirect } from "~/components/redirect";

export default function SignOut() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    localStorage.removeItem('authorization')
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => setDone(true))
  }, [])
  return (
    <>
    {done 
      ?  <Redirect to="/signin"/>
      : 'Signing you out...'
    }
    </>
  )
}
