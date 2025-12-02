import type { InitResult } from '../../types/init-result.js'

/**
 * Output a summary of the init operation
 */
export function outputSummary(
  output: NodeJS.WritableStream,
  result: InitResult
): void {
  output.write('\n')

  for (const path of result.created) {
    output.write(`  Created ${path}\n`)
  }

  for (const path of result.restored) {
    output.write(`  Restored ${path}\n`)
  }

  for (const path of result.reset) {
    output.write(`  Reset ${path}\n`)
  }

  for (const path of result.skipped) {
    output.write(`  Skipped ${path}\n`)
  }

  if (result.userFiles.length > 0) {
    output.write('\nUser files (left untouched):\n')
    for (const path of result.userFiles) {
      output.write(`  ${path}\n`)
    }
  }

  const total =
    result.created.length + result.restored.length + result.reset.length
  output.write(
    `\nSuccessfully initialized .centy folder with ${total} managed items.\n`
  )
}
