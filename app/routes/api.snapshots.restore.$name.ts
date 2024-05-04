import { json } from "@remix-run/node";
import { createApiError, createApiInternalError } from "~/models";
import { getSnapshots } from "~/services/snapshots";
import { paths } from "~/constants";
import AdmZip from 'adm-zip'
import path from 'path'
import { handleAuth } from "~/middlewares/auth";

export async function action({params, request}: {params: {name: string}, request: Request}) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const snapshots = getSnapshots()
    const snapshot = snapshots.find(s => s.name === params.name)
    if (!snapshot) {
      return json(createApiError(400, `Snapshot '${params.name}' cannot be found`), 400)
    }
    console.log(`Restoring snapshot '${snapshot.name}'...`)
    const archive = new AdmZip(`${path.join(paths.snapshots, snapshot.name)}.zip`)
    archive.extractAllTo(paths.root, true)
    console.log(`Snapshot '${snapshot.name}' was successfully restored!`, snapshots)
    return json({})
  }
  catch (e) {
    const err = e as Error
    return json(createApiInternalError(err))
  }
}