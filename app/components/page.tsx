import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import { Toaster } from "react-hot-toast";
import { Spinner } from "@nextui-org/react";
import FlexSpacer from "./spacer";
import { Redirect } from "./redirect";
import { ApiOk } from "~/models";
import { isExpired } from "react-jwt";

export default function Index({title, subtitle, children}: {title: string, subtitle?: string, children: React.JSX.Element}) {
  return (
    <Authorized>
      <Navbar/>
      <div className="flex flex-col m-6 gap-10">
        <div className="flex flex-col gap-4 text-center">
          <h1 className=" font-semibold text-3xl">{title}</h1>
          {subtitle && <h2 className="text-md text-gray-500 dark:text-gray-300">{subtitle}</h2>}
        </div>
        {children}
      </div>
      <Toaster/>
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
      const res = await fetch('/api/setup')
      const {data} = await res.json() as ApiOk<boolean>
      setSetup(data)
      setFetching(false)
    }
    getData()
    const token = localStorage.getItem('authorization')
    if (token) {
      try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const expired = isExpired(token)
        if (expired) {
          localStorage.removeItem('authorization')
        }
        else {
          setAuth(true)
        }
      }
      catch (err) {
        console.log(err)
        localStorage.removeItem('authorization')
      }
    }
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