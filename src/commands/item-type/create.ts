// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonCreateItemType } from '../../daemon/daemon-create-item-type.js'
import type { ItemTypeFeature } from '../../daemon/types.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  VALID_FEATURES,
  parseFeatures,
} from '../../lib/create-item-type/features.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a new custom item type in the .centy folder
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ItemTypeCreate extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a new custom item type'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> item-type create --name "Bug" --plural "bugs" --identifier uuid --statuses open,in-progress,closed --default-status open --priority-levels 3 --features display-number,status,priority,move,duplicate',
    '<%= config.bin %> item-type create --name "Task" --plural "tasks" --identifier slug --statuses todo,doing,done --default-status todo --features status,priority',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    name: Flags.string({
      char: 'n',
      description: 'Singular display name (e.g., "Bug", "Task", "Epic")',
      required: true,
    }),
    plural: Flags.string({
      description:
        'Folder/type key, lowercase alphanumeric + hyphens (e.g., "bugs")',
      required: true,
    }),
    identifier: Flags.string({
      description: 'Identifier type for items',
      options: ['uuid', 'slug'],
      required: true,
    }),
    statuses: Flags.string({
      description: 'Comma-separated list of allowed statuses',
      required: true,
    }),
    'default-status': Flags.string({
      description: 'Default status for new items (must be in statuses list)',
      required: true,
    }),
    'priority-levels': Flags.integer({
      description: 'Number of priority levels (0 = none)',
      default: 0,
    }),
    features: Flags.string({
      char: 'f',
      description: `Comma-separated features (${VALID_FEATURES.join(', ')})`,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ItemTypeCreate)
    const cwd = await resolveProjectPath(flags.project)
    const statuses = flags.statuses.split(',').map(s => s.trim())
    const defaultStatus = flags['default-status']

    if (!statuses.includes(defaultStatus)) {
      this.error(
        `Default status "${defaultStatus}" must be one of: ${statuses.join(', ')}`
      )
    }

    // eslint-disable-next-line no-restricted-syntax
    const features = parseFeatures(flags.features) as ItemTypeFeature[]
    const response = await daemonCreateItemType({
      projectPath: cwd,
      name: flags.name,
      plural: flags.plural,
      // eslint-disable-next-line no-restricted-syntax
      identifier: flags.identifier as 'uuid' | 'slug',
      features,
      statuses,
      defaultStatus,
      priorityLevels: flags['priority-levels'],
      customFields: [],
    })

    if (!response.success) {
      const errorMsg =
        response.error !== '' ? response.error : 'Failed to create item type'
      this.error(errorMsg)
    }

    this.log(`\nCreated item type "${flags.name}" (${flags.plural})`)
    this.log(`  Identifier: ${flags.identifier}`)
    this.log(`  Statuses: ${statuses.join(', ')}`)
    this.log(`  Default status: ${defaultStatus}`)
    if (flags['priority-levels'] > 0) {
      this.log(`  Priority levels: ${flags['priority-levels']}`)
    }
    if (features.length > 0 && flags.features !== undefined) {
      this.log(`  Features: ${flags.features}`)
    }
  }
}
