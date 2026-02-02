/* eslint-disable max-lines */

// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetIssue } from '../../daemon/daemon-get-issue.js'
import { daemonGetIssueByDisplayNumber } from '../../daemon/daemon-get-issue-by-display-number.js'
import { daemonGetIssuesByUuid } from '../../daemon/daemon-get-issues-by-uuid.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  formatCrossProjectHint,
  formatCrossProjectJson,
  handleNotInitializedWithSearch,
  isNotFoundError,
  isValidUuid,
} from '../../utils/cross-project-search.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get a single issue by ID or display number
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class GetIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['show:issue', 'issue']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get a single issue by ID or display number'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get issue 1',
    '<%= config.bin %> get issue abc123-uuid',
    '<%= config.bin %> get issue 1 --json',
    '<%= config.bin %> get issue abc12345-1234-1234-1234-123456789abc --global',
    '<%= config.bin %> get issue abc12345-1234-1234-1234-123456789abc -g --json',
    '<%= config.bin %> get issue 1 --project centy-daemon',
    '<%= config.bin %> get issue 1 --project /path/to/project',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'Search across all tracked projects (UUID only)',
      default: false,
    }),
    project: projectFlag,
  }

  // eslint-disable-next-line max-lines-per-function
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetIssue)
    const cwd = await resolveProjectPath(flags.project)

    // Handle global search
    if (flags.global) {
      // Validate UUID format for global search
      if (!isValidUuid(args.id)) {
        this.error(
          'Global search requires a valid UUID. Display numbers are not supported for global search.'
        )
      }

      const result = await daemonGetIssuesByUuid({ uuid: args.id })

      if (flags.json) {
        this.log(JSON.stringify(result, null, 2))
        return
      }

      if (result.issues.length === 0) {
        this.log(`No issues found with UUID: ${args.id}`)
        if (result.errors.length > 0) {
          this.warn('Some projects could not be searched:')
          for (const err of result.errors) {
            this.warn(`  - ${err}`)
          }
        }
        return
      }

      this.log(
        `Found ${result.totalCount} issue(s) matching UUID: ${args.id}\n`
      )

      for (const iwp of result.issues) {
        const issue = iwp.issue
        const meta = issue.metadata
        this.log(`--- Project: ${iwp.projectName} (${iwp.projectPath}) ---`)
        this.log(`Issue #${issue.displayNumber}`)
        this.log(`ID: ${issue.id}`)
        this.log(`Title: ${issue.title}`)
        this.log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
        this.log(
          `Priority: ${meta !== undefined ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`) : 'P?'}`
        )
        this.log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
        this.log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
        if (issue.description) {
          this.log(`\nDescription:\n${issue.description}`)
        }
        this.log('')
      }

      if (result.errors.length > 0) {
        this.warn('Some projects could not be searched:')
        for (const err of result.errors) {
          this.warn(`  - ${err}`)
        }
      }
      return
    }

    // Local search (existing behavior)
    try {
      await ensureInitialized(cwd)
    } catch (error) {
      const result = await handleNotInitializedWithSearch(error, {
        entityType: 'issue',
        identifier: args.id,
        jsonMode: flags.json,
        shouldSearch: isValidUuid,
        async globalSearchFn() {
          const searchResult = await daemonGetIssuesByUuid({ uuid: args.id })
          return {
            matches: searchResult.issues.map(iwp => ({
              projectName: iwp.projectName,
              projectPath: iwp.projectPath,
            })),
            errors: searchResult.errors,
          }
        },
      })

      if (result !== null) {
        if (result.jsonOutput !== undefined) {
          this.log(JSON.stringify(result.jsonOutput, null, 2))
          this.exit(1)
        }
        this.error(result.message)
      }

      throw error instanceof Error ? error : new Error(String(error))
    }

    // Try to parse as display number first
    // Only treat as display number if the entire string is digits (not UUIDs like "3981508f-...")
    const isAllDigits = /^\d+$/.test(args.id)
    const displayNumber = isAllDigits ? Number.parseInt(args.id, 10) : NaN
    const isDisplayNumber =
      isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0

    try {
      const issue = isDisplayNumber
        ? await daemonGetIssueByDisplayNumber({
            projectPath: cwd,
            displayNumber,
          })
        : await daemonGetIssue({
            projectPath: cwd,
            issueId: args.id,
          })

      if (flags.json) {
        this.log(JSON.stringify(issue, null, 2))
        return
      }

      const meta = issue.metadata
      this.log(`Issue #${issue.displayNumber}`)
      this.log(`ID: ${issue.id}`)
      this.log(`Title: ${issue.title}`)
      this.log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
      this.log(
        `Priority: ${meta !== undefined ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`) : 'P?'}`
      )
      this.log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
      this.log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
      if (issue.description) {
        this.log(`\nDescription:\n${issue.description}`)
      }
    } catch (error) {
      // For UUID lookups that fail, try cross-project search to provide helpful hints
      if (!isDisplayNumber && isNotFoundError(error) && isValidUuid(args.id)) {
        // Try global search to see if the issue exists in another project
        const result = await daemonGetIssuesByUuid({ uuid: args.id })
        if (result.issues.length > 0) {
          const matches = result.issues.map(iwp => ({
            projectName: iwp.projectName,
            projectPath: iwp.projectPath,
          }))

          if (flags.json) {
            this.log(
              JSON.stringify(
                formatCrossProjectJson('issue', args.id, matches),
                null,
                2
              )
            )
            this.exit(1)
          }

          this.error(formatCrossProjectHint('issue', args.id, matches))
        }
      }
      // Re-throw original error if not found anywhere or not a NOT_FOUND error
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}
