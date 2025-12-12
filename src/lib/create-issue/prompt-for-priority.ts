import type { Interface } from 'node:readline'

type Priority = 'low' | 'medium' | 'high'

const PRIORITY_OPTIONS: readonly Priority[] = ['low', 'medium', 'high'] as const

/**
 * Prompt user for issue priority
 * Shows options and validates input
 */
export function promptForPriority(
  rl: Interface,
  output: NodeJS.WritableStream
): Promise<Priority> {
  return new Promise(resolve => {
    output.write('Select priority (low/medium/high) [medium]: ')
    rl.question('', answer => {
      const trimmed = answer.trim().toLowerCase()
      if (trimmed === '') {
        resolve('medium')
        return
      }
      // eslint-disable-next-line no-restricted-syntax
      if (PRIORITY_OPTIONS.includes(trimmed as Priority)) {
        // eslint-disable-next-line no-restricted-syntax
        resolve(trimmed as Priority)
        return
      }
      // Invalid input, prompt again
      output.write(`Invalid priority "${answer}". `)
      resolve(promptForPriority(rl, output))
    })
  })
}
