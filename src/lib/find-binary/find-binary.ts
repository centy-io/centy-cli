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
  const envPath: string | undefined = Reflect.get(process.env, envVar)

  if (envPath !== undefined && existsSync(envPath)) {
    return envPath
  }

  // 2. Check ~/.centy/bin/ (installed via centy install)
  const userInstallPath = join(homedir(), '.centy', 'bin', platformBinaryName)

  if (existsSync(userInstallPath)) {
    return userInstallPath
  }

  // 3. Check same directory as CLI binary
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const sameDirPath = join(__dirname, '..', '..', '..', platformBinaryName)

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

  if (existsSync(devPath)) {
    return devPath
  }

  // 5. Fallback to PATH lookup (will be resolved by spawn)
  return platformBinaryName
}
