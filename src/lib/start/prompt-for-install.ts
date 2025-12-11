import type { Interface } from 'node:readline'
import { askYesNo } from '../../utils/ask-yes-no.js'

interface PromptForInstallOptions {
  rl: Interface
  output: NodeJS.WritableStream
  daemonPath: string
}

/**
 * Prompt user to install missing daemon
 * @returns true if user wants to install, false otherwise
 */
export async function promptForInstall(
  options: PromptForInstallOptions
): Promise<boolean> {
  const { rl, output, daemonPath } = options

  output.write(`\nDaemon not found at: ${daemonPath}\n`)
  output.write('The daemon binary is required to run centy.\n\n')

  return askYesNo(rl, 'Install daemon now?', false)
}
