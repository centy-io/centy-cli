/* eslint-disable ddd/require-spec-file */
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { Args, Command, Flags } from '@oclif/core'

import { daemonAddAsset } from '../../daemon/daemon-add-asset.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

/**
 * Add an asset to an issue, PR, or as a shared asset
 */
export default class AddAsset extends Command {
  static override args = {
    file: Args.string({
      description: 'Path to the file to add',
      required: true,
    }),
  }

  static override description =
    'Add an asset to an issue, PR, or as a shared asset'

  static override examples = [
    '<%= config.bin %> add asset screenshot.png --issue 1',
    '<%= config.bin %> add asset screenshot.png --pr 1',
    '<%= config.bin %> add asset diagram.svg --shared',
    '<%= config.bin %> add asset image.jpg --issue 1 --name my-image.jpg',
  ]

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
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AddAsset)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    if (!flags.issue && !flags.pr && !flags.shared) {
      this.error('Either --issue, --pr, or --shared must be specified.')
    }

    if (flags.issue && flags.pr) {
      this.error('Cannot specify both --issue and --pr. Choose one.')
    }

    let fileData: Buffer
    try {
      fileData = await readFile(args.file)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('ENOENT')) {
        this.error(`File not found: ${args.file}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const filename = flags.name ?? basename(args.file)

    const response = await daemonAddAsset({
      projectPath: cwd,
      issueId: flags.issue,
      prId: flags.pr,
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
