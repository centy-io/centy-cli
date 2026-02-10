/* eslint-disable max-lines */

// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetIssuesByUuid } from '../daemon/daemon-get-issues-by-uuid.js'
import { daemonGetPrsByUuid } from '../daemon/daemon-get-prs-by-uuid.js'
import { isValidUuid } from '../utils/is-valid-uuid.js'

/**
 * Show an entity by UUID, auto-detecting type across all tracked projects
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Show extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    uuid: Args.string({
      description: 'Entity UUID to look up',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Show an entity by UUID, searching across all tracked projects'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> show 9f38fb44-55df-424d-a61f-a3432cfa83d2',
    '<%= config.bin %> show 9f38fb44-55df-424d-a61f-a3432cfa83d2 --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  // eslint-disable-next-line max-lines-per-function
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Show)

    if (!isValidUuid(args.uuid)) {
      this.error(
        'A valid UUID is required. Use `centy get issue <id>` or `centy get pr <id>` for display numbers.'
      )
    }

    const [issuesResult, prsResult] = await Promise.all([
      daemonGetIssuesByUuid({ uuid: args.uuid }),
      daemonGetPrsByUuid({ uuid: args.uuid }),
    ])

    const hasIssues = issuesResult.issues.length > 0
    const hasPrs = prsResult.prs.length > 0
    const allErrors = [...issuesResult.errors, ...prsResult.errors]

    if (!hasIssues && !hasPrs) {
      if (flags.json) {
        this.log(
          JSON.stringify({ issues: [], prs: [], errors: allErrors }, null, 2)
        )
        return
      }

      this.log(`No entities found with UUID: ${args.uuid}`)
      if (allErrors.length > 0) {
        this.warn('Some projects could not be searched:')
        for (const err of allErrors) {
          this.warn(`  - ${err}`)
        }
      }
      return
    }

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            issues: issuesResult.issues,
            prs: prsResult.prs,
            errors: allErrors,
          },
          null,
          2
        )
      )
      return
    }

    for (const iwp of issuesResult.issues) {
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

    for (const pwp of prsResult.prs) {
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

    if (allErrors.length > 0) {
      this.warn('Some projects could not be searched:')
      for (const err of allErrors) {
        this.warn(`  - ${err}`)
      }
    }
  }
}
