/* eslint-disable single-export/single-export */
import { homedir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import { daemonListProjects } from '../daemon/daemon-list-projects.js'

/**
 * Check if a string looks like a filesystem path (rather than a project name)
 */
function isPath(input: string): boolean {
  // Contains path separators
  if (input.includes('/') || input.includes('\\')) {
    return true
  }
  // Starts with tilde (home directory)
  if (input.startsWith('~')) {
    return true
  }
  // Is an absolute path (Windows drive letter or Unix root)
  if (isAbsolute(input)) {
    return true
  }
  // Starts with a dot (relative path like . or ..)
  if (input.startsWith('.')) {
    return true
  }
  return false
}

/**
 * Expand tilde to home directory
 */
function expandTilde(input: string): string {
  if (input.startsWith('~')) {
    return join(homedir(), input.slice(1))
  }
  return input
}

export class ProjectNotFoundError extends Error {
  constructor(projectName: string) {
    super(
      `Project "${projectName}" not found. Use 'centy list projects' to see available projects.`
    )
    this.name = 'ProjectNotFoundError'
  }
}

/**
 * Resolve a project argument to a filesystem path.
 *
 * The input can be:
 * - undefined: uses CENTY_CWD env var or process.cwd()
 * - A filesystem path: returned as-is (with tilde expansion)
 * - A project name: looked up via daemon to get the path
 *
 * @param projectArg - The project name or path from the --project flag
 * @returns The resolved filesystem path
 * @throws Error if project name is not found
 */
export async function resolveProjectPath(
  projectArg: string | undefined
): Promise<string> {
  // 1. If no arg provided, use env var or cwd
  // eslint-disable-next-line no-restricted-syntax
  const input = projectArg ?? process.env['CENTY_CWD'] ?? process.cwd()

  // 2. If it looks like a path, return it (with tilde expansion)
  if (isPath(input)) {
    return expandTilde(input)
  }

  // 3. Otherwise treat as project name - look up in daemon
  const { projects } = await daemonListProjects({
    includeUninitialized: true,
    includeStale: false,
  })

  const match = projects.find(p => p.name.toLowerCase() === input.toLowerCase())

  if (match === undefined) {
    throw new ProjectNotFoundError(input)
  }

  return match.path
}
