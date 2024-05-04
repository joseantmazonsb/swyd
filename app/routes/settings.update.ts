import { ActionFunctionArgs, json } from "@remix-run/node";
import { ValidationError } from "yup";
import { createApiInternalError, createApiValidationError, settingsSchema } from "~/models";
import { updateSettings } from "~/services/settings";

export async function action({
  request
} : ActionFunctionArgs) {
  try {
    const data = await request.json()
    const settings = await settingsSchema.validate(data)
    updateSettings(settings)
    return json({ success: true })
  }
  catch (err) {
    if (err instanceof ValidationError) {
      return json(createApiValidationError(err))
    }
    return json(createApiInternalError(err as Error))
  }
}