import { Command, Help } from '@oclif/core'
import { daemonGetSupportedEditors } from './daemon/daemon-get-supported-editors.js'

/**
 * Custom help class that adds LLM callout to root help output
 */

export default class CentyHelp extends Help {
  /**
   * Override showRootHelp to add LLM callout at the beginning
   */
  protected async showRootHelp(): Promise<void> {
    this.log(
      'AI/LLM ASSISTANTS: Run `centy llm` first to get project-specific instructions'
    )
    this.log('for working with this codebase.')
    this.log('')

    await super.showRootHelp()
  }

  /**
   * Override showCommandHelp to dynamically populate the --editor flag description
   * with available editors fetched from the daemon.
   */
  override async showCommandHelp(command: Command.Loadable): Promise<void> {
    if (command.flags !== undefined && 'editor' in command.flags) {
      try {
        const { editors } = await daemonGetSupportedEditors({})
        const ids = editors.filter(e => e.available).map(e => e.editorId)
        if (ids.length > 0) {
          command.flags.editor.description = `Editor to use: ${ids.join(', ')} (default: interactive selection or project default)`
        }
      } catch {
        // daemon unavailable — keep static description
      }
    }

    return super.showCommandHelp(command)
  }
}
