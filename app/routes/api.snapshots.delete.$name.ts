import { json } from "@remix-run/node";
import { createApiError, createApiInternalError } from "~/models";
import { getSnapshots, updateSnapshots } from "~/services/snapshots";
import { paths } from "~/constants";
import { remove } from "~/utils";
import fs from 'fs'
import path from 'path'
import { handleAuth } from "~/middlewares/auth";

export async function action({params, request}: {params: {name: string}, request: Request}) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    let snapshots = getSnapshots()
    const snapshot = snapshots.find(s => s.name === params.name)
    if (!snapshot) {
      return json(createApiError(400, `Snapshot '${params.name}' cannot be found`), 400)
    }
    console.log(`Removing snapshot '${snapshot.name}'...`)
    fs.rmSync(`${path.join(paths.snapshots, snapshot.name)}.zip`)
    snapshots = remove(snapshot, snapshots)
    updateSnapshots(snapshots)
    console.log('Snapshots registry updated', snapshots)
    return json({data: snapshot})
  }
  catch (e) {
    const err = e as Error
    return json(createApiInternalError(err))
  }
}