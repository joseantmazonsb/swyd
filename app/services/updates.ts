import { paths } from "~/constants"
import { readFileSync, existsSync, writeFileSync, rmSync } from 'fs'
import { Update } from "~/models"

export function getUpdates() : Update | undefined {
  const exists = existsSync(paths.update)
  if (!exists) {
    return undefined
  }
  try {
    const updates = JSON.parse(readFileSync(paths.update).toString())
    return updates as Update
  }
  catch (err) {
    console.log(err)
    throw err
  }
}

export function setUpdates(update: Update) {
  writeFileSync(paths.update, JSON.stringify(update, undefined, 4))
}
