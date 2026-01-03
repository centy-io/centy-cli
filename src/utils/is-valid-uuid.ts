import { validate } from 'uuid'

/**
 * Validates if a string is a valid UUID format
 */
export function isValidUuid(id: string): boolean {
  return validate(id)
}
