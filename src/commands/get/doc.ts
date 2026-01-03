/* eslint-disable max-lines */

// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetDoc } from '../../daemon/daemon-get-doc.js'
import { daemonGetDocsBySlug } from '../../daemon/daemon-get-docs-by-slug.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  formatCrossProjectHint,
  formatCrossProjectJson,
  handleNotInitializedWithSearch,
  isNotFoundError,
} from '../../utils/cross-project-search.js'
import { ensureInitialized } from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get a single doc by slug
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class GetDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['show:doc']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get a documentation file by slug'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get doc getting-started',
    '<%= config.bin %> get doc api-reference --json',
    '<%= config.bin %> get doc getting-started --global',
    '<%= config.bin %> get doc getting-started -g --json',
    '<%= config.bin %> get doc api-reference --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'Search across all tracked projects',
      default: false,
    }),
    project: projectFlag,
  }

  // eslint-disable-next-line max-lines-per-function
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetDoc)
    const cwd = await resolveProjectPath(flags.project)

    // Handle global search
    if (flags.global) {
      const result = await daemonGetDocsBySlug({ slug: args.slug })

      if (flags.json) {
        this.log(JSON.stringify(result, null, 2))
        return
      }

      if (result.docs.length === 0) {
        this.log(`No docs found with slug: ${args.slug}`)
        if (result.errors.length > 0) {
          this.warn('Some projects could not be searched:')
          for (const err of result.errors) {
            this.warn(`  - ${err}`)
          }
        }
        return
      }

      this.log(
        `Found ${result.totalCount} doc(s) matching slug: ${args.slug}\n`
      )

      for (const dwp of result.docs) {
        const doc = dwp.doc
        this.log(`--- Project: ${dwp.projectName} (${dwp.projectPath}) ---`)
        this.log(`Title: ${doc.title}`)
        this.log(`Slug: ${doc.slug}`)
        this.log(
          `Created: ${doc.metadata !== undefined ? doc.metadata.createdAt : 'unknown'}`
        )
        this.log(
          `Updated: ${doc.metadata !== undefined ? doc.metadata.updatedAt : 'unknown'}`
        )
        if (doc.content) {
          this.log(`\nContent:\n${doc.content}`)
        }
        this.log('')
      }

      if (result.errors.length > 0) {
        this.warn('Some projects could not be searched:')
        for (const err of result.errors) {
          this.warn(`  - ${err}`)
        }
      }
      return
    }

    // Local search
    try {
      await ensureInitialized(cwd)
    } catch (error) {
      const result = await handleNotInitializedWithSearch(error, {
        entityType: 'doc',
        identifier: args.slug,
        jsonMode: flags.json,
        async globalSearchFn() {
          const searchResult = await daemonGetDocsBySlug({ slug: args.slug })
          return {
            matches: searchResult.docs.map(dwp => ({
              projectName: dwp.projectName,
              projectPath: dwp.projectPath,
            })),
            errors: searchResult.errors,
          }
        },
      })

      if (result !== null) {
        if (result.jsonOutput !== undefined) {
          this.log(JSON.stringify(result.jsonOutput, null, 2))
          this.exit(1)
        }
        this.error(result.message)
      }

      throw error instanceof Error ? error : new Error(String(error))
    }

    try {
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
    } catch (error) {
      // For NOT_FOUND errors, try cross-project search to provide helpful hints
      if (isNotFoundError(error)) {
        // Try global search to see if the doc exists in another project
        const result = await daemonGetDocsBySlug({ slug: args.slug })
        if (result.docs.length > 0) {
          const matches = result.docs.map(dwp => ({
            projectName: dwp.projectName,
            projectPath: dwp.projectPath,
          }))

          if (flags.json) {
            this.log(
              JSON.stringify(
                formatCrossProjectJson('doc', args.slug, matches),
                null,
                2
              )
            )
            this.exit(1)
          }

          this.error(formatCrossProjectHint('doc', args.slug, matches))
        }
      }
      // Re-throw original error if not found anywhere or not a NOT_FOUND error
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}
