import type { Interface } from 'node:readline'

/**
 * Prompt user for PR title
 */
export function promptForTitle(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<string> {
  return new Promise(resolve => {
    output.write('Enter PR title: ')
    rl.question('', answer => {
      resolve(answer.trim())
    })
  })
}
