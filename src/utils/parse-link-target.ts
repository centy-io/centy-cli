/**
 * Parse a link target string in the format type:id
 */
export function parseLinkTarget(target: string): [string, string] | undefined {
  const colonIndex = target.indexOf(':')
  if (colonIndex === -1) {
    return undefined
  }
  const type = target.slice(0, colonIndex)
  const id = target.slice(colonIndex + 1)
  if (type === '' || id === '') {
    return undefined
  }
  return [type, id]
}
