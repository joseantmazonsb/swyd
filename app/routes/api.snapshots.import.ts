import { LoaderFunctionArgs, json } from "@remix-run/node";
import { ValidationError } from "yup";
import { createApiError, createApiInternalError, createApiValidationError } from "~/models";
import { getSnapshots, updateSnapshots } from "~/services/snapshots";
import { paths } from "~/constants";
import AdmZip from 'adm-zip'
import path from 'path'
import { handleAuth } from "~/middlewares/auth";

export async function action({request}: LoaderFunctionArgs) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const body = await request.formData()
    const filename = body.get('filename') as string
    const data = body.get('data') as Blob
    const buffer = Buffer.from(await data.arrayBuffer())
    const zip = new AdmZip(buffer)
    if (zip.getEntryCount() !== 3) {
      return json(createApiError(400, 'Invalid snapshot format'), 400)
    }
    const entries = [path.basename(paths.devices), path.basename(paths.settings), path.basename(paths.tasks)]
    console.log(entries)
    for (let e of zip.getEntries()) {
      if (!entries.includes(e.entryName)) {
        return json(createApiError(400, 'Invalid snapshot format'), 400)
      }
      try {
        if (!e.getData().toJSON()) {
          return json(createApiError(400, 'Invalid snapshot format'), 400)
        }
      }
      catch (err) {
        console.log(err)
        return json(createApiError(400, 'Invalid snapshot format'), 400)
      }
    }
    const snapshot = {
      name: path.parse(filename).name,
      creationDate: new Date(Date.now())
    }
    console.log('Storing imported snapshot...')
    const snapshots = getSnapshots()
    if (snapshots.find(s => s.name === snapshot.name)) {
      return json(createApiError(409, `A snapshot named '${snapshot.name}' already exists!`), 409)
    }
    console.log('Updating snapshots registry...')
    zip.writeZip(path.join(paths.snapshots, filename))
    snapshots.push(snapshot)
    updateSnapshots(snapshots)
    console.log('Snapshots registry updated', snapshots)
    return json({data: snapshot})
  }
  catch (e) {
    const err = e as Error
    if (err instanceof ValidationError) {
      return json(createApiValidationError(err))
    }
    return json(createApiInternalError(err))
  }
}