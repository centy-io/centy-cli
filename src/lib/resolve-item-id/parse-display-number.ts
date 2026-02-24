/**
 * Parses a display number from a string identifier.
 * Returns the number if the string is a valid positive integer, otherwise undefined.
 */
export function parseDisplayNumber(id: string): number | undefined {
  return /^\d+$/.test(id) ? Number(id) : undefined
}
