import type { CreatePrOptions } from '../../types/create-pr-options.js'
import { closePromptInterface } from '../../utils/close-prompt-interface.js'
import { createPromptInterface } from '../../utils/create-prompt-interface.js'
import { promptForLinkedIssues } from './prompt-for-linked-issues.js'
import { promptForPriority } from './prompt-for-priority.js'
import { promptForReviewers } from './prompt-for-reviewers.js'
import { promptForStatus } from './prompt-for-status.js'

type Priority = 'low' | 'medium' | 'high'
type Status = 'draft' | 'open'

export async function gatherMetadataFields(
  opts: CreatePrOptions,
  output: NodeJS.WritableStream
): Promise<{
  linkedIssues: string[] | undefined
  reviewers: string[] | undefined
  priority: Priority
  status: Status
}> {
  let linkedIssues = opts.linkedIssues
  if (linkedIssues === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    linkedIssues = await promptForLinkedIssues(rl, output)
    closePromptInterface(rl)
  }

  let reviewers = opts.reviewers
  if (reviewers === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    reviewers = await promptForReviewers(rl, output)
    closePromptInterface(rl)
  }

  let priority: Priority = opts.priority ?? 'medium'
  if (opts.priority === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    priority = await promptForPriority(rl, output)
    closePromptInterface(rl)
  }

  let status: Status = opts.status ?? 'draft'
  if (opts.status === undefined) {
    const rl = createPromptInterface(opts.input, opts.output)
    status = await promptForStatus(rl, output)
    closePromptInterface(rl)
  }

  return { linkedIssues, reviewers, priority, status }
}
