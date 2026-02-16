import { daemonCreateIssue } from '../../daemon/daemon-create-issue.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import type { CreateIssueOptions } from '../../types/create-issue-options.js'
import type { CreateIssueResult } from '../../types/create-issue-result.js'
import {
  buildIssuePaths,
  convertCustomFields,
  convertPriority,
  handleDaemonError,
} from './converters.js'
import { gatherIssueInput } from './gather-issue-input.js'

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
      // eslint-disable-next-line no-restricted-syntax
      draft: opts.draft ?? false,
      // eslint-disable-next-line no-restricted-syntax
      isOrgIssue: opts.org ?? false,
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
