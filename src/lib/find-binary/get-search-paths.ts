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

export function getSearchPaths(options: FindBinaryOptions): string[] {
  const { binaryName, envVar, devRepoName } = options
  const platformBinaryName = getBinaryNameForPlatform(binaryName)
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const paths: string[] = []

  // 1. Environment variable (if set)
  // eslint-disable-next-line no-restricted-syntax, security/detect-object-injection
  const envPath = process.env[envVar]
  if (envPath !== undefined) {
    paths.push(envPath)
  }

  // 2. ~/.centy/bin/ (installed via centy install)
  paths.push(join(homedir(), '.centy', 'bin', platformBinaryName))

  // 3. Same directory as CLI binary
  paths.push(join(__dirname, '..', '..', '..', platformBinaryName))

  // 4. Development path (sibling repo)
  paths.push(
    join(
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
  )

  // 5. PATH lookup (fallback)
  paths.push(`${platformBinaryName} (PATH)`)

  return paths
}
