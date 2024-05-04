import { json } from '@remix-run/node';
import { createApiError, createApiInternalError } from '~/models';
import { getSnapshots } from '~/services/snapshots';
import path from 'path'
import { paths } from '~/constants';
import fs from 'fs'
import { handleAuth } from '~/middlewares/auth';

export async function loader({params, request}: {params: {name: string}, request: Request}) {
  try {
    // Remix does not support middlewares yet
    const unauthorized = await handleAuth(request)
    if (unauthorized) return unauthorized
    
    const snapshot = getSnapshots().find(s => s.name === params.name)
    if (!snapshot) {
      return json(createApiError(404, `Snapshot ${params.name} cannot be found`), 404)
    }
    const filename = `${snapshot.name}.zip`
    const filepath = path.join(paths.snapshots, filename)
    const file = fs.readFileSync(filepath)
    return new Response(file, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/zip',
      },
    });
  }
  catch (err) {
    return createApiInternalError(err as Error)
  }
};