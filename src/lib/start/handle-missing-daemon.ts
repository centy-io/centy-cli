import { execSync } from 'node:child_process'
import { closePromptInterface } from '../../utils/close-prompt-interface.js'
import { createPromptInterface } from '../../utils/create-prompt-interface.js'
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

    const rl = createPromptInterface()
    try {
      shouldInstall = await promptForInstall({
        rl,
        output: process.stdout,
        daemonPath,
      })
    } finally {
      closePromptInterface(rl)
    }
  }

  if (!shouldInstall) {
    return false
  }

  log('\nInstalling daemon...\n')

  execSync(installCmd, {
    stdio: 'inherit',
    env: { ...process.env, BINARIES: 'centy-daemon' },
  })

  log('\nDaemon installed successfully\n')
  return true
}
