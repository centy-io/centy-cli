/* eslint-disable single-export/single-export, security/detect-unsafe-regex */

/**
 * Check if a version string is a prerelease version.
 * Prerelease versions contain a hyphen after the version number.
 * Examples: "0.2.0-alpha.9", "1.0.0-beta.1", "2.0.0-rc.1"
 */
export function isPrerelease(version: string): boolean {
  return version.includes('-')
}

/**
 * Parse a version string into its components for comparison.
 * Handles both stable (1.2.3) and prerelease (1.2.3-alpha.4) versions.
 */
interface ParsedVersion {
  major: number
  minor: number
  patch: number
  prerelease: string | undefined
  prereleaseNum: number | undefined
}

function parseVersion(version: string): ParsedVersion | undefined {
  // Match: major.minor.patch[-prerelease.num]
  // This regex is safe: anchored, uses non-greedy patterns, and has bounded repetition
  const versionRegex =
    /^(\d{1,10})\.(\d{1,10})\.(\d{1,10})(?:-([a-zA-Z]+)(?:\.(\d{1,10}))?)?$/
  const match = version.match(versionRegex)
  if (match === null) {
    return undefined
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
    prereleaseNum: match[5] !== undefined ? parseInt(match[5], 10) : undefined,
  }
}

/**
 * Compare two version strings.
 * Returns:
 *  - positive if v1 > v2
 *  - negative if v1 < v2
 *  - 0 if equal
 *
 * Note: A stable version is considered greater than a prerelease of the same base version.
 * e.g., 1.0.0 > 1.0.0-alpha.1
 */
export function compareVersions(v1: string, v2: string): number {
  const p1 = parseVersion(v1)
  const p2 = parseVersion(v2)

  if (p1 === undefined || p2 === undefined) {
    return v1.localeCompare(v2)
  }

  // Compare major.minor.patch
  if (p1.major !== p2.major) return p1.major - p2.major
  if (p1.minor !== p2.minor) return p1.minor - p2.minor
  if (p1.patch !== p2.patch) return p1.patch - p2.patch

  // Both stable = equal at this point
  if (p1.prerelease === undefined && p2.prerelease === undefined) return 0

  // Stable > prerelease
  if (p1.prerelease === undefined) return 1
  if (p2.prerelease === undefined) return -1

  // Compare prerelease tags (alpha < beta < rc)
  const prereleaseOrder: Record<string, number> = {
    alpha: 1,
    beta: 2,
    rc: 3,
  }
  const order1 =
    prereleaseOrder[p1.prerelease] !== undefined
      ? prereleaseOrder[p1.prerelease]
      : 0
  const order2 =
    prereleaseOrder[p2.prerelease] !== undefined
      ? prereleaseOrder[p2.prerelease]
      : 0

  if (order1 !== order2) return order1 - order2

  // Compare prerelease numbers
  const num1 = p1.prereleaseNum !== undefined ? p1.prereleaseNum : 0
  const num2 = p2.prereleaseNum !== undefined ? p2.prereleaseNum : 0
  return num1 - num2
}

/**
 * Check if there's a newer prerelease available given the current version.
 */
export function isNewerVersion(current: string, available: string): boolean {
  return compareVersions(available, current) > 0
}
