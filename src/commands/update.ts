// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import pluralize from 'pluralize'
import { daemonUpdateItem } from '../daemon/daemon-update-item.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { formatItemJson } from '../utils/format-item-json.js'
import { parseCustomFields } from '../utils/parse-custom-fields.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'
import { resolveItemId } from '../lib/resolve-item-id/resolve-item-id.js'

/**
 * Update an item of any type by type and identifier
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Update extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, epic, or custom type)',
      required: true,
    }),
    id: Args.string({
      description: 'Item ID (UUID, display number, or slug)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Update an item by type and identifier'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> update issue 1 --status closed',
    '<%= config.bin %> update epic 1 --title "New title"',
    '<%= config.bin %> update bug abc123-uuid --status in-progress --priority 1',
    '<%= config.bin %> update epic 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    title: Flags.string({ char: 't', description: 'New title' }),
    body: Flags.string({
      char: 'b',
      description: 'New body (markdown content)',
    }),
    status: Flags.string({
      char: 's',
      description: 'New status (e.g., open, in-progress, closed)',
    }),
    priority: Flags.integer({
      char: 'p',
      description: 'New priority level (1 = highest)',
    }),
    'custom-field': Flags.string({
      multiple: true,
      description: 'Custom field in key=value format (repeatable)',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Update)
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

    if (
      !flags.title &&
      !flags.body &&
      !flags.status &&
      !flags.priority &&
      (!flags['custom-field'] || flags['custom-field'].length === 0)
    ) {
      this.error('At least one field must be specified to update.')
    }

    const itemId = await resolveItemId(args.id, itemType, cwd, msg =>
      this.error(msg)
    )
    const response = await daemonUpdateItem({
      projectPath: cwd,
      itemType,
      itemId,
      title: flags.title !== undefined ? flags.title : '',
      body: flags.body !== undefined ? flags.body : '',
      status: flags.status !== undefined ? flags.status : '',
      priority: flags.priority !== undefined ? flags.priority : 0,
      customFields: parseCustomFields(flags['custom-field']),
    })

    if (!response.success) this.error(response.error)

    const item = response.item!

    if (flags.json) {
      this.log(JSON.stringify(formatItemJson(args.type, item), null, 2))
      return
    }

    const meta = item.metadata
    const dn =
      meta !== undefined && meta.displayNumber > 0 ? meta.displayNumber : 0
    this.log(`Updated ${args.type}${dn > 0 ? ` #${dn}` : ` ${item.id}`}`)
  }
}
