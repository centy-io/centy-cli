// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import pluralize from 'pluralize'
import { daemonListItems } from '../daemon/daemon-list-items.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Get the next open item of any type
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Next extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, bug, epic, or custom type)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get the next open item of any type'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> next issue',
    '<%= config.bin %> next issue --status in-progress',
    '<%= config.bin %> next bug --json',
    '<%= config.bin %> next issue --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    status: Flags.string({
      char: 's',
      description: 'Filter by status (e.g., open, in-progress, closed)',
      default: 'open',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Next)
    const itemType = pluralize(args.type)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const status = flags.status !== undefined ? flags.status : 'open'
    const filter = JSON.stringify({ status: { $eq: status } })

    const response = await daemonListItems({
      projectPath: cwd,
      itemType,
      filter,
      limit: 1,
      offset: 0,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (response.items.length === 0) {
      this.log(`No ${status} ${args.type} found.`)
      return
    }

    const item = response.items[0]

    if (flags.json) {
      this.log(JSON.stringify(item, null, 2))
      return
    }

    const meta = item.metadata
    const dn =
      meta !== undefined && meta.displayNumber > 0
        ? `#${meta.displayNumber} `
        : ''
    const statusLabel =
      meta !== undefined && meta.status !== '' ? ` [${meta.status}]` : ''
    const priority =
      meta !== undefined && meta.priority > 0 ? ` [P${meta.priority}]` : ''
    this.log(`${dn}${item.title}${statusLabel}${priority}`)

    if (item.body) {
      this.log(`\n${item.body}`)
    }
  }
}
