// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeleteAsset } from '../../daemon/daemon-delete-asset.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Delete an asset
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class DeleteAsset extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    filename: Args.string({
      description: 'Asset filename',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Delete an asset'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> delete asset screenshot.png --issue 1',
    '<%= config.bin %> delete asset logo.svg --shared',
    '<%= config.bin %> delete asset old-image.png --issue 1 --force',
    '<%= config.bin %> delete asset screenshot.png --issue 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    issue: Flags.string({
      char: 'i',
      description: 'Issue ID or display number',
    }),
    shared: Flags.boolean({
      char: 's',
      description: 'Delete a shared asset',
      default: false,
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DeleteAsset)
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

    if (!flags.force) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer = await new Promise<string>(resolve => {
        rl.question(
          `Are you sure you want to delete asset "${args.filename}"? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonDeleteAsset({
      projectPath: cwd,
      issueId: flags.issue,
      filename: args.filename,
      isShared: flags.shared,
    })

    if (!response.success) {
      this.error(response.error)
    }

    const assetType = response.wasShared ? 'shared asset' : 'asset'
    this.log(`Deleted ${assetType} "${response.filename}"`)
  }
}
