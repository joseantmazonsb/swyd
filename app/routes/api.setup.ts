import { json } from "@remix-run/node";
import { createApiInternalError } from "~/models";
import { getCredentials } from "~/services/auth";
import { oidcEnabled } from '~/services/oidc.server';

export function loader() {
  try {
    const credentialsExist = getCredentials() !== undefined
    return json({data: credentialsExist || oidcEnabled, oidc: oidcEnabled, local: credentialsExist})
  }
  catch (e) {
    console.log((e as Error).message)
    return json(createApiInternalError(e as Error))
  }
}
