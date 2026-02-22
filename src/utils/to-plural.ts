import pluralize from 'pluralize'

/**
 * Convert a singular item type name to its plural form.
 */
export function toPlural(type: string): string {
  return pluralize(type)
}
