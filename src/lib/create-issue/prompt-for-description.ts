import type { Interface } from 'node:readline'

/**
 * Prompt user for issue description
 */
export function promptForDescription(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<string> {
  return new Promise(resolve => {
    output.write('Enter issue description (optional): ')
    rl.question('', answer => {
      resolve(answer.trim())
    })
  })
}
