import { existsSync, writeFileSync, readFileSync } from 'fs'
import { paths } from '~/constants'
import { Device } from '../models'

let devices: Device[] | undefined

export function getDevices() : Device[] {
  if (!devices) {
    devices = []
    const exists = existsSync(paths.devices)
    if (!exists) {
      console.log(`Devices file not found in path ${paths.devices}. Creating default...`)
      updateDevices(devices)
      console.log(`Devices file created!`)
      return devices
    }
  }
  try {
    devices = JSON.parse(readFileSync(paths.devices).toString())
    return devices as Device[]
  }
  catch (err) {
    console.log(err)
    throw err
  }
}

export function getDeviceById(id: string) {
  return findDeviceByProperty('id', id)
}

export function findDeviceByName(name: string) {
  return findDeviceByProperty('name', name)
}

function findDeviceByProperty(propName: string, propValue: string) {
  const devices = getDevices()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return devices.find(d => (d as any)[propName] == propValue)
}

export function updateDevices(devices: Device[]) {
  writeFileSync(paths.devices, JSON.stringify(devices, undefined, 4))
}