/* eslint-disable ddd/require-spec-file */
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
    description: basic.description ?? '',
    sourceBranch: basic.sourceBranch ?? '',
    targetBranch: basic.targetBranch ?? 'main',
    linkedIssues: metadata.linkedIssues ?? [],
    reviewers: metadata.reviewers ?? [],
    priority: metadata.priority,
    status: metadata.status,
  }
}
