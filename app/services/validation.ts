import { ValidationError } from "yup"

/**
 * Convert a validation error into a dictionary containing all errors sorted by their paths.
 * @param e Validation error
 * @returns A dictionary
 */
export function toDictionary(e: ValidationError) {
  const dict: Record<string, string[]> = {}
  const errors = (e.inner && e.inner.length) ? e.inner : [e]
  errors.forEach(ve => {
    const path = ve.path!
    if (!(path in dict)) {
      dict[path] = []
    }
    dict[path] = [...dict[path], ...ve.errors]
  })
  return dict
}