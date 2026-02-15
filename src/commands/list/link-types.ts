// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonGetAvailableLinkTypes } from '../../daemon/daemon-get-available-link-types.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List all available link types
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListLinkTypes extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all available link types'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list link-types',
    '<%= config.bin %> list link-types --json',
    '<%= config.bin %> list link-types --project centy-daemon',
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
    const { flags } = await this.parse(ListLinkTypes)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonGetAvailableLinkTypes({
      projectPath: cwd,
    })

    if (flags.json) {
      this.log(JSON.stringify(response.linkTypes, null, 2))
      return
    }

    if (response.linkTypes.length === 0) {
      this.log('No link types available.')
      return
    }

    this.log('Available link types:\n')
    for (const linkType of response.linkTypes) {
      const builtinTag = linkType.isBuiltin ? ' (builtin)' : ' (custom)'
      const desc =
        linkType.description !== '' ? ` - ${linkType.description}` : ''
      this.log(`  ${linkType.name} <-> ${linkType.inverse}${builtinTag}${desc}`)
    }
  }
}
