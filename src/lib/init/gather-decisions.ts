/* eslint-disable single-export/single-export */

import type { InitOptions } from '../../types/init-options.js'
import { closePromptInterface } from '../../utils/close-prompt-interface.js'
import { createPromptInterface } from '../../utils/create-prompt-interface.js'
import { promptForReset } from './prompt-for-reset.js'
import { promptForRestore } from './prompt-for-restore.js'
import type { FileToRestore, FileToReset } from './type-converters.js'

interface Plan {
  toRestore: FileToRestore[]
  toReset: FileToReset[]
}

export interface Decisions {
  restore: string[]
  reset: string[]
  skip: string[]
}

export async function gatherDecisions(
  plan: Plan,
  opts: InitOptions,
  output: NodeJS.WritableStream
): Promise<Decisions> {
  const decisions: Decisions = {
    restore: [],
    reset: [],
    skip: [],
  }

  if (plan.toRestore.length > 0) {
    if (opts.force === true) {
      decisions.restore = plan.toRestore.map(f => f.path)
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const restoreResult = await promptForRestore(rl, output, plan.toRestore)
      decisions.restore = restoreResult.restore
      decisions.skip.push(...restoreResult.skip)
      closePromptInterface(rl)
    }
  }

  if (plan.toReset.length > 0) {
    if (opts.force === true) {
      decisions.skip.push(...plan.toReset.map(f => f.path))
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const resetResult = await promptForReset(rl, output, plan.toReset)
      decisions.reset = resetResult.reset
      decisions.skip.push(...resetResult.skip)
      closePromptInterface(rl)
    }
  }

  return decisions
}
