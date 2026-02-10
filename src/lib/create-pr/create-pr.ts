import { daemonCreatePr } from '../../daemon/daemon-create-pr.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import type { CreatePrOptions } from '../../types/create-pr-options.js'
import type { CreatePrResult } from '../../types/create-pr-result.js'
import {
  buildPrPaths,
  convertCustomFields,
  convertPriority,
  handleDaemonError,
} from './converters.js'
import { gatherPrInput } from './gather-pr-input.js'

/**
 * Create a new PR in the .centy/prs folder
 * Requires daemon to be running
 */
export async function createPr(
  options?: CreatePrOptions
): Promise<CreatePrResult> {
  // eslint-disable-next-line no-restricted-syntax
  const opts = options ?? {}
  // eslint-disable-next-line no-restricted-syntax
  const cwd = opts.cwd ?? process.cwd()
  // eslint-disable-next-line no-restricted-syntax
  const output = opts.output ?? process.stdout

  try {
    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      return {
        success: false,
        error: '.centy folder not initialized. Run "centy init" first.',
      }
    }

    // Note: We pass undefined for detectedBranch as the daemon will detect it
    const input = await gatherPrInput(opts, output)
    if (input.title === null) {
      return { success: false, error: 'PR title is required' }
    }

    const response = await daemonCreatePr({
      projectPath: cwd,
      title: input.title,
      description: input.description,
      sourceBranch: input.sourceBranch || undefined,
      targetBranch: input.targetBranch || undefined,
      reviewers: input.reviewers,
      priority: convertPriority(input.priority),
      status: input.status,
      customFields: convertCustomFields(opts.customFields),
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    const paths = buildPrPaths(cwd, response.id)
    output.write(`\nCreated PR #${response.displayNumber}\n`)
    output.write(`ID: ${response.id}\n`)
    output.write(`Source branch: ${response.detectedSourceBranch}\n`)
    output.write(`\nFiles created:\n`)
    for (const file of response.createdFiles) {
      output.write(`  ${file}\n`)
    }

    return {
      success: true,
      prId: response.id,
      displayNumber: response.displayNumber,
      prPath: paths.prFolderPath,
      prMarkdownPath: paths.prMdPath,
      metadataPath: paths.metadataPath,
      sourceBranch: response.detectedSourceBranch,
    }
  } catch (error) {
    return handleDaemonError(error)
  }
}
