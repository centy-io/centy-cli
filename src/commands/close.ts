// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonUpdateIssue } from '../daemon/daemon-update-issue.js'
import { projectFlag } from '../flags/project-flag.js'
import { CloseEntityError } from '../lib/close/close-entity-error.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Close an issue by display number
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
  static override description = 'Close an issue by display number'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> close 1',
    '<%= config.bin %> close #1',
    '<%= config.bin %> close 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
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

    await closeIssue(
      cwd,
      args.identifier,
      displayNumber,
      flags.json,
      this.log.bind(this)
    )
  }
}

async function closeIssue(
  cwd: string,
  issueId: string,
  displayNumber: number,
  json: boolean,
  log: (msg: string) => void
): Promise<void> {
  const response = await daemonUpdateIssue({
    projectPath: cwd,
    issueId,
    status: 'closed',
  })

  if (!response.success) {
    throw new CloseEntityError(response.error)
  }

  if (json) {
    log(
      JSON.stringify(
        {
          type: 'issue',
          displayNumber: response.issue.displayNumber,
          status: 'closed',
        },
        null,
        2
      )
    )
  } else {
    log(`Closed issue #${response.issue.displayNumber}`)
  }
}
