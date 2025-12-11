/* eslint-disable ddd/require-spec-file */
import type { CreatePrOptions } from '../../types/create-pr-options.js'
import { closePromptInterface } from '../../utils/close-prompt-interface.js'
import { createPromptInterface } from '../../utils/create-prompt-interface.js'
import { promptForDescription } from './prompt-for-description.js'
import { promptForSourceBranch } from './prompt-for-source-branch.js'
import { promptForTargetBranch } from './prompt-for-target-branch.js'
import { promptForTitle } from './prompt-for-title.js'

export async function gatherBasicFields(
  opts: CreatePrOptions,
  output: NodeJS.WritableStream,
  detectedBranch?: string
): Promise<{
  title: string | undefined
  description: string | undefined
  sourceBranch: string | undefined
  targetBranch: string | undefined
}> {
  let title = opts.title
  if (title === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    title = await promptForTitle(rl, output)
    closePromptInterface(rl)
  }

  let description = opts.description
  if (description === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    description = await promptForDescription(rl, output)
    closePromptInterface(rl)
  }

  let sourceBranch = opts.sourceBranch
  if (sourceBranch === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    sourceBranch = await promptForSourceBranch(rl, output, detectedBranch)
    closePromptInterface(rl)
  }

  let targetBranch = opts.targetBranch
  if (targetBranch === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    targetBranch = await promptForTargetBranch(rl, output)
    closePromptInterface(rl)
  }

  return { title, description, sourceBranch, targetBranch }
}
