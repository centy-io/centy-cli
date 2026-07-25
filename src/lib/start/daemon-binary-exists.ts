import { existsSync } from 'node:fs'

const DAEMON_BINARY_NAME = 'centy-daemon'

export function daemonBinaryExists(path: string): boolean {
  // PATH lookup case - assume binary is accessible
  if (path === DAEMON_BINARY_NAME) {
    return true
  }

  return existsSync(path)
}
