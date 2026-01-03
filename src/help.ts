import { Help } from '@oclif/core'

/**
 * Custom help class that adds LLM callout to root help output
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CentyHelp extends Help {
  /**
   * Override showRootHelp to add LLM callout at the end
   */
  protected async showRootHelp(): Promise<void> {
    await super.showRootHelp()

    this.log('')
    this.log('---')
    this.log('')
    this.log(
      'AI/LLM ASSISTANTS: Run `centy llm` first to get project-specific instructions'
    )
    this.log('for working with this codebase.')
    this.log('')
  }
}
