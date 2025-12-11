import { Args, Command, Flags } from '@oclif/core'

import { daemonGetPr } from '../../daemon/daemon-get-pr.js'
import { daemonGetPrByDisplayNumber } from '../../daemon/daemon-get-pr-by-display-number.js'
import { daemonGetPrsByUuid } from '../../daemon/daemon-get-prs-by-uuid.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  formatCrossProjectHint,
  formatCrossProjectJson,
  isNotFoundError,
} from '../../utils/cross-project-search.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get a single pull request by ID or display number
 */
export default class GetPr extends Command {
  static override aliases = ['show:pr']

  static override args = {
    id: Args.string({
      description: 'PR ID (UUID) or display number',
      required: true,
    }),
  }

  static override description =
    'Get a single pull request by ID or display number'

  static override examples = [
    '<%= config.bin %> get pr 1',
    '<%= config.bin %> get pr abc123-uuid',
    '<%= config.bin %> get pr 1 --json',
    '<%= config.bin %> get pr abc12345-1234-1234-1234-123456789abc --global',
    '<%= config.bin %> get pr abc12345-1234-1234-1234-123456789abc -g --json',
    '<%= config.bin %> get pr 1 --project centy-daemon',
  ]

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
    const { args, flags } = await this.parse(GetPr)
    const cwd = await resolveProjectPath(flags.project)

    // Handle global search
    if (flags.global) {
      // Validate UUID format for global search
      const uuidRegex =
        /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
      if (!uuidRegex.test(args.id)) {
        this.error(
          'Global search requires a valid UUID. Display numbers are not supported for global search.'
        )
      }

      const result = await daemonGetPrsByUuid({ uuid: args.id })

      if (flags.json) {
        this.log(JSON.stringify(result, null, 2))
        return
      }

      if (result.prs.length === 0) {
        this.log(`No PRs found with UUID: ${args.id}`)
        if (result.errors.length > 0) {
          this.warn('Some projects could not be searched:')
          for (const err of result.errors) {
            this.warn(`  - ${err}`)
          }
        }
        return
      }

      this.log(`Found ${result.totalCount} PR(s) matching UUID: ${args.id}\n`)

      for (const pwp of result.prs) {
        const pr = pwp.pr
        const meta = pr.metadata
        this.log(`--- Project: ${pwp.projectName} (${pwp.projectPath}) ---`)
        this.log(`PR #${pr.displayNumber}`)
        this.log(`ID: ${pr.id}`)
        this.log(`Title: ${pr.title}`)
        this.log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
        this.log(
          `Priority: ${meta !== undefined ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`) : 'P?'}`
        )
        this.log(
          `Branch: ${meta !== undefined ? `${meta.sourceBranch} -> ${meta.targetBranch}` : '? -> ?'}`
        )
        this.log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
        this.log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
        if (pr.description) {
          this.log(`\nDescription:\n${pr.description}`)
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

    // Local search
    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    // Try to parse as display number first
    // Only treat as display number if the entire string is digits
    const isAllDigits = /^\d+$/.test(args.id)
    const displayNumber = isAllDigits ? Number.parseInt(args.id, 10) : NaN
    const isDisplayNumber =
      isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0

    try {
      const pr = isDisplayNumber
        ? await daemonGetPrByDisplayNumber({
            projectPath: cwd,
            displayNumber,
          })
        : await daemonGetPr({
            projectPath: cwd,
            prId: args.id,
          })

      if (flags.json) {
        this.log(JSON.stringify(pr, null, 2))
        return
      }

      const meta = pr.metadata
      this.log(`PR #${pr.displayNumber}`)
      this.log(`ID: ${pr.id}`)
      this.log(`Title: ${pr.title}`)
      this.log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
      this.log(
        `Priority: ${meta !== undefined ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`) : 'P?'}`
      )
      this.log(
        `Branch: ${meta !== undefined ? `${meta.sourceBranch} -> ${meta.targetBranch}` : '? -> ?'}`
      )
      if (meta !== undefined && meta.linkedIssues.length > 0) {
        this.log(`Linked Issues: ${meta.linkedIssues.join(', ')}`)
      }
      if (meta !== undefined && meta.reviewers.length > 0) {
        this.log(`Reviewers: ${meta.reviewers.join(', ')}`)
      }
      this.log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
      this.log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
      if (meta !== undefined && meta.mergedAt !== '') {
        this.log(`Merged: ${meta.mergedAt}`)
      }
      if (meta !== undefined && meta.closedAt !== '') {
        this.log(`Closed: ${meta.closedAt}`)
      }
      if (pr.description) {
        this.log(`\nDescription:\n${pr.description}`)
      }
    } catch (error) {
      // For UUID lookups that fail, try cross-project search to provide helpful hints
      if (!isDisplayNumber && isNotFoundError(error)) {
        const uuidRegex =
          /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
        if (uuidRegex.test(args.id)) {
          // Try global search to see if the PR exists in another project
          const result = await daemonGetPrsByUuid({ uuid: args.id })
          if (result.prs.length > 0) {
            const matches = result.prs.map(pwp => ({
              projectName: pwp.projectName,
              projectPath: pwp.projectPath,
            }))

            if (flags.json) {
              this.log(
                JSON.stringify(
                  formatCrossProjectJson('pr', args.id, matches),
                  null,
                  2
                )
              )
              this.exit(1)
            }

            this.error(formatCrossProjectHint('pr', args.id, matches))
          }
        }
      }
      // Re-throw original error if not found anywhere or not a NOT_FOUND error
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}
