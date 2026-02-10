import type { Config } from '../../daemon/types.js'
import type { InitOptions } from '../../types/init-options.js'

/**
 * Build a Config object from InitOptions if any config flags were provided.
 * Returns undefined if no config options were set.
 * Proto default values (0, "", []) signal "use default from CentyConfig::default()"
 */
export function buildConfigFromOptions(opts: InitOptions): Config | undefined {
  const hasConfigOptions =
    opts.priorityLevels !== undefined ||
    opts.defaultState !== undefined ||
    opts.allowedStates !== undefined ||
    opts.version !== undefined ||
    opts.llmAutoClose !== undefined ||
    opts.llmUpdateStatus !== undefined ||
    opts.llmAllowDirectEdits !== undefined

  if (!hasConfigOptions) {
    return undefined
  }

  // Build LLM config if any LLM options were provided
  const hasLlmOptions =
    opts.llmAutoClose !== undefined ||
    opts.llmUpdateStatus !== undefined ||
    opts.llmAllowDirectEdits !== undefined

  const llmConfig = hasLlmOptions
    ? {
        autoCloseOnComplete:
          opts.llmAutoClose !== undefined ? opts.llmAutoClose : false,
        updateStatusOnStart:
          opts.llmUpdateStatus !== undefined ? opts.llmUpdateStatus : false,
        allowDirectEdits:
          opts.llmAllowDirectEdits !== undefined
            ? opts.llmAllowDirectEdits
            : false,
      }
    : {
        autoCloseOnComplete: false,
        updateStatusOnStart: false,
        allowDirectEdits: false,
      }

  return {
    priorityLevels: opts.priorityLevels !== undefined ? opts.priorityLevels : 0, // 0 = use default
    defaultState: opts.defaultState !== undefined ? opts.defaultState : '', // '' = use default
    allowedStates: opts.allowedStates !== undefined ? opts.allowedStates : [], // [] = use default
    version: opts.version !== undefined ? opts.version : '',
    llm: llmConfig,
    // These are not configurable via CLI flags, use defaults
    customFields: [],
    defaults: {},
    stateColors: {},
    priorityColors: {},
    customLinkTypes: [],
    defaultEditor: '',
    hooks: [],
  }
}
