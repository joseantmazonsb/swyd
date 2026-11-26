import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import { Toaster } from "react-hot-toast";
import { Spinner } from "@nextui-org/react";
import FlexSpacer from "./spacer";
import { Redirect } from "./redirect";
import { ApiOk } from "~/models";
import { UserContextProvider } from "~/contexts";

export default function Layout({
  children,
  overwriteUserContext
}: 
{
  children: React.JSX.Element,
  overwriteUserContext?: boolean
}) {

  return (
    <Authorized>
      {overwriteUserContext 
      ?
        <>
          <Navbar/>
          {children}
          <Toaster/>
        </>
      :
        <UserContextProvider>
          <Navbar/>
          {children}
          <Toaster/>
        </UserContextProvider>
      }
    </Authorized>
  )
}

function Authorized({
  children
}: {
  children: JSX.Element | JSX.Element[]
}) {

  const [fetching, setFetching] = useState(true)
  const [setup, setSetup] = useState(false)
  const [auth, setAuth] = useState(false)
  
  useEffect(() => {
    const getData = async () => {
      try {
        const token = localStorage.getItem('authorization')
        const headers = token ? { 'X-Authorization': token } : undefined
        const [setupRes, sessionRes] = await Promise.all([fetch('/api/setup'), fetch('/api/auth/session', { headers })])
        const {data} = await setupRes.json() as ApiOk<boolean>
        const session = await sessionRes.json()
        setSetup(data)
        setAuth(!!session.data)
        if (token && !session.data) localStorage.removeItem('authorization')
      }
      catch (err) {
        console.log(err)
      }
      finally { setFetching(false) }
    }
    getData()
  }, [])

  return (
    <>
      {fetching &&
      <div className="flex" style={{height: '100vh'}}>
        <FlexSpacer/>
        <div className="flex flex-col">
          <FlexSpacer/>
            <Spinner/>
          <FlexSpacer/>
        </div>
        <FlexSpacer/>
      </div>
      }
      {!fetching && !setup && <Redirect to="/signup"/>}
      {!fetching && setup && !auth && <Redirect to="/signin"/>}
      {!fetching && setup && auth && children}
    </>
  )
}
