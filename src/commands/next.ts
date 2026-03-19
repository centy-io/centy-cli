// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import pluralize from 'pluralize'
import { projectFlag } from '../flags/project-flag.js'
import { handleGlobalNext } from '../lib/next-item/handle-global-next.js'
import { handleProjectNext } from '../lib/next-item/handle-project-next.js'
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
    '<%= config.bin %> next issue --global',
    '<%= config.bin %> next issue --global --status in-progress',
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
    global: Flags.boolean({
      char: 'g',
      description: 'Fetch next item across all tracked projects',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Next)
    const itemType = pluralize(args.type)
    const status = flags.status !== undefined ? flags.status : 'open'
    const filter = JSON.stringify({ status: { $eq: status } })

    if (flags.global) {
      await handleGlobalNext(
        itemType,
        args.type,
        filter,
        status,
        flags.json,
        this.log.bind(this)
      )
      return
    }

    const cwd = await resolveProjectPath(flags.project)
    await handleProjectNext(
      cwd,
      itemType,
      args.type,
      filter,
      status,
      flags.json,
      this.log.bind(this),
      this.error.bind(this)
    )
  }
}
