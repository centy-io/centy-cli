import type { Interface } from 'node:readline'

/**
 * Prompt user for issue title
 */
export function promptForTitle(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<string> {
  return new Promise(resolve => {
    output.write('Enter issue title: ')
    rl.question('', answer => {
      resolve(answer.trim())
    })
  })
}
