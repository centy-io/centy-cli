// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListDocs } from '../../daemon/daemon-list-docs.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List all documentation files
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListDocs extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all documentation files'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list docs',
    '<%= config.bin %> list docs --json',
    '<%= config.bin %> list docs --project centy-daemon',
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
    const { flags } = await this.parse(ListDocs)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonListDocs({
      projectPath: cwd,
    })

    if (flags.json) {
      this.log(JSON.stringify(response.docs, null, 2))
      return
    }

    if (response.docs.length === 0) {
      this.log('No docs found.')
      return
    }

    this.log(`Found ${response.totalCount} doc(s):\n`)
    for (const doc of response.docs) {
      this.log(`${doc.slug}: ${doc.title}`)
    }
  }
}
