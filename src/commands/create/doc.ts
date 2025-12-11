/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { daemonCreateDoc } from '../../daemon/daemon-create-doc.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

/**
 * Create a new documentation file
 */
export default class CreateDoc extends Command {
  static override description = 'Create a new documentation file'

  static override examples = [
    '<%= config.bin %> create doc --title "Getting Started"',
    '<%= config.bin %> create doc -t "API Reference" -c "# API\n\nDocumentation here"',
    '<%= config.bin %> create doc --title "Guide" --slug my-guide',
  ]

  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'Doc title',
      required: true,
    }),
    content: Flags.string({
      char: 'c',
      description: 'Doc content (markdown)',
      default: '',
    }),
    slug: Flags.string({
      description: 'Custom slug (auto-generated from title if not provided)',
    }),
    template: Flags.string({
      description: 'Template name to use',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreateDoc)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    const response = await daemonCreateDoc({
      projectPath: cwd,
      title: flags.title,
      content: flags.content,
      slug: flags.slug,
      template: flags.template,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Created doc "${flags.title}"`)
    this.log(`  Slug: ${response.slug}`)
    this.log(`  File: ${response.createdFile}`)
  }
}
