/* eslint-disable ddd/require-spec-file */
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetPr } from '../../daemon/daemon-get-pr.js'
import { daemonGetPrByDisplayNumber } from '../../daemon/daemon-get-pr-by-display-number.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

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
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetPr)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    // Try to parse as display number first
    const displayNumber = Number.parseInt(args.id, 10)
    const isDisplayNumber = !Number.isNaN(displayNumber) && displayNumber > 0

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
  }
}
