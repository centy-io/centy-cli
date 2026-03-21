import { Args, Command } from '@oclif/core'
import pluralize from 'pluralize'
import { daemonCreateItem } from '../daemon/daemon-create-item.js'
import { createFlags } from '../flags/create-flags.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { applyLinkFlags } from '../utils/apply-link-flags.js'
import { formatItemJson } from '../utils/format-item-json.js'
import { parseCustomFields } from '../utils/parse-custom-fields.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Create a new item of any registered type via the generic CreateItem RPC
 */

export default class Create extends Command {
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, doc, epic, or custom type)',
      required: true,
    }),
  }

  static override description = 'Create a new item of any type'

  static override examples = [
    '<%= config.bin %> create issue --title "Bug in login" --priority 1',
    '<%= config.bin %> create doc --title "Getting Started" --body "# Guide"',
    '<%= config.bin %> create epic --title "Auth overhaul" --status open',
    '<%= config.bin %> create bug --title "Crash on startup"',
    '<%= config.bin %> create task --title "Review PR" --custom-field "assignee=alice"',
    '<%= config.bin %> create issue --title "Login crash" --link blocks:issue:2',
    '<%= config.bin %> create task --title "Write tests" --link relates-to:issue:5 --link relates-to:doc:api-guide',
  ]

  static override flags = createFlags

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Create)
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

    if (flags.json) {
      this.log(JSON.stringify(formatItemJson(args.type, item), null, 2))
      return
    }

    const displayId =
      meta !== undefined && meta.displayNumber > 0
        ? ` #${meta.displayNumber}`
        : ''
    this.log(`Created ${args.type}${displayId}: "${item.title}"`)
    this.log(`  ID: ${item.id}`)

    const linkSpecs = flags.link !== undefined ? flags.link : []
    await applyLinkFlags(linkSpecs, item.id, args.type, cwd, this)
  }
}
