import { writeFile } from 'node:fs/promises'
// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetAsset } from '../../daemon/daemon-get-asset.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get an asset and save it to a file
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class GetAsset extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['show:asset']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    filename: Args.string({
      description: 'Asset filename',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get an asset and save it to a file'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get asset screenshot.png --issue 1 --output ./screenshot.png',
    '<%= config.bin %> get asset logo.svg --shared --output ./logo.svg',
    '<%= config.bin %> get asset screenshot.png --issue 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    issue: Flags.string({
      char: 'i',
      description: 'Issue ID or display number',
    }),
    shared: Flags.boolean({
      char: 's',
      description: 'Get a shared asset',
      default: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path (defaults to asset filename)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetAsset)
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

    const response = await daemonGetAsset({
      projectPath: cwd,
      issueId: flags.issue !== undefined ? flags.issue : '',
      filename: args.filename,
      isShared: flags.shared,
    })

    if (!response.success) {
      this.error(response.error)
    }

    // eslint-disable-next-line no-restricted-syntax
    const outputPath = flags.output ?? args.filename
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(outputPath, response.data)

    this.log(`Saved asset to ${outputPath}`)
    this.log(`  Size: ${response.asset!.size} bytes`)
    this.log(`  Type: ${response.asset!.mimeType}`)
  }
}
