import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonAddAsset } from '../../daemon/daemon-add-asset.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Add an asset to an issue, PR, or as a shared asset
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class AddAsset extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    file: Args.string({
      description: 'Path to the file to add',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Add an asset to an issue, PR, or as a shared asset'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> add asset screenshot.png --issue 1',
    '<%= config.bin %> add asset screenshot.png --pr 1',
    '<%= config.bin %> add asset diagram.svg --shared',
    '<%= config.bin %> add asset image.jpg --issue 1 --name my-image.jpg',
    '<%= config.bin %> add asset screenshot.png --issue 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    issue: Flags.string({
      char: 'i',
      description: 'Issue ID or display number to attach the asset to',
    }),
    pr: Flags.string({
      char: 'p',
      description: 'PR ID or display number to attach the asset to',
    }),
    shared: Flags.boolean({
      char: 's',
      description: 'Add as a shared asset (accessible by all issues/PRs)',
      default: false,
    }),
    name: Flags.string({
      char: 'n',
      description: 'Custom filename (defaults to original filename)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AddAsset)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (!flags.issue && !flags.pr && !flags.shared) {
      this.error('Either --issue, --pr, or --shared must be specified.')
    }

    if (flags.issue && flags.pr) {
      this.error('Cannot specify both --issue and --pr. Choose one.')
    }

    let fileData: Buffer
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fileData = await readFile(args.file)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('ENOENT')) {
        this.error(`File not found: ${args.file}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    // eslint-disable-next-line no-restricted-syntax
    const filename = flags.name ?? basename(args.file)

    const response = await daemonAddAsset({
      projectPath: cwd,
      issueId: flags.issue !== undefined ? flags.issue : flags.pr,
      filename,
      data: fileData,
      isShared: flags.shared,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Added asset "${filename}"`)
    this.log(`  Path: ${response.path}`)
    this.log(`  Size: ${response.asset.size} bytes`)
    this.log(`  Type: ${response.asset.mimeType}`)
  }
}
