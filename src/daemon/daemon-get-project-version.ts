/**
 * Project version status utilities
 * Multiple exports allowed for related types and functions
 */
import { lt, valid } from 'semver'
import { daemonGetDaemonInfo } from './daemon-get-daemon-info.js'
import { daemonGetManifest } from './daemon-get-manifest.js'

export interface ProjectVersionStatus {
  projectVersion: string
  daemonVersion: string
  isProjectBehind: boolean
}

/**
 * Compare two semver strings.
 * Returns true if `a` is strictly less than `b`, false if either is invalid.
 */
export function isSemverBehind(a: string, b: string): boolean {
  if (valid(a) === null || valid(b) === null) return false
  return lt(a, b)
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
