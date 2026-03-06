// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import pluralize from 'pluralize'
import { projectFlag } from '../flags/project-flag.js'
import { handleGlobalList } from '../lib/list-items/handle-global-list.js'
import { handleProjectList } from '../lib/list-items/handle-project-list.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * List items of any type
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class List extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, doc, epic, or custom type)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List items of any type'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list issues',
    '<%= config.bin %> list epics --status open',
    '<%= config.bin %> list issues --global',
    '<%= config.bin %> list issues --global --status open --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    status: Flags.string({
      char: 's',
      description: 'Filter by status (e.g., open, in-progress, closed)',
    }),
    priority: Flags.integer({
      char: 'p',
      description: 'Filter by priority level (1 = highest)',
    }),
    'include-deleted': Flags.boolean({
      description: 'Include soft-deleted items',
      default: false,
    }),
    limit: Flags.integer({
      char: 'l',
      description: 'Maximum number of items to return (0 = no limit)',
      default: 0,
    }),
    offset: Flags.integer({
      description: 'Number of items to skip for pagination',
      default: 0,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'List items across all tracked projects',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(List)
    const itemType = pluralize(args.type)
    const limit = flags.limit !== undefined ? flags.limit : 0
    const offset = flags.offset !== undefined ? flags.offset : 0

    const filterParts: Record<string, unknown> = {}
    if (flags.status !== undefined)
      filterParts['status'] = { $eq: flags.status }
    if (flags.priority !== undefined)
      filterParts['priority'] = { $eq: flags.priority }
    const filter =
      Object.keys(filterParts).length > 0 ? JSON.stringify(filterParts) : ''

    if (flags.global) {
      await handleGlobalList(
        itemType,
        filter,
        limit,
        offset,
        flags.json,
        this.log.bind(this),
        this.warn.bind(this)
      )
      return
    }

    const cwd = await resolveProjectPath(flags.project)
    const throwError = (msg: string): never => this.error(msg)
    await handleProjectList(
      cwd,
      itemType,
      filter,
      limit,
      offset,
      flags.json,
      this.log.bind(this),
      throwError
    )
  }
}
