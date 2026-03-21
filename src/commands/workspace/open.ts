import { Args, Command, Flags } from '@oclif/core'
import { daemonGetSupportedEditors } from '../../daemon/daemon-get-supported-editors.js'
import { daemonOpenInTempWorkspace } from '../../daemon/daemon-open-in-temp-workspace.js'
import { projectFlag } from '../../flags/project-flag.js'
import { resolveEditorId } from '../../lib/workspace/resolve-editor-id.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Open an issue in a temporary workspace
 */

export default class WorkspaceOpen extends Command {
  static override description = 'Open an issue in a temporary workspace'

  static override examples = [
    '<%= config.bin %> workspace open 1',
    '<%= config.bin %> workspace open abc-123 --ttl 24',
    '<%= config.bin %> workspace open 1 --editor vscode',
  ]

  static override args = {
    issueId: Args.string({
      description: 'Issue ID or display number',
      required: true,
    }),
  }

  static override flags = {
    project: projectFlag,
    ttl: Flags.integer({
      description: 'Workspace TTL in hours (default: 12)',
    }),
    agent: Flags.string({
      description: 'Agent name to use (default: project default)',
    }),
    editor: Flags.string({
      description:
        'Editor to use (default: interactive selection or project default)',
    }),
  }

  public async run(): Promise<void> {
    const { editors } = await daemonGetSupportedEditors({})
    const availableIds = editors.filter(e => e.available).map(e => e.editorId)

    const { args, flags } = await this.parse({
      args: WorkspaceOpen.args,
      flags: {
        ...WorkspaceOpen.flags,
        editor: Flags.string({
          description: WorkspaceOpen.flags.editor.description,
          options: availableIds,
        }),
      },
    })

    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    let editorId: string
    try {
      editorId = await resolveEditorId(flags.editor, editors)
    } catch (error) {
      this.error(error instanceof Error ? error.message : String(error))
    }

    const response = await daemonOpenInTempWorkspace({
      projectPath: cwd,
      issueId: args.issueId,
      ttlHours: flags.ttl !== undefined ? flags.ttl : 0,
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

    this.log(`Issue: #${response.displayNumber}`)
    this.log(`Expires: ${response.expiresAt}`)

    if (response.editorOpened) {
      this.log('Editor opened successfully')
    } else {
      this.warn('Editor could not be opened automatically. Open manually.')
    }
  }
}
