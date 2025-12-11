/* eslint-disable ddd/require-spec-file */
import type { Interface } from 'node:readline'

/**
 * Prompt user for reviewers
 * Returns comma-separated reviewer names as an array
 */
export function promptForReviewers(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<string[]> {
  return new Promise(resolve => {
    output.write('Enter reviewers (comma-separated, optional): ')
    rl.question('', answer => {
      const trimmed = answer.trim()
      if (trimmed === '') {
        resolve([])
        return
      }
      const reviewers = trimmed
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
      resolve(reviewers)
    })
  })
}
