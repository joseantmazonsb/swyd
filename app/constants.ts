import { resolve } from 'path'

const root = resolve(process.env.SWYD_ROOT!)
const snapshots = resolve(process.env.SWYD_SNAPSHOTS!)
export const privateKey = resolve(process.env.SWYD_PRIVATE_KEY!)

console.log(`Root folder is ${root}`)
console.log(`Snapshots folder is ${snapshots}`)

export const paths = {
  root,
  devices: `${root}/devices.json`,
  settings: `${root}/settings.json`,
  tasks: `${root}/tasks.json`,
  credentials: `${root}/credentials.json`,
  snapshots,
  snapshotsRegistry: `${snapshots}/snapshots.json`,
}
