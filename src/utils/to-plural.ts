/**
 * Convert a singular item type name to its plural form
 */
export function toPlural(type: string): string {
  if (type.endsWith('s')) return type
  if (type.endsWith('y')) return type.slice(0, -1) + 'ies'
  return type + 's'
}
