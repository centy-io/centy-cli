// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonCreateItem } from '../daemon/daemon-create-item.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { parseCustomFields } from '../utils/parse-custom-fields.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'
import { toPlural } from '../utils/to-plural.js'

/**
 * Create a new item of any registered type via the generic CreateItem RPC
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Create extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, doc, epic, or custom type)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a new item of any type'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> create issue --title "Bug in login" --priority 1',
    '<%= config.bin %> create doc --title "Getting Started" --body "# Guide"',
    '<%= config.bin %> create epic --title "Auth overhaul" --status open',
    '<%= config.bin %> create bug --title "Crash on startup"',
    '<%= config.bin %> create task --title "Review PR" --custom-field "assignee=alice"',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'Item title',
      required: true,
    }),
    body: Flags.string({
      char: 'b',
      description: 'Item body / description (markdown)',
      default: '',
    }),
    status: Flags.string({
      char: 's',
      description: 'Initial status (empty = use type default)',
      default: '',
    }),
    priority: Flags.integer({
      char: 'p',
      description: 'Priority level (0 = use default)',
      default: 0,
    }),
    'custom-field': Flags.string({
      description: 'Custom field as key=value (repeatable)',
      multiple: true,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Create)
    const itemType = toPlural(args.type)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const customFields = parseCustomFields(flags['custom-field'])

    const response = await daemonCreateItem({
      projectPath: cwd,
      itemType,
      title: flags.title,
      body: flags.body,
      status: flags.status,
      priority: flags.priority,
      customFields,
    })

    if (!response.success) {
      const errorMsg =
        response.error !== '' ? response.error : 'Failed to create item'
      this.error(errorMsg)
    }

    const item = response.item!
    const meta = item.metadata
    const displayId =
      meta !== undefined && meta.displayNumber > 0
        ? ` #${meta.displayNumber}`
        : ''
    this.log(`Created ${args.type}${displayId}: "${item.title}"`)
    this.log(`  ID: ${item.id}`)
  }
}
