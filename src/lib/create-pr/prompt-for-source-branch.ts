/* eslint-disable ddd/require-spec-file */
import type { Interface } from 'node:readline'

/**
 * Prompt user for source branch
 * Shows the auto-detected branch as default
 */
export function promptForSourceBranch(
  rl: Interface,
  output: NodeJS.WritableStream,
  detectedBranch?: string
): Promise<string> {
  return new Promise(resolve => {
    const defaultHint = detectedBranch ? ` [${detectedBranch}]` : ''
    output.write(`Enter source branch${defaultHint}: `)
    rl.question('', answer => {
      const trimmed = answer.trim()
      if (trimmed === '' && detectedBranch) {
        resolve(detectedBranch)
      } else {
        resolve(trimmed)
      }
    })
  })
}
