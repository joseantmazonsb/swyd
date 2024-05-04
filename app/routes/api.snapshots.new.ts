import { LoaderFunctionArgs, json } from "@remix-run/node";
import { ValidationError } from "yup";
import { Snapshot, createApiInternalError, createApiValidationError, snapshotsSchema } from "~/models";
import { getSnapshots, updateSnapshots } from "~/services/snapshots";
import { paths } from "~/constants";
import AdmZip from 'adm-zip'
import { handleAuth } from "~/middlewares/auth";

/**
 * Create backup file using snapshot info
 * @param info Snapshot info
 */
async function createSnapshot(info: Snapshot) {
  const path =`${paths.snapshots}/${info.name}.zip`
  console.log(`Creating snapshot in ${path}`)
  const zip = new AdmZip()
  zip.addLocalFile(paths.devices)
  zip.addLocalFile(paths.settings)
  zip.addLocalFile(paths.tasks)
  await zip.writeZipPromise(path)
  console.log(`Snapshot created in ${path}`)
}

export async function action({request}: LoaderFunctionArgs) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const body = await request.json() as Snapshot
    body.creationDate = new Date(Date.now())
    console.log(body)
    const snapshot = snapshotsSchema.validateSync(body)
    const snapshots = getSnapshots()
    if (snapshots.find(s => s.name === snapshot.name)) {
      throw new ValidationError('A snapshot with the same name already exists', 'name', 'name')
    }
    await createSnapshot(snapshot)
    console.log('Updating snapshots registry...')
    snapshots.push(snapshot)
    updateSnapshots(snapshots)
    console.log('Snapshots registry updated', snapshots)
    return json({data: snapshot})
  }
  catch (e) {
    const err = e as Error
    if (err instanceof ValidationError) {
      return json(createApiValidationError(err), 400)
    }
    return json(createApiInternalError(err), 400)
  }
}