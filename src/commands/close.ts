// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { projectFlag } from '../flags/project-flag.js'
import { closeIssue } from '../lib/close/close-issue.js'
import { closePr } from '../lib/close/close-pr.js'
import { findEntityByDisplayNumber } from '../lib/close/find-entity.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

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
  static override description = 'Close an issue or PR by display number'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> close 1',
    '<%= config.bin %> close #1',
    '<%= config.bin %> close 1 --type issue',
    '<%= config.bin %> close 1 --type pr',
    '<%= config.bin %> close 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    type: Flags.string({
      char: 't',
      description: 'Entity type (issue, pr)',
      options: ['issue', 'pr'],
    }),
    project: projectFlag,
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Close)

    const displayNumberMatch = args.identifier.match(/^#?(\d+)$/)
    if (!displayNumberMatch) {
      this.error(
        'Invalid identifier. Please provide a display number (e.g., 1 or #1)'
      )
    }
    const displayNumber = Number.parseInt(displayNumberMatch[1], 10)

    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (flags.type !== undefined) {
      await this.closeByType(flags.type, cwd, displayNumber, flags.json)
      return
    }

    await this.closeByDiscovery(cwd, displayNumber, flags.json)
  }

  private async closeByType(
    type: string,
    cwd: string,
    displayNumber: number,
    json: boolean
  ): Promise<void> {
    if (type === 'issue') {
      await closeIssue(cwd, displayNumber, json, this.log.bind(this))
    } else if (type === 'pr') {
      await closePr(cwd, displayNumber, json, this.log.bind(this))
    }
  }

  private async closeByDiscovery(
    cwd: string,
    displayNumber: number,
    json: boolean
  ): Promise<void> {
    const foundEntities = await findEntityByDisplayNumber(cwd, displayNumber)

    if (foundEntities.length === 0) {
      this.error(`No issue or PR found with display number #${displayNumber}`)
    }

    if (foundEntities.length > 1) {
      const types = foundEntities.map(e => e.type).join(', ')
      this.error(
        `Ambiguous: found multiple entities with #${displayNumber} (${types}). Use --type to specify which to close.`
      )
    }

    const entity = foundEntities[0]
    if (entity.type === 'issue') {
      await closeIssue(cwd, displayNumber, json, this.log.bind(this))
    } else if (entity.type === 'pr') {
      await closePr(cwd, displayNumber, json, this.log.bind(this))
    }
  }
}
