import { InferType, ValidationError, boolean, date, number, object, ref, string } from "yup"
import { regex } from "~/utils"
import { toDictionary } from "./services/validation"

export type DeviceStatus = 'online' | 'offline'

export const deviceTypes = ['server', 'desktop', 'router', 'other'] as const
export type DeviceType = typeof deviceTypes[number]

export const deviceSchema = object({
  id: string().required(),
  name: string().required().min(2).max(32),
  description: string(),
  host: string().required(),
  mac: string().required().matches(new RegExp(regex.mac.source), 'Must be a valid MAC address'),
  type: string().required().oneOf(deviceTypes),
  ssh: object({
    user: string().notRequired()
  })
})

export type Device = InferType<typeof deviceSchema>

export type ApiError = {
  code: number
  message: string
}

export function createApiError(code: number, message: string) {
  return {
    code,
    message
  }
}

export function createApiInternalError(err: Error) {
  return {
    code: 500,
    message: err.message
  }
}

export function createApiValidationError(err: ValidationError) {
  return {
    code: 400,
    message: err.message,
    errors: toDictionary(err)
  }
}

export type ApiOk<T> = {
  data: T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isApiError(obj: any): obj is ApiError {
  return obj.code && obj.message
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isApiOk<T>(obj: any): obj is ApiOk<T> {
  return obj.data !== undefined
}

export type ApiValidationError = ApiError & {
  errors: {[field: string]: string}
}

export const settingsSchema = object({
  ssh: object({
    strictHostKeyChecking: boolean().required(),
    defaultUser: string().required()
  }).required(),
  ping: object({
    attempts: number().min(1).required()
  }).required()
})

export type AppSettings = InferType<typeof settingsSchema>

export function defaultSettings(): AppSettings {
  return {
    ssh: {
      strictHostKeyChecking: false,
      defaultUser: 'root'
    },
    ping: {
      attempts: 2
    }
  }
}

export const tasksSchema = object().shape({
  device: string().required(),
  do: string().required().oneOf(['turn-on', 'turn-off'] as const),
  when: object({
    idle: string().matches(
      /^(\d{1,2}m)|(\d{1,2}h)$/,
      'Invalid idle format. Please use a valid format like {number}m for minutes or {number}h for hours.'
    ),
    time: string().matches(
      /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
      'Invalid time format. Please use HH:MM format.'
    )
  }).test({
    test: (value) => !!value.idle !== !!value.time,
    name: 'exclusive',
    message: 'Either idle or timestamp is required, but not both',
    exclusive: true
  }).required('Either idle or timestamp is required, but not both')
})

export type Task = InferType<typeof tasksSchema>

export const snapshotsSchema = object({
  creationDate: date().required(),
  name: string().required().min(2),
  description: string()
})

export type Snapshot = InferType<typeof snapshotsSchema>

export const credentialsSchema = object({
  username: string().required().min(2),
  password: string().required().min(6),
  rememberMe: boolean()
})

export type Credentials = InferType<typeof credentialsSchema>

export type ServerCredentials = Credentials & {
  id: string
}

export const changePasswordSchema = object({
  currentPassword: string().required().min(6),
  newPassword: string().required().min(6),
  confirmPassword: string().required().min(6).oneOf([ref('newPassword')], 'Passwords must match')
})

export type ChangePasswordType = InferType<typeof changePasswordSchema>
