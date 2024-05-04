import { paths } from "~/constants"
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { AppSettings, defaultSettings } from "~/models"

export function getSettings() : AppSettings {
  const exists = existsSync(paths.settings)
  if (!exists) {
    console.log(`Settings file not found in path ${paths.settings}. Creating default...`)
    const settings = defaultSettings()
    updateSettings(settings)
    console.log(`Settings file created!`)
    return settings
  }
  try {
    const settings = JSON.parse(readFileSync(paths.settings).toString())
    return settings as AppSettings
  }
  catch (err) {
    console.log(err)
    throw err
  }
}

export function updateSettings(settings: AppSettings) {
  writeFileSync(paths.settings, JSON.stringify(settings, undefined, 4))
}