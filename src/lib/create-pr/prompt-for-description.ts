/* eslint-disable ddd/require-spec-file */
import type { Interface } from 'node:readline'

/**
 * Prompt user for PR description (optional)
 */
export function promptForDescription(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<string> {
  return new Promise(resolve => {
    output.write('Enter PR description (optional, press Enter to skip): ')
    rl.question('', answer => {
      resolve(answer.trim())
    })
  })
}
