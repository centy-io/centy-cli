// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonCreateDoc } from '../../daemon/daemon-create-doc.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a new documentation file
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CreateDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a new documentation file'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> create doc --title "Getting Started"',
    '<%= config.bin %> create doc -t "API Reference" -c "# API\n\nDocumentation here"',
    '<%= config.bin %> create doc --title "Guide" --slug my-guide',
    '<%= config.bin %> create doc --title "Guide" --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
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

    const response = await daemonCreateDoc({
      projectPath: cwd,
      title: flags.title,
      content: flags.content,
      slug: flags.slug !== undefined ? flags.slug : '',
      template: flags.template !== undefined ? flags.template : '',
      isOrgDoc: false,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Created doc "${flags.title}"`)
    this.log(`  Slug: ${response.slug}`)
    this.log(`  File: ${response.createdFile}`)
  }
}
