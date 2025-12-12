// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonUpdateDoc } from '../../daemon/daemon-update-doc.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Update an existing doc
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UpdateDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Update an existing documentation file'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> update doc getting-started --title "New Title"',
    '<%= config.bin %> update doc api-reference --content "# New Content"',
    '<%= config.bin %> update doc old-slug --new-slug new-slug',
    '<%= config.bin %> update doc api-reference --title "New Title" --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'New title',
    }),
    content: Flags.string({
      char: 'c',
      description: 'New content (markdown)',
    }),
    'new-slug': Flags.string({
      description: 'Rename the doc to a new slug',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdateDoc)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (!flags.title && !flags.content && !flags['new-slug']) {
      this.error('At least one field must be specified to update.')
    }

    const response = await daemonUpdateDoc({
      projectPath: cwd,
      slug: args.slug,
      title: flags.title,
      content: flags.content,
      newSlug: flags['new-slug'],
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Updated doc "${response.doc.title}" (${response.doc.slug})`)
  }
}
