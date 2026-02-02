/* eslint-disable security/detect-non-literal-fs-filename */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { getInstallDir } from './get-install-dir.js'
import { getBinaryFileName } from './platform.js'

export function getInstalledDaemonVersion(): string | undefined {
  const installDir = getInstallDir()
  const binaryName = getBinaryFileName('centy-daemon')
  const binaryPath = join(installDir, binaryName)

  if (!existsSync(binaryPath)) {
    return undefined
  }

  try {
    const output = execSync(`"${binaryPath}" --version`, {
      encoding: 'utf-8',
      timeout: 5000,
    })
    // Expected format: "centy-daemon 0.2.0-alpha.9" or "centy-daemon 0.2.0"
    const match = output.match(/centy-daemon\s+(\S+)/)
    return match !== null ? match[1] : undefined
  } catch {
    return undefined
  }
}
