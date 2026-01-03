/* eslint-disable max-lines */

// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetIssueByDisplayNumber } from '../daemon/daemon-get-issue-by-display-number.js'
import { daemonGetOrgIssueByDisplayNumber } from '../daemon/daemon-get-org-issue-by-display-number.js'
import { daemonGetPrByDisplayNumber } from '../daemon/daemon-get-pr-by-display-number.js'
import { daemonUpdateIssue } from '../daemon/daemon-update-issue.js'
import { daemonUpdateOrgIssue } from '../daemon/daemon-update-org-issue.js'
import { daemonUpdatePr } from '../daemon/daemon-update-pr.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

type EntityType = 'issue' | 'pr' | 'org-issue'

interface FoundEntity {
  type: EntityType
  id: string
  displayNumber: number
}

/**
 * Generic close command for issues, PRs, and org-issues
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Close extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    identifier: Args.string({
      description: 'Display number (#N or N) or UUID',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Close an issue, PR, or org-issue by display number'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> close 1',
    '<%= config.bin %> close #1',
    '<%= config.bin %> close 1 --type issue',
    '<%= config.bin %> close 1 --type pr',
    '<%= config.bin %> close 1 --org my-org',
    '<%= config.bin %> close 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    type: Flags.string({
      char: 't',
      description: 'Entity type (issue, pr, org-issue)',
      options: ['issue', 'pr', 'org-issue'],
    }),
    org: Flags.string({
      char: 'o',
      description: 'Organization slug (for org-issues)',
    }),
    project: projectFlag,
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  // eslint-disable-next-line max-lines-per-function
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Close)

    // Parse display number (supports #1 or 1 format)
    const displayNumberMatch = args.identifier.match(/^#?(\d+)$/)
    if (!displayNumberMatch) {
      this.error(
        'Invalid identifier. Please provide a display number (e.g., 1 or #1)'
      )
    }
    const displayNumber = Number.parseInt(displayNumberMatch[1], 10)

    // Handle org-issue case
    if (flags.org !== undefined || flags.type === 'org-issue') {
      if (flags.org === undefined) {
        this.error(
          'Organization slug is required for org-issues. Use --org <slug>'
        )
      }
      await this.closeOrgIssue(flags.org, displayNumber, flags.json)
      return
    }

    // Resolve project path for local entities
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    // If type is specified, close that type directly
    if (flags.type !== undefined) {
      if (flags.type === 'issue') {
        await this.closeIssue(cwd, displayNumber, flags.json)
      } else if (flags.type === 'pr') {
        await this.closePr(cwd, displayNumber, flags.json)
      }
      return
    }

    // Search for entities with this display number
    const foundEntities: FoundEntity[] = []

    // Try to find issue
    try {
      const issue = await daemonGetIssueByDisplayNumber({
        projectPath: cwd,
        displayNumber,
      })
      foundEntities.push({
        type: 'issue',
        id: issue.id,
        displayNumber: issue.displayNumber,
      })
    } catch {
      // Issue not found, continue
    }

    // Try to find PR
    try {
      const pr = await daemonGetPrByDisplayNumber({
        projectPath: cwd,
        displayNumber,
      })
      foundEntities.push({
        type: 'pr',
        id: pr.id,
        displayNumber: pr.displayNumber,
      })
    } catch {
      // PR not found, continue
    }

    // Handle results
    if (foundEntities.length === 0) {
      this.error(`No issue or PR found with display number #${displayNumber}`)
    }

    if (foundEntities.length > 1) {
      const types = foundEntities.map(e => e.type).join(', ')
      this.error(
        `Ambiguous: found multiple entities with #${displayNumber} (${types}). Use --type to specify which to close.`
      )
    }

    // Close the single found entity
    const entity = foundEntities[0]
    if (entity.type === 'issue') {
      await this.closeIssue(cwd, displayNumber, flags.json)
    } else if (entity.type === 'pr') {
      await this.closePr(cwd, displayNumber, flags.json)
    }
  }

  private async closeIssue(
    projectPath: string,
    displayNumber: number,
    jsonOutput: boolean
  ): Promise<void> {
    const issue = await daemonGetIssueByDisplayNumber({
      projectPath,
      displayNumber,
    })

    const response = await daemonUpdateIssue({
      projectPath,
      issueId: issue.id,
      status: 'closed',
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (jsonOutput) {
      this.log(JSON.stringify({ type: 'issue', ...response.issue }, null, 2))
      return
    }

    this.log(`Closed issue #${response.issue.displayNumber}`)
  }

  private async closePr(
    projectPath: string,
    displayNumber: number,
    jsonOutput: boolean
  ): Promise<void> {
    const pr = await daemonGetPrByDisplayNumber({
      projectPath,
      displayNumber,
    })

    const response = await daemonUpdatePr({
      projectPath,
      prId: pr.id,
      status: 'closed',
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (jsonOutput) {
      this.log(JSON.stringify({ type: 'pr', ...response.pr }, null, 2))
      return
    }

    this.log(`Closed PR #${response.pr.displayNumber}`)
  }

  private async closeOrgIssue(
    orgSlug: string,
    displayNumber: number,
    jsonOutput: boolean
  ): Promise<void> {
    const issue = await daemonGetOrgIssueByDisplayNumber({
      orgSlug,
      displayNumber,
    })

    const response = await daemonUpdateOrgIssue({
      orgSlug,
      issueId: issue.id,
      status: 'closed',
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (jsonOutput) {
      this.log(
        JSON.stringify({ type: 'org-issue', ...response.issue }, null, 2)
      )
      return
    }

    this.log(`Closed organization issue #${response.issue.displayNumber}`)
  }
}
