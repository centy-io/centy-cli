// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonCreateItem } from '../../daemon/daemon-create-item.js'
import { projectFlag } from '../../flags/project-flag.js'
import { convertPriority } from '../../lib/create-issue/converters.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a new issue — thin alias over the generic CreateItem RPC
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CreateIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a new issue in the .centy folder'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> create issue --title "Bug in login" --priority high',
    '<%= config.bin %> create issue -t "Add feature" -d "Implement dark mode"',
    '<%= config.bin %> create issue -t "Add feature" --project centy-daemon',
    '<%= config.bin %> create issue --title "WIP feature" --draft',
    '<%= config.bin %> create issue --title "Cross-org bug" --org',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'Issue title',
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      description: 'Issue description',
      default: '',
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
    org: Flags.boolean({
      description: 'Create as an org-wide issue',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreateIssue)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const priority = convertPriority(toPriorityLevel(flags.priority))

    const customFields: Record<string, string> = {}
    if (flags.draft) {
      customFields['draft'] = 'true'
    }
    if (flags.org) {
      customFields['isOrgIssue'] = 'true'
    }

    const response = await daemonCreateItem({
      projectPath: cwd,
      itemType: 'issues',
      title: flags.title,
      body: flags.description,
      status: flags.status,
      priority,
      customFields,
    })

    if (!response.success) {
      const errorMsg =
        response.error !== '' ? response.error : 'Failed to create issue'
      this.error(errorMsg)
    }

    const item = response.item!
    const meta = item.metadata
    const displayId =
      meta !== undefined && meta.displayNumber > 0
        ? ` #${meta.displayNumber}`
        : ''
    this.log(`Created issue${displayId}: "${item.title}"`)
    this.log(`  ID: ${item.id}`)
  }
}

function toPriorityLevel(
  value: string | undefined
): 'low' | 'medium' | 'high' | undefined {
  if (value === 'low' || value === 'medium' || value === 'high') return value
  return undefined
}
