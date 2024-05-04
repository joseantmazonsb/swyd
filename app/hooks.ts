import { createContext, useContext, useEffect, useState } from "react"
import { Device, Task } from "./models"

type FetchArgs = {
  input: string | URL | Request,
  init?: RequestInit,
}

export function useFetch<T>({
  input,
  init,
  getData
}: FetchArgs & {getData: (res: Response) => Promise<T>}, dependencies?: unknown[]) {
  const [status, setStatus] = useState<'fetching' | 'ok' | 'error'>('fetching')
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<T>()

  const customFetch = useApiFetch()

  useEffect(() => {
    const run = async () => {
      try {
        const res = await customFetch(input, init)
        const data = await getData(res)
        setData(data)
        setStatus(res.ok ? 'ok' : 'error')
      }
      catch (err) {
        setStatus('error')
        setError(err as Error)
      }
    }
    setStatus('fetching')
    setData(undefined)
    setError(undefined)
    run()
  }, dependencies)
  return {
    status,
    data,
    error,
    setData
  }
}
/**
 * Get a fetch function that already manages API stuff such as authentication.
 * @returns 
 */
export function useApiFetch() {
  const proxy = new Proxy(fetch, {
    apply: function(target, thisArg, args) {
      const [input, init] = args;

      // Merge custom headers with the existing headers
      const headers = new Headers(init?.headers);
      const token = localStorage.getItem('authorization')
      if (token) {
        headers.append('X-Authorization', token)
      }

      // Make the fetch call with the updated headers
      return target(input, { ...init, headers });
    },
  })
  return proxy
}

export function useJsonFetch<T>({
  input,
  init
}: FetchArgs, dependencies?: unknown[]) {
  const getData = async (res: Response) => {
    const json = await res.json()
    const { data } = json
    return data as T
  }
  return useFetch<T>({input, init, getData}, dependencies)
}

type DeviceContextType = {
  device: Device
  tasks: Task[],
  // status: 'ok' | 'fetching' | 'error'
}

export const DeviceContext = createContext<DeviceContextType | undefined >(undefined)

export function useDeviceContext() {
  const ctx = useContext(DeviceContext)
  return ctx as DeviceContextType
}