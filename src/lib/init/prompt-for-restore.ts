import type { Interface } from 'node:readline'
import { askYesNoAllNone } from '../../utils/ask-yes-no-all-none.js'

interface FileToRestore {
  path: string
  wasInManifest: boolean
}

interface RestoreDecision {
  restore: string[]
  skip: string[]
}

/**
 * Prompt user for restore decisions on deleted files
 */
export async function promptForRestore(
  rl: Interface,
  output: NodeJS.WritableStream,
  files: FileToRestore[]
): Promise<RestoreDecision> {
  const restore: string[] = []
  const skip: string[] = []
  let restoreAll = false
  let skipAll = false

  for (const file of files) {
    if (skipAll) {
      skip.push(file.path)
      continue
    }
    if (restoreAll) {
      restore.push(file.path)
      continue
    }

    output.write(`\n${file.path} was deleted.\n`)
    const choice = await askYesNoAllNone(rl, 'Restore?')

    if (choice === 'yes') {
      restore.push(file.path)
    } else if (choice === 'all') {
      restoreAll = true
      restore.push(file.path)
    } else if (choice === 'none') {
      skipAll = true
      skip.push(file.path)
    } else {
      skip.push(file.path)
    }
  }

  return { restore, skip }
}
