// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListProjects } from '../../daemon/daemon-list-projects.js'

/**
 * List all tracked projects
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListProjects extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all tracked centy projects'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list projects',
    '<%= config.bin %> list projects --include-stale',
    '<%= config.bin %> list projects --include-uninitialized',
    '<%= config.bin %> list projects --org centy-io',
    '<%= config.bin %> list projects --ungrouped',
    '<%= config.bin %> list projects --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    'include-stale': Flags.boolean({
      description: 'Include projects where path no longer exists',
      default: false,
    }),
    'include-uninitialized': Flags.boolean({
      description: 'Include projects that are not initialized',
      default: false,
    }),
    org: Flags.string({
      description: 'Filter by organization slug',
    }),
    ungrouped: Flags.boolean({
      description: 'Only show projects without an organization',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListProjects)

    const response = await daemonListProjects({
      includeStale: flags['include-stale'],
      includeUninitialized: flags['include-uninitialized'],
      organizationSlug: flags.org,
      ungroupedOnly: flags.ungrouped,
    })

    if (flags.json) {
      this.log(JSON.stringify(response.projects, null, 2))
      return
    }

    if (response.projects.length === 0) {
      this.log('No tracked projects found.')
      return
    }

    // Sort favorites first
    const sortedProjects = [...response.projects].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return 0
    })

    this.log(`Found ${response.totalCount} project(s):\n`)
    for (const project of sortedProjects) {
      const status = project.initialized ? '✓' : '✗'
      const favorite = project.isFavorite ? '★' : ' '
      this.log(`${favorite} ${status} ${project.name}`)
      this.log(`    Path: ${project.path}`)
      if (project.organizationName) {
        this.log(
          `    Organization: ${project.organizationName} (${project.organizationSlug})`
        )
      }
      this.log(`    Issues: ${project.issueCount}, Docs: ${project.docCount}`)
      this.log(`    Last accessed: ${project.lastAccessed}`)
      this.log('')
    }
  }
}
