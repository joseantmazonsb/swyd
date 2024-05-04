import { paths } from "~/constants"
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { Snapshot } from "~/models"

export function getSnapshots() : Snapshot[] {
  const exists = existsSync(paths.snapshotsRegistry)
  if (!exists) {
    console.log(`Snapshots registry file not found in path ${paths.snapshotsRegistry}. Creating default...`)
    const snapshots: Snapshot[] = []
    updateSnapshots(snapshots)
    console.log(`Snapshots registry file created!`)
    return snapshots
  }
  try {
    const snapshots = JSON.parse(readFileSync(paths.snapshotsRegistry).toString())
    return snapshots as Snapshot[]
  }
  catch (err) {
    console.log(err)
    throw err
  }
}

export function updateSnapshots(snapshots: Snapshot[]) {
  writeFileSync(paths.snapshotsRegistry, JSON.stringify(snapshots, undefined, 4))
}