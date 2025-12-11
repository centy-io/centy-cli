/* eslint-disable ddd/require-spec-file */
import type { Interface } from 'node:readline'

const DEFAULT_TARGET = 'main'

/**
 * Prompt user for target branch
 * Defaults to 'main'
 */
export function promptForTargetBranch(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<string> {
  return new Promise(resolve => {
    output.write(`Enter target branch [${DEFAULT_TARGET}]: `)
    rl.question('', answer => {
      const trimmed = answer.trim()
      resolve(trimmed === '' ? DEFAULT_TARGET : trimmed)
    })
  })
}
