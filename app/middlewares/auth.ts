import { json } from "@remix-run/node";
import jwt from 'jsonwebtoken'
import { privateKey } from "~/constants";
import { createApiError } from "~/models";

export async function handleAuth(request: Request) {
  const token = request.headers.get("X-Authorization")
  if (!token) {
    return json(createApiError(401, 'Unauthorized'), 401)
  }
  try {
    jwt.verify(token, privateKey)
  }
  catch(err) {
    return json(createApiError(401, (err as Error).message), 401)
  }
}