import type { CreatePrOptions } from '../../types/create-pr-options.js'
import { gatherBasicFields } from './gather-basic-fields.js'
import { gatherMetadataFields } from './gather-metadata-fields.js'
import type { GatherPrInputResult } from './types.js'

/**
 * Gather PR input from options or prompts
 * Only prompts for fields not provided via options
 */
export async function gatherPrInput(
  opts: CreatePrOptions,
  output: NodeJS.WritableStream,
  detectedBranch?: string
): Promise<GatherPrInputResult> {
  const basic = await gatherBasicFields(opts, output, detectedBranch)

  if (!basic.title || basic.title.trim() === '') {
    return {
      title: null,
      description: '',
      sourceBranch: '',
      targetBranch: 'main',
      linkedIssues: [],
      reviewers: [],
      priority: 'medium',
      status: 'draft',
    }
  }

  const metadata = await gatherMetadataFields(opts, output)

  return {
    title: basic.title,
    // eslint-disable-next-line no-restricted-syntax
    description: basic.description ?? '',
    // eslint-disable-next-line no-restricted-syntax
    sourceBranch: basic.sourceBranch ?? '',
    // eslint-disable-next-line no-restricted-syntax
    targetBranch: basic.targetBranch ?? 'main',
    // eslint-disable-next-line no-restricted-syntax
    linkedIssues: metadata.linkedIssues ?? [],
    // eslint-disable-next-line no-restricted-syntax
    reviewers: metadata.reviewers ?? [],
    priority: metadata.priority,
    status: metadata.status,
  }
}
