import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const DAEMON_BINARY_NAME = 'centy-daemon'

export function findDaemonBinary(): string {
  // 1. Check CENTY_DAEMON_PATH environment variable
  const envPath = process.env['CENTY_DAEMON_PATH']
  if (envPath !== undefined && existsSync(envPath)) {
    return envPath
  }

  // 2. Check ~/.centy/bin/ (installed via centy install daemon)
  const userInstallPath = join(homedir(), '.centy', 'bin', DAEMON_BINARY_NAME)
  if (existsSync(userInstallPath)) {
    return userInstallPath
  }

  // 3. Check same directory as CLI binary
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const sameDirPath = join(__dirname, '..', '..', '..', DAEMON_BINARY_NAME)
  if (existsSync(sameDirPath)) {
    return sameDirPath
  }

  // 4. Check development path (sibling repo)
  const devPath = join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'centy-daemon',
    'target',
    'release',
    DAEMON_BINARY_NAME
  )
  if (existsSync(devPath)) {
    return devPath
  }

  // 5. Fallback to PATH lookup (will be resolved by spawn)
  return DAEMON_BINARY_NAME
}
