import { Command, Flags } from '@oclif/core'

import { projectFlag } from '../../flags/project-flag.js'
import { createIssue } from '../../lib/create-issue/index.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a new issue in the .centy/issues folder
 */
export default class CreateIssue extends Command {
  static override description = 'Create a new issue in the .centy folder'

  static override examples = [
    '<%= config.bin %> create issue',
    '<%= config.bin %> create issue --title "Bug in login" --priority high',
    '<%= config.bin %> create issue -t "Add feature" -d "Implement dark mode"',
    '<%= config.bin %> create issue -t "Add feature" --project centy-daemon',
  ]

  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'Issue title',
    }),
    description: Flags.string({
      char: 'd',
      description: 'Issue description',
    }),
    priority: Flags.string({
      char: 'p',
      description: 'Priority level (low/medium/high)',
      options: ['low', 'medium', 'high'],
    }),
    status: Flags.string({
      char: 's',
      description: 'Initial status',
      default: 'open',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreateIssue)
    const cwd = await resolveProjectPath(flags.project)

    const result = await createIssue({
      cwd,
      title: flags.title,
      description: flags.description,
      priority: flags.priority as 'low' | 'medium' | 'high' | undefined,
      status: flags.status,
    })

    if (!result.success) {
      this.error(result.error ?? 'Failed to create issue')
    }
  }
}
