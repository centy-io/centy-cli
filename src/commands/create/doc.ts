// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonCreateItem } from '../../daemon/daemon-create-item.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a new documentation file — thin alias over the generic CreateItem RPC
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CreateDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a new documentation file'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> create doc --title "Getting Started"',
    '<%= config.bin %> create doc -t "API Reference" -b "# API\\nDocumentation here"',
    '<%= config.bin %> create doc --title "Guide" --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'Doc title',
      required: true,
    }),
    body: Flags.string({
      char: 'b',
      description: 'Doc content (markdown)',
      default: '',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreateDoc)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonCreateItem({
      projectPath: cwd,
      itemType: 'docs',
      title: flags.title,
      body: flags.body,
      status: '',
      priority: 0,
      customFields: {},
    })

    if (!response.success) {
      const errorMsg =
        response.error !== '' ? response.error : 'Failed to create doc'
      this.error(errorMsg)
    }

    const item = response.item!
    this.log(`Created doc: "${item.title}"`)
    this.log(`  ID: ${item.id}`)
  }
}
