import { execSync } from 'node:child_process'

/**
 * Check if the given directory is inside a git repository
 */
export function isGitRepo(cwd: string): boolean {
  try {
    execSync('git rev-parse --git-dir', { cwd, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
