import type { Interface } from 'node:readline'

type Status = 'draft' | 'open'

const STATUS_OPTIONS: readonly Status[] = ['draft', 'open'] as const

/**
 * Prompt user for PR status
 * Shows options and validates input
 */
export function promptForStatus(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<Status> {
  return new Promise(resolve => {
    output.write('Select status (draft/open) [draft]: ')
    rl.question('', answer => {
      const trimmed = answer.trim().toLowerCase()
      if (trimmed === '') {
        resolve('draft')
        return
      }
      // eslint-disable-next-line no-restricted-syntax
      if (STATUS_OPTIONS.includes(trimmed as Status)) {
        // eslint-disable-next-line no-restricted-syntax
        resolve(trimmed as Status)
        return
      }
      // Invalid input, prompt again
      output.write(`Invalid status "${answer}". `)
      resolve(promptForStatus(rl, output))
    })
  })
}
