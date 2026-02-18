/**
 * Parse custom field key=value pairs into an object.
 */
export function parseCustomFields(
  fields: string[] | undefined
): Record<string, string> {
  const result: Record<string, string> = {}
  if (fields === undefined) return result
  for (const field of fields) {
    const eqIndex = field.indexOf('=')
    if (eqIndex === -1) continue
    const key = field.slice(0, eqIndex)
    const value = field.slice(eqIndex + 1)
    // eslint-disable-next-line security/detect-object-injection
    result[key] = value
  }
  return result
}
