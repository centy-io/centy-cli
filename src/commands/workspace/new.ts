// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonGetSupportedEditors } from '../../daemon/daemon-get-supported-editors.js'
import { daemonOpenStandaloneWorkspace } from '../../daemon/daemon-open-standalone-workspace.js'
import { projectFlag } from '../../flags/project-flag.js'
import { resolveEditorId } from '../../lib/workspace/resolve-editor-id.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Open a standalone workspace not tied to an issue
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class WorkspaceNew extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Create a standalone workspace not tied to an issue'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> workspace new',
    '<%= config.bin %> workspace new --name my-workspace',
    '<%= config.bin %> workspace new --name "Feature spike" --description "Explore new auth approach" --ttl 24',
    '<%= config.bin %> workspace new --editor vscode',
    '<%= config.bin %> workspace new --editor terminal',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    project: projectFlag,
    name: Flags.string({
      description: 'Optional workspace name',
    }),
    description: Flags.string({
      char: 'd',
      description: 'Optional description/goal for the AI agent',
    }),
    ttl: Flags.integer({
      description: 'Workspace TTL in hours (default: 12)',
    }),
    agent: Flags.string({
      description: 'Agent name to use (default: project default)',
    }),
    editor: Flags.string({
      description:
        'Editor to use: vscode, terminal (default: interactive selection or project default)',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(WorkspaceNew)
    const cwd = await resolveProjectPath(flags.project)

    const { editors } = await daemonGetSupportedEditors({})

    let editorId: string
    try {
      editorId = await resolveEditorId(flags.editor, editors)
    } catch (error) {
      this.error(error instanceof Error ? error.message : String(error))
    }

    const response = await daemonOpenStandaloneWorkspace({
      projectPath: cwd,
      name: flags.name !== undefined ? flags.name : '',
      description: flags.description !== undefined ? flags.description : '',
      ttlHours: flags.ttl !== undefined ? flags.ttl : 0,
      agentName: flags.agent !== undefined ? flags.agent : '',
      editorId,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (response.workspaceReused) {
      this.log(`Reopened existing workspace at: ${response.workspacePath}`)
      if (response.originalCreatedAt) {
        this.log(`Originally created: ${response.originalCreatedAt}`)
      }
    } else {
      this.log(`Created workspace at: ${response.workspacePath}`)
    }

    if (response.name) {
      this.log(`Name: ${response.name}`)
    }
    this.log(`Expires: ${response.expiresAt}`)

    if (response.editorOpened) {
      this.log('Editor opened successfully')
    } else {
      this.warn('Editor could not be opened automatically. Open manually.')
    }
  }
}
