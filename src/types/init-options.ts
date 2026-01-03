/**
 * Options for the init command
 */
export interface InitOptions {
  /** Working directory (defaults to process.cwd()) */
  cwd?: string
  /** Skip interactive prompts, use defaults */
  force?: boolean
  /** Input stream for prompts (defaults to process.stdin) */
  input?: NodeJS.ReadableStream
  /** Output stream for messages (defaults to process.stdout) */
  output?: NodeJS.WritableStream

  // Config options - if any are provided, config.json will be created
  /** Number of priority levels (1-10, default: 3) */
  priorityLevels?: number
  /** Default state for new issues (default: "open") */
  defaultState?: string
  /** Allowed states for issues */
  allowedStates?: string[]
  /** Project version (semver) */
  version?: string

  // LLM config options
  /** Auto-close issues when LLM completes work */
  llmAutoClose?: boolean
  /** Update status to in-progress when LLM starts */
  llmUpdateStatus?: boolean
  /** Allow LLM to directly edit issue files */
  llmAllowDirectEdits?: boolean
}
