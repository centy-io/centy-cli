import { join } from 'node:path'
import { daemonCreateIssue } from '../../daemon/daemon-create-issue.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import type { CreateIssueOptions } from '../../types/create-issue-options.js'
import type { CreateIssueResult } from '../../types/create-issue-result.js'
import { gatherIssueInput } from './gather-issue-input.js'

const CENTY_FOLDER = '.centy'
const ISSUES_FOLDER = 'issues'

function buildIssuePaths(
  cwd: string,
  issueNumber: string
): { issueFolderPath: string; issueMdPath: string; metadataPath: string } {
  const centyPath = join(cwd, CENTY_FOLDER)
  const issuesPath = join(centyPath, ISSUES_FOLDER)
  const issueFolderPath = join(issuesPath, issueNumber)
  return {
    issueFolderPath,
    issueMdPath: join(issueFolderPath, 'issue.md'),
    metadataPath: join(issueFolderPath, 'metadata.json'),
  }
}

function handleDaemonError(error: unknown): CreateIssueResult {
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
      // eslint-disable-next-line security/detect-object-injection
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
    // eslint-disable-next-line no-restricted-syntax
    default:
      return 0 // use default
  }
}

/**
 * Create a new issue in the .centy/issues folder
 * Requires daemon to be running
 */
export async function createIssue(
  options?: CreateIssueOptions
): Promise<CreateIssueResult> {
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

    const input = await gatherIssueInput(opts, output)
    if (input.title === null) {
      return { success: false, error: 'Issue title is required' }
    }

    const response = await daemonCreateIssue({
      projectPath: cwd,
      title: input.title,
      description: input.description,
      priority: convertPriority(input.priority),
      // eslint-disable-next-line no-restricted-syntax
      status: opts.status ?? 'open',
      customFields: convertCustomFields(opts.customFields),
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    const paths = buildIssuePaths(cwd, response.issueNumber)
    output.write(`\nCreated issue #${response.issueNumber}\n`)
    output.write(`  ${paths.issueMdPath}\n`)
    output.write(`  ${paths.metadataPath}\n`)

    return {
      success: true,
      issueNumber: response.issueNumber,
      issuePath: paths.issueFolderPath,
      issueMarkdownPath: paths.issueMdPath,
      metadataPath: paths.metadataPath,
    }
  } catch (error) {
    return handleDaemonError(error)
  }
}
