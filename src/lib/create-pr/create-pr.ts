/* eslint-disable ddd/require-spec-file */
import { join } from 'node:path'
import { daemonCreatePr } from '../../daemon/daemon-create-pr.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import type { CreatePrOptions } from '../../types/create-pr-options.js'
import type { CreatePrResult } from '../../types/create-pr-result.js'
import { gatherPrInput } from './gather-pr-input.js'

const CENTY_FOLDER = '.centy'
const PRS_FOLDER = 'prs'

function buildPrPaths(
  cwd: string,
  prId: string
): { prFolderPath: string; prMdPath: string; metadataPath: string } {
  const centyPath = join(cwd, CENTY_FOLDER)
  const prsPath = join(centyPath, PRS_FOLDER)
  const prFolderPath = join(prsPath, prId)
  return {
    prFolderPath,
    prMdPath: join(prFolderPath, 'pr.md'),
    metadataPath: join(prFolderPath, 'metadata.json'),
  }
}

function handleDaemonError(error: unknown): CreatePrResult {
  const msg = error instanceof Error ? error.message : String(error)
  if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
    return {
      success: false,
      error: 'Centy daemon is not running. Please start the daemon first.',
    }
  }
  return { success: false, error: msg }
}

function convertCustomFields(
  fields: Record<string, unknown> | undefined
): Record<string, string> {
  const result: Record<string, string> = {}
  if (fields !== undefined) {
    for (const [key, value] of Object.entries(fields)) {
      result[key] = String(value)
    }
  }
  return result
}

/**
 * Convert string priority to numeric priority
 * 1 = high (highest), 2 = medium, 3 = low
 * 0 = use default
 */
function convertPriority(
  priority: 'low' | 'medium' | 'high' | undefined
): number {
  switch (priority) {
    case 'high':
      return 1
    case 'medium':
      return 2
    case 'low':
      return 3
    default:
      return 0 // use default
  }
}

/**
 * Create a new PR in the .centy/prs folder
 * Requires daemon to be running
 */
export async function createPr(
  options?: CreatePrOptions
): Promise<CreatePrResult> {
  const opts = options ?? {}
  const cwd = opts.cwd ?? process.cwd()
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
      linkedIssues: input.linkedIssues,
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
