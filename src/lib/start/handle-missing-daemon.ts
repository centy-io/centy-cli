import { execSync } from 'node:child_process'
import {
  INSTALL_TIMEOUT_MS,
  PROMPT_TIMEOUT_MS,
} from '../../utils/process-timeout-config.js'
import { ProcessTimeoutError } from '../../utils/process-timeout-error.js'
import { promptForInstall } from './prompt-for-install.js'

export async function handleMissingDaemon(
  daemonPath: string,
  autoYes: boolean,
  installCmd: string,
  log: (msg: string) => void
): Promise<boolean> {
  let shouldInstall = autoYes

  if (!autoYes) {
    if (!process.stdin.isTTY) {
      log('Daemon not found and running in non-interactive mode.')
      log(`Use --yes flag to auto-install, or install using: ${installCmd}`)
      return false
    }

    const promptPromise = promptForInstall({
      output: process.stdout,
      daemonPath,
    })
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const operation = 'install prompt'
        reject(new ProcessTimeoutError(operation, PROMPT_TIMEOUT_MS))
      }, PROMPT_TIMEOUT_MS)
    })
    shouldInstall = await Promise.race([promptPromise, timeoutPromise])
  }

  if (!shouldInstall) {
    return false
  }

  log('\nInstalling daemon...\n')

  execSync(installCmd, {
    stdio: 'inherit',
    timeout: INSTALL_TIMEOUT_MS,
    env: { ...process.env, BINARIES: 'centy-daemon' },
  })

  log('\nDaemon installed successfully\n')
  return true
}
