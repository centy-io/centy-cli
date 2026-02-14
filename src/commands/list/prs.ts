// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListPrs } from '../../daemon/daemon-list-prs.js'
import type { PullRequest } from '../../daemon/types.js'
import { projectFlag } from '../../flags/project-flag.js'
import { ensureInitialized, NotInitializedError } from '../../utils/ensure-initialized.js'
import { groupByProject } from '../../utils/group-by-project.js'
import { listAcrossProjects } from '../../utils/list-across-projects.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

const formatPr = (pr: PullRequest): string => {
  const meta = pr.metadata
  const priority = meta !== undefined
    ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`) : 'P?'
  const status = meta !== undefined ? meta.status : 'unknown'
  const branches = meta !== undefined ? `${meta.sourceBranch} -> ${meta.targetBranch}` : '? -> ?'
  return `#${pr.displayNumber} [${priority}] [${status}] ${pr.title}\n      ${branches}`
}

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListPrs extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all pull requests'
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['pr:list']
  // eslint-disable-next-line no-restricted-syntax
  static override examples = ['<%= config.bin %> list prs', '<%= config.bin %> list prs --all']
  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    status: Flags.string({ char: 's', description: 'Filter by status' }),
    source: Flags.string({ description: 'Filter by source branch' }),
    target: Flags.string({ description: 'Filter by target branch' }),
    priority: Flags.integer({ char: 'p', description: 'Filter by priority' }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
    all: Flags.boolean({ char: 'a', description: 'List from all projects', default: false }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListPrs)
    if (flags.all) return this.listAll(flags)
    const cwd = await resolveProjectPath(flags.project)
    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) this.error(error.message)
      throw error instanceof Error ? error : new Error(String(error))
    }
    const response = await daemonListPrs({
      projectPath: cwd, status: flags.status, sourceBranch: flags.source,
      targetBranch: flags.target, priority: flags.priority,
    })
    if (flags.json) return void this.log(JSON.stringify(response.prs, null, 2))
    if (response.prs.length === 0) return void this.log('No pull requests found.')
    this.log(`Found ${response.totalCount} PR(s):\n`)
    for (const pr of response.prs) this.log(formatPr(pr))
  }

  private async listAll(flags: {
    status?: string; source?: string; target?: string; priority?: number; json: boolean
  }): Promise<void> {
    const result = await listAcrossProjects<PullRequest>({
      async listFn(projectPath) {
        const r = await daemonListPrs({
          projectPath, status: flags.status, sourceBranch: flags.source,
          targetBranch: flags.target, priority: flags.priority,
        })
        return r.prs
      },
    })
    if (flags.json) {
      const prs = result.items.map(i => ({
        pr: i.entity, projectName: i.projectName, projectPath: i.projectPath,
      }))
      return void this.log(JSON.stringify({ prs, totalCount: prs.length, errors: result.errors }, null, 2))
    }
    if (result.items.length === 0) {
      this.log('No PRs found across all projects.')
      return void this.printErrors(result.errors)
    }
    this.log(`Found ${result.items.length} PR(s) across all projects:\n`)
    for (const [name, items] of groupByProject(result.items)) {
      this.log(`--- ${name} (${items.length} PR(s)) ---`)
      for (const i of items) this.log(`  ${formatPr(i.entity)}`)
      this.log('')
    }
    this.printErrors(result.errors)
  }

  private printErrors(errors: string[]): void {
    if (errors.length > 0) {
      this.warn('Some projects could not be searched:')
      for (const err of errors) this.warn(`  - ${err}`)
    }
  }
}
