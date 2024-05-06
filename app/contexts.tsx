import { createContext, useContext, useState } from "react"
import { Device, Task, Account } from "./models"

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

export type UserContextType = {
  account?: Account
  setAccount: (account?: Account) => void,
}

export const UserContext = createContext<UserContextType>({
  account: undefined,
  setAccount: () => {},
})

export function UserContextProvider({ children }: {children: React.ReactNode}) {
  const [account, setAccount] = useState<Account>()

  return (
    <UserContext.Provider value={{ account, setAccount}}>
      {children}
    </UserContext.Provider>
  );
}