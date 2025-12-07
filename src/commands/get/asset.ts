import { writeFile } from 'node:fs/promises'
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetAsset } from '../../daemon/daemon-get-asset.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

/**
 * Get an asset and save it to a file
 */
export default class GetAsset extends Command {
  static override args = {
    filename: Args.string({
      description: 'Asset filename',
      required: true,
    }),
  }

  static override description = 'Get an asset and save it to a file'

  static override examples = [
    '<%= config.bin %> get asset screenshot.png --issue 1 --output ./screenshot.png',
    '<%= config.bin %> get asset logo.svg --shared --output ./logo.svg',
  ]

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
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetAsset)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    if (!flags.issue && !flags.shared) {
      this.error('Either --issue or --shared must be specified.')
    }

    const response = await daemonGetAsset({
      projectPath: cwd,
      issueId: flags.issue,
      filename: args.filename,
      isShared: flags.shared,
    })

    if (!response.success) {
      this.error(response.error)
    }

    const outputPath = flags.output ?? args.filename
    await writeFile(outputPath, response.data)

    this.log(`Saved asset to ${outputPath}`)
    this.log(`  Size: ${response.asset.size} bytes`)
    this.log(`  Type: ${response.asset.mimeType}`)
  }
}
