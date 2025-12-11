/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import { daemonListDocs } from '../../daemon/daemon-list-docs.js'

/**
 * List all documentation files
 */
export default class ListDocs extends Command {
  static override description = 'List all documentation files'

  static override examples = [
    '<%= config.bin %> list docs',
    '<%= config.bin %> list docs --json',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListDocs)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
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
