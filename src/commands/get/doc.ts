/* eslint-disable ddd/require-spec-file */
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetDoc } from '../../daemon/daemon-get-doc.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

/**
 * Get a single doc by slug
 */
export default class GetDoc extends Command {
  static override aliases = ['show:doc']

  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  static override description = 'Get a documentation file by slug'

  static override examples = [
    '<%= config.bin %> get doc getting-started',
    '<%= config.bin %> get doc api-reference --json',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetDoc)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    const doc = await daemonGetDoc({
      projectPath: cwd,
      slug: args.slug,
    })

    if (flags.json) {
      this.log(JSON.stringify(doc, null, 2))
      return
    }

    this.log(`Title: ${doc.title}`)
    this.log(`Slug: ${doc.slug}`)
    this.log(
      `Created: ${doc.metadata !== undefined ? doc.metadata.createdAt : 'unknown'}`
    )
    this.log(
      `Updated: ${doc.metadata !== undefined ? doc.metadata.updatedAt : 'unknown'}`
    )
    this.log(`\nContent:\n${doc.content}`)
  }
}
