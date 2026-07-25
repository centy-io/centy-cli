import { Command, Flags } from '@oclif/core'
import { daemonListItemTypes } from '../../daemon/daemon-list-item-types.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List all item types configured for a project
 */

export default class ItemTypeList extends Command {
  static override description = 'List all item types for a project'

  static override examples = [
    '<%= config.bin %> item-type list',
    '<%= config.bin %> item-type list --json',
    '<%= config.bin %> item-type list --project centy-daemon',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ItemTypeList)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonListItemTypes({ projectPath: cwd })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.itemTypes, null, 2))
      return
    }

    if (response.itemTypes.length === 0) {
      this.log('No item types found.')
      return
    }

    this.log(`Found ${response.totalCount} item type(s):\n`)
    for (const itemType of response.itemTypes) {
      const f = itemType.features
      const enabledFeatures =
        f === undefined
          ? []
          : [
              f.displayNumber && 'display_number',
              f.status && 'status',
              f.priority && 'priority',
              f.assets && 'assets',
              f.orgSync && 'org_sync',
              f.move && 'move',
              f.duplicate && 'duplicate',
            ].filter(Boolean)
      const features =
        enabledFeatures.length > 0 ? ` [${enabledFeatures.join(', ')}]` : ''
      const statuses =
        itemType.statuses.length > 0
          ? ` statuses: ${itemType.statuses.join(', ')}`
          : ''
      this.log(`${itemType.name} (${itemType.plural})${features}${statuses}`)
    }
  }
}
