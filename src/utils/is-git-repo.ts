import { execSync } from 'node:child_process'
import { GIT_COMMAND_TIMEOUT_MS } from './process-timeout-config.js'

/**
 * Check if the given directory is inside a git repository
 */
export function isGitRepo(cwd: string): boolean {
  try {
    execSync('git rev-parse --git-dir', {
      cwd,
      stdio: 'ignore',
      timeout: GIT_COMMAND_TIMEOUT_MS,
    })
    return true
  } catch {
    return false
  }
}
