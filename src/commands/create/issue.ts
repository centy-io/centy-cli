// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { projectFlag } from '../../flags/project-flag.js'
import { createIssue } from '../../lib/create-issue/index.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a new issue in the .centy/issues folder
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CreateIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a new issue in the .centy folder'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> create issue',
    '<%= config.bin %> create issue --title "Bug in login" --priority high',
    '<%= config.bin %> create issue -t "Add feature" -d "Implement dark mode"',
    '<%= config.bin %> create issue -t "Add feature" --project centy-daemon',
    '<%= config.bin %> create issue --title "WIP feature" --draft',
  ]

  // eslint-disable-next-line no-restricted-syntax
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
    draft: Flags.boolean({
      description: 'Create as draft',
      default: false,
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
      // eslint-disable-next-line no-restricted-syntax
      priority: flags.priority as 'low' | 'medium' | 'high' | undefined,
      status: flags.status,
      draft: flags.draft,
    })

    if (!result.success) {
      // eslint-disable-next-line no-restricted-syntax
      this.error(result.error ?? 'Failed to create issue')
    }
  }
}
