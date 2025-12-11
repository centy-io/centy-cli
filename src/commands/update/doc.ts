/* eslint-disable ddd/require-spec-file */
import { Args, Command, Flags } from '@oclif/core'

import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import { daemonUpdateDoc } from '../../daemon/daemon-update-doc.js'

/**
 * Update an existing doc
 */
export default class UpdateDoc extends Command {
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  static override description = 'Update an existing documentation file'

  static override examples = [
    '<%= config.bin %> update doc getting-started --title "New Title"',
    '<%= config.bin %> update doc api-reference --content "# New Content"',
    '<%= config.bin %> update doc old-slug --new-slug new-slug',
  ]

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
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdateDoc)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
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
