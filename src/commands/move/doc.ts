// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonMoveDoc } from '../../daemon/daemon-move-doc.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Move a doc to a different project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class MoveDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Move a doc to a different project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> move doc my-doc --to /path/to/target/project',
    '<%= config.bin %> move doc readme --to ../other-project --new-slug new-readme',
    '<%= config.bin %> move doc api-guide --to ~/projects/target --project ./source',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    to: Flags.string({
      char: 't',
      description: 'Target project path',
      required: true,
    }),
    'new-slug': Flags.string({
      char: 's',
      description: 'New slug for the doc (if slug already exists in target)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MoveDoc)
    const sourceProjectPath = await resolveProjectPath(flags.project)
    const targetProjectPath = await resolveProjectPath(flags.to)

    // Ensure source project is initialized
    try {
      await ensureInitialized(sourceProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Source project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    // Ensure target project is initialized
    try {
      await ensureInitialized(targetProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Target project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (sourceProjectPath === targetProjectPath) {
      this.error('Source and target project cannot be the same.')
    }

    const response = await daemonMoveDoc({
      sourceProjectPath,
      slug: args.slug,
      targetProjectPath,
      newSlug: flags['new-slug'],
    })

    if (!response.success) {
      this.error(response.error)
    }

    const slugInfo =
      response.oldSlug !== response.doc.slug
        ? `${response.oldSlug} → ${response.doc.slug}`
        : response.doc.slug

    this.log(`Moved doc "${slugInfo}" to ${targetProjectPath}`)
  }
}
