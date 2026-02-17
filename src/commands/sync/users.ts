// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonSyncUsers } from '../../daemon/daemon-sync-users.js'
import { projectFlag } from '../../flags/project-flag.js'
import type { SyncUsersResponse } from '../../daemon/types.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Sync users from git history
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class SyncUsers extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Sync users from git history'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> sync users',
    '<%= config.bin %> sync users --dry-run',
    '<%= config.bin %> sync users --json',
    '<%= config.bin %> sync users --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    'dry-run': Flags.boolean({
      char: 'd',
      description: 'Show what would be done without making changes',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(SyncUsers)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonSyncUsers({
      projectPath: cwd,
      dryRun: flags['dry-run'],
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response, null, 2))
      return
    }

    if (flags['dry-run']) {
      this.printDryRunOutput(response)
    } else {
      this.printSyncOutput(response)
    }
  }

  private printDryRunOutput(response: SyncUsersResponse): void {
    if (response.wouldCreate.length === 0 && response.wouldSkip.length === 0) {
      this.log('No git contributors found.')
      return
    }

    if (response.wouldCreate.length > 0) {
      this.log(`Would create ${response.wouldCreate.length} user(s):`)
      for (const contributor of response.wouldCreate) {
        this.log(`  ${contributor.name} <${contributor.email}>`)
      }
    }

    if (response.wouldSkip.length === 0) {
      return
    }

    this.log(
      `\nWould skip ${response.wouldSkip.length} user(s) (already exist):`
    )
    for (const contributor of response.wouldSkip) {
      this.log(`  ${contributor.name} <${contributor.email}>`)
    }
  }

  private printSyncOutput(response: SyncUsersResponse): void {
    if (response.created.length > 0) {
      this.log(`Created ${response.created.length} user(s):`)
      for (const userId of response.created) this.log(`  ${userId}`)
    }
    if (response.skipped.length > 0) {
      this.log(`\nSkipped ${response.skipped.length} user(s) (already exist):`)
      for (const email of response.skipped) this.log(`  ${email}`)
    }
    if (response.errors.length > 0) {
      this.log(`\nErrors (${response.errors.length}):`)
      for (const err of response.errors) this.log(`  ${err}`)
    }
    const hasNoResults =
      response.created.length === 0 &&
      response.skipped.length === 0 &&
      response.errors.length === 0
    if (hasNoResults) this.log('No git contributors found.')
  }
}
