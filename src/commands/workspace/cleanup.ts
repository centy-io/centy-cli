import { Command } from '@oclif/core'
import { daemonCleanupExpiredWorkspaces } from '../../daemon/daemon-cleanup-expired-workspaces.js'

/**
 * Cleanup all expired temporary workspaces
 */

export default class WorkspaceCleanup extends Command {

  static override description = 'Cleanup all expired temporary workspaces'


  static override examples = ['<%= config.bin %> workspace cleanup']

  public async run(): Promise<void> {
    const response = await daemonCleanupExpiredWorkspaces({})

    if (!response.success) {
      this.error('Cleanup failed')
    }

    if (response.cleanedCount === 0) {
      this.log('No expired workspaces to clean up')
      return
    }

    this.log(`Cleaned up ${response.cleanedCount} expired workspace(s)`)

    if (response.failedPaths.length === 0) {
      return
    }

    this.warn(`Failed to clean up ${response.failedPaths.length} workspace(s):`)
    for (const path of response.failedPaths) {
      this.warn(`  - ${path}`)
    }
  }
}
