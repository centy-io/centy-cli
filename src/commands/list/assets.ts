/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import { daemonListAssets } from '../../daemon/daemon-list-assets.js'
import { daemonListSharedAssets } from '../../daemon/daemon-list-shared-assets.js'

/**
 * List assets for an issue or shared assets
 */
export default class ListAssets extends Command {
  static override description = 'List assets for an issue or shared assets'

  static override examples = [
    '<%= config.bin %> list assets --issue 1',
    '<%= config.bin %> list assets --shared',
    '<%= config.bin %> list assets --issue 1 --include-shared',
  ]

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
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListAssets)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
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
