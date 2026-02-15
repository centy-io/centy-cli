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
    opts.version !== undefined

  if (!hasConfigOptions) {
    return undefined
  }

  return {
    priorityLevels: opts.priorityLevels !== undefined ? opts.priorityLevels : 0, // 0 = use default
    defaultState: opts.defaultState !== undefined ? opts.defaultState : '', // '' = use default
    allowedStates: opts.allowedStates !== undefined ? opts.allowedStates : [], // [] = use default
    version: opts.version !== undefined ? opts.version : '',
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
