import { askYesNo } from '../../utils/ask-yes-no.js'

interface PromptForInstallOptions {
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
  const { output, daemonPath } = options

  output.write(`\nDaemon not found at: ${daemonPath}\n`)
  output.write('The daemon binary is required to run centy.\n\n')

  return askYesNo('Install daemon now?', false)
}
