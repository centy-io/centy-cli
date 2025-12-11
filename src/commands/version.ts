import { Command, Flags } from '@oclif/core'

import { daemonGetProjectVersion } from '../daemon/daemon-get-project-version.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'

/**
 * Get project version info
 */
export default class Version extends Command {
  static override description =
    'Get project version info and comparison with daemon'

  static override examples = [
    '<%= config.bin %> version',
    '<%= config.bin %> version --json',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Version)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonGetProjectVersion({
      projectPath: cwd,
    })

    if (flags.json) {
      this.log(JSON.stringify(response, null, 2))
      return
    }

    this.log(`Project Version: ${response.projectVersion}`)
    this.log(`Daemon Version: ${response.daemonVersion}`)
    this.log(`Status: ${this.formatComparison(response.comparison)}`)
    if (response.degradedMode) {
      this.warn('Running in degraded mode - project version is ahead of daemon')
    }
  }

  private formatComparison(comparison: string): string {
    switch (comparison) {
      case 'equal':
        return 'Up to date ✓'
      case 'project_behind':
        return 'Update available (run "centy update")'
      case 'project_ahead':
        return 'Project ahead of daemon (update daemon)'
      default:
        return comparison
    }
  }
}
