// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDuplicateDoc } from '../../daemon/daemon-duplicate-doc.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Duplicate a doc (same or different project)
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class DuplicateDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Duplicate a doc (same project or different project)'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> duplicate doc my-doc',
    '<%= config.bin %> duplicate doc readme --new-slug readme-v2',
    '<%= config.bin %> duplicate doc api-guide --to /path/to/other/project',
    '<%= config.bin %> duplicate doc spec --to ../other --new-slug spec-copy --title "Spec Copy"',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    to: Flags.string({
      char: 't',
      description:
        'Target project path (defaults to same project if not specified)',
    }),
    'new-slug': Flags.string({
      char: 's',
      description: 'Slug for the duplicate (defaults to "{slug}-copy")',
    }),
    title: Flags.string({
      description: 'Title for the duplicate (defaults to "Copy of {original}")',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DuplicateDoc)
    const sourceProjectPath = await resolveProjectPath(flags.project)
    const targetProjectPath = flags.to
      ? await resolveProjectPath(flags.to)
      : sourceProjectPath

    // Ensure source project is initialized
    try {
      await ensureInitialized(sourceProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Source project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    // Ensure target project is initialized (if different)
    if (targetProjectPath !== sourceProjectPath) {
      try {
        await ensureInitialized(targetProjectPath)
      } catch (error) {
        if (error instanceof NotInitializedError) {
          this.error(`Target project: ${error.message}`)
        }
        throw error instanceof Error ? error : new Error(String(error))
      }
    }

    const response = await daemonDuplicateDoc({
      sourceProjectPath,
      slug: args.slug,
      targetProjectPath,
      newSlug: flags['new-slug'],
      newTitle: flags.title,
    })

    if (!response.success) {
      this.error(response.error)
    }

    const locationInfo =
      targetProjectPath !== sourceProjectPath
        ? ` in ${targetProjectPath}`
        : ' in current project'

    this.log(
      `Duplicated doc → "${response.doc.slug}" "${response.doc.title}"${locationInfo}`
    )
  }
}
