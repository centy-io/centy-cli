/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { daemonGetManifest } from '../daemon/daemon-get-manifest.js'
import { daemonIsInitialized } from '../daemon/daemon-is-initialized.js'

/**
 * Get the project manifest
 */
export default class Manifest extends Command {
  static override description = 'Get the project manifest'

  static override examples = [
    '<%= config.bin %> manifest',
    '<%= config.bin %> manifest --json',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Manifest)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    const manifest = await daemonGetManifest({
      projectPath: cwd,
    })

    if (flags.json) {
      this.log(JSON.stringify(manifest, null, 2))
      return
    }

    this.log(`Centy Manifest`)
    this.log(`  Schema Version: ${manifest.schemaVersion}`)
    this.log(`  Centy Version: ${manifest.centyVersion}`)
    this.log(`  Created: ${manifest.createdAt}`)
    this.log(`  Updated: ${manifest.updatedAt}`)
  }
}
