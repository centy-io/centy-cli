/* eslint-disable single-export/single-export */
/**
 * Project version status utilities
 * Multiple exports allowed for related types and functions
 */
import { daemonGetDaemonInfo } from './daemon-get-daemon-info.js'
import { daemonGetManifest } from './daemon-get-manifest.js'

export interface ProjectVersionStatus {
  projectVersion: string
  daemonVersion: string
  isProjectBehind: boolean
}

/**
 * Parse a semver string into [major, minor, patch] numbers.
 * Returns null if the string is not a valid semver.
 */
function parseSemver(version: string): [number, number, number] | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/**
 * Compare two semver strings.
 * Returns true if `a` is strictly less than `b`.
 */
export function isSemverBehind(a: string, b: string): boolean {
  const parsedA = parseSemver(a)
  const parsedB = parseSemver(b)
  if (parsedA === null || parsedB === null) return false
  const [aMajor, aMinor, aPatch] = parsedA
  const [bMajor, bMinor, bPatch] = parsedB
  if (aMajor !== bMajor) return aMajor < bMajor
  if (aMinor !== bMinor) return aMinor < bMinor
  return aPatch < bPatch
}

// Module-level cache to avoid repeated daemon calls within a process
const versionStatusCache = new Map<string, ProjectVersionStatus>()

/**
 * Get the version status of a project relative to the running daemon.
 * Returns null if the project is not initialized or if an error occurs.
 *
 * Results are cached per project path to avoid repeated daemon calls.
 */
export async function getProjectVersionStatus(
  projectPath: string
): Promise<ProjectVersionStatus | null> {
  const cached = versionStatusCache.get(projectPath)
  if (cached !== undefined) return cached

  try {
    const [manifest, daemonInfo] = await Promise.all([
      daemonGetManifest({ projectPath }),
      daemonGetDaemonInfo({}),
    ])

    const projectVersion = manifest.centyVersion
    const daemonVersion = daemonInfo.version

    // Skip comparison if project has no version set
    if (!projectVersion) return null

    const status: ProjectVersionStatus = {
      projectVersion,
      daemonVersion,
      isProjectBehind: isSemverBehind(projectVersion, daemonVersion),
    }

    versionStatusCache.set(projectPath, status)
    return status
  } catch {
    // Silently ignore errors (project not initialized, daemon unavailable, etc.)
    return null
  }
}
