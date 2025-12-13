/**
 * Options for the create-issue command
 */
export interface CreateIssueOptions {
  /** Working directory (defaults to process.cwd()) */
  cwd?: string
  /** Issue title */
  title?: string
  /** Issue description */
  description?: string
  /** Priority level */
  priority?: 'low' | 'medium' | 'high'
  /** Initial status */
  status?: string
  /** Custom field values */
  customFields?: Record<string, unknown>
  /** Input stream for prompts (defaults to process.stdin) */
  input?: NodeJS.ReadableStream
  /** Output stream for messages (defaults to process.stdout) */
  output?: NodeJS.WritableStream
  /** Whether to create the issue as a draft */
  draft?: boolean
}
