import { Args, Command } from '@oclif/core'
import { daemonDeleteLink } from '../daemon/daemon-delete-link.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Remove a link by its ID
 */

export default class Unlink extends Command {
  static override args = {
    linkId: Args.string({
      description: 'Link ID (UUID) to remove — use `links` command to list IDs',
      required: true,
    }),
  }

  static override description = 'Remove a link by its ID'

  static override examples = [
    '<%= config.bin %> unlink <link-uuid>',
    '<%= config.bin %> unlink <link-uuid> --project my-project',
  ]

  static override flags = {
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Unlink)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonDeleteLink({
      projectPath: cwd,
      linkId: args.linkId,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Removed link ${args.linkId}`)
  }
}
