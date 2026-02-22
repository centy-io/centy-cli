// eslint-disable-next-line import/order
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
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ItemTypeList extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all item types for a project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> item-type list',
    '<%= config.bin %> item-type list --json',
    '<%= config.bin %> item-type list --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
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
      const features =
        itemType.features.length > 0
          ? ` [${itemType.features.map(f => f.replace('ITEM_TYPE_FEATURE_', '').toLowerCase()).join(', ')}]`
          : ''
      const statuses =
        itemType.statuses.length > 0
          ? ` statuses: ${itemType.statuses.join(', ')}`
          : ''
      this.log(`${itemType.name} (${itemType.plural})${features}${statuses}`)
    }
  }
}
