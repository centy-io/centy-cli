/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { daemonGetProjectVersion } from '../daemon/daemon-get-project-version.js'
import { daemonIsInitialized } from '../daemon/daemon-is-initialized.js'
import { daemonUpdateVersion } from '../daemon/daemon-update-version.js'

/**
 * Update project to a target version
 */
export default class Update extends Command {
  static override description =
    'Update project to a target version (runs migrations)'

  static override examples = [
    '<%= config.bin %> update',
    '<%= config.bin %> update --target 0.2.0',
    '<%= config.bin %> update --force',
  ]

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
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    const versionInfo = await daemonGetProjectVersion({ projectPath: cwd })
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
