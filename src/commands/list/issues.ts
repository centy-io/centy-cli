// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListIssues } from '../../daemon/daemon-list-issues.js'
import type { Issue } from '../../daemon/types.js'
import { projectFlag } from '../../flags/project-flag.js'
import { ensureInitialized, NotInitializedError } from '../../utils/ensure-initialized.js'
import { groupByProject } from '../../utils/group-by-project.js'
import { listAcrossProjects } from '../../utils/list-across-projects.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

const formatIssue = (issue: Issue): string => {
  const meta = issue.metadata
  const priority = meta !== undefined
    ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`)
    : 'P?'
  const status = meta !== undefined ? meta.status : 'unknown'
  const draft = meta !== undefined && meta.draft === true ? ' [DRAFT]' : ''
  return `#${issue.displayNumber} [${priority}] [${status}]${draft} ${issue.title}`
}

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListIssues extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all issues'
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['issue:list']
  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list issues',
    '<%= config.bin %> list issues --all',
    '<%= config.bin %> list issues -a --status open',
  ]
  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    status: Flags.string({ char: 's', description: 'Filter by status' }),
    priority: Flags.integer({ char: 'p', description: 'Filter by priority' }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
    draft: Flags.boolean({ description: 'Filter by draft status', allowNo: true }),
    all: Flags.boolean({ char: 'a', description: 'List from all projects', default: false }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListIssues)
    if (flags.all) return this.listAll(flags)
    const cwd = await resolveProjectPath(flags.project)
    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) this.error(error.message)
      throw error instanceof Error ? error : new Error(String(error))
    }
    const response = await daemonListIssues({
      projectPath: cwd, status: flags.status, priority: flags.priority, draft: flags.draft,
    })
    if (flags.json) return void this.log(JSON.stringify(response.issues, null, 2))
    if (response.issues.length === 0) return void this.log('No issues found.')
    this.log(`Found ${response.totalCount} issue(s):\n`)
    for (const issue of response.issues) this.log(formatIssue(issue))
  }

  private async listAll(flags: {
    status?: string; priority?: number; draft?: boolean; json: boolean
  }): Promise<void> {
    const result = await listAcrossProjects<Issue>({
      async listFn(projectPath) {
        const r = await daemonListIssues({
          projectPath, status: flags.status, priority: flags.priority, draft: flags.draft,
        })
        return r.issues
      },
    })
    if (flags.json) {
      const issues = result.items.map(i => ({
        issue: i.entity, projectName: i.projectName, projectPath: i.projectPath,
      }))
      return void this.log(JSON.stringify({ issues, totalCount: issues.length, errors: result.errors }, null, 2))
    }
    if (result.items.length === 0) {
      this.log('No issues found across all projects.')
      return void this.printErrors(result.errors)
    }
    this.log(`Found ${result.items.length} issue(s) across all projects:\n`)
    for (const [name, items] of groupByProject(result.items)) {
      this.log(`--- ${name} (${items.length} issue(s)) ---`)
      for (const i of items) this.log(`  ${formatIssue(i.entity)}`)
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
