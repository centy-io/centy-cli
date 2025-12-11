/* eslint-disable ddd/require-spec-file */
import type { Interface } from 'node:readline'

/**
 * Prompt user for linked issue numbers
 * Returns comma-separated issue IDs as an array
 */
export function promptForLinkedIssues(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<string[]> {
  return new Promise(resolve => {
    output.write('Enter linked issue numbers (comma-separated, optional): ')
    rl.question('', answer => {
      const trimmed = answer.trim()
      if (trimmed === '') {
        resolve([])
        return
      }
      const issues = trimmed
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
      resolve(issues)
    })
  })
}
