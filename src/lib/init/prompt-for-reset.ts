import type { Interface } from 'node:readline'
import { askYesNoAllNone } from '../../utils/ask-yes-no-all-none.js'

interface FileToReset {
  path: string
  currentHash: string
  originalHash: string
}

interface ResetDecision {
  reset: string[]
  skip: string[]
}

/**
 * Prompt user for reset decisions on modified files
 */
export async function promptForReset(
  rl: Interface,
  output: NodeJS.WritableStream,
  files: FileToReset[]
): Promise<ResetDecision> {
  const reset: string[] = []
  const skip: string[] = []
  let resetAll = false
  let skipAll = false

  for (const file of files) {
    if (skipAll) {
      skip.push(file.path)
      continue
    }
    if (resetAll) {
      reset.push(file.path)
      continue
    }

    output.write(`\n${file.path} has been modified.\n`)
    const choice = await askYesNoAllNone(rl, 'Reset to default?')

    if (choice === 'yes') {
      reset.push(file.path)
    } else if (choice === 'all') {
      resetAll = true
      reset.push(file.path)
    } else if (choice === 'none') {
      skipAll = true
      skip.push(file.path)
    } else {
      skip.push(file.path)
    }
  }

  return { reset, skip }
}
