import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

interface FindBinaryOptions {
  binaryName: string
  envVar: string
  devRepoName: string
}

function getBinaryNameForPlatform(baseName: string): string {
  return process.platform === 'win32' ? `${baseName}.exe` : baseName
}

export function findBinary(options: FindBinaryOptions): string {
  const { binaryName, envVar, devRepoName } = options
  const platformBinaryName = getBinaryNameForPlatform(binaryName)

  // 1. Check environment variable
  // eslint-disable-next-line no-restricted-syntax, security/detect-object-injection
  const envPath = process.env[envVar]
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (envPath !== undefined && existsSync(envPath)) {
    return envPath
  }

  // 2. Check ~/.centy/bin/ (installed via centy install)
  const userInstallPath = join(homedir(), '.centy', 'bin', platformBinaryName)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (existsSync(userInstallPath)) {
    return userInstallPath
  }

  // 3. Check same directory as CLI binary
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const sameDirPath = join(__dirname, '..', '..', '..', platformBinaryName)
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
    devRepoName,
    'target',
    'release',
    platformBinaryName
  )
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (existsSync(devPath)) {
    return devPath
  }

  // 5. Fallback to PATH lookup (will be resolved by spawn)
  return platformBinaryName
}
