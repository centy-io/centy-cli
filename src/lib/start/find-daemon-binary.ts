import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const DAEMON_BINARY_NAME = 'centy-daemon'

function getBinaryName(): string {
  return process.platform === 'win32'
    ? `${DAEMON_BINARY_NAME}.exe`
    : DAEMON_BINARY_NAME
}

export function findDaemonBinary(): string {
  // 1. Check CENTY_DAEMON_PATH environment variable
  // eslint-disable-next-line no-restricted-syntax
  const envPath = process.env['CENTY_DAEMON_PATH']
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (envPath !== undefined && existsSync(envPath)) {
    return envPath
  }

  // 2. Check ~/.centy/bin/ (installed via centy install daemon)
  const binaryName = getBinaryName()
  const userInstallPath = join(homedir(), '.centy', 'bin', binaryName)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (existsSync(userInstallPath)) {
    return userInstallPath
  }

  // 3. Check same directory as CLI binary
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const sameDirPath = join(__dirname, '..', '..', '..', binaryName)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
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
    binaryName
  )
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (existsSync(devPath)) {
    return devPath
  }

  // 5. Fallback to PATH lookup (will be resolved by spawn)
  return binaryName
}
