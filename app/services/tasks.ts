import { paths } from "~/constants"
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { Task } from "~/models"

export function getTasksByDevice(device: string) : Task[] {
  const tasks = getTasks()
  return tasks.filter(t => t.device === device)
}

export function getTasks() : Task[] {
  const exists = existsSync(paths.tasks)
  if (!exists) {
    console.log(`Tasks file not found in path ${paths.tasks}. Creating default...`)
    const tasks: Task[] = []
    updateTasks(tasks)
    console.log(`Tasks file created!`)
    return tasks
  }
  try {
    const tasks = JSON.parse(readFileSync(paths.tasks).toString())
    return tasks as Task[]
  }
  catch (err) {
    console.log(err)
    throw err
  }
}

export function updateTasks(tasks: Task[]) {
  writeFileSync(paths.tasks, JSON.stringify(tasks, undefined, 4))
}