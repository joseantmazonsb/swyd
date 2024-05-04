import { ActionFunctionArgs, json } from "@remix-run/node";
import { paths } from "~/constants";
import { handleAuth } from "~/middlewares/auth";
import { createApiInternalError } from "~/models";
import { getSnapshots, updateSnapshots } from "~/services/snapshots";
import { remove } from "~/utils";
import snapshots from "./snapshots";
import fs from 'fs'
import path from 'path'

export async function action({request}: ActionFunctionArgs) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    const names = await request.json() as string[]
    console.log(`Removing snapshots ${names.join(', ')}...`)
    const snapshots = getSnapshots()
    const removed: string[] = []
    for (const name of names) {
      const snapshot = snapshots.find(s => s.name === name)
      if (!snapshot) {
        const msg = `Snapshot ${name} not found: skipping...`
        console.log(msg)
        continue
      }
      console.log(snapshot)
      fs.rmSync(`${path.join(paths.snapshots, snapshot.name)}.zip`)
      remove(snapshot, snapshots)
      removed.push(name)
    }
    updateSnapshots(snapshots)
    console.log('Snapshots registry updated', snapshots)
    return json({data: removed})
  }
  catch (e) {
    const err = e as Error
    return json(createApiInternalError(err))
  }
}