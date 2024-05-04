import { execSync, exec } from 'child_process'

export function wake(ip: string, mac: string) {
  try {
    execSync(`wakeonlan ${mac}`)
    return true
  }
  catch {
    return false
  }
}

export function poweroff(user: string, address: string, strictHostKeyChecking: boolean)  {
  try {
    execSync(`ssh -o "strictHostKeyChecking ${strictHostKeyChecking ? 'yes' : 'no'}" ${user}@${address} poweroff`)
    return true
  }
  catch {
    return false
  }
}

export function isAwakeAsync(address: string, attempts: number) {
  return new Promise((resolve) => {
    exec(`ping -c ${attempts} -t 500 ${address}`, (err) => {
      resolve(err ? false : true)
    })
  })
}