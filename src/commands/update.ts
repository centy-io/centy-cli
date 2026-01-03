// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonGetProjectVersion } from '../daemon/daemon-get-project-version.js'
import { daemonUpdateVersion } from '../daemon/daemon-update-version.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'

/**
 * Update project to a target version
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Update extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Update project to a target version (runs migrations)'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> update',
    '<%= config.bin %> update --target 0.2.0',
    '<%= config.bin %> update --force',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    target: Flags.string({
      char: 't',
      description: 'Target version to update to (defaults to daemon version)',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Update)
    // eslint-disable-next-line no-restricted-syntax
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const versionInfo = await daemonGetProjectVersion({ projectPath: cwd })
    // eslint-disable-next-line no-restricted-syntax
    const targetVersion = flags.target ?? versionInfo.daemonVersion

    if (versionInfo.projectVersion === targetVersion) {
      this.log(`Project is already at version ${targetVersion}`)
      return
    }

    if (!flags.force) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer = await new Promise<string>(resolve => {
        rl.question(
          `Update project from ${versionInfo.projectVersion} to ${targetVersion}? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonUpdateVersion({
      projectPath: cwd,
      targetVersion,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(
      `Updated project from ${response.fromVersion} to ${response.toVersion}`
    )
    if (response.migrationsApplied.length > 0) {
      this.log(`Migrations applied:`)
      for (const migration of response.migrationsApplied) {
        this.log(`  - ${migration}`)
      }
    }
  }
}
