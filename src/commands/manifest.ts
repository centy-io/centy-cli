// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonGetManifest } from '../daemon/daemon-get-manifest.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Get the project manifest
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Manifest extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get the project manifest'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> manifest',
    '<%= config.bin %> manifest --json',
    '<%= config.bin %> manifest --project centy-daemon',
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
    const { flags } = await this.parse(Manifest)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
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
