// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListDocs } from '../../daemon/daemon-list-docs.js'
import type { Doc } from '../../daemon/types.js'
import { projectFlag } from '../../flags/project-flag.js'
import { ensureInitialized, NotInitializedError } from '../../utils/ensure-initialized.js'
import { groupByProject } from '../../utils/group-by-project.js'
import { listAcrossProjects } from '../../utils/list-across-projects.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListDocs extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all documentation files'
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['doc:list']
  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list docs',
    '<%= config.bin %> list docs --all',
    '<%= config.bin %> list docs -a --json',
  ]
  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
    all: Flags.boolean({ char: 'a', description: 'List from all projects', default: false }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListDocs)
    if (flags.all) return this.listAll(flags)
    const cwd = await resolveProjectPath(flags.project)
    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) this.error(error.message)
      throw error instanceof Error ? error : new Error(String(error))
    }
    const response = await daemonListDocs({ projectPath: cwd })
    if (flags.json) return void this.log(JSON.stringify(response.docs, null, 2))
    if (response.docs.length === 0) return void this.log('No docs found.')
    this.log(`Found ${response.totalCount} doc(s):\n`)
    for (const doc of response.docs) this.log(`${doc.slug}: ${doc.title}`)
  }

  private async listAll(flags: { json: boolean }): Promise<void> {
    const result = await listAcrossProjects<Doc>({
      async listFn(projectPath) {
        const r = await daemonListDocs({ projectPath })
        return r.docs
      },
    })
    if (flags.json) {
      const docs = result.items.map(i => ({
        doc: i.entity, projectName: i.projectName, projectPath: i.projectPath,
      }))
      return void this.log(JSON.stringify({ docs, totalCount: docs.length, errors: result.errors }, null, 2))
    }
    if (result.items.length === 0) {
      this.log('No docs found across all projects.')
      return void this.printErrors(result.errors)
    }
    this.log(`Found ${result.items.length} doc(s) across all projects:\n`)
    for (const [name, items] of groupByProject(result.items)) {
      this.log(`--- ${name} (${items.length} doc(s)) ---`)
      for (const i of items) this.log(`  ${i.entity.slug}: ${i.entity.title}`)
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
