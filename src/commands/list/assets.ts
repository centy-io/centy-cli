// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListAssets } from '../../daemon/daemon-list-assets.js'
import { daemonListSharedAssets } from '../../daemon/daemon-list-shared-assets.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List assets for an issue or shared assets
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListAssets extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List assets for an issue or shared assets'

  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['asset:list']

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list assets --issue 1',
    '<%= config.bin %> list assets --shared',
    '<%= config.bin %> list assets --issue 1 --include-shared',
    '<%= config.bin %> list assets --issue 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    issue: Flags.string({
      char: 'i',
      description: 'Issue ID or display number',
    }),
    shared: Flags.boolean({
      char: 's',
      description: 'List only shared assets',
      default: false,
    }),
    'include-shared': Flags.boolean({
      description: 'Include shared assets when listing issue assets',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListAssets)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (!flags.issue && !flags.shared) {
      this.error('Either --issue or --shared must be specified.')
    }

    const response = flags.shared
      ? await daemonListSharedAssets({ projectPath: cwd })
      : await daemonListAssets({
          projectPath: cwd,
          issueId: flags.issue,
          includeShared: flags['include-shared'],
        })

    if (flags.json) {
      this.log(JSON.stringify(response.assets, null, 2))
      return
    }

    if (response.assets.length === 0) {
      this.log('No assets found.')
      return
    }

    this.log(`Found ${response.totalCount} asset(s):\n`)
    for (const asset of response.assets) {
      const shared = asset.isShared ? ' [shared]' : ''
      this.log(
        `${asset.filename}${shared} (${asset.size} bytes, ${asset.mimeType})`
      )
    }
  }
}
