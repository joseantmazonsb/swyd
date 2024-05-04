import { json } from "@remix-run/node";
import { createApiInternalError } from "~/models";
import { getCredentials } from "~/services/auth";

export function loader() {
  try {
    const credentialsExist = getCredentials() !== undefined
    return json({data: credentialsExist})
  }
  catch (e) {
    console.log((e as Error).message)
    return json(createApiInternalError(e as Error))
  }
}